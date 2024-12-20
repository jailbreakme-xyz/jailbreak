import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Pages } from "../models/Models.js";
import { PublicKey } from "@solana/web3.js";
import BlockchainService from "../services/blockchain/index.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RPC_ENV = process.env.NODE_ENV === "development" ? "devnet" : "mainnet";
const SOLANA_RPC = `https://${RPC_ENV}.helius-rpc.com/?api-key=${process.env.RPC_KEY}`;

const idl = fs.readFileSync(
  path.join(__dirname, "../jailbreak-pool-v2/target/idl/tournament.json")
);
const idlData = JSON.parse(idl.toString());

router.get("/", async (req, res) => {
  const filePath = path.join(
    __dirname,
    "../jailbreak-pool-v2/dist/jailbreak_pool.so"
  );

  // Set headers to indicate a binary file
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=jailbreak_pool.so"
  );

  // Stream the file to the response
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

router.get("/deployment-data", async (req, res) => {
  const page = await Pages.findOne({ name: "deployment-data" });
  res.send(page.content);
});

router.post("/deploy-tournament", async (req, res) => {
  try {
    const sender = req.body.sender;
    const page = await Pages.findOne({ name: "deployment-data" });
    const deploymentData = page.content.deploymentData;
    const ownerAddress = new PublicKey(deploymentData.owner_address);
    const senderAddress = new PublicKey(sender);
    const ownerFee = deploymentData.owner_fee;

    const filePath = path.join(
      __dirname,
      "../jailbreak-pool-v2/dist/jailbreak_pool.so"
    );

    const programData = fs.readFileSync(filePath);

    const blockchainService = new BlockchainService(SOLANA_RPC);

    const { serializedTransaction, program_id } =
      await blockchainService.createDeployProgramTransaction(
        senderAddress,
        ownerAddress,
        ownerFee,
        programData
      );

    res.json({ serializedTransaction, program_id });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

router.post("/initialize-tournament", async (req, res) => {
  const sender = req.body.sender;
  const programId = req.body.programId;
  const blockchainService = new BlockchainService(SOLANA_RPC, programId);
  const { serializedTransaction } =
    await blockchainService.initializeTournament(sender, programId);

  res.json({ serializedTransaction });
});

router.post("/start-tournament", async (req, res) => {
  const sender = req.body.sender;
  const programId = req.body.programId;
  const tournamentIDL = idlData;
  tournamentIDL.address = programId;

  const blockchainService = new BlockchainService(SOLANA_RPC, programId);
  const { serializedTransaction } = await blockchainService.startTournament(
    sender,
    programId
  );
  res.json({ serializedTransaction });
});

router.post("/initialize-and-start-tournament", async (req, res) => {
  const sender = req.body.sender;
  const programId = req.body.programId;
  const blockchainService = new BlockchainService(SOLANA_RPC, programId);
  const { serializedTransaction } =
    await blockchainService.initializeAndStartTournament(sender, programId);
  res.json({ serializedTransaction });
});

export { router as programRoute };
