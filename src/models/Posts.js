import mongoose from "mongoose";

const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    userId: { type: String, required: true },
    desc: { type: String, max: 500 },
    img: { type: String },
    likes: { type: Array, default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema, "posts");
