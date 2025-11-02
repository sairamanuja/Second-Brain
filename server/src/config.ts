export function random(len: number) {
    let options = "qwertyuioasdfghjklzxcvbnm12345678";
    let length = options.length;

    let ans = "";

    for (let i = 0; i < len; i++) {
        ans += options[Math.floor((Math.random() * length))] // 0 => 20
    }

    return ans;
}

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
export const PINECONE_INDEX_NAME = "second-brain";