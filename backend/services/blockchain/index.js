import {
  Connection,
  Transaction,
  TransactionInstruction,
  PublicKey,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createHash } from "crypto";
import bs58 from "bs58";
import { readFileSync } from "fs";

class BlockchainService {
  constructor(solanaRpc, programId) {
    this.connection = new Connection(solanaRpc, "confirmed");
    this.programId = new PublicKey(programId);
  }

  // Utility to calculate the discriminator
  calculateDiscriminator(instructionName) {
    const hash = createHash("sha256")
      .update(`global:${instructionName}`, "utf-8")
      .digest();
    return hash.slice(0, 8);
  }

  // Verify a transaction
  async verifyTransaction(signature, tournamentPDA, expectedAmount) {
    try {
      // Fetch transaction details
      const transactionDetails = await this.connection.getTransaction(
        signature,
        {
          commitment: "confirmed",
        }
      );
      if (!transactionDetails) {
        throw new Error("Transaction not found");
      }

      // Check that the transaction includes the expected program
      const { transaction, meta } = transactionDetails;
      const programIndex = transaction.message.accountKeys.findIndex((key) =>
        key.equals(this.programId)
      );
      if (programIndex === -1) {
        throw new Error("Program ID not found in transaction");
      }

      // Verify the submit_solution instruction
      const discriminator = this.calculateDiscriminator("submit_solution");
      let validInstruction = false;

      for (const instruction of transaction.message.instructions) {
        if (instruction.programIdIndex === programIndex) {
          console.log("Raw Instruction Data:", instruction.data);
          console.log("Instruction Accounts:", instruction.accounts);

          // Decode instruction data and match discriminator
          const decodedData = bs58.decode(instruction.data);
          if (!Buffer.from(decodedData.slice(0, 8)).equals(discriminator)) {
            console.log("Discriminator mismatch");
            continue;
          }

          // Resolve account indices to public keys
          const resolvedAccounts = instruction.accounts.map(
            (index) => transaction.message.accountKeys[index]
          );

          // Check if tournamentPDA is in resolved accounts
          if (
            resolvedAccounts.some((key) =>
              key.equals(new PublicKey(tournamentPDA))
            )
          ) {
            validInstruction = true;
            break;
          }
        }
      }

      if (!validInstruction) {
        throw new Error("submit_solution instruction not found");
      }

      // Verify the amount transferred to the tournament PDA
      const tournamentPdaIndex = transaction.message.accountKeys.findIndex(
        (key) => key.equals(new PublicKey(tournamentPDA))
      );
      const preBalance = meta.preBalances[tournamentPdaIndex];
      const postBalance = meta.postBalances[tournamentPdaIndex];
      const amountTransferred = (postBalance - preBalance) / LAMPORTS_PER_SOL;

      const tolerance = expectedAmount * 0.01;
      const isWithinTolerance =
        Math.abs(amountTransferred - expectedAmount) <= tolerance;

      console.log("Pre Balance:", preBalance);
      console.log("Post Balance:", postBalance);
      console.log("Amount Transferred:", amountTransferred);

      if (!isWithinTolerance) {
        throw new Error(
          `Incorrect amount transferred. Expected: ${expectedAmount} SOL (±${tolerance}), Got: ${amountTransferred} SOL`
        );
      }

      console.log("Transaction verification successful");
      return true;
    } catch (error) {
      console.error("Error verifying transaction:", error);
      return false;
    }
  }

  // Get tournament data
  async getTournamentData(tournamentPDA) {
    try {
      // Fetch the account info
      const accountInfo = await this.connection.getAccountInfo(
        new PublicKey(tournamentPDA)
      );
      if (!accountInfo) {
        throw new Error("Tournament account not found");
      }

      const data = Buffer.from(accountInfo.data);
      // Read authority (first 32 bytes)
      const authority = new PublicKey(data.subarray(8, 40)); // Skip 8-byte discriminator

      // Read state (1 byte)
      const state = data.readUInt8(40);

      // Read entry fee (8 bytes)
      const entryFee = data.readBigUInt64LE(41);

      return {
        authority: authority.toString(),
        state,
        entryFee: Number(entryFee) / LAMPORTS_PER_SOL, // Convert BigInt to number if needed
      };
    } catch (error) {
      console.error("Error fetching tournament data:", error);
      throw error;
    }
  }

  //   Conclude Tournament
  async concludeTournament(tournamentPDA, winnerAccount) {
    try {
      // Load wallet keypair (payer/authority)
      const keypairFile = readFileSync("./secrets/solana-keypair");
      const wallet = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(keypairFile.toString()))
      );
      // Fetch tournament account
      const tournamentAccountInfo = await this.connection.getAccountInfo(
        new PublicKey(tournamentPDA)
      );
      if (!tournamentAccountInfo) {
        throw new Error("Tournament account not found");
      }

      // Define the instruction data for ConcludeTournament
      const discriminator = this.calculateDiscriminator("conclude_tournament");

      // Instruction data is just the discriminator
      const data = Buffer.from(discriminator);

      // Define the accounts involved
      const keys = [
        {
          pubkey: new PublicKey(tournamentPDA),
          isSigner: false,
          isWritable: true,
        }, // Tournament PDA
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // Payer/Authority
        {
          pubkey: new PublicKey(winnerAccount),
          isSigner: false,
          isWritable: true,
        }, // Winner account
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // System program
      ];

      // Create the instruction
      const instruction = new TransactionInstruction({
        keys,
        programId: this.programId,
        data,
      });

      // Create the transaction and add the instruction
      const transaction = new Transaction().add(instruction);

      // Send the transaction
      const signature = await this.connection.sendTransaction(
        transaction,
        [wallet],
        {
          preflightCommitment: "confirmed",
        }
      );

      // Confirm the transaction
      const confirmation = await this.connection.confirmTransaction(
        signature,
        "confirmed"
      );

      console.log("ConcludeTournament transaction signature:", signature);
      return signature;
    } catch (error) {
      console.error("Error concluding tournament:", error);
      throw error;
    }
  }
}

export default BlockchainService;
