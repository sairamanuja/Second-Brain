import express from "express";
const app = express();
import { userMiddleware } from "./middleware";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { connectDB, User, Content, Link } from "./DB";
import bcrypt from "bcrypt";
import { z } from "zod";
import { random } from "./config";
import dotenv from "dotenv";
import cors from "cors";
import { Request, Response } from "express";
import { extractContent } from "./services/extractor";
import { indexContent, searchContent, generateAnswer } from "./services/embedding";
app.use(cors({ origin: "http://localhost:5173" }));

dotenv.config();

// TODO: move this to a background job later (bull/agenda)
async function processContent(contentId: string, userId: string, link: string, type: string, title: string) {
    console.log("processing content for embedding:", contentId);
    let text = await extractContent(link, type, title);
    // cap at 5k chars (~10 chunks) — full transcripts cause OOM, 5k is enough for RAG
    if (text.length > 5000) {
        console.log(`text too long (${text.length} chars), truncating to 5000`);
        text = text.slice(0, 5000);
    }
    await indexContent(contentId, userId, text, title, link, type);
    await Content.updateOne({ _id: contentId }, { embedded: true });
    console.log("embedding done for:", contentId);
}
const JWT_SECRET = process.env.JWT_SECRET;
app.use(express.json());
//@ts-ignore
app.post("/api/v1/signup", async (req, res) => {
    const schema = z.object({
        username: z.string().min(3).max(30),
        password: z.string().min(5).max(20)
    })
    const parsed = schema.safeParse(req.body);
    
    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid input"
        })
        return;
    }
    const username = parsed.data.username;
    const password = await bcrypt.hash(parsed.data.password, 10);

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists with this email"
            });
        }

        await User.create({
            username: username,
            password: password
        }) 

        res.status(201).json({
            message: "User signed up",
            success: true
        })
    } catch(e) {
        console.error("signup error:", e);
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

app.post("/api/v1/signin", async (req, res) => {
    const schema = z.object({
        username: z.string().min(3).max(30),
        password: z.string().min(5).max(20)
    })
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid input"
        })
        return;
    }
    const username = parsed.data.username;
    const password = parsed.data.password;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser && await bcrypt.compare(password, existingUser.password)) {
            const token = jwt.sign({
                id: existingUser._id
            }, JWT_SECRET as string)

            res.status(200).json({
                token,
                success: true
            })
        } else {
            res.status(401).json({
                message: "Incorrect credentials"
            })
        }
    } catch (e) {
        console.error("signin error:", e);
        res.status(500).json({
            message: "Internal server error"
        });
    }
})
// @ts-ignore
app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const schema = z.object({
        link: z.string().url(),
        type: z.string(),
        content: z.string(),
        title: z.string().min(1)
    });
    
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: parsed.error.errors
        });
    }

    const { link, type, content, title } = parsed.data;
    const savedContent = await Content.create({
        link,
        type,
        content,
        title,
        userId: req.user.Id,
        tags: []
    });

    // fire and forget - don't block the response for embedding
    processContent(savedContent._id.toString(), req.user.Id, link, type, title)
        .catch(err => console.error("embedding failed:", err));

    res.status(201).json({
        message: "Content added"
    });
})

// @ts-ignore
app.get("/api/v1/content", userMiddleware, async (req, res) => {
    const userId = req.user.Id;
    const content = await Content.find({ userId });

    res.status(200).json({
        content
    });
})

//@ts-ignore
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;
    const userId = req.user.Id;

    if (!contentId) {
        return res.status(400).json({
            message: "Enter Content ID "
        });
    }

    try {
        const deleted = await Content.deleteOne({
            _id: contentId,
            userId
        });

        if (deleted.deletedCount > 0) {
            // TODO: also delete vectors from Pinecone - need to delete by prefix contentId_chunk_*
            // Pinecone free tier doesn't support prefix delete, so skipping for now
            res.status(200).json({
                message: "Content deleted"
            });
        } else {
            res.status(404).json({
                message: "Content not found"
            });
        }
    } catch (e) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
})
// reindex all content that hasn't been embedded yet
//@ts-ignore
app.post("/api/v1/reindex", userMiddleware, async (req, res) => {
    const userId = req.user.Id;
    try {
        const items = await Content.find({ userId, embedded: false });
        console.log(`reindexing ${items.length} items for user ${userId}`);

        res.json({ message: `Reindexing ${items.length} items in background...` });

        // fire and forget each one
        for (const item of items) {
            processContent(item._id.toString(), userId, item.link || "", item.type, item.title)
                .catch(err => console.error("reindex failed for", item._id, err));
        }
    } catch (e) {
        console.error("reindex error:", e);
        res.status(500).json({ message: "Internal server error" });
    }
});

// TODO: add zod validation
//@ts-ignore
app.post("/api/v1/brain/query", userMiddleware, async (req, res) => {
    const query = req.body.query;
    const userId = req.user.Id;

    if (!query) {
        return res.status(400).json({ message: "query is required" });
    }

    try {
        const results = await searchContent(query, userId);

        if (results.length === 0) {
            return res.json({
                answer: "I couldn't find anything relevant in your saved content.",
                sources: []
            });
        }

        const answer = await generateAnswer(query, results);

        res.json({
            answer,
            sources: results.map(r => ({ title: r.title, score: r.score, link: r.link, type: r.type }))
        });
    } catch (err) {
        console.error("query route failed:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

//@ts-ignore
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
    const { share } = req.body;
    if (share) {
        const existingLink = await Link.findOne({ userId: req.userId });
        if (existingLink) {
            res.json({ hash: existingLink.hash }); // Send existing hash if found.
            return;
        }

        const hash = random(10);
        await Link.create({ userId: req.userId, hash });
        res.json({ hash }); // Send new hash in the response.
    } else {
        await Link.deleteOne({ userId: req.userId });
          res.json({ message: "Removed link" }); // Send success response.
    }
});


//@ts-ignore
app.get("/api/v1/brain/share/:hash", async (req: Request, res: Response) => {
    try {
        const schema = z.object({
            hash: z.string()
        });
        const parsed = schema.safeParse(req.params);

        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid hash parameter" });
        }

        const { hash } = parsed.data;
        const link = await Link.findOne({ hash });

        if (!link) {
            return res.status(404).json({ message: "Shared content not found" });
        }

        const content = await Content.find({ userId: link.userId });
        res.status(200).json({ content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});     
const PORT = process.env.PORT || 3000;  // Port set to 3000

connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




