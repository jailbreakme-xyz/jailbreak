import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema(
  {
    owner: String,
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
    instructions: String,
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
    expiry_decision: String,
    assistant_id: String,
    suffix: String,
    language: String,
    tldr: String,
    fee_multiplier: Number,
    agent_logic: String,
    expiry_logic: String,
    style: Array,
    custom_user_img: String,
    phrases: Array,
    type: String,
    tag: String,
    sample: String,
    sample_keyword: String,
    jailx_thread: String,
    tournament_id: String,
    hero: Boolean,
    framework: Object,
    use_alcatraz: Boolean,
    verified_owner: {
      type: Object,
      default: null,
    },
    airdrop_split: {
      winner: Number,
      creator: Number,
    },
    single_tool_comparison: {
      tool_name: String,
      higher_field_name: String,
      lower_field_name: String,
    },
  },
  {
    collection:
      process.env.NODE_ENV === "development" ? "challenges" : "challenges",
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
    win: Boolean,
    alcatraz: Boolean,
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
    cf_ip: String,
    generation_limit: {
      count: Number,
      date: Date,
    },
    date_created: { type: Date, default: Date.now },
    api_key: String,
    api_rate_limit: {
      count: Number,
      date: Date,
    },
  },
  { collection: "breakers" }
);

export const Breaker = mongoose.model("Breaker", breakerSchema);

const pageSchema = new mongoose.Schema(
  {
    name: String,
    content: Object,
  },
  {
    collection: process.env.NODE_ENV === "development" ? "pages_test" : "pages",
  }
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
    challengeName: String,
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

const socialBountySchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    targetUrl: String,
    prize: Number,
    sol_prize: Number,
    task: String,
    submissions: Array,
    txn: String,
    jailbreak: {
      url: String,
    },
    date: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    creator: String,
  },
  {
    collection:
      process.env.NODE_ENV === "development"
        ? "social_bounties"
        : "social_bounties",
  }
);

export const SocialBounty = mongoose.model("SocialBounty", socialBountySchema);

const submissionSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    website: String,
    social: String,
    date: { type: Date, default: Date.now },
  },
  { collection: "submissions" }
);

export const Submission = mongoose.model("Submission", submissionSchema);

const embeddedChatSchema = new mongoose.Schema(
  {
    original_chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    challenge: {
      type: String,
      ref: "Challenge",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    metadata: {
      model: String,
      thread_id: String,
      win: Boolean,
      alcatraz: Boolean,
      date: Date,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection:
      process.env.NODE_ENV === "development"
        ? "embedded_chats_test"
        : "embedded_chats",
  }
);

export const EmbeddedChat = mongoose.model("EmbeddedChat", embeddedChatSchema);
