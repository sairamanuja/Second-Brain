import express from "express";
const app = express();
import { userMiddleware } from "./middleware";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { connectDB, User, Content, Link } from "./DB";
import bcrypt from "bcrypt";
import { z } from "zod";
import { random } from "./config";

const JWT_SECRET = "MANISH12";
app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
    const schema = z.object({
        username: z.string().min(3).max(20),
        password: z.string().min(8).max(20)
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
            await User.create({
            username: username,
            password: password
        }) 

        res.json({
            message: "User signed up"
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists"
        })
    }
})

app.post("/api/v1/signin", async (req, res) => {
    const schema = z.object({
        username: z.string().min(3).max(20),
        password: z.string().min(8).max(20)
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

    const existingUser = await User.findOne({
        username,
        password
    })
    if (existingUser) {
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_SECRET)

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Incorrrect credentials"
        })
    }
})
// @ts-ignore
app.post("/api/v1/content", userMiddleware, async (req, res) => {
        const link = req.body.link;
        const type = req.body.type;
        const userId = req.user.Id;
        const content = req.body.content;
        const title = req.body.title;
    await Content.create({
        link: link,
        type: type,
        content: content,
        title: req.body.title,
        userId: userId,
        tags: []
    })

    res.json({
        message: "Content added"
    })
    
})

// @ts-ignore
app.get("/api/v1/content", userMiddleware, async (req, res) => {
  
    const userId = req.user.Id;
    console.log(userId);
    const content = await Content.find({
        userId,
    })
    res.json({
        content
    })
})
//@ts-ignore
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;
    const userId = req.user.Id;
   try{
   const content = await Content.deleteOne({
        _id: contentId,
        userId
    })
    if(content) {   
        res.json({
            message: "Content deleted"
        })
    } else {
        res.status(403).json({
            message: "Content not found"
        })
    }
   } catch(e) {
    res.status(403).json({
        message: "error"
    })
   }
})
//@ts-ignore
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
    const { share } = req.body;
    if (share) {
        // Check if a link already exists for the user.
        const existingLink = await Link.findOne({ userId: req.userId });
        if (existingLink) {
            res.json({ hash: existingLink.hash }); // Send existing hash if found.
            return;
        }

        // Generate a new hash for the shareable link.
        const hash = random(10);
        await Link.create({ userId: req.userId, hash });
        res.json({ hash }); // Send new hash in the response.
    } else {
        // Remove the shareable link if share is false.
        await Link.deleteOne({ userId: req.userId });
        res.json({ message: "Removed link" }); // Send success response.
    }
});

const PORT = process.env.PORT || 4000;  // Use 3001 or any other available port

connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

