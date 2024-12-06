import express from "express";
import { Challenge, Chat } from "../models/Models.js";
import BlockchainService from "../services/blockchain/index.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const solanaRpc = process.env.RPC_URL_DEVNET;
const model = "gpt-4o-mini";

router.get("/", async (req, res) => {
  try {
    const challenges = await Challenge.find({});
    res.send(challenges);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.get("/get-challenge", async (req, res) => {
  try {
    const name = req.query.name;
    const nameReg = { $regex: name, $options: "i" };
    const initial = req.query.initial;
    let message_price = Number(req.query.price);
    let prize = message_price * 100;

    const projection = {
      _id: 1,
      title: 1,
      label: 1,
      task: 1,
      level: 1,
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
      expiry: 1,
    };

    const challengeInitialized = await Chat.findOne({
      challenge: nameReg,
    });

    if (!challengeInitialized) {
      projection.system_message = 1;
    }

    let challenge = await Challenge.findOne({ name: nameReg }, projection);
    const challengeName = challenge.name;
    const challengeId = challenge._id;
    const chatLimit = challenge.chatLimit;

    if (!challenge) {
      return res.status(404).send("Challenge not found");
    }

    const allowedStatuses = ["active", "concluded"];
    if (!allowedStatuses.includes(challenge.status)) {
      return res.status(404).send("Challenge is not active");
    }

    const programId = challenge.idl?.address;
    if (!programId) return res.write("Program ID not found");

    const tournamentPDA = challenge.tournamentPDA;
    if (!tournamentPDA) return res.write("Tournament PDA not found");

    const break_attempts = await Chat.countDocuments({
      challenge: challengeName,
      role: "user",
    });

    const chatHistory = await Chat.find({
      challenge: challengeName,
      role: { $ne: "system" },
    })
      .sort({ date: -1 })
      .limit(chatLimit);

    const now = new Date();
    const expiry = challenge.expiry;

    if (chatHistory.length > 0) {
      if (expiry < now && challenge.status === "active") {
        const lastSender = chatHistory[0].address;
        const blockchainService = new BlockchainService(solanaRpc, programId);
        const concluded = await blockchainService.concludeTournament(
          tournamentPDA,
          lastSender
        );
        const successMessage = `🥳 Tournament concluded: ${concluded}`;
        const assistantMessage = {
          challenge: challengeName,
          model: model,
          role: "assistant",
          content: successMessage,
          tool_calls: {},
          address: lastSender,
        };

        await Chat.create(assistantMessage);
        await Challenge.updateOne(
          { _id: challengeId },
          { $set: { status: "concluded" } }
        );
      }

      message_price = challenge.entryFee;
      prize = message_price * 100;

      return res.status(200).json({
        challenge,
        break_attempts,
        message_price,
        prize,
        expiry,
        chatHistory: chatHistory.reverse(),
      });
    }

    if (!challengeInitialized) {
      const firstPrompt = challenge.system_message;
      const newChat = await Chat.create({
        challenge: challengeName,
        model: model,
        role: "system",
        content: firstPrompt,
        address: challenge.tournamentPDA,
      });

      console.log("New chat document created:", newChat);
    }

    if (initial) {
      const blockchainService = new BlockchainService(solanaRpc, programId);
      const tournamentData = await blockchainService.getTournamentData(
        tournamentPDA
      );

      message_price = tournamentData.entryFee;
      prize = message_price * 100;
    }

    return res.status(200).json({
      challenge,
      break_attempts,
      message_price,
      prize,
      chatHistory,
      expiry,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).send(err);
  }
});

export { router as challengesRoute };
