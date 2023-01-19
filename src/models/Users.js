import { boolean } from "joi";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, min: 4, required: true },
    profileImageUrl: { type: String, default: "" },
    coverImageUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    followers: { type: Array, default: [] },
    followings: { type: Array, default: [] },
    desc: { type: String, max: 50, default: "" },
    city: { type: String, max: 20, default: "" },
    country: { type: String, max: 50, default: "" },
    requests: { type: Array, default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema, "users");
