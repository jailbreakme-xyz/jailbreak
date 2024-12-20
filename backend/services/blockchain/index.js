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
import { sha256 } from "js-sha256";

import dotenv from "dotenv";
dotenv.config();

const RPC_KEY = process.env.RPC_KEY;

class BlockchainService {
  constructor(solanaRpc, programId) {
    this.connection = new Connection(solanaRpc, "confirmed");
    this.programId = programId ? new PublicKey(programId) : null;
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
      const feeMulPct = data.readUInt8(49);

      return {
        authority: authority.toString(),
        state,
        entryFee: Number(entryFee) / LAMPORTS_PER_SOL, // Convert BigInt to number if needed
        feeMulPct,
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

  async verifyTransactionSignature(
    signature,
    savedTransaction,
    entryFee,
    feeMulPct,
    senderWalletAddress
  ) {
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

      const { unsignedTransaction, userWalletAddress, tournamentPDA } =
        savedTransaction;

      if (userWalletAddress !== senderWalletAddress) {
        console.log("User wallet address mismatch");
        throw new Error("User wallet address mismatch");
      }

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

      const amountReceivedSOL = (totalLamportsSent / LAMPORTS_PER_SOL).toFixed(
        6
      );
      const expectedDifference = amountReceivedSOL * (feeMulPct / 1000);
      const expectedFee = (entryFee - expectedDifference).toFixed(6);

      console.log("Amount received:", amountReceivedSOL);
      console.log("Expected Fee:", expectedFee);
      console.log("Next Entry fee:", entryFee);
      const tolerance = expectedFee * 0.05;
      const isWithinTolerance =
        Math.abs(amountReceivedSOL - expectedFee) <= tolerance;

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

  async createDeployProgramTransaction(
    senderAddress,
    ownerAddress,
    ownerFee,
    programData
  ) {
    try {
      const programAccount = Keypair.generate();
      const programId = programAccount.publicKey;
      const rentExemption =
        await this.connection.getMinimumBalanceForRentExemption(
          programData.byteLength
        );

      const extraCharge = rentExemption * ownerFee;

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: senderAddress,
          newAccountPubkey: programId,
          lamports: rentExemption,
          space: programData.byteLength,
          programId: SystemProgram.programId,
        }),
        SystemProgram.transfer({
          fromPubkey: senderAddress,
          toPubkey: ownerAddress,
          lamports: extraCharge,
        })
      );

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(senderAddress);

      const serializedTransaction = transaction
        .serialize({
          requireAllSignatures: false,
        })
        .toString("base64");

      return {
        serializedTransaction,
        program_id: programId,
      };
    } catch (error) {
      console.error("Error creating submit_solution transaction:", error);
      return false;
    }
  }

  async initializeTournament(senderAddress, programId) {
    try {
      // Find the PDA for the tournament
      const [tournamentPDA, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("tournament")],
        programId
      );

      console.log("Tournament PDA:", tournamentPDA.toBase58());

      // Check if the tournament PDA is already initialized
      const tournamentInfo = await this.connection.getAccountInfo(
        tournamentPDA
      );
      if (tournamentInfo) {
        console.log(
          "Tournament PDA already initialized. Skipping initialization."
        );
        return;
      }

      // Define the accounts involved in the transaction
      const keys = [
        { pubkey: tournamentPDA, isSigner: false, isWritable: true },
        { pubkey: senderAddress, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];

      // Calculate the discriminator for the initialize instruction
      const discriminator = sha256.digest("global:initialize").slice(0, 8);
      const data = Buffer.from([...discriminator, bump]);

      // Create the transaction instruction
      const instruction = new TransactionInstruction({
        keys,
        programId,
        data,
      });

      // Create a new transaction and add the instruction
      const transaction = new Transaction().add(instruction);

      // Get the latest blockhash and set the fee payer
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(senderAddress);

      // Serialize the transaction
      const serializedTransaction = transaction
        .serialize({
          requireAllSignatures: false,
        })
        .toString("base64");

      return {
        serializedTransaction,
      };
    } catch (error) {
      console.error("Error initializing tournament:", error);
      return false;
    }
  }

