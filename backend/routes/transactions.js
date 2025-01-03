import express from "express";
import BlockchainService from "../../backend/services/blockchain/index.js";
import DataBaseService from "../../backend/services/db/index.js";
import dotenv from "dotenv";
import { createHash } from "crypto";
import crypto from "crypto";
import { sha256 } from "js-sha256";
import { PublicKey } from "@solana/web3.js";
import { solanaAuth } from "../middleware/solanaAuth.js";
import multer from "multer";
import { validateTournament } from "../hooks/validateTournament.js";

dotenv.config();

const router = express.Router();

const RPC_ENV = process.env.NODE_ENV === "development" ? "devnet" : "mainnet";

const solanaRpc = `https://${RPC_ENV}.helius-rpc.com/?api-key=${process.env.RPC_KEY}`;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      const ext = file.mimetype.split("/")[1].toLowerCase();
      if (["png", "jpg", "jpeg", "gif"].includes(ext)) {
        cb(null, true);
        return;
      }
    }
    cb(new Error("Only .png, .jpg, .jpeg and .gif files are allowed!"));
  },
});

const hashString = (str) => {
  return createHash("sha256").update(str, "utf-8").digest("hex");
};

router.post("/get-transaction", solanaAuth, async (req, res) => {
  const { solution, userWalletAddress, id } = req.body;
  try {
    const challenge = await DataBaseService.getChallengeById(id, {});

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found." });
    }

    if (userWalletAddress !== req.user.walletAddress) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const challengeName = challenge.name;
    const tournamentPDA = challenge.tournamentPDA;
    const solutionHash = hashString(solution);
    const programId = challenge.idl.address;

    const blockchainService = new BlockchainService(solanaRpc, programId);

    const tournamentData = await blockchainService.getTournamentData(
      tournamentPDA
    );

    const entryFee = tournamentData.entryFee;
    const { serializedTransaction } =
      await blockchainService.createSubmitSolutionTransaction(
        tournamentPDA,
        solutionHash,
        userWalletAddress
      );

    if (!serializedTransaction) {
      return res.status(500).json({ error: "Failed to create transaction." });
    }

    // const mainnetBlockchainService = new BlockchainService(
    //   mainSolanaRpc,
    //   challenge.idl.address
    // );

    // let holdings, accountCreationTimestamp;
    // const foundHoldings = await DataBaseService.getTransactionByAddress(
    //   userWalletAddress
    // );

    // if (foundHoldings && foundHoldings.transactions_data) {
    //   holdings = foundHoldings.transactions_data.holdings;
    //   accountCreationTimestamp =
    //     foundHoldings.transactions_data.accountCreationDate;
    // } else {
    //   holdings = await mainnetBlockchainService.fetchUserTokenHoldings(
    //     userWalletAddress,
    //     100,
    //     true
    //   );
    //   accountCreationTimestamp =
    //     await mainnetBlockchainService.getAccountCreationTimestamp(
    //       userWalletAddress
    //     );
    // }
    const transactionId = crypto.randomUUID();

    const transactionData = {
      challengeName,
      transactionId,
      tournamentPDA,
      solutionHash,
      userWalletAddress,
      unsignedTransaction: serializedTransaction,
      createdAt: new Date(),
      status: "pending",
      entryFee,
      // transactions_data: {
      //   holdings: holdings,
      //   accountCreationDate: new Date(accountCreationTimestamp * 1000),
      // },
    };

    const savedTransaction = await DataBaseService.saveTransaction(
      transactionData
    );

    if (!savedTransaction) {
      console.log("Failed to save transaction in the database.");
      return res.status(500).json({ error: "Failed to save transaction." });
    }

    res.status(200).json({
      serializedTransaction,
      transactionId,
      token: req.user.token,
    });
  } catch (error) {
    console.error("Error processing transaction:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/create-start-tournament-transaction",
  upload.single("pfp"),
  solanaAuth,
  async (req, res) => {
    try {
      const deploymentData = await DataBaseService.getOnePage({
        name: "deployment-data",
      });

      const user = req.user;

      const creation_fee = deploymentData.content.deploymentData.creation_fee;
      const owner_address = deploymentData.content.deploymentData.owner_address;

      const programId = deploymentData.content.deploymentData.program_id;
      const defaultWinnerPayoutPct =
        deploymentData.content.deploymentData.default_winner_payout;
      const defaultFeeType =
        deploymentData.content.deploymentData.default_fee_type;
      const royalty_payout_pct =
        deploymentData.content.deploymentData.owner_fee;

      const randomString = Math.random().toString(36).substring(2, 15);
      const tournamentId = BigInt("0x" + sha256(randomString).substring(0, 16));

      const body = JSON.parse(req.body.data);
      const sender = user.walletAddress;
      const initialSol = body.initial_pool_size;
      const feeMulPct = body.fee_multiplier * 10;
      const systemPrompt = body.instructions;
      const name = body.name;
      const openingMessage = body.opening_message;
      const pfp = req.file ? req.file.buffer : req.body.pfp;

      const winnerPayoutPct = defaultWinnerPayoutPct;
      const feeType = defaultFeeType;
      const developer_fee = 100 - winnerPayoutPct;

      const existingAgent = await DataBaseService.getChallengeByName(name);
      if (existingAgent) {
        return res.status(400).json({ error: "Agent name already exists" });
      }

      const tournament = {
        ...body,
        developer_fee: developer_fee,
        opening_message: openingMessage,
        tournament_type: "phrases",
        phrases: body.phrases,
        tools: [],
        tools_description: "",
        tool_choice_required: false,
        success_function: "",
        disable: ["special_characters"],
        characterLimit: 500,
        contextLimit: 1,
        charactersPerWord: null,
        start_date: new Date(),
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        title: `Jailbreak ${name}`,
        tldr: null,
        constant_message_price: false,
      };

      const error = validateTournament({
        tournament,
        sender,
        winner_payout_pct: winnerPayoutPct,
        feeType: feeType,
        pfp: pfp,
      });

      if (error) {
        return res.status(400).json({ error: error });
      }

      const blockchainService = new BlockchainService(solanaRpc, programId);

      const result = await blockchainService.initializeAndStartTournament(
        sender,
        new PublicKey(programId),
        initialSol,
        feeMulPct,
        winnerPayoutPct,
        systemPrompt,
        feeType,
        royalty_payout_pct,
        tournamentId,
        false,
        creation_fee,
        owner_address
      );

      if (!result) {
        return res.status(500).json({
          error: "Failed to initialize and start tournament",
        });
      }

      return res.json({
        serializedTransaction: result.serializedTransaction,
        tournamentPDA: result.tournamentPDA,
        tournamentId: tournamentId.toString(),
        token: user.token,
      });
    } catch (error) {
      console.error("Tournament initialization error:", error);
      return res.status(500).json({
        error: "Failed to initialize tournament",
        details: error.message,
      });
    }
  }
);

router.post(
  "/advanced-create-start-tournament-transaction",
  upload.single("pfp"),
  solanaAuth,
  async (req, res) => {
    try {
      const deploymentData = await DataBaseService.getOnePage({
        name: "deployment-data",
      });

      const user = req.user;

      const creation_fee = deploymentData.content.deploymentData.creation_fee;
      const owner_address = deploymentData.content.deploymentData.owner_address;
      const programId = deploymentData.content.deploymentData.program_id;
      const royalty_payout_pct =
        deploymentData.content.deploymentData.owner_fee;

      const randomString = Math.random().toString(36).substring(2, 15);
      const tournamentId = BigInt("0x" + sha256(randomString).substring(0, 16));

      const body = JSON.parse(req.body.data);
      const sender = user.walletAddress;
      const initialSol = body.initial_pool_size;
      const feeMulPct = body.fee_multiplier / 10;
      const systemPrompt = body.instructions;
      const developer_fee = body.developer_fee;
      const constant_message_price = body.constant_message_price;
      const winnerPayoutPct = 100 - developer_fee;
      const feeType = constant_message_price ? 1 : 0;

      const existingAgent = await DataBaseService.getChallengeByName(body.name);
      if (existingAgent) {
        return res.status(400).json({ error: "Agent name already exists" });
      }

      const error = validateTournament({
        tournament: {
          ...body,
          fee_multiplier: feeMulPct / 10,
          phrases:
            body.tournament_type === "phrases"
              ? body.phrases
              : ["FUNCTION_CALL"],
        },
        sender,
        winner_payout_pct: winnerPayoutPct,
        feeType: feeType,
        pfp: req.file ? req.file.buffer : req.body.pfp,
      });

      if (error) {
        return res.status(400).json({ error: error });
      }

      const blockchainService = new BlockchainService(solanaRpc, programId);

      const result = await blockchainService.initializeAndStartTournament(
        sender,
        new PublicKey(programId),
        initialSol,
        feeMulPct,
        winnerPayoutPct,
        systemPrompt,
        feeType,
        royalty_payout_pct,
        tournamentId,
        true,
        creation_fee,
        owner_address
      );

      if (!result) {
        return res.status(500).json({
          error: "Failed to initialize and start tournament",
        });
      }

      return res.json({
        serializedTransaction: result.serializedTransaction,
        tournamentPDA: result.tournamentPDA,
        tournamentId: tournamentId.toString(),
        token: user.token,
      });
    } catch (error) {
      console.error("Tournament initialization error:", error);
      return res.status(500).json({
        error: "Failed to initialize tournament",
        details: error.message,
      });
    }
  }
);

export { router as transactionsRoute };
