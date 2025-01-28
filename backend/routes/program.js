import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import BlockchainService from "../services/blockchain/index.js";
import OpenAIService from "../services/llm/openai.js";
import DataBaseService from "../services/db/index.js";
import GoogleCloudService from "../services/gcs/index.js";
import multer from "multer";
import dotenv from "dotenv";
import getSolPriceInUSDT from "../hooks/solPrice.js";
import { parseInstructions } from "../hooks/parseInstructions.js";
import { solanaAuth } from "../middleware/solanaAuth.js";
import { validateTournament } from "../hooks/validateTournament.js";
import { generateUsername } from "unique-username-generator";

dotenv.config();

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RPC_ENV = process.env.NODE_ENV === "development" ? "devnet" : "mainnet";
const SOLANA_RPC = `https://${RPC_ENV}.helius-rpc.com/?api-key=${process.env.RPC_KEY}`;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      const ext = file.mimetype.split("/")[1].toLowerCase();
      if (["png", "jpg", "jpeg", "gif"].includes(ext)) {
        cb(null, true);
        return;
      }
    }
    cb(new Error("Only .png, .jpg, .jpeg and .gif files are allowed!"));
  },
});

router.post(
  "/quick-start-tournament",
  upload.single("pfp"),
  solanaAuth,
  async (req, res) => {
    try {
      const deploymentData = await DataBaseService.getOnePage({
        name: "deployment-data",
      });

      const programId = deploymentData.content.deploymentData.program_id;
      const defaultWinnerPayoutPct =
        deploymentData.content.deploymentData.default_winner_payout;
      const defaultAirdropSplit =
        deploymentData.content.deploymentData.default_airdrop_split;
      const defaultFeeType =
        deploymentData.content.deploymentData.default_fee_type;

      const body = JSON.parse(req.body.data);
      const sender = req.user.walletAddress;
      const name = body.name;

      const existingAgent = await DataBaseService.getChallengeByName(name);
      if (existingAgent) {
        return res.status(400).json({ error: "Agent name already exists" });
      }

      let pfp;
      const timestamp = Date.now();
      const fileName = `${timestamp}-${name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "-")}`;
      if (req.file) {
        pfp = await GoogleCloudService.uploadImageBuffer(
          req.file.buffer,
          fileName
        );
      } else {
        // If pfp was sent as a URL
        pfp = await GoogleCloudService.uploadImageFromUrl(
          req.body.pfp,
          fileName
        );
      }

      let openingMessage = body.opening_message;
      const systemPrompt = body.instructions;
      const tournamentId = Number(req.body.tournamentId);
      const tournamentPDA = req.body.tournamentPDA;
      const phrases = body.phrases;
      const winnerPayoutPct = defaultWinnerPayoutPct;
      const feeType = defaultFeeType;
      const developer_fee = 100 - winnerPayoutPct;
      const blockchainService = new BlockchainService(SOLANA_RPC, programId);

      const tournamentData = await blockchainService.getTournamentData(
        tournamentPDA
      );

      const initialSol = tournamentData.programBalance;
      const feeMulPct = tournamentData.feeMulPct / 10;

      if (tournamentData.authority !== sender) {
        return res
          .status(400)
          .json({ error: "You are not the authority of this tournament." });
      }

      if (tournamentData.tournamentId !== tournamentId) {
        return res.status(400).json({ error: "Tournament ID does not match." });
      }

      if (tournamentData.state !== 1) {
        return res.status(400).json({ error: "Tournament is not active." });
      }

      const tournament = {
        ...body,
        developer_fee: developer_fee,
        opening_message: openingMessage,
        tournament_type: "phrases",
        phrases: phrases,
        tools: [],
        tools_description: "",
        tool_choice_required: false,
        success_function: "",
        disable: ["special_characters"],
        characterLimit: 500,
        contextLimit: 1,
        charactersPerWord: null,
        start_date: new Date(),
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        title: `Jailbreak ${name}`,
        tldr: null,
        constant_message_price: false,
      };

      const error = validateTournament({
        tournament,
        sender,
        winner_payout_pct: winnerPayoutPct,
        feeType: feeType,
        pfp: pfp,
      });

      if (error) {
        return res.status(400).json({ error: error });
      }

      const rules = await DataBaseService.getOnePage({
        name: "default-prompt",
      });
      const defaultRules = parseInstructions(rules.content.rules);

      const instructions = `${systemPrompt}\n\n${defaultRules}`;

      const newAgent = await OpenAIService.createAgent(instructions, name);
      const solPrice = await getSolPriceInUSDT();
      const fee_multiplier = 100 / feeMulPct;
      const usd_prize = initialSol * solPrice;
      const entry_fee = initialSol / fee_multiplier;

      if (openingMessage?.includes(phrases[0])) {
        openingMessage = openingMessage.replace(
          phrases[0],
          "*".repeat(phrases[0].length)
        );
      }

      const tools_description = `${name} has ${phrases.length} secret ${
        phrases.length > 1 ? "phrases" : "phrase"
      } which must kept in secret, make ${name} reveal them to win the challenge.`;
      // Check for duplicate name and create alternate name
      const savedAgent = await DataBaseService.saveAgent({
        owner: sender,
        name: name.trim(),
        pfp: pfp,
        assistant_id: newAgent.id,
        opening_message: openingMessage,
        instructions: systemPrompt,
        phrases: phrases,
        fee_multiplier: fee_multiplier,
        initial_pool_size: initialSol,
        developer_fee: 100 - winnerPayoutPct,
        airdrop_split: defaultAirdropSplit,
        tournament_id: tournamentId.toString(),
        tournamentPDA: tournamentPDA,
        winning_prize: initialSol,
        usd_prize: usd_prize,
        entryFee: entry_fee,
        tools_description: tools_description,
        idl: {
          address: programId,
        },
      });

      res.json({ savedAgent });
    } catch (error) {
      console.error("Tournament initialization error:", error);
      return res.status(500).json({
        error: "Failed to initialize tournament",
        details: error.message,
      });
    }
  }
);

