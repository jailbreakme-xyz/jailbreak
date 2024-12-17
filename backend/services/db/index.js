import {
  Chat,
  Challenge,
  Pages,
  Transaction,
  Breaker,
} from "../../models/Models.js";
import dotenv from "dotenv";

dotenv.config();

class DataBaseService {
  constructor() {
    // Constructor remains empty as we don't need initialization logic
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
    const nameReg = { $regex: name, $options: "i" };
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
  // Settings-related methods
  async getSettings() {
    try {
      const challenge = await Challenge.find(
        {},
        {
          _id: 0,
          id: "$_id",
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
        }
      );

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

  async getTopBreakersAndChatters() {
    try {
      // Aggregation for Top Breakers from the 'challenges' collection
      const topBreakers = await Challenge.aggregate([
        {
          $match: {
            winner: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$winner",
            winCount: { $sum: 1 },
            totalUsdPrize: { $sum: "$usd_prize" },
            developerFee: { $first: "$developer_fee" },
          },
        },
        {
          $lookup: {
            from:
              process.env.NODE_ENV === "development" ? "chats_test" : "chats",
            let: { challengeId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$address", "$$challengeId"] },
                      { $eq: ["$role", "user"] },
                    ],
                  },
                },
              },
            ],
            as: "userChats",
          },
        },
        {
          $addFields: {
            chatCount: { $size: "$userChats" },
            netUsdPrize: {
              $multiply: [
                "$totalUsdPrize",
                { $subtract: [1, { $divide: ["$developerFee", 100] }] },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            address: "$_id",
            winCount: 1,
            chatCount: 1,
            totalUsdPrize: "$netUsdPrize",
          },
        },
        { $sort: { totalUsdPrize: -1 } },
        { $limit: 10 },
      ]);

      // Aggregation for Top Chatters from the 'chats' collection
      const topChatters = await Chat.aggregate([
        { $match: { role: "user" } },
        {
          $group: {
            _id: "$address",
            chatCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            address: "$_id",
            chatCount: 1,
          },
        },
        { $sort: { chatCount: -1 } },
        { $limit: 11 },
      ]);

      // Exclude top breakers from top chatters
      const breakerAddresses = topBreakers.map((breaker) => breaker.address);
      const filteredTopChatters = topChatters.filter(
        (chatter) => !breakerAddresses.includes(chatter.address)
      );

      return {
        topBreakers,
        topChatters: filteredTopChatters,
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
}

export default new DataBaseService();
