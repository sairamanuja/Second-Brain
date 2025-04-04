import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

export const connectDB = async () => {
try {
   if (!process.env.MONGO_URI) {
     throw new Error("MONGO_URI is not defined in environment variables");
   }
   const connect = await mongoose.connect(process.env.MONGO_URI);
   console.log(` ${connect.connection.host}`);
} catch (error) {
    console.log(error);
}
};

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
});

export const User = mongoose.model("User", UserSchema);

const ContentSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    type: {type: String, required: true},
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: "tag"}],
    link: {type: String},
    userId:[ {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}],
    
});

export const Content = mongoose.model("Content", ContentSchema);

const TagSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true }
  });
  
  export const Tag = mongoose.model('Tag', TagSchema);

  const linkSchema = new mongoose.Schema({
    hash: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  });

  export const Link = mongoose.model('Link', linkSchema);