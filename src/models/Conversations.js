import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
  {
    members: { type: Array },
  },
  { timestamps: true }
);

export default mongoose.model('Conversations',ConversationSchema,"conversations");
