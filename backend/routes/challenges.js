import express from "express";
import BlockchainService from "../services/blockchain/index.js";
import dotenv from "dotenv";
import DatabaseService from "../services/db/index.js";
import getSolPriceInUSDT from "../hooks/solPrice.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Challenge } from "../models/Models.js";
dotenv.config();

const router = express.Router();
const RPC_ENV = process.env.NODE_ENV === "development" ? "devnet" : "mainnet";

const solanaRpc = `https://${RPC_ENV}.helius-rpc.com/?api-key=${process.env.RPC_KEY}`;

const model = "gpt-4o-mini";

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

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
      airdrop_split: 1,
      verified_owner: 1,
      type: 1,
      owner: 1,
      tools: 1,
      framework: 1,
      use_alcatraz: 1,
    };

    let challenge = await DatabaseService.getChallengeByName(name, projection);
    if (!challenge) {
      return res.status(404).send("Challenge not found");
    }

    if (challenge.tools_description) {
      challenge.tools = [];
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
      alcatraz: 1,
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
      if (
        expiry < now &&
        challenge.status === "active" &&
        challenge.type != "transfer"
      ) {
        await DatabaseService.updateChallenge(challengeId, {
          status: "concluded",
        });

        const blockchainService = new BlockchainService(solanaRpc, programId);
        const tournamentData = await blockchainService.getTournamentData(
          tournamentPDA
        );

        let winner;
        if (challenge.expiry_logic === "score") {
          const topScoreMsg = await DatabaseService.getHighestAndLatestScore(
            challengeName
          );
          winner = topScoreMsg[0].address;
        } else if (challenge.expiry_logic === "last_sender") {
          winner = chatHistory[0].address;
        }

        const deploymentData = await DatabaseService.getOnePage({
          name: "deployment-data",
        });

        const owner_address =
          deploymentData.content.deploymentData.owner_address;
        const owner_fee = deploymentData.content.deploymentData.owner_fee;

        // Creator gets his fee minus owner fee, owner gets the rest to be distributed to airdrop
        const concluded = await blockchainService.concludeTournament(
          tournamentPDA,
          owner_address
        );

        const winnerShare = challenge.airdrop_split.winner;
        const creatorShare = challenge.airdrop_split.creator;
        const creatorRefund = owner_fee;
        const airdropShare = 100 - owner_fee - winnerShare - creatorShare;

        let successMessage = `⏱️ Tournament Expired - ${winnerShare}% to winner, ${creatorShare}% to creator, ${airdropShare}% to airdrop`;
        successMessage += `\n💰 Total prize: ${
          tournamentData.total_lamports / LAMPORTS_PER_SOL
        } SOL`;

        const senders = await DatabaseService.getSendersByChallenge({
          challenge: challengeName,
          address: { $ne: winner },
        });

        const recipients = senders.map((sender) => sender.address);

        const creatorAirdropAmount =
          (tournamentData.total_lamports * creatorRefund) / 100;
        let totalCreatorAmount = creatorAirdropAmount;

        // Handle winner share
        const winnerAirdropAmount =
          (tournamentData.total_lamports * winnerShare) / 100;
        if (winner) {
          const winnerSolAmount = winnerAirdropAmount / LAMPORTS_PER_SOL;
          const winnerAirdropped = await blockchainService.airDrop(
            [winner],
            winnerAirdropAmount
          );

          successMessage += `\n🎁 Airdropped ${winnerSolAmount.toFixed(
            3
          )} SOL to ${winner}\n${
            winnerAirdropped && winnerAirdropped.length > 0
              ? "✅ Airdropped successfully"
              : "❌ Airdrop failed, we will airdrop manually"
          }`;
        } else {
          // Add winner's share to creator amount if no winner
          totalCreatorAmount += winnerAirdropAmount;
          successMessage +=
            "\n💫 No winner found - winner's share added to creator amount";
        }

        // Handle recipients share
        const airdropAmount =
          (tournamentData.total_lamports * airdropShare) / 100;
        if (recipients.length > 0) {
          const airdropSolAmount = airdropAmount / LAMPORTS_PER_SOL;
          const airdropped = await blockchainService.airDrop(
            recipients,
            airdropAmount
          );

          successMessage += `\n🎁 Airdropped ${airdropSolAmount.toFixed(
            3
          )} SOL among ${recipients.length} recipients.\n${
            airdropped && airdropped.length > 0
              ? "✅ Airdropped successfully"
              : "❌ Airdrop failed, we will airdrop manually"
          }`;
        } else {
          // Add recipients' share to creator amount if no recipients
          totalCreatorAmount += airdropAmount;
          successMessage +=
            "\n💫 No recipients found - airdrop share added to creator amount";
        }

        // Send accumulated creator amount
        const creatorAirdropped = await blockchainService.airDrop(
          [tournamentData.authority],
          totalCreatorAmount
        );

        // const totalCreatorSol = totalCreatorAmount / LAMPORTS_PER_SOL;
        const creatorShareSol =
          (tournamentData.total_lamports * creatorShare) /
          100 /
          LAMPORTS_PER_SOL;
        successMessage += `\n👑 Sent ${creatorShareSol.toFixed(
          3
        )} SOL to creator\n${
          creatorAirdropped && creatorAirdropped.length > 0
            ? "✅ Sent successfully"
            : "❌ Transfer failed, we will send manually"
        }`;

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
