import { Plugin } from "@elizaos/core";
import transferToken from "./actions/transfer.ts";

const walletPlugin: Plugin = {
    name: "wallet-plugin",
    description: "Wallet Plugin for Eliza",
    actions: [
        transferToken
    ],
    evaluators: [],
    providers: [],
};

export default walletPlugin;