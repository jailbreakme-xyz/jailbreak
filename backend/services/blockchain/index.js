import { Connection, PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Challenge } from "../../models/Models.js";

dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlockchainService {
  constructor() {
    // Use devnet connection
    this.connection = new Connection(process.env.RPC_URL_DEVNET, "confirmed");

    this.programId = new PublicKey(
      "8SSA8rCG5E3K4LGrVB99pWjDL3BQapzQcEvhVkLrHh2S"
    );

    // Load your keypair
    const keypairFile = fs.readFileSync(
      path.join(
        __dirname,
        "../../jailbreak-pool/target/deploy/jailbreak_pool-keypair.json"
      )
    );
    this.keypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(keypairFile))
    );

    // Create wallet instance
    this.wallet = new Wallet(this.keypair);

    // Read IDL
    this.idl = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../../jailbreak-pool/target/idl/tournament.json"),
        "utf8"
      )
    );
  }

  async verifyAndCreateTransaction(walletAddress, challengeId, message) {
    try {
      // Get challenge and tournament data
      const challenge = await Challenge.findOne({ _id: challengeId });
      if (!challenge || !challenge.deployed) {
        throw new Error("Challenge not found or not deployed");
      }

      // Get current entry fee from tournament
      const tournamentData = await this.getTournamentData(
        challenge.tournamentAddress
      );

      // Create solution hash
      const solutionHash = await this.createSolutionHash(message);

      // Create transaction
      const transaction = await this.submitSolution(
        new PublicKey(walletAddress),
        solutionHash,
        new anchor.BN(tournamentData.entryFee)
      );

      return {
        transaction: transaction.serialize().toString("base64"),
        entryFee: tournamentData.entryFee,
        tournamentAddress: challenge.tournamentAddress,
      };
    } catch (error) {
      console.error("Error in verifyAndCreateTransaction:", error);
      throw error;
    }
  }

  async createTournament(initialEntryFee) {
    try {
      const provider = new AnchorProvider(this.connection, this.wallet, {
        commitment: "confirmed",
      });

      // Create the coder explicitly
      const coder = new anchor.BorshCoder(this.idl);

      // Create program with explicit coder
      const program = new anchor.Program(
        this.idl,
        this.programId,
        provider,
        coder // Pass the coder explicitly
      );

      // Generate tournament PDA
      const [tournamentPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("tournament")],
        this.programId
      );

      // Create tournament instruction
      const tx = await program.methods
        .initialize()
        .accounts({
          tournament: tournamentPDA,
          authority: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Tournament created with transaction:", tx);
      return tx;
    } catch (error) {
      console.error("Error creating tournament:", error);
      throw error;
    }
  }

  async getTournamentData(tournamentAddress) {
    try {
      const provider = new anchor.AnchorProvider(this.connection, null, {
        commitment: "confirmed",
      });

      const program = new anchor.Program(this.idl, this.programId, provider);

      const tournamentAccount = await program.account.tournament.fetch(
        tournamentAddress
      );

      return {
        entryFee: tournamentAccount.entryFee.toString(),
        state: tournamentAccount.state,
        authority: tournamentAccount.authority.toString(),
      };
    } catch (error) {
      console.error("Error fetching tournament data:", error);
      throw error;
    }
  }

  async verifyTransaction(signature, tournamentAddress, expectedFee) {
    try {
      const transaction = await this.connection.getTransaction(signature);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // Verify transaction details
      const isValidTransaction =
        transaction.transaction.message.accountKeys.some((key) =>
          key.equals(new PublicKey(tournamentAddress))
        ) && transaction.meta.fee >= Number(expectedFee);

      if (!isValidTransaction) {
        throw new Error("Invalid transaction");
      }

      return true;
    } catch (error) {
      console.error("Transaction verification failed:", error);
      throw error;
    }
  }

  async submitSolution(walletPublicKey, solutionHash, amount) {
    try {
      // Create provider
      const provider = new anchor.AnchorProvider(
        this.connection,
        null, // wallet will be injected from frontend
        { commitment: "confirmed" }
      );

      // Create program interface
      const program = new anchor.Program(this.idl, this.programId, provider);

      // Get tournament account (you'll need to store this somewhere)
      const [tournamentPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("tournament")],
        this.programId
      );

      // Create transaction instruction
      const tx = await program.methods
        .submitSolution(solutionHash)
        .accounts({
          tournament: tournamentPDA,
          payer: walletPublicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      return tx;
    } catch (error) {
      console.error("Error in submitSolution:", error);
      throw error;
    }
  }

  // Helper function to create solution hash
  createSolutionHash(solution) {
    // Create a SHA-256 hash of the solution
    const encoder = new TextEncoder();
    const data = encoder.encode(solution);
    return crypto.subtle.digest("SHA-256", data);
  }
}

export default new BlockchainService();
