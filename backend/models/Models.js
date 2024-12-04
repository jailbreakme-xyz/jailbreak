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
    status: { type: String, default: "active" },
    phrase: String,
    assistant_id: String,
    system_message: String,
    deployed: Boolean,
    tournamentPDA: String,
    idl: Object,
    entryFee: Number,
    characterLimit: Number,
    contextLimit: Number,
    expiry: Date,
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
    txn: String,
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
