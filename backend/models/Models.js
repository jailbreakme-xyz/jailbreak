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
  },
  { collection: "challenges" }
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
    verified: Boolean,
    date: { type: Date, default: Date.now },
  },
  { collection: "chats" }
);

export const Chat = mongoose.model("Chat", chatSchema);

const userSchema = new mongoose.Schema(
  {
    api_key: String,
    address: String,
    date_created: { type: Date, default: Date.now },
  },
  { collection: "users" }
);

export const User = mongoose.model("User", userSchema);

const pageSchema = new mongoose.Schema(
  {
    name: String,
    content: Object,
  },
  { collection: "pages" }
);

export const Pages = mongoose.model("Pages", pageSchema);

// const chatTestSchema = new mongoose.Schema(
//   {
//     challenge: {
//       type: String,
//       ref: "Challenge",
//       required: true,
//     },
//     model: String,
//     role: { type: String, required: true },
//     content: { type: String, required: true },
//     tool_calls: Object,
//     address: { type: String, required: true },
//     txn: String,
//     date: { type: Date, default: Date.now },
//   },
//   { collection: "ChatTest" }
// );

// export const Chat = mongoose.model("ChatTest", chatTestSchema);

// const challengeTestSchema = new mongoose.Schema(
//   {
//     title: String,
//     name: String,
//     description: String,
//     image: String,
//     pfp: String,
//     task: String,
//     label: String,
//     level: String,
//     status: { type: String, default: "active" },
//     model: String,
//     system_message: String,
//     deployed: Boolean,
//     tournamentPDA: String,
//     idl: Object,
//     entryFee: Number,
//     characterLimit: Number,
//     contextLimit: Number,
//     chatLimit: Number,
//     expiry: Date,
//     initial_pool_size: Number,
//     developer_fee: Number,
//     tools: Array,
//     winning_message: String,
//     phrase: String,
//     winning_prize: Number,
//     tools_description: String,
//     custom_rules: String,
//     disable: Array,
//     success_function: String,
//     fail_function: String,
//     tool_choice: String,
//     start_date: Date,
//     charactersPerWord: Number,
//   },
//   { collection: "challenges_test" }
// );

// export const Challenge = mongoose.model("ChallengeTest", challengeTestSchema);
