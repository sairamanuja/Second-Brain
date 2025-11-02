import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";

// NOTE: you need to create the Pinecone index manually in the dashboard:
// Name: second-brain, Dimensions: 768, Metric: cosine

// lazy init so dotenv has time to load before we read env vars
let pineconeIndex: any = null;
let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
    if (!genAI) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    }
    return genAI;
}

function getPineconeIndex() {
    if (!pineconeIndex) {
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
        pineconeIndex = pc.index(process.env.PINECONE_INDEX_NAME || "second-brain");
    }
    return pineconeIndex;
}

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const model = getGenAI().getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await model.embedContent({
            content: { parts: [{ text }], role: "user" },
            outputDimensionality: 768
        } as any);
        return result.embedding.values;
    } catch (err) {
        console.error("generateEmbedding failed:", err);
        throw err;
    }
}

export function chunkText(text: string): string[] {
    const CHUNK_SIZE = 500;
    const OVERLAP = 100;

    if (text.length <= CHUNK_SIZE) {
        return [text];
    }

    // character-based chunking with word boundary snapping
    // sentence splitting doesn't work for youtube transcripts (no punctuation)
    const chunks: string[] = [];
    let i = 0;

    while (i < text.length) {
        let end = Math.min(i + CHUNK_SIZE, text.length);

        // snap to nearest word boundary so we don't cut mid-word
        if (end < text.length) {
            const lastSpace = text.lastIndexOf(" ", end);
            if (lastSpace > i) end = lastSpace;
        }

        const chunk = text.slice(i, end).trim();
        if (chunk) chunks.push(chunk);

        i = end - OVERLAP;
        if (i <= 0) break;
    }

    return chunks;
}

export async function indexContent(contentId: string, userId: string, text: string, title: string, link: string = "", type: string = ""): Promise<void> {
    const chunks = chunkText(text);
    console.log(`indexing ${chunks.length} chunks for content ${contentId}`);

    const vectors = [];

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
            const embedding = await generateEmbedding(chunk);
            vectors.push({
                id: `${contentId}_chunk_${i}`,
                values: embedding,
                metadata: {
                    contentId,
                    userId,
                    title: title.slice(0, 200),
                    chunkIndex: i,
                    text: chunk.slice(0, 500), // cap to stay under pinecone's 40KB/vector metadata limit
                    link: link.slice(0, 300),
                    type
                }
            });
        } catch (err) {
            console.error(`failed to embed chunk ${i} for content ${contentId}:`, err);
        }
    }

    if (vectors.length === 0) {
        console.log("no vectors to upsert for content", contentId);
        return;
    }

    // TODO: fix types - pinecone metadata types are annoying
    // pinecone SDK v7 uses { records: [...] } not a plain array
    await getPineconeIndex().upsert({ records: vectors } as any);
    console.log(`upserted ${vectors.length} vectors for content ${contentId}`);
}

export async function searchContent(query: string, userId: string): Promise<Array<{text: string, title: string, score: number, link: string, type: string}>> {
    try {
        const queryEmbedding = await generateEmbedding(query);

        const results = await getPineconeIndex().query({
            vector: queryEmbedding,
            topK: 5,
            filter: { userId: { $eq: userId } },
            includeMetadata: true
        });

        if (!results.matches || results.matches.length === 0) {
            return [];
        }

        return results.matches.map((match: any) => ({
            text: match.metadata?.text || "",
            title: match.metadata?.title || "Untitled",
            score: match.score || 0,
            link: match.metadata?.link || "",
            type: match.metadata?.type || ""
        }));
    } catch (err) {
        console.error("searchContent failed:", err);
        return [];
    }
}

export async function generateAnswer(query: string, contexts: Array<{text: string, title: string}>): Promise<string> {
    try {
        const contextBlock = contexts.map(c => `---\nTitle: ${c.title}\nContent: ${c.text}\n---`).join("\n");

        const prompt = `You are a helpful assistant that answers questions based on the user's saved content in their Second Brain.

Here is the relevant content from the user's saved items:

${contextBlock}

Based on the above content, answer this question: ${query}

If the content doesn't contain enough information to answer the question, say so honestly. Don't make stuff up.`;

        const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.error("generateAnswer failed:", err);
        throw err;
    }
}
