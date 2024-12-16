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
    charactersPerWord: Number,
    contextLimit: Number,
    chatLimit: Number,
    expiry: Date,
    initial_pool_size: Number,
    developer_fee: Number,
    tools: Array,
    winning_message: String,
    phrase: String,
    winning_prize: Number,
    tools_description: String,
    custom_rules: String,
    disable: Array,
    success_function: String,
    fail_function: String,
    tool_choice: String,
    start_date: Date,
    usd_prize: Number,
    break_attempts: Number,
    winner: String,
    expirt_decision: String,
    assistant_id: String,
    suffix: String,
    language: String,
    tldr: String,
    fee_multiplier: Number,
    agent_logic: String,
  },
  {
    collection:
      process.env.NODE_ENV === "development" ? "challenges_test" : "challenges",
  }
);

export const Challenge = mongoose.model("Challenge", ChallengeSchema);

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
    fee: Number,
    thread_id: String,
    date: { type: Date, default: Date.now },
  },
  {
    collection: process.env.NODE_ENV === "development" ? "chats_test" : "chats",
  }
);

export const Chat = mongoose.model("Chat", chatSchema);

const breakerSchema = new mongoose.Schema(
  {
    address: String,
    degen_score: Number,
    holdings: Array,
    date_created: { type: Date, default: Date.now },
  },
  { collection: "breakers" }
);

export const Breaker = mongoose.model("Breaker", breakerSchema);

const pageSchema = new mongoose.Schema(
  {
    name: String,
    content: Object,
  },
  { collection: "pages" }
);

export const Pages = mongoose.model("Pages", pageSchema);

const transactionSchema = new mongoose.Schema(
  {
    transactionId: String,
    userWalletAddress: String,
    tournamentPDA: String,
    solutionHash: String,
    unsignedTransaction: String,
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: "pending" },
    entryFee: Number,
    // holdings: Array,
    scored: Boolean,
    transactions_data: Object,
    // accountCreationDate: { type: Date, default: Date.now },
    // accountTransactionFrequency: Number,
  },
  {
    collection:
      process.env.NODE_ENV === "development"
        ? "transactions_test"
        : "transactions",
  }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
