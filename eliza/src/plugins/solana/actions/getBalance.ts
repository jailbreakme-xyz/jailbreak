import { elizaLogger, settings } from "@elizaos/core";
import {
    Connection,
    PublicKey,
    SystemProgram,
    TransactionMessage,
    VersionedTransaction,
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
import { getWalletKey } from "../keypairUtils.ts";

export default {
    name: "GET_BALANCE",
    similes: ["CHECK_BALANCE", "VIEW_BALANCE", "SHOW_BALANCE"],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        elizaLogger.log("Validating balance check for user:", message.userId);
        return true;
    },
    description: "Use this action to check the SOL balance of agent's wallet, you must share the balance with the user when asked.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.log("Starting GET_BALANCE handler...");

        try {
            const { keypair: senderKeypair } = await getWalletKey(runtime, true);
            const connection = new Connection(settings.SOLANA_RPC_URL!);

            const balance = await connection.getBalance(senderKeypair.publicKey);
            const solBalance = balance / 1e9; // Convert lamports to SOL

            if (callback) {
                callback({
                    text: `Current balance: ${solBalance} SOL`,
                    content: {
                        success: true,
                        balance: solBalance,
                        address: senderKeypair.publicKey.toString()
                    },
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error checking balance:", error);
            if (callback) {
                callback({
                    text: `Problem checking balance: ${error.message}`,
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
                    text: "What's your current SOL balance?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "My current balance is X SOL",
                    action: "GET_BALANCE",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;