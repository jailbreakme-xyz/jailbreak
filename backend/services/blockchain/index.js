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
import { readFileSync } from "fs";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplTokenMetadata,
  fetchDigitalAsset,
  fetchAllDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const RPC_KEY = process.env.RPC_KEY;

class BlockchainService {
  constructor(solanaRpc, programId) {
    this.connection = new Connection(solanaRpc, "confirmed");
    this.programId = new PublicKey(programId);
    this.umi = createUmi(solanaRpc).use(mplTokenMetadata());
    this.HELIUS_API_URL = `https://api.helius.xyz/v0`;
  }

  // Utility to calculate the discriminator
  calculateDiscriminator(instructionName) {
    const hash = createHash("sha256")
      .update(`global:${instructionName}`, "utf-8")
      .digest();
    return hash.slice(0, 8);
  }

  // Verify a transaction

  async verifyTransaction(
    signature,
    tournamentPDA,
    expectedAmount,
    senderWalletAddress
  ) {
    try {
      let verified = false;
      // Fetch transaction details
      const transactionDetails = await this.connection.getParsedTransaction(
        signature,
        {
          commitment: "confirmed",
        }
      );

      // Check if transaction exists
      if (!transactionDetails) {
        console.log(`Transaction not found. ${signature}`);
        return verified;
      }

      const { meta, transaction } = transactionDetails;

      // Ensure the transaction was successful
      if (meta.err) {
        console.log(
          `Transaction ${signature} failed with error: ${JSON.stringify(
            meta.err
          )}`
        );
        return verified;
      }

      // Extract inner instructions
      const innerInstructions = meta.innerInstructions || [];

      // Initialize variable to hold total transferred lamports
      let totalLamportsSent = 0;

      // Iterate through inner instructions to find system transfers
      for (const innerInstruction of innerInstructions) {
        for (const instruction of innerInstruction.instructions) {
          // Check if the instruction is a system program transfer
          if (
            instruction.program === "system" &&
            instruction.parsed &&
            instruction.parsed.type === "transfer"
          ) {
            const info = instruction.parsed.info;
            const sender = info.source;
            const recipient = info.destination;
            const lamports = info.lamports;
            if (recipient === tournamentPDA && sender === senderWalletAddress) {
              verified = true;
            }
            // Accumulate lamports
            totalLamportsSent += lamports;
          }
        }
      }

      // After processing all inner instructions, check if any matching transfer was found
      if (totalLamportsSent === 0) {
        console.log(
          `No matching transfers found from sender to recipient. ${signature}`
        );
        return false;
      }

      // Convert lamports to SOL (1 SOL = 1e9 lamports)
      const amountReceivedSOL = totalLamportsSent / LAMPORTS_PER_SOL;

      // Calculate tolerance
      const tolerance = expectedAmount * 0.03;
      const isWithinTolerance =
        Math.abs(amountReceivedSOL - expectedAmount) <= tolerance;

      // Verify amount with tolerance
      if (!isWithinTolerance) {
        console.log(
          `Amount mismatch. Expected: ~${expectedAmount} SOL, Received: ${amountReceivedSOL} SOL ${signature}`
        );
        return false;
      }

      // If all verifications pass
      console.log("Transaction verified successfully.");
      console.log(`Sender: ${senderWalletAddress}`);
      console.log(`Recipient: ${tournamentPDA}`);
      console.log(`Total Amount Received: ${amountReceivedSOL} SOL`);
      return verified;
    } catch (error) {
      console.error(`Verification failed: ${error.message} ${signature}`);
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
        return false;
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
      return false;
    }
  }

