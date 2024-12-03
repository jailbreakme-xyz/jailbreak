import express from "express";
import { Challenge, Settings, Chat } from "../models/Models.js";
import BlockchainService from "../services/blockchain/index.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

// import { challenges } from "../data/challenges.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const challenges = await Challenge.find({});
    // await Challenge.insertMany(challenges);
    res.send(challenges);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.get("/get-challenge", async (req, res) => {
  try {
    const id = req.query.id;
    const challenge = await Challenge.findOne(
      { _id: id },
      {
        _id: 1,
        title: 1,
        label: 1,
        task: 1,
        level: 1,
        image: 1,
        pfp: 1,
        active: 1,
        name: 1,
        deployed: 1,
      }
    );

    if (!challenge) {
      return res.status(404).send("Challenge not found");
    }

    if (!challenge.active) {
      return res.status(404).send("Challenge is not active");
    }

    // Check if challenge needs tournament deployment

    // if (!challenge.deployed) {
    //   try {
    //     // Create new tournament with initial entry fee
    //     const initialEntryFee = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL
    //     const transaction = await BlockchainService.createTournament(
    //       initialEntryFee
    //     );

    //     challenge.deployed = true;
    //     await challenge.save();

    //     const [tournamentPDA] = PublicKey.findProgramAddressSync(
    //       [Buffer.from("tournament")],
    //       BlockchainService.programId
    //     );
    //     challenge.tournamentAddress = tournamentPDA.toString();
    //     await challenge.save();
    //   } catch (error) {
    //     console.error("Failed to deploy tournament:", error);
    //     return res.status(500).send("Failed to deploy tournament");
    //   }
    // }

    // Get current entry fee from blockchain
    // const tournamentData = await BlockchainService.getTournamentData(
    //   challenge.tournamentAddress
    // );

    // const message_price = Number(tournamentData.entryFee) / LAMPORTS_PER_SOL;
    const break_attempts = await Chat.countDocuments({ challenge: id });
    const message_price = 14.83;
    const chatLimit = 20;
    const firstPrompt = challenge.system_message;
    // const address = req.walletAddress;

    const chatHistory = await Chat.find({
      challenge: id,
      role: { $ne: "system" },
    })
      .sort({ date: -1 })
      .limit(chatLimit);

    if (chatHistory.length > 0) {
      return res.status(200).json({
        challenge,
        break_attempts,
        message_price,
        chatHistory: chatHistory.reverse(),
      });
    }

    const found = await Chat.findOne({
      challenge: challenge,
    });

    if (!found) {
      const newChat = await Chat.create({
        challenge: id,
        model: model,
        role: "system",
        content: firstPrompt,
        ip: clientIp,
      });

      console.log("New chat document created:", newChat);
    }

    // const settings = await Settings.findOne({
    //   _id: "67499aec7a5af63de4eb84fb",
    // });

    return res.status(200).json({
      challenge,
      break_attempts,
      message_price: Number(tournamentData.entryFee) / LAMPORTS_PER_SOL,
      chatHistory,
      tournamentData,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).send(err);
  }
});

export { router as challengesRoute };
