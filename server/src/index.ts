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

app.use(cors({
    origin: "http://localhost:5173"
})); 
dotenv.config();
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
    await Content.create({
        link,
        type,
        content,
        title,
        userId: req.user.Id,
        tags: []
    });

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
        const content = await Content.deleteOne({
            _id: contentId,
            userId
        });

        if (content.deletedCount > 0) {
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

const PORT = process.env.PORT || 3000;  // Port set to 3000

connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

