import { Chat, Challenge, Pages } from "../../models/Models.js";
import dotenv from "dotenv";

dotenv.config();

class DataBaseService {
  constructor() {
    // Constructor remains empty as we don't need initialization logic
  }

  // Challenge-related methods
  async getAllChallenges() {
    try {
      return await Challenge.find(
        {},
        {
          _id: 1,
          title: 1,
          label: 1,
          task: 1,
          level: 1,
          model: 1,
          image: 1,
          pfp: 1,
          status: 1,
          name: 1,
          deployed: 1,
          idl: 1,
          tournamentPDA: 1,
          entryFee: 1,
          characterLimit: 1,
          contextLimit: 1,
          chatLimit: 1,
          initial_pool_size: 1,
          expiry: 1,
          developer_fee: 1,
        }
      );
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
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

  async updateChallenge(id, updateData) {
    try {
      return await Challenge.updateOne({ _id: id }, { $set: updateData });
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

  async getChatHistory(query, sort = { date: -1 }, limit = 0) {
    try {
      return await Chat.find(query)
        .sort(sort)
        .limit(limit)
        .select("role content -_id");
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }

  async getFullChatHistory(query, projection, sort = { date: -1 }, limit = 0) {
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
}

export default new DataBaseService();
