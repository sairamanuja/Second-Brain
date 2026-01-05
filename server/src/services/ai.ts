// one call to gemini — returns both summary and tags
// dont crash the save flow if this fails

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function generateSummaryAndTags(text: string): Promise<{ summary: string; tags: string[] }> {
    // only send first 3000 chars — dont waste tokens on full articles
    const truncated = text.slice(0, 3000);

    const prompt = `Analyze the following content and return a JSON object with:
1. "summary": a 2-3 sentence summary of what this content is about. Be specific.
2. "tags": an array of 2-3 short topic tags (like "react", "system-design", "javascript", "career-advice"). Lowercase, no hashtags.

Content:
${truncated}

Return ONLY valid JSON, nothing else. No markdown backticks.`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!res.ok) {
            console.log("AI summary/tags request failed:", res.status);
            return { summary: "", tags: [] };
        }

        const data: any = await res.json();
        let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        responseText = responseText.trim();

        // gemini sometimes wraps json in backticks — strip them
        if (responseText.startsWith("```")) {
            responseText = responseText.replace(/^```[a-z]*\n?/, "").replace(/```$/, "").trim();
        }

        const parsed = JSON.parse(responseText);
        return {
            summary: parsed.summary || "",
            tags: Array.isArray(parsed.tags) ? parsed.tags : []
        };
    } catch (err) {
        console.log("AI summary/tags failed:", err);
        // dont crash the save flow if AI fails
        return { summary: "", tags: [] };
    }
}
