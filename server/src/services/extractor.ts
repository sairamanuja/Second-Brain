import axios from "axios";
import * as cheerio from "cheerio";
import { YoutubeTranscript } from "youtube-transcript";

function getYoutubeVideoId(url: string): string | null {
    // handles https://www.youtube.com/watch?v=xxx and https://youtu.be/xxx
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return watchMatch[1];

    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return shortMatch[1];

    return null;
}

export async function extractContent(link: string, type: string, title?: string): Promise<string> {
    try {
        if (type === "youtube") {
            const videoId = getYoutubeVideoId(link);
            if (!videoId) {
                console.log("couldn't extract video id from:", link);
                return title ? `${title} ${link}` : link;
            }

            console.log("fetching transcript for video:", videoId);
            const transcript = await YoutubeTranscript.fetchTranscript(videoId);
            const text = transcript.map((seg: any) => seg.text).join(" ");

            // cap to 8000 chars — full transcripts can be 80K+ and blow up memory
            if (text.length > 8000) {
                console.log(`transcript too long (${text.length} chars), truncating to 8000`);
                return text.slice(0, 8000);
            }
            return text;
        }

        if (type === "twitter" || type === "tweet") {
            // TODO: integrate twitter API or scraping for tweet text
            return title ? `${title} ${link}` : link;
        }

        // article / link / anything else — scrape with cheerio
        console.log("scraping article:", link);
        const response = await axios.get(link, {
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; SecondBrain/1.0)"
            }
        });

        const $ = cheerio.load(response.data);

        // remove noise
        $("script, style, nav, footer, header, aside").remove();

        let text = "";
        $("article, h1, h2, h3, p").each((_: any, el: any) => {
            const t = $(el).text().trim();
            if (t) text += t + " ";
        });

        text = text.replace(/\s+/g, " ").trim();

        if (!text) {
            return title ? `${title} ${link}` : link;
        }

        if (text.length > 8000) {
            console.log(`article too long (${text.length} chars), truncating to 8000`);
            text = text.slice(0, 8000);
        }
        return text;

    } catch (err) {
        console.error("extractContent failed for", link, err);
        // fallback so we at least have something to embed
        return title ? `${title} ${link}` : link;
    }
}
