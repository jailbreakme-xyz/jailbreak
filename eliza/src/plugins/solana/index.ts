import { Plugin } from "@elizaos/core";
import transferToken from "./actions/transfer.ts";
import transferSol from "./actions/transfer_sol.ts";
import getBalance from "./actions/getBalance.ts";


const walletPlugin: Plugin = {
    name: "wallet-plugin",
    description: "Wallet Plugin for Jailo",
    actions: [
        transferToken,
        transferSol,
        getBalance
    ],
    evaluators: [],
    providers: [],
};

export default walletPlugin;