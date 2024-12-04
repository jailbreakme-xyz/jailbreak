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
    const id = req.query.id;
    const chatLimit = 50;

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
      challenge: id,
    });

    if (!challengeInitialized) {
      projection.system_message = 1;
    }

    let challenge = await Challenge.findOne({ _id: id }, projection);

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

    const blockchainService = new BlockchainService(solanaRpc, programId);
    const tournamentData = await blockchainService.getTournamentData(
      tournamentPDA
    );

    const message_price = tournamentData.entryFee;
    const prize = message_price * 100;

    const break_attempts = await Chat.countDocuments({
      challenge: id,
      role: "user",
    });

    const chatHistory = await Chat.find({
      challenge: id,
      role: { $ne: "system" },
    })
      .sort({ date: -1 })
      .limit(chatLimit);

    const now = new Date();
    const expiry = challenge.expiry;

    if (chatHistory.length > 0) {
      if (expiry < now && challenge.status === "active") {
        const lastSender = chatHistory[0].address;
        const concluded = await blockchainService.concludeTournament(
          tournamentPDA,
          lastSender
        );
        const successMessage = `🥳 Tournament concluded: ${concluded}`;
        const assistantMessage = {
          challenge: id,
          model: model,
          role: "assistant",
          content: successMessage,
          tool_calls: {},
          address: lastSender,
        };

        await Chat.create(assistantMessage);
        await Challenge.updateOne(
          { _id: id },
          { $set: { status: "concluded" } }
        );
      }

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
        challenge: id,
        model: model,
        role: "system",
        content: firstPrompt,
        address: challenge.tournamentPDA,
      });

      console.log("New chat document created:", newChat);
    }

    return res.status(200).json({
      challenge,
      break_attempts,
      message_price,
      prize,
      chatHistory,
      expiry,
      tournamentData,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).send(err);
  }
});

export { router as challengesRoute };
