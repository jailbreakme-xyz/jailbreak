import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema(
  {
    title: String,
    name: String,
    description: String,
    image: String,
    pfp: String,
    task: String,
    label: String,
    level: String,
    active: Boolean,
    phrase: String,
    assistant_id: String,
    system_message: String,
    deployed: Boolean,
    tournamentAddress: String,
  },
  { collection: "challenges" }
);

export const Challenge = mongoose.model("Challenge", ChallengeSchema);

const userSchema = new mongoose.Schema(
  {
    api_key: String,
    address: String,
    date_created: { type: Date, default: Date.now },
  },
  { collection: "users" }
);

export const User = mongoose.model("User", userSchema);

const conversationSchema = new mongoose.Schema(
  {
    data: [
      {
        _id: false,
        role: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
    model: String,
    address: String,
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "conversations" }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);

const chatSchema = new mongoose.Schema(
  {
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    model: String,
    role: { type: String, required: true },
    content: { type: String, required: true },
    tool_calls: Object,
    address: { type: String, required: true },
    ip: String,
    avatar: Object,
    date: { type: Date, default: Date.now },
  },
  { collection: "chats" }
);

export const Chat = mongoose.model("Chat", chatSchema);

const settingSchema = new mongoose.Schema(
  {
    address: String,
    threshold: Number,
  },
  { collection: "settings" }
);

export const Settings = mongoose.model("Settings", settingSchema);