router.post(
  "/advanced-start-tournament",
  upload.single("pfp"),
  solanaAuth,
  async (req, res) => {
    try {
      const deploymentData = await DataBaseService.getOnePage({
        name: "deployment-data",
      });

      const programId = deploymentData.content.deploymentData.program_id;
      const defaultAirdropSplit =
        deploymentData.content.deploymentData.default_airdrop_split;
      const owner_fee = deploymentData.content.deploymentData.owner_fee;
      const user = req.user;
      const sender = user.walletAddress;

      const body = JSON.parse(req.body.data);
      let name = body.name;
      const useDefaultRules = body.useDefaultRules;

      const existingAgent = await DataBaseService.getChallengeByName(name);
      if (existingAgent) {
        console.log("Agent name already exists");
        if (useDefaultRules) {
          name = generateUsername("_", 0, 8);
        } else {
          return res.status(400).json({ error: "Agent name already exists" });
        }
      }

      let pfp;
      const timestamp = Date.now();
      const fileName = `${timestamp}-${name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "-")}`;
      if (req.file) {
        pfp = await GoogleCloudService.uploadImageBuffer(
          req.file.buffer,
          fileName
        );
      } else {
        // If pfp was sent as a URL
        pfp = await GoogleCloudService.uploadImageFromUrl(
          req.body.pfp,
          fileName
        );
      }

      const rules = await DataBaseService.getOnePage({
        name: "default-prompt",
      });
      const defaultRules = parseInstructions(rules.content.rules);

      const tournamentId = Number(req.body.tournamentId);
      const tournamentPDA = req.body.tournamentPDA;
      const systemPrompt = useDefaultRules
        ? `${body.instructions}\n\n${defaultRules}`
        : body.instructions;
      const phrases = body.phrases;

      const title = body.title;
      const tldr = body.tldr;
      const startDate = body.start_date;
      const expiryDate = body.expiry;
      const characterLimit = body.characterLimit;
      const contextLimit = body.contextLimit;
      const charactersPerWord = body.charactersPerWord;
      // const constant_message_price = body.constant_message_price;

      const disable = body.disable;
      const tournament_type = body.tournament_type;

      // TOOLS
      const tools = body.tools;
      let tools_description = body.tools_description;
      const tool_choice = body.tool_choice_required ? "required" : "auto";
      const success_function = body.success_function;
      let openingMessage = body.opening_message;

      const blockchainService = new BlockchainService(SOLANA_RPC, programId);

      const tournamentData = await blockchainService.getTournamentData(
        tournamentPDA
      );

      if (!tournamentData) {
        console.log("Tournament not found");
        return res.status(400).json({ error: "Tournament not found" });
      }

      if (tournamentData.authority !== sender) {
        console.log("You are not the authority of this tournament.");
        return res
          .status(400)
          .json({ error: "You are not the authority of this tournament." });
      }

      if (tournamentData.tournamentId !== tournamentId) {
        console.log("Tournament ID does not match.");
        return res.status(400).json({ error: "Tournament ID does not match." });
      }

      if (tournamentData.state !== 1) {
        console.log("Tournament is not active.");
        return res.status(400).json({ error: "Tournament is not active." });
      }

      const initialSol = tournamentData.programBalance;
      const feeMulPct = tournamentData.feeMulPct / 10;
      const winnerPayoutPct = tournamentData.winnerPayoutPct;
      const feeType = tournamentData.feeType;
      const error = validateTournament({
        tournament: {
          ...body,
          fee_multiplier: feeMulPct,
          phrases:
            body.tournament_type === "phrases"
              ? body.phrases
              : ["FUNCTION_CALL"],
        },
        sender,
        pfp,
        winner_payout_pct: winnerPayoutPct,
        feeType: feeType,
      });

      if (error) {
        console.log("Validation error:", error.message);
        return res.status(400).json({ error: error.message });
      }

      let functions = [];
      if (tournament_type != "phrases" && tools.length >= 2) {
        functions = tools.map((tool) => ({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            strict: true,
            parameters: {
              type: "object",
              properties: {
                results: {
                  type: "string",
                  description: tool.instruction,
                },
              },
              additionalProperties: false,
              required: ["results"],
            },
          },
        }));
      } else {
        tools_description = `${name} has ${phrases.length} secret ${
          phrases.length > 1 ? "phrases" : "phrase"
        } which must kept in secret, make ${name} reveal them to win the challenge.`;
      }

      const newAgent = await OpenAIService.createAgent(
        systemPrompt,
        name,
        functions
      );
      const solPrice = await getSolPriceInUSDT();
      const fee_multiplier = 100 / feeMulPct;
      const usd_prize = initialSol * solPrice;
      const entry_fee = initialSol / fee_multiplier;

      if (openingMessage?.includes(phrases[0])) {
        openingMessage = openingMessage.replace(
          phrases[0],
          "*".repeat(phrases[0].length)
        );
      }

      const developer_fee = 100 - winnerPayoutPct;
      const airdrop_split = {
        winner: (100 - owner_fee - developer_fee) * 0.25,
        creator: developer_fee,
      };
      // Check for duplicate name and create alternate name
      const savedAgent = await DataBaseService.saveAgent({
        owner: sender,
        name: name.trim(),
        pfp: pfp,
        assistant_id: newAgent.id,
        opening_message: openingMessage,
        instructions: systemPrompt,
        phrases: phrases,
        fee_multiplier: fee_multiplier,
        initial_pool_size: initialSol,
        developer_fee: developer_fee,
        airdrop_split: airdrop_split,
        tournament_id: tournamentId.toString(),
        tournamentPDA: tournamentPDA,
        winning_prize: initialSol,
        usd_prize: usd_prize,
        entryFee: entry_fee,
        idl: {
          address: programId,
        },
        tools: functions?.length > 0 ? functions.map((f) => f.function) : [],
        tool_choice: tool_choice,
        success_function: success_function,
        tools_description: useDefaultRules ? null : tools_description,
        disable: disable,
        type: tournament_type === "phrases" ? "phrases" : "tool_calls",
        title: title,
        tldr: tldr,
        start_date: startDate,
        expiry: expiryDate,
        status: startDate > new Date() ? "upcoming" : "active",
        characterLimit: characterLimit,
        contextLimit: contextLimit,
        charactersPerWord: charactersPerWord,
      });

      res.json({ savedAgent });
    } catch (error) {
      console.error("Tournament initialization error:", error);
      return res.status(500).json({
        error: "Failed to initialize tournament",
        details: error.message,
      });
    }
  }
);