  async startTournament(
    senderAddress,
    tournamentPDA,
    initialSol,
    fee_mul_pct,
    winner_payout_pct,
    systemPrompt
  ) {
    try {
      const systemPromptHash = new Uint8Array(
        Buffer.from(sha256.digest(systemPrompt))
      );

      const initialPool = BigInt(initialSol * LAMPORTS_PER_SOL);
      const keys = [
        { pubkey: tournamentPDA, isSigner: false, isWritable: true }, // tournament
        { pubkey: senderAddress, isSigner: true, isWritable: true }, // payer
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
      ];

      // Calculate the discriminator for the `start_tournament` instruction
      const discriminator = sha256
        .digest("global:start_tournament")
        .slice(0, 8);
      console.log("Discriminator:", Buffer.from(discriminator).toString("hex"));

      // Construct the instruction data
      const data = Buffer.alloc(8 + 32 + 8 + 2); // Allocate sufficient space
      data.set(Buffer.from(discriminator), 0); // Add discriminator
      data.set(systemPromptHash, 8); // Add system prompt hash at offset 8
      data.writeBigUInt64LE(initialPool, 40); // Add initial pool at offset 40
      data.writeUInt8(fee_mul_pct, 48); // Add fee multiplier at offset 48
      data.writeUInt8(winner_payout_pct, 49); // Add winner payout at offset 49

      console.log("Instruction Data Buffer:", data.toString("hex")); // Log the full buffer

      const instruction = new TransactionInstruction({
        keys,
        programId,
        data,
      });

      // Create a new transaction and add the instruction
      const transaction = new Transaction().add(instruction);

      // Get the latest blockhash and set the fee payer
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(senderAddress);

      // Serialize the transaction
      const serializedTransaction = transaction
        .serialize({
          requireAllSignatures: false,
        })
        .toString("base64");

      return {
        serializedTransaction,
      };
    } catch (error) {
      console.error("Error starting tournament:", error);
      return false;
    }
  }

  async initializeAndStartTournament(
    senderAddress,
    programId,
    initialSol,
    fee_mul_pct,
    winner_payout_pct,
    systemPrompt
  ) {
    try {
      // Find the PDA for the tournament
      const [tournamentPDA, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("tournament")],
        programId
      );

      console.log("Tournament PDA:", tournamentPDA.toBase58());

      // Check if the tournament PDA is already initialized
      const tournamentInfo = await this.connection.getAccountInfo(
        tournamentPDA
      );
      if (tournamentInfo) {
        console.log(
          "Tournament PDA already initialized. Skipping initialization."
        );
        return;
      }

      // Define the accounts involved in the initialization transaction
      const initKeys = [
        { pubkey: tournamentPDA, isSigner: false, isWritable: true },
        { pubkey: senderAddress, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];

      // Calculate the discriminator for the initialize instruction
      const initDiscriminator = sha256.digest("global:initialize").slice(0, 8);
      const initData = Buffer.from([...initDiscriminator, bump]);

      // Create the initialization transaction instruction
      const initInstruction = new TransactionInstruction({
        keys: initKeys,
        programId,
        data: initData,
      });

      // Proceed to start the tournament
      const systemPromptHash = new Uint8Array(
        Buffer.from(sha256.digest(systemPrompt))
      );
      const initialPool = BigInt(initialSol * LAMPORTS_PER_SOL);
      const startKeys = [
        { pubkey: tournamentPDA, isSigner: false, isWritable: true }, // tournament
        { pubkey: senderAddress, isSigner: true, isWritable: true }, // payer
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
      ];

      // Calculate the discriminator for the `start_tournament` instruction
      const startDiscriminator = sha256
        .digest("global:start_tournament")
        .slice(0, 8);

      // Construct the instruction data for starting the tournament
      const startData = Buffer.alloc(8 + 32 + 8 + 2); // Allocate sufficient space
      startData.set(Buffer.from(startDiscriminator), 0); // Add discriminator
      startData.set(systemPromptHash, 8); // Add system prompt hash at offset 8
      startData.writeBigUInt64LE(initialPool, 40); // Add initial pool at offset 40
      startData.writeUInt8(fee_mul_pct, 48); // Add fee multiplier at offset 48
      startData.writeUInt8(winner_payout_pct, 49); // Add winner payout at offset 49

      const startInstruction = new TransactionInstruction({
        keys: startKeys,
        programId,
        data: startData,
      });

      // Create a new transaction and add both instructions
      const transaction = new Transaction().add(
        initInstruction,
        startInstruction
      );

      // Get the latest blockhash and set the fee payer
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(senderAddress);

      // Serialize the transaction
      const serializedTransaction = transaction
        .serialize({
          requireAllSignatures: false,
        })
        .toString("base64");

      return {
        serializedTransaction,
      };
    } catch (error) {
      console.error("Error initializing and starting tournament:", error);
      return false;
    }
  }
}

export default BlockchainService;
