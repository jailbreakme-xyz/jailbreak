import {
  Connection,
  Transaction,
  TransactionInstruction,
  PublicKey,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  TransactionMessage,
  VersionedTransaction,
  sendAndConfirmTransaction,
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
import splitIntoBatches from "../../hooks/splitIntoBatches.js";

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
      // Read authority (32 bytes after 8-byte discriminator)
      const authority = new PublicKey(data.subarray(8, 40));

      // Read state (1 byte)
      const state = data.readUInt8(40);

      // Read fee type (1 byte)
      const fee_type = data.readUInt8(41);

      // Read entry fee (8 bytes)
      const entryFee = data.readBigUInt64LE(42);

      // Read fee multiplier percentage times 10 (1 byte)
      const fee_mul_pct_x10 = data.readUInt8(50);

      // Read winner payout percentage (1 byte)
      const winner_payout_pct = data.readUInt8(51);

      // Read royalty payout percentage (1 byte)
      const royalty_payout_pct = data.readUInt8(52);

      // Read tournament_id (8 bytes)
      const tournament_id = data.readBigUInt64LE(53);

      const programBalance = await this.getAccountBalance(tournamentPDA);
      return {
        authority: authority.toString(),
        state,
        entryFee: Number(entryFee) / LAMPORTS_PER_SOL,
        feeMulPct: fee_mul_pct_x10,
        winnerPayoutPct: winner_payout_pct,
        feeType: fee_type,
        royaltyPayoutPct: royalty_payout_pct,
        programBalance: programBalance / LAMPORTS_PER_SOL,
        total_lamports: programBalance,
        tournamentId: Number(tournament_id),
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

      // Get tournament data to find authority
      const tournamentData = await this.getTournamentData(tournamentPDA);
      if (!tournamentData) {
        return false;
      }

      // Define the instruction data for ConcludeTournament
      const discriminator = this.calculateDiscriminator("conclude_tournament");
      const data = Buffer.from(discriminator);

      // Find program admin PDA
      const [programAdminPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("admin")],
        this.programId
      );

      // Define the accounts involved in the same order as conclude.rs
      const keys = [
        {
          pubkey: new PublicKey(tournamentPDA),
          isSigner: false,
          isWritable: true,
        }, // Tournament PDA
        {
          pubkey: programAdminPDA,
          isSigner: false,
          isWritable: true,
        }, // Program Admin PDA
        {
          pubkey: wallet.publicKey,
          isSigner: false,
          isWritable: true,
        }, // Royalty destination (program admin authority)
        {
          pubkey: wallet.publicKey,
          isSigner: true,
          isWritable: true,
        }, // Authority
        {
          pubkey: new PublicKey(winnerAccount),
          isSigner: false,
          isWritable: true,
        }, // Winner account
        {
          pubkey: new PublicKey(tournamentData.authority),
          isSigner: false,
          isWritable: true,
        }, // Tournament authority
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        }, // System program
      ];

      // Create the instruction
      const instruction = new TransactionInstruction({
        keys,
        programId: this.programId,
        data,
      });

      // Create the transaction and add the instruction
      const transaction = new Transaction().add(instruction);

      const { blockhash, lastValidBlockHeight } =
        await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const message = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: transaction.instructions,
      }).compileToV0Message();

      const versionedTransaction = new VersionedTransaction(message);
      versionedTransaction.sign([wallet]);

      // Send the transaction
      const signature = await this.connection.sendTransaction(
        versionedTransaction,
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      );

      // Confirm the transaction
      await this.connection.confirmTransaction({
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
    winnerPayoutPct,
    feeType,
    senderWalletAddress
  ) {
    try {
      // Step 1: Fetch transaction details from the network
      const transactionDetails = await this.connection
        .getParsedTransaction(signature, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        })
        .catch((err) => {
          console.error(`RPC error fetching transaction: ${err.message}`);
          return null;
        });

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
      const expectedFee =
        feeType === 0 ? (entryFee - expectedDifference).toFixed(6) : entryFee;

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

  async getAccountBalance(address) {
    const balance = await this.connection.getBalance(new PublicKey(address));
    return balance;
  }

  async initializeAndStartTournament(
    senderAddress,
    programId,
    initialSol,
    fee_mul_pct,
    winner_payout_pct,
    systemPrompt,
    fee_type,
    royalty_payout_pct,
    tournamentId,
    advanced = false,
    creation_fee,
    owner_address
  ) {
    try {
      // Find the PDA for the tournament using the correct seeds
      const [tournamentPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("tournament"),
          new PublicKey(senderAddress).toBuffer(),
          Buffer.from(new BigInt64Array([tournamentId]).buffer),
        ],
        programId
      );

      // Find program admin PDA
      const [programAdminPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("admin")],
        programId
      );

      // Initialize instruction setup
      const initKeys = [
        { pubkey: tournamentPDA, isSigner: false, isWritable: true },
        { pubkey: programAdminPDA, isSigner: false, isWritable: false },
        {
          pubkey: new PublicKey(senderAddress),
          isSigner: true,
          isWritable: true,
        },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];

      const initDiscriminator = sha256.digest("global:initialize").slice(0, 8);
      const initData = Buffer.alloc(16);
      initData.set(Buffer.from(initDiscriminator), 0);
      initData.writeBigUInt64LE(tournamentId, 8);

      const initInstruction = new TransactionInstruction({
        keys: initKeys,
        programId,
        data: initData,
      });

      // Start tournament instruction setup
      const systemPromptHash = Buffer.from(sha256.digest(systemPrompt));
      const initialPool = BigInt(initialSol * LAMPORTS_PER_SOL);
      const fee_mul_pct_x10 = fee_mul_pct;

      const startKeys = [
        { pubkey: tournamentPDA, isSigner: false, isWritable: true },
        {
          pubkey: new PublicKey(senderAddress),
          isSigner: true,
          isWritable: true,
        },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ];

      const startDiscriminator = sha256
        .digest("global:start_tournament")
        .slice(0, 8);
      const startData = Buffer.alloc(8 + 32 + 8 + 1 + 1 + 1 + 1);
      startData.set(Buffer.from(startDiscriminator), 0);
      startData.set(systemPromptHash, 8);
      startData.writeBigUInt64LE(initialPool, 40);
      startData.writeUInt8(fee_mul_pct_x10, 48);
      startData.writeUInt8(winner_payout_pct, 49);
      startData.writeUInt8(royalty_payout_pct, 50);
      startData.writeUInt8(fee_type, 51);

      const startInstruction = new TransactionInstruction({
        keys: startKeys,
        programId,
        data: startData,
      });

      let transferInstruction;
      if (creation_fee > 0) {
        transferInstruction = SystemProgram.transfer({
          fromPubkey: new PublicKey(senderAddress),
          toPubkey: new PublicKey(owner_address),
          lamports: BigInt(creation_fee * LAMPORTS_PER_SOL),
        });
      }

      // Create a new transaction and add both instructions
      const transaction = new Transaction().add(
        initInstruction,
        startInstruction,
        ...(creation_fee > 0 ? [transferInstruction] : [])
      );

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(senderAddress);

      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
      });

      const base64Transaction = serializedTransaction.toString("base64");

      return {
        serializedTransaction: base64Transaction,
        tournamentPDA: tournamentPDA.toBase58(),
      };
    } catch (error) {
      console.error("Error initializing and starting tournament:", error);
      return false;
    }
  }

  async airDrop(recipientAddresses, total_lamports) {
    try {
      const batchSize = 5;
      const keypairFile = readFileSync("./secrets/solana-keypair.json");
      const wallet = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(keypairFile.toString()))
      );

      const lamportsPerRecipient = Math.floor(
        total_lamports / recipientAddresses.length
      );

      const batches = splitIntoBatches(recipientAddresses, batchSize);
      const signatures = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Processing batch ${i + 1} of ${batches.length}`);
        await new Promise((resolve) => setTimeout(resolve, 500));
        const transaction = new Transaction();
        await Promise.all(
          batch.map(async (recipient) => {
            try {
              const toPublicKey = new PublicKey(recipient);
              transaction.add(
                SystemProgram.transfer({
                  fromPubkey: wallet.publicKey,
                  toPubkey: toPublicKey,
                  lamports: lamportsPerRecipient,
                })
              );
              return transaction;
            } catch (err) {
              console.error(`Airdrop to ${recipient} failed:`, err);
              return null;
            }
          })
        );

        const signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          [wallet]
        );
        signatures.push(signature);
      }

      console.log("Airdrop Results:", signatures);
      return signatures;
    } catch (error) {
      console.error("Error air dropping:", error);
      return false;
    }
  }
}

export default BlockchainService;
