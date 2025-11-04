// using raw fetch instead of SDKs — SDKs consumed too much memory on startup
// gemini-embedding-001 with outputDimensionality=768 matches pinecone index
// gemini-2.5-flash for generation (2.0-flash not available for new users)

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const PINECONE_INDEX_HOST = process.env.PINECONE_INDEX_HOST || "";

export async function generateEmbedding(text: string): Promise<number[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: { parts: [{ text }] },
            outputDimensionality: 768
        })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini embedding failed (${res.status}): ${err}`);
    }

    const data: any = await res.json();
    return data.embedding.values;
}

export function chunkText(text: string): string[] {
    const CHUNK_SIZE = 500;
    const OVERLAP = 100;

    if (text.length <= CHUNK_SIZE) {
        return [text];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        let end = Math.min(start + CHUNK_SIZE, text.length);

        // snap to word boundary
        if (end < text.length) {
            const lastSpace = text.lastIndexOf(" ", end);
            if (lastSpace > start) end = lastSpace;
        }

        const chunk = text.slice(start, end).trim();
        if (chunk) chunks.push(chunk);

        if (end >= text.length) break;
        start = end - OVERLAP;
        if (start <= 0) start = end; // safety — always advance
    }

    return chunks;
}

async function pineconeRequest(path: string, body: any) {
    const res = await fetch(`https://${PINECONE_INDEX_HOST}${path}`, {
        method: "POST",
        headers: {
            "Api-Key": PINECONE_API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Pinecone ${path} failed (${res.status}): ${err}`);
    }

    return res.json();
}

export async function indexContent(
    contentId: string,
    userId: string,
    text: string,
    title: string,
    link: string = "",
    type: string = ""
): Promise<void> {
    const chunks = chunkText(text);
    console.log(`indexing ${chunks.length} chunks for content ${contentId}`);

    // one chunk at a time to keep memory low
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
            const embedding = await generateEmbedding(chunk);

            await pineconeRequest("/vectors/upsert", {
                vectors: [{
                    id: `${contentId}_chunk_${i}`,
                    values: embedding,
                    metadata: {
                        contentId,
                        userId,
                        title: title.slice(0, 200),
                        chunkIndex: i,
                        text: chunk.slice(0, 500),
                        link: link.slice(0, 300),
                        type
                    }
                }]
            });

            console.log(`indexed chunk ${i + 1}/${chunks.length}`);
        } catch (err) {
            console.error(`failed chunk ${i}:`, err);
        }
    }

    console.log(`done indexing content ${contentId}`);
}

export async function searchContent(
    query: string,
    userId: string
): Promise<Array<{ text: string; title: string; score: number; link: string; type: string }>> {
    try {
        const queryEmbedding = await generateEmbedding(query);

        const data: any = await pineconeRequest("/query", {
            vector: queryEmbedding,
            topK: 5,
            filter: { userId: { $eq: userId } },
            includeMetadata: true
        });

        if (!data.matches || data.matches.length === 0) {
            return [];
        }

        return data.matches.map((match: any) => ({
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

export async function generateAnswer(
    query: string,
    contexts: Array<{ text: string; title: string }>
): Promise<string> {
    const contextBlock = contexts
        .map(c => `---\nTitle: ${c.title}\nContent: ${c.text}\n---`)
        .join("\n");

    const prompt = `You are a helpful assistant that answers questions based on the user's saved content in their Second Brain.

Here is the relevant content from the user's saved items:

${contextBlock}

Based on the above content, answer this question: ${query}

If the content doesn't contain enough information to answer the question, say so honestly. Don't make stuff up.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini generate failed (${res.status}): ${err}`);
    }

    const data: any = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate an answer.";
}
