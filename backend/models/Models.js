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
    model: String,
    system_message: String,
    deployed: Boolean,
    tournamentPDA: String,
    idl: Object,
    entryFee: Number,
    characterLimit: Number,
    contextLimit: Number,
    chatLimit: Number,
    expiry: Date,
    initial_pool_size: Number,
    developer_fee: Number,
    tools: Array,
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
      type: String,
      ref: "Challenge",
      required: true,
    },
    model: String,
    role: { type: String, required: true },
    content: { type: String, required: true },
    tool_calls: Object,
    address: { type: String, required: true },
    txn: String,
    date: { type: Date, default: Date.now },
  },
  { collection: "chats" }
);

export const Chat = mongoose.model("Chat", chatSchema);

const pageSchema = new mongoose.Schema(
  {
    name: String,
    content: Object,
  },
  { collection: "pages" }
);

export const Pages = mongoose.model("Pages", pageSchema);