  //   Conclude Tournament
  async concludeTournament(tournamentPDA, winnerAccount) {
    try {
      // Load wallet keypair (payer/authority)
      const keypairFile = readFileSync("./secrets/solana-keypair.json");
      const wallet = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(keypairFile.toString()))
      );
      // Fetch tournament account
      const tournamentAccountInfo = await this.connection.getAccountInfo(
        new PublicKey(tournamentPDA)
      );
      if (!tournamentAccountInfo) {
        return false;
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
      const confirmation = await this.connection.confirmTransaction({
        signature: signature,
        commitment: "confirmed",
      });

      console.log("ConcludeTournament transaction signature:", signature);
      return signature;
    } catch (error) {
      console.error("Error concluding tournament:", error);
      return false;
    }
  }

  // Create a transaction for submit_solution on the server
  async createSubmitSolutionTransaction(
    tournamentPDA,
    solutionHash,
    userWalletAddress
  ) {
    try {
      const discriminator = this.calculateDiscriminator("submit_solution");
      const solutionHashBuffer = Buffer.from(solutionHash, "hex");
      const data = Buffer.concat([discriminator, solutionHashBuffer]);

      const keys = [
        {
          pubkey: new PublicKey(tournamentPDA),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(userWalletAddress),
          isSigner: true,
          isWritable: true,
        },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];

      const instruction = new TransactionInstruction({
        keys,
        programId: this.programId,
        data,
      });

      const transaction = new Transaction().add(instruction);

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(userWalletAddress);

      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
      });

      const base64Transaction = serializedTransaction.toString("base64");

      return {
        serializedTransaction: base64Transaction,
      };
    } catch (error) {
      console.error("Error creating submit_solution transaction:", error);
      return false;
    }
  }

  async verifyTransactionSignature(signature, savedTransaction) {
    try {
      // Step 1: Fetch transaction details from the network
      const transactionDetails = await this.connection.getParsedTransaction(
        signature,
        "confirmed"
      );

      if (!transactionDetails) {
        console.log("Transaction not found on the network.");
        return false;
      }

      const {
        unsignedTransaction,
        userWalletAddress,
        tournamentPDA,
        entryFee,
      } = savedTransaction;

      const unsignedTx = Transaction.from(
        Buffer.from(unsignedTransaction, "base64")
      );

      const instructionInfo =
        transactionDetails.meta.innerInstructions[0].instructions[0].parsed
          .info;
      const totalLamportsSent = instructionInfo.lamports;
      const destination = instructionInfo.destination;
      const source = instructionInfo.source;

      const userWalletKey = unsignedTx.instructions[0].keys.find(
        (key) => key.pubkey.toString() === userWalletAddress
      );
      const pdaKey = unsignedTx.instructions[0].keys.find(
        (key) => key.pubkey.toString() === tournamentPDA
      );

      if (!userWalletKey || !pdaKey) {
        console.log("User wallet or PDA key not found");
        return false;
      }

      if (source.toString() !== userWalletKey.pubkey.toString()) {
        console.log("Source mismatch");
        return false;
      }

      if (destination.toString() !== pdaKey.pubkey.toString()) {
        console.log("Destination mismatch");
        return false;
      }

      const amountReceivedSOL = totalLamportsSent / LAMPORTS_PER_SOL;

      console.log("Amount received:", amountReceivedSOL);
      console.log("Entry fee:", entryFee);
      const tolerance = entryFee * 0.05;
      const isWithinTolerance =
        Math.abs(amountReceivedSOL - entryFee) <= tolerance;

      if (!isWithinTolerance) {
        console.log("Amount mismatch");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error verifying transaction signature:", error);
      return false;
    }
  }

  async fetchUserTokenHoldings(address, limit = 50, shuffle = true) {
    try {
      const publicKey = new PublicKey(address);

      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
          limit,
        }
      );

      if (tokenAccounts.value.length === 0) {
        return [];
      }

      const holdings = await Promise.all(
        tokenAccounts.value.map(async (account) => {
          const accountData = account.account.data;
          const parsedData = accountData.parsed.info;
          return {
            token_address: parsedData.mint,
            balance: parsedData.tokenAmount.uiAmount,
          };
        })
      );

      const tokensMetadata = await this.getTokensMetadata(
        holdings.map((holding) => holding.token_address)
      );

      const combinedData = holdings
        .map((holding, index) => ({
          mintAddress: holding.token_address,
          balance: holding.balance.toFixed(2),
          name: tokensMetadata[index]?.metadata?.name,
        }))
        .sort((a, b) => b.balance - a.balance);

      const shuffledCombinedData = shuffle
        ? this.shufflePartial(combinedData, limit / 2)
        : combinedData;

      return shuffledCombinedData;
    } catch (error) {
      console.error("Error fetching user token holdings:", error);
      return [];
    }
  }

  async getTokensMetadata(tokens) {
    try {
      const metadata = await fetchAllDigitalAsset(this.umi, tokens);
      return metadata;
    } catch (error) {
      console.error("Error fetching token metadata:", error);
      return null;
    }
  }

  async getAccountCreationTimestamp(address) {
    try {
      const signatures = await this.connection.getSignaturesForAddress(
        new PublicKey(address)
      );
      return signatures[signatures.length - 1].blockTime;
    } catch (error) {
      console.error("Error fetching account creation timestamp:", error);
      return null;
    }
  }

  async getAccountTransactionFrequency(address) {
    let transactions = [];
    try {
      const response = await axios.get(
        `${this.HELIUS_API_URL}/addresses/${address}/transactions?api-key=${RPC_KEY}&type=SWAP&limit=100`
      );
      transactions = response.data;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const frequency = this.calculateFrequency(transactions, currentTimestamp);
      return frequency;
    } catch (error) {
      console.log(`Error fetching transactions for address ${address}:`, error);
      return null;
    }
  }

  calculateFrequency(transactions, currentTimestamp) {
    const SWAP_LIMIT_DAYS = 30;
    const periodStart = currentTimestamp - SWAP_LIMIT_DAYS * 24 * 60 * 60;
    const swapsLastPeriod = transactions.filter(
      (tx) => tx.timestamp >= periodStart
    ).length;
    const frequency = swapsLastPeriod / SWAP_LIMIT_DAYS;
    return frequency; // Swaps per day
  }

  shufflePartial(arr, count) {
    const partialArr = arr.slice(0, count);
    for (let i = partialArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [partialArr[i], partialArr[j]] = [partialArr[j], partialArr[i]];
    }

    const shuffledArray = [...partialArr, ...arr.slice(count)];

    return shuffledArray;
  }
}

export default BlockchainService;
