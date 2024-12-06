import { Chat, Challenge, Pages } from "../../models/Models.js";
import dotenv from "dotenv";

dotenv.config();

class DataBaseService {
  constructor() {
    // Constructor remains empty as we don't need initialization logic
  }

  // Challenge-related methods
  async getAllChallenges() {
    return await Challenge.find({});
  }

  async getChallengeById(id, projection = {}) {
    return await Challenge.findOne({ _id: id }, projection);
  }

  async getChallengeByName(name, projection = {}) {
    const nameReg = { $regex: name, $options: "i" };
    return await Challenge.findOne({ name: nameReg }, projection);
  }

  async updateChallenge(id, updateData) {
    return await Challenge.updateOne({ _id: id }, { $set: updateData });
  }

  // Chat-related methods
  async createChat(chatData) {
    return await Chat.create(chatData);
  }

  async getChatHistory(query, sort = { date: -1 }, limit = 0) {
    return await Chat.find(query)
      .sort(sort)
      .limit(limit)
      .select("role content -_id");
  }

  async getFullChatHistory(query, sort = { date: -1 }, limit = 0) {
    return await Chat.find(query).sort(sort).limit(limit);
  }

  async getChatCount(query) {
    return await Chat.countDocuments(query);
  }

  async findOneChat(query) {
    return await Chat.findOne(query);
  }
  async getPages() {
    return await Pages.find({});
  }
  // Settings-related methods
  async getSettings() {
    const challenges = await Challenge.find(
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
      }
    );
    return challenges;
  }

  // Add these new methods
  async getUserConversations(address, skip = 0, limit = 20) {
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
  }

  async getChallengeConversations(address, challenge, skip = 0, limit = 20) {
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
  }

  async getAllTournaments() {
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
        tools: 1,
        idl: 1,
      }
    );
  }

  async getTournamentById(id) {
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
        tools: 1,
        idl: 1,
      }
    );
  }

  async createTournament(tournamentData) {
    const savedChallenge = new Challenge(tournamentData);
    await savedChallenge.save();
    return savedChallenge;
  }
}

export default new DataBaseService();
