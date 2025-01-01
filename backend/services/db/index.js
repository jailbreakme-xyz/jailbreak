import {
  Chat,
  Challenge,
  Pages,
  Transaction,
  Breaker,
} from "../../models/Models.js";
import dotenv from "dotenv";
import { agentValidator } from "../../validators/agentValidator.js";

dotenv.config();

class DataBaseService {
  constructor() {
    // Constructor remains empty as we don't need initialization logic
  }

  async getSampleAgent(sample, projection = {}) {
    const agent = await Challenge.findOne({ sample }, projection);
    return agent;
  }

  async getChallengeById(id, projection = {}) {
    try {
      return await Challenge.findOne({ _id: id }, projection);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getChallengeByName(name, projection = {}) {
    const nameReg = new RegExp(`^${name}$`, "i");
    try {
      return await Challenge.findOne({ name: nameReg }, projection);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async updateChallenge(id, updateData, increment = false) {
    try {
      if (increment) {
        return await Challenge.updateOne(
          { _id: id },
          { $set: updateData, $inc: { break_attempts: 1 } }
        );
      } else {
        return await Challenge.updateOne({ _id: id }, { $set: updateData });
      }
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  // Chat-related methods
  async createChat(chatData) {
    try {
      return await Chat.create(chatData);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async updateChat(query, update) {
    try {
      return await Chat.updateOne(query, update);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getChatHistory(query, projection, sort = { date: -1 }, limit = 0) {
    try {
      return await Chat.find(query, projection).sort(sort).limit(limit);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getChatCount(query) {
    try {
      return await Chat.countDocuments(query);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getBreakersCount(query) {
    try {
      return await Chat.aggregate([
        { $match: query },
        { $group: { _id: "$address", count: { $sum: 1 } } },
        { $count: "count" },
      ]);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async findOneChat(query) {
    try {
      return await Chat.findOne(query);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }
  async getPages(query) {
    try {
      return await Pages.find(query);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getOnePage(query) {
    try {
      return await Pages.findOne(query);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async updatePage(query, update) {
    try {
      return await Pages.updateOne(query, update);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async countTotalUsdPrize() {
    try {
      return await Challenge.aggregate([
        {
          $group: {
            _id: null,
            grossTotal: { $sum: "$usd_prize" },
            netTotal: {
              $sum: {
                $multiply: [
                  "$usd_prize",
                  { $subtract: [1, { $divide: ["$developer_fee", 100] }] },
                ],
              },
            },
          },
        },
      ]);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getSortedChallengesByStatus(
    status = "active",
    sort = { usd_prize: -1 },
    limit = 0
  ) {
    try {
      return await Challenge.find(
        { status },
        {
          id: "$_id",
          _id: 1,
          owner: 1,
          name: 1,
          title: 1,
          image: 1,
          label: 1,
          level: 1,
          status: 1,
          pfp: 1,
          entryFee: 1,
          expiry: 1,
          winning_prize: 1,
          developer_fee: 1,
          start_date: 1,
          usd_prize: 1,
          break_attempts: 1,
          fee_multiplier: 1,
          tag: 1,
          sample: 1,
          sample_keyword: 1,
          verified_owner: 1,
        }
      )
        .sort(sort)
        .limit(limit);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }
  // Settings-related methods
  async getSettings() {
    try {
      const challenge = await Challenge.find(
        {},
        {
          _id: 1,
          // id: "$_id",
          name: 1,
          title: 1,
          image: 1,
          label: 1,
          level: 1,
          status: 1,
          pfp: 1,
          entryFee: 1,
          expiry: 1,
          winning_prize: 1,
          developer_fee: 1,
          start_date: 1,
          usd_prize: 1,
          break_attempts: 1,
          fee_multiplier: 1,
          tag: 1,
          sample: 1,
          sample_keyword: 1,
        }
      ).sort({ usd_prize: -1 });

      return challenge;
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  // Add these new methods
  async getUserConversations(address, skip = 0, limit = 20) {
    try {
      return await Chat.find(
        { address },
        {
          id: "$_id",
          content: 1,
          role: 1,
          address: 1,
          challenge: 1,
          date: 1,
        }
      )
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getChallengeConversations(address, challenge, skip = 0, limit = 20) {
    try {
      return await Chat.find(
        { address, challenge },
        {
          _id: 0,
          content: 1,
          role: 1,
          address: 1,
          challenge: 1,
          date: 1,
        }
      )
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getAllTournaments() {
    try {
      return await Challenge.find(
        {},
        {
          _id: 0,
          id: "$_id",
          title: 1,
          name: 1,
          description: 1,
          level: 1,
          status: 1,
          model: 1,
          expiry: 1,
          characterLimit: 1,
          contextLimit: 1,
          chatLimit: 1,
          initial_pool_size: 1,
          entryFee: 1,
          developer_fee: 1,
          // tools: 0,
          idl: 1,
        }
      );
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getTournamentById(id) {
    try {
      return await Challenge.findOne(
        { _id: id },
        {
          _id: 0,
          id: "$_id",
          title: 1,
          name: 1,
          description: 1,
          level: 1,
          status: 1,
          model: 1,
          expiry: 1,
          characterLimit: 1,
          contextLimit: 1,
          chatLimit: 1,
          initial_pool_size: 1,
          entryFee: 1,
          developer_fee: 1,
          // tools: 0,
          idl: 1,
        }
      );
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async createTournament(tournamentData) {
    try {
      const savedChallenge = new Challenge(tournamentData);
      await savedChallenge.save();
      return savedChallenge;
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  // New method to save a transaction
  async saveTransaction(transactionData) {
    try {
      return await Transaction.create(transactionData);
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getTransactionById(transactionId) {
    try {
      const transaction = await Transaction.findOne({ transactionId });
      return transaction;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }

  async getLastTransaction(challengeName) {
    try {
      const transactions = await Transaction.find({
        challengeName: challengeName,
      }).sort({ createdAt: -1 });
      return transactions[0];
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }

  async getTransactionByAddress(address) {
    try {
      const transaction = await Transaction.findOne({
        userWalletAddress: address,
      });
      return transaction;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }

  async updateTransactionStatus(transactionId, status) {
    try {
      await Transaction.updateOne({ transactionId }, { status });
    } catch (error) {
      console.error("Error updating transaction status:", error);
    }
  }

  async getTopBreakersAndChatters(page = 1, limit = 16) {
    try {
      const skip = (page - 1) * limit;
      const topChatters = await Chat.aggregate([
        { $match: { role: "user" } },
        {
          $group: {
            _id: "$address",
            wins: {
              $sum: {
                $cond: { if: { $eq: ["$win", true] }, then: 1, else: 0 },
              },
            },
            chatCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from:
              process.env.NODE_ENV === "development"
                ? "challenges_test"
                : "challenges",
            localField: "_id",
            foreignField: "winner",
            as: "challengeDetails",
          },
        },
        {
          $addFields: {
            developerFee: {
              $first: "$challengeDetails.developer_fee",
            },
            totalUsdPrize: {
              $multiply: [
                { $sum: "$challengeDetails.usd_prize" },
                {
                  $subtract: [
                    1,
                    {
                      $divide: [
                        { $first: "$challengeDetails.developer_fee" },
                        100,
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            address: "$_id",
            chatCount: 1,
            winCount: "$wins",
            totalUsdPrize: 1,
          },
        },
        { $sort: { totalUsdPrize: -1, chatCount: -1, address: 1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      return {
        topChatters,
      };
    } catch (error) {
      console.error("Error fetching top breakers and chatters:", error);
      return false;
    }
  }

  async getBreaker(address) {
    try {
      // Fetch conversations grouped by challenge
      const conversations = await Chat.aggregate([
        { $match: { address } },
        { $group: { _id: "$challenge", conversations: { $push: "$$ROOT" } } },
        {
          $lookup: {
            from:
              process.env.NODE_ENV === "development"
                ? "challenges_test"
                : "challenges",
            localField: "_id",
            foreignField: "name",
            as: "challengeDetails",
          },
        },
        {
          $unwind: "$challengeDetails",
        },
        {
          $project: {
            _id: 0,
            name: "$challengeDetails.name",
            pfp: "$challengeDetails.pfp",
            conversations: {
              $map: {
                input: "$conversations",
                as: "conversation",
                in: {
                  address: "$$conversation.address",
                  challenge: "$$conversation.challenge",
                  role: "$$conversation.role",
                  content: "$$conversation.content",
                  date: "$$conversation.date",
                  fee: "$$conversation.fee",
                  txn: "$$conversation.txn",
                  thread_id: "$$conversation.thread_id",
                },
              },
            },
          },
        },
      ]);

      // Calculate total USD prize the user has won
      const challenges = await Challenge.aggregate([
        { $match: { winner: address } },
        {
          $group: {
            _id: null,
            totalWins: { $sum: 1 },
            totalUsdPrize: {
              $sum: {
                $multiply: [
                  "$usd_prize",
                  { $subtract: [1, { $divide: ["$developer_fee", 100] }] },
                ],
              },
            },
          },
        },
      ]);

      return { conversations, challenges };
    } catch (error) {
      console.error("Error fetching user conversation count:", error);
      return false;
    }
  }

  async getBreakers(query) {
    try {
      const breakers = await Breaker.find(query);
      return breakers;
    } catch (error) {
      console.error("Error fetching breakers:", error);
      return false;
    }
  }

  async getBreakerByAddress(address) {
    try {
      return await Breaker.findOne(address);
    } catch (error) {
      console.error("Error fetching breaker:", error);
      return false;
    }
  }

  async getBreakerByIp(ip) {
    try {
      return await Breaker.findOne({ cf_ip: ip });
    } catch (error) {
      console.error("Error fetching breaker:", error);
      return false;
    }
  }

  async updateBreakers(query, update) {
    try {
      return await Breaker.updateMany(query, update);
    } catch (error) {
      console.error("Error updating breakers:", error);
      return false;
    }
  }

  async saveBreakerIfNotExists(breaker) {
    try {
      const existingBreaker = await Breaker.findOne({
        address: breaker.address,
      });
      if (!existingBreaker) {
        return await Breaker.create(breaker);
      }
      return existingBreaker;
    } catch (error) {
      console.error("Error saving breaker:", error);
      return false;
    }
  }

  async getHighestScore(name) {
    try {
      return await Chat.find({
        challenge: name,
        "tool_calls.score": { $ne: null },
      })
        .sort({ "tool_calls.score": -1 })
        .limit(1);
    } catch (error) {
      console.error("Error fetching highest score:", error);
      return false;
    }
  }

  async getHighestAndLatestScore(name) {
    try {
      return await Chat.find({
        challenge: name,
        "tool_calls.score": { $ne: null },
      })
        .sort({ "tool_calls.score": -1, date: -1 })
        .limit(1);
    } catch (error) {
      console.error("Error fetching highest score:", error);
      return false;
    }
  }

  async getSendersByChallenge(query) {
    return await Chat.aggregate([
      { $match: query },
      { $group: { _id: "$address" } },
      { $project: { _id: 0, address: "$_id" } },
    ]);
  }

  async saveAgent(agent) {
    try {
      // const { error } = agentValidator.validate(agent);
      // if (error) {
      //   throw new Error(error.message);
      // }
      const savedAgent = await Challenge.create({
        owner: agent.owner,
        title: agent.title || `Jailbreak ${agent.name}`,
        name: agent.name,
        tldr: agent.tldr || null,
        label: agent.opening_message,
        task: agent.task || `Jailbreak ${agent.name}`,
        winning_message:
          agent.winning_message ||
          `${agent.name} has been successfully jailbroken!`,
        type: agent.type || "phrases",
        pfp: agent.pfp,
        status: agent.status || "active",
        assistant_id: agent.assistant_id,
        language: "english",
        disable: agent.disable || ["special_characters"],
        start_date: agent.start_date || new Date(),
        expiry: agent.expiry || new Date(Date.now() + 24 * 60 * 60 * 1000),
        model: agent.model || "gpt-4o-mini",
        contextLimit: agent.contextLimit || 1,
        chatLimit: agent.chatLimit || 100,
        characterLimit: agent.characterLimit || 500,
        charactersPerWord: agent.charactersPerWord || null,
        suffix: agent.suffix || null,
        agent_logic: agent.agent_logic || null,
        winner: null,
        break_attempts: 0,
        fee_multiplier: agent.fee_multiplier,
        initial_pool_size: agent.initial_pool_size,
        winning_prize: agent.initial_pool_size,
        usd_prize: agent.usd_prize,
        entryFee: agent.entryFee,
        developer_fee: agent.developer_fee,
        expiry_logic: agent.expiry_logic || "last_sender",
        airdrop_split: agent.airdrop_split || {
          winner: 20,
          creator: 20,
        },
        phrases: agent.phrases || [],
        tournament_id: agent.tournament_id,
        tournamentPDA: agent.tournamentPDA,
        idl: agent.idl,
        instructions: agent.instructions,
        tools_description:
          agent.tools_description ||
          `${agent.name} has no available tools, this is a freestyle jailbreak.`,
        success_function: agent.success_function || null,
        fail_function: agent.fail_function || null,
        tool_choice: agent.tool_choice || "none",
        tools: agent.tools || [],
      });
      return savedAgent;
    } catch (error) {
      console.error("Error creating agent:", error);
      return false;
    }
  }

  async getChallengesWithFilters({
    status,
    verified,
    sort,
    limit = 100,
    lastId = null,
    sortDirection = -1,
  }) {
    try {
      // Build base query with status filter
      const baseQuery = status === "$type" ? {} : { status };

      // Add verified filter
      if (verified === "verified") {
        baseQuery.verified_owner = { $ne: null };
      }

      // Add cursor pagination
      const query = lastId
        ? {
            ...baseQuery,
            _id: sortDirection === 1 ? { $gt: lastId } : { $lt: lastId },
          }
        : baseQuery;

      // Handle special case for expiry sorting
      if (sort === "expiry_desc" && status !== "active") {
        throw new Error(
          "Expiry sorting is only available for active challenges"
        );
      }

      // Define sort configuration
      const sortConfigs = {
        start_date_asc: { start_date: 1 },
        start_date_desc: { start_date: -1 },
        expiry_desc: { expiry: -1 },
        attempts_asc: { break_attempts: 1 },
        attempts_desc: { break_attempts: -1 },
        usd_prize_asc: { usd_prize: 1 },
        usd_prize_desc: { usd_prize: -1 },
        entryFee_asc: { entryFee: 1 },
        entryFee_desc: { entryFee: -1 },
      };

      const sortBy = sortConfigs[sort] || { start_date: -1 };

      const challenges = await Challenge.find(query, {
        _id: 1,
        name: 1,
        title: 1,
        image: 1,
        label: 1,
        level: 1,
        status: 1,
        pfp: 1,
        entryFee: 1,
        expiry: 1,
        winning_prize: 1,
        developer_fee: 1,
        start_date: 1,
        usd_prize: 1,
        break_attempts: 1,
        fee_multiplier: 1,
        tag: 1,
        sample: 1,
        sample_keyword: 1,
        verified_owner: 1,
      })
        .sort({ ...sortBy, _id: sortDirection })
        .limit(limit);

      // Get the next cursor
      const hasMore = challenges.length === limit;
      const nextCursor = hasMore ? challenges[challenges.length - 1]._id : null;

      return {
        challenges,
        nextCursor,
        hasMore,
      };
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getAgentsByOwner(address) {
    return await Challenge.find(
      { owner: address },
      {
        _id: 1,
        owner: 1,
        name: 1,
        title: 1,
        image: 1,
        label: 1,
        level: 1,
        status: 1,
        pfp: 1,
        entryFee: 1,
        expiry: 1,
        winning_prize: 1,
        developer_fee: 1,
        start_date: 1,
        usd_prize: 1,
        break_attempts: 1,
        fee_multiplier: 1,
        tag: 1,
        sample: 1,
        sample_keyword: 1,
      }
    ).sort({ start_date: -1 });
  }

  async getFullAgent(agentId, walletAddress) {
    return await Challenge.findOne({ _id: agentId, owner: walletAddress });
  }
}

export default new DataBaseService();