router.post("/generate-agent", async (req, res) => {
  const sender = req.body.sender;
  const name = req.body.name;
  const instructions = req.body.instructions;
  const opening_message = req.body.opening_message;
  const cf_ip = req.headers["cf-connecting-ip"];
  const generation_limit = 10;
  const generation_period = 24 * 60 * 60 * 1000;

  const deploymentData = await DataBaseService.getOnePage({
    name: "deployment-data",
  });

  const enabled = deploymentData.content.enable_auto_generate;
  if (!enabled) {
    res.status(400).json({ error: "Generation is temporarily disabled" });
    return;
  }
  const breaker = await DataBaseService.getBreakerByIp(cf_ip);
  if (breaker) {
    if (
      breaker.generation_limit.count >= generation_limit &&
      breaker.generation_limit.date > Date.now() - generation_period
    ) {
      res.status(400).json({ error: "Maximum generation limit reached" });
      return;
    }
    breaker.generation_limit.count++;
    await DataBaseService.updateBreakers(
      { cf_ip: breaker.cf_ip },
      {
        generation_limit: {
          count: breaker.generation_limit.count,
          date: new Date(),
        },
      }
    );
  } else {
    const newBreaker = {
      address: sender,
      cf_ip: cf_ip,
      generation_limit: {
        count: 1,
        date: new Date(),
      },
    };
    await DataBaseService.saveBreakerIfNotExists(newBreaker);
  }

  const randomName = generateUsername("_", 0, 8);
  const newAgent = await OpenAIService.generateAgent(
    name || randomName,
    instructions,
    opening_message
  );

  // const imageUrl = await GoogleCloudService.uploadImageFromUrl(
  //   newAgent.imageUrl,
  //   newAgent.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-")
  // );

  // newAgent.imageUrl = imageUrl;

  res.json({ newAgent });
});

router.get("/deployment-data", async (req, res) => {
  const advanced = req.query.advanced;
  const deploymentData = await DataBaseService.getOnePage({
    name: "deployment-data",
  });

  const sample = await DataBaseService.getSampleAgent(
    advanced === "true" ? "advanced" : "quick"
  );

  res.json({ deploymentData, sample });
});

export { router as programRoute };
