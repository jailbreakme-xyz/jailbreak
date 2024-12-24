import express from "express";
import BlockchainService from "../services/blockchain/index.js";
import dotenv from "dotenv";
import DatabaseService from "../services/db/index.js";
import getSolPriceInUSDT from "../hooks/solPrice.js";

dotenv.config();

const router = express.Router();
const RPC_ENV = process.env.NODE_ENV === "development" ? "devnet" : "mainnet";

const solanaRpc = `https://${RPC_ENV}.helius-rpc.com/?api-key=${process.env.RPC_KEY}`;

const model = "gpt-4o-mini";

router.get("/get-challenge", async (req, res) => {
  try {
    const name = req.query.name;
    const initial = req.query.initial;
    const projection = {
      _id: 1,
      title: 1,
      label: 1,
      task: 1,
      tools_description: 1,
      custom_rules: 1,
      disable: 1,
      start_date: 1,
      charactersPerWord: 1,
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
      usd_prize: 1,
      break_attempts: 1,
      language: 1,
      tldr: 1,
      fee_multiplier: 1,
      agent_logic: 1,
      expiry_logic: 1,
      custom_user_img: 1,
      tag: 1,
      winning_prize: 1,
      usd_prize: 1,
    };

    let challenge = await DatabaseService.getChallengeByName(name, projection);
    if (!challenge) {
      return res.status(404).send("Challenge not found");
    }

    const solPrice = await getSolPriceInUSDT(initial === "true");
    let fee_multiplier = challenge.fee_multiplier || 100;
    const message_price = challenge.entryFee;
    const usdMessagePrice = message_price * solPrice;
    const prize =
      challenge.fee_multiplier === 1
        ? challenge.winning_prize
        : message_price * fee_multiplier;
    const usdPrize = challenge.usd_prize;

    const challengeName = challenge.name;
    const challengeId = challenge._id;
    const chatLimit = challenge.chatLimit;

    if (!challenge) {
      return res.status(404).send("Challenge not found");
    }

    const allowedStatuses = ["active", "concluded", "upcoming"];

    if (!allowedStatuses.includes(challenge.status)) {
      return res.status(404).send("Challenge is not active");
    }

    const programId = challenge.idl?.address;
    if (!programId) return res.write("Program ID not found");

    const tournamentPDA = challenge.tournamentPDA;
    if (!tournamentPDA) return res.write("Tournament PDA not found");

    const break_attempts = challenge.break_attempts;

    const chatProjection = {
      challenge: 1,
      role: 1,
      content: 1,
      address: 1,
      txn: 1,
      date: 1,
      win: 1,
    };

    if (!challenge.tools_description) {
      chatProjection.tool_calls = 1;
    }

    const chatHistory = await DatabaseService.getChatHistory(
      {
        challenge: challengeName,
        role: { $ne: "system" },
      },
      chatProjection,
      { date: -1 },
      chatLimit
    );

    const now = new Date();
    const expiry = challenge.expiry;

    if (
      challenge.start_date <= now &&
      expiry >= now &&
      challenge.status === "upcoming"
    ) {
      await DatabaseService.updateChallenge(challengeId, {
        status: "active",
      });
    }

    let highestScore = 0;
    if (challenge.agent_logic === "scoring") {
      const highestScoreMessage = await DatabaseService.getHighestScore(
        challenge.name
      );
      if (highestScoreMessage?.length > 0) {
        highestScore = highestScoreMessage[0]?.tool_calls.score;
      }
    }

    if (chatHistory.length > 0) {
      if (expiry < now && challenge.status === "active") {
        await DatabaseService.updateChallenge(challengeId, {
          status: "concluded",
        });

        let winner;
        if (challenge.expiry_logic === "score") {
          const topScoreMsg = await DatabaseService.getHighestAndLatestScore(
            challengeName
          );
          winner = topScoreMsg[0].address;
        } else {
          winner = chatHistory[0].address;
        }
        const blockchainService = new BlockchainService(solanaRpc, programId);
        const concluded = await blockchainService.concludeTournament(
          tournamentPDA,
          winner
        );
        const successMessage = `🥳 Tournament concluded: ${concluded}`;
        const assistantMessage = {
          challenge: challengeName,
          model: model,
          role: "assistant",
          content: successMessage,
          tool_calls: {},
          address: winner,
        };

        await DatabaseService.createChat(assistantMessage);
        await DatabaseService.updateChallenge(challengeId, {
          expiry: new Date(),
          winning_prize: prize,
          usd_prize: usdPrize,
          winner: winner,
        });
      }

      return res.status(200).json({
        challenge,
        break_attempts,
        message_price,
        prize,
        usdMessagePrice,
        usdPrize,
        expiry,
        solPrice,
        highestScore,
        chatHistory: chatHistory.reverse(),
      });
    }

    if (initial === "true") {
      const blockchainService = new BlockchainService(solanaRpc, programId);
      const tournamentData = await blockchainService.getTournamentData(
        tournamentPDA
      );
    }

    return res.status(200).json({
      challenge,
      break_attempts,
      message_price,
      prize,
      usdMessagePrice,
      usdPrize,
      chatHistory,
      expiry,
      solPrice,
      highestScore,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).send(err);
  }
});

export { router as challengesRoute };
