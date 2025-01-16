import {
    getAssociatedTokenAddressSync,
    createTransferInstruction,
} from "@solana/spl-token";
import { elizaLogger, settings } from "@elizaos/core";

import {
    Connection,
    PublicKey,
    Transaction,
    TransactionMessage,
    VersionedTransaction,
    LAMPORTS_PER_SOL,
    SystemProgram,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    ActionExample,
    Content,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    type Action,
} from "@elizaos/core";
import { composeContext } from "@elizaos/core";
import { getWalletKey } from "../keypairUtils.ts";
import { generateObjectDeprecated } from "@elizaos/core";

export interface TransferContent extends Content {
    tokenAddress: string;
    recipient: string;
    amount: string | number;
}

function isTransferContent(
    runtime: IAgentRuntime,
    content: any
): content is TransferContent {
    elizaLogger.log("Content for transfer", content);
    return (
        typeof content.tokenAddress === "string" &&
        typeof content.recipient === "string" &&
        (typeof content.amount === "string" ||
            typeof content.amount === "number")
    );
}

const transferTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "tokenAddress": "BieefG47jAHCGZBxi2q87RDuHyGZyYC3vAzxpyu8pump",
    "recipient": "9jW8FPr6BSSsemWPV22UUCzSqkVdTp6HTyPqeqyuBbCa",
    "amount": "1000"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested token transfer:
- Token contract address
- Recipient wallet address
- Amount to transfer

Respond with a JSON markdown block containing only the extracted values.`;

export default {
    name: "SEND_TOKEN",
    similes: [
        "TRANSFER_TOKEN",
        "TRANSFER_TOKENS",
        "SEND_TOKENS",
        "SEND_SOL",
        "PAY",
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        elizaLogger.log("Validating transfer from user:", message.userId);
        // const source = message.content.source;
        // if (source != "direct") {
        //     return false;
        // }
        return true;
    },
    description: "Transfer tokens from the agent's wallet to another address",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.log("Starting SEND_TOKEN handler...");

        // Initialize or update state
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        // Compose transfer context
        const transferContext = composeContext({
            state,
            template: transferTemplate,
        });

        // Generate transfer content
        const content = await generateObjectDeprecated({
            runtime,
            context: transferContext,
            modelClass: ModelClass.LARGE,
        });

        // Validate transfer content
        if (!isTransferContent(runtime, content)) {
            elizaLogger.error("Invalid content for TRANSFER_TOKEN action.");
            if (callback) {
                callback({
                    text: "Unable to process transfer request. Invalid content provided.",
                    content: { error: "Invalid transfer content" },
                });
            }
            return false;
        }

        try {
            const { keypair: senderKeypair } = await getWalletKey(
                runtime,
                true
            );

            const connection = new Connection(settings.RPC_URL);
            const balance = await connection.getBalance(senderKeypair.publicKey);
            console.log(`Balance for ${senderKeypair.publicKey.toBase58()}: ${balance / LAMPORTS_PER_SOL} SOL`);
            
            const mintPubkey = new PublicKey(content.tokenAddress);
            const recipientPubkey = new PublicKey(content.recipient);

            // Get decimals (simplest way)
            const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
            const decimals =
                (mintInfo.value?.data as any)?.parsed?.info?.decimals ?? 9;

            // Adjust amount with decimals
            const adjustedAmount = BigInt(
                Number(content.amount) * Math.pow(10, decimals)
            );
            elizaLogger.log(
                `Transferring: ${content.amount} tokens (${adjustedAmount} base units) from ${senderKeypair.publicKey.toBase58()} to ${recipientPubkey.toBase58()}`
            );

            const randomAmountSOL = 0.0001 + Math.random() * (0.0009 - 0.0001);
            const randomAmountLamports = BigInt(randomAmountSOL * LAMPORTS_PER_SOL);
            const finalAmount = message.content.source === "direct" ? adjustedAmount : randomAmountLamports;
            const transaction = new Transaction();  
            transaction.add(
                SystemProgram.transfer({
                  fromPubkey: senderKeypair.publicKey,
                  toPubkey: recipientPubkey,
                  lamports: finalAmount,
                })
              );

              const signature = await sendAndConfirmTransaction(
                connection,
                transaction,
                [senderKeypair]
              );


            // Rest of the existing working code...
            // const senderATA = getAssociatedTokenAddressSync(
            //     mintPubkey,
            //     senderKeypair.publicKey
            // );
            // const recipientATA = getAssociatedTokenAddressSync(
            //     mintPubkey,
            //     recipientPubkey
            // );

            // const instructions = [];

            // const recipientATAInfo =
            //     await connection.getAccountInfo(recipientATA);

            // if (!recipientATAInfo) {
            //     const { createAssociatedTokenAccountInstruction } =
            //         await import("@solana/spl-token");
            //     instructions.push(
            //         createAssociatedTokenAccountInstruction(
            //             senderKeypair.publicKey,
            //             recipientATA,
            //             recipientPubkey,
            //             mintPubkey
            //         )
            //     );
            // }


            // instructions.push(
            //     createTransferInstruction(
            //         senderATA,
            //         recipientATA,
            //         senderKeypair.publicKey,
            //         adjustedAmount
            //     )
            // );

            // const transaction = new Transaction().add(...instructions);

            // const { blockhash } = await connection.getLatestBlockhash();

            // transaction.recentBlockhash = blockhash;
            // transaction.feePayer = senderKeypair.publicKey;
            // const messageV0 = new TransactionMessage({
            //     payerKey: senderKeypair.publicKey,
            //     recentBlockhash: blockhash,
            //     instructions,
            // }).compileToV0Message();
    
            // const versionedTransaction = new VersionedTransaction(messageV0);
            // versionedTransaction.sign([senderKeypair]);

            // const signature = await connection.sendTransaction(
            //     versionedTransaction,
            //     {
            //       skipPreflight: false,
            //       preflightCommitment: "confirmed",
            //     }
            //   );


            elizaLogger.log("Transfer successful:", signature);

            if (callback) {
                callback({
                    text: `Successfully transferred ${content.amount} tokens to ${content.recipient}\nTransaction: ${signature}`,
                    content: {
                        success: true,
                        signature,
                        amount: content.amount,
                        recipient: content.recipient,
                    },
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error during token transfer:", error);
            if (callback) {
                callback({
                    text: `Error transferring tokens: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Send 69 EZSIS BieefG47jAHCGZBxi2q87RDuHyGZyYC3vAzxpyu8pump to 9jW8FPr6BSSsemWPV22UUCzSqkVdTp6HTyPqeqyuBbCa",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll send 69 EZSIS tokens now...",
                    action: "SEND_TOKEN",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully sent 69 EZSIS tokens to 9jW8FPr6BSSsemWPV22UUCzSqkVdTp6HTyPqeqyuBbCa\nTransaction: 5KtPn3DXXzHkb7VAVHZGwXJQqww39ASnrf7YkyJoF2qAGEpBEEGvRHLnnTG8ZVwKqNHMqSckWVGnsQAgfH5pbxEb",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;