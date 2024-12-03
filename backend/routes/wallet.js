import { Router } from "express";
import { verifyWalletSignature } from "../utils/verifyWalletSignature";
import BlockchainService from "../services/blockchain";
import Challenge from "../models/Challenge";
import anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

const router = Router();

router.post("/verify-and-transfer", async (req, res) => {
  try {
    const { walletAddress, signature, message, challengeId } = req.body;

    // Verify wallet signature
    const isValid = await verifyWalletSignature(
      walletAddress,
      signature,
      message
    );
    if (!isValid) {
      return res.status(401).send("Invalid wallet signature");
    }

    // Get challenge and tournament data
    const challenge = await Challenge.findOne({ _id: challengeId });
    if (!challenge || !challenge.deployed) {
      return res.status(404).send("Challenge not found or not deployed");
    }

    // Get entry fee from tournament
    const tournamentData = await BlockchainService.getTournamentData(
      challenge.tournamentAddress
    );

    // Create transaction for entry fee
    const transaction = await BlockchainService.submitSolution(
      new PublicKey(walletAddress),
      Buffer.from(message), // or your solution hash
      new anchor.BN(tournamentData.entryFee)
    );

    return res.json({
      transaction: transaction.serialize().toString("base64"),
      entryFee: tournamentData.entryFee,
    });
  } catch (error) {
    console.error("Error in verify-and-transfer:", error);
    return res.status(500).send(error.message);
  }
});

export default router;
