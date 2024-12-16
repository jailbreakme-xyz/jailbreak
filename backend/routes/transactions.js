import express from "express";
import BlockchainService from "../../backend/services/blockchain/index.js";
import DataBaseService from "../../backend/services/db/index.js";
import dotenv from "dotenv";
import { createHash } from "crypto";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
dotenv.config();

const router = express.Router();

const RPC_ENV = process.env.NODE_ENV === "development" ? "devnet" : "mainnet";

const solanaRpc = `https://${RPC_ENV}.helius-rpc.com/?api-key=${process.env.RPC_KEY}`;
const mainSolanaRpc = `https://mainnet.helius-rpc.com/?api-key=${process.env.RPC_KEY}`;

const hashString = (str) => {
  return createHash("sha256").update(str, "utf-8").digest("hex");
};

router.post("/get-transaction", async (req, res) => {
  const { solution, userWalletAddress, id } = req.body;

  try {
    const challenge = await DataBaseService.getChallengeById(id, {});

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found." });
    }

    const challengeName = challenge.name;
    const tournamentPDA = challenge.tournamentPDA;
    const solutionHash = hashString(solution);

    const blockchainService = new BlockchainService(
      solanaRpc,
      challenge.idl.address
    );

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

    const mainnetBlockchainService = new BlockchainService(
      mainSolanaRpc,
      challenge.idl.address
    );

    let holdings, accountCreationTimestamp;
    const foundHoldings = await DataBaseService.getTransactionByAddress(
      userWalletAddress
    );

    if (foundHoldings && foundHoldings.transactions_data) {
      holdings = foundHoldings.transactions_data.holdings;
      accountCreationTimestamp =
        foundHoldings.transactions_data.accountCreationDate;
    } else {
      holdings = await mainnetBlockchainService.fetchUserTokenHoldings(
        userWalletAddress,
        100,
        true
      );
      accountCreationTimestamp =
        await mainnetBlockchainService.getAccountCreationTimestamp(
          userWalletAddress
        );
    }
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
      transactions_data: {
        holdings: holdings,
        accountCreationDate: new Date(accountCreationTimestamp * 1000),
      },
    };

    const savedTransaction = await DataBaseService.saveTransaction(
      transactionData
    );

    if (!savedTransaction) {
      console.log("Failed to save transaction in the database.");
      return res.status(500).json({ error: "Failed to save transaction." });
    }

    res.status(200).json({ serializedTransaction, transactionId });
  } catch (error) {
    console.error("Error processing transaction:", error);
    res.status(500).json({ error: error.message });
  }
});

export { router as transactionsRoute };
