import express from "express";
import DatabaseService from "../services/db/index.js";
import getSolPriceInUSDT from "../hooks/solPrice.js";
import multer from "multer";
import GoogleCloudService from "../services/gcs/index.js";
import { solanaAuth } from "../middleware/solanaAuth.js";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import BlockchainService from "../services/blockchain/index.js";
import { validateBounty } from "../validators/bountyValidator.js";
const router = express.Router();

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

const RPC_ENV = process.env.NODE_ENV === "development" ? "devnet" : "mainnet";
const SOLANA_RPC = `https://${RPC_ENV}.helius-rpc.com/?api-key=${process.env.RPC_KEY}`;

router.get("/breakers", async (req, res) => {
  const limit = 100;
  const page = Number(req.query.page) || 1;

  if (limit > 100) {
    return res.status(400).json({ error: "Limit must be 100 or less" });
  }

  const breakers = await DatabaseService.getTopBreakersAndChatters(page, limit);
  const count = await DatabaseService.getBreakersCount({ role: "user" });

  const hasNextPage = count[0]?.count > page * limit;
  res.send({
    topChatters: breakers.topChatters,
    count: count[0]?.count,
    hasNextPage: hasNextPage,
  });
});

router.get("/agents", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const lastId = req.query.cursor || null;

    if (limit > 100) {
      return res.status(400).json({ error: "Limit must be 100 or less" });
    }
    // Add verified filter validation
    const validVerified = ["all", "verified"];
    const verified = validVerified.includes(req.query.verified)
      ? req.query.verified
      : "all";

    // Status filter with validation
    const validStatuses = ["active", "upcoming", "concluded"];
    const status = validStatuses.includes(req.query.status)
      ? req.query.status
      : { $type: "string" };

    // Validate sort parameter
    const validSorts = [
      "start_date_asc",
      "start_date_desc",
      "expiry_desc",
      "attempts_asc",
      "attempts_desc",
      "usd_prize_asc",
      "usd_prize_desc",
      "entryFee_asc",
      "entryFee_desc",
    ];
    const sort = validSorts.includes(req.query.sort)
      ? req.query.sort
      : "start_date_desc";

    const result = await DatabaseService.getChallengesWithFilters({
      status,
      verified,
      sort,
      limit,
      lastId,
      sortDirection: sort.endsWith("_asc") ? 1 : -1,
    });

    if (!result) {
      return res.status(500).json({ error: "Failed to fetch challenges" });
    }

    res.json({
      challenges: result.challenges,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      sort,
      status: req.query.status || "all",
      verified,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/agents-by-owner/:address", async (req, res) => {
  const address = req.params.address;
  const agents = await DatabaseService.getAgentsByOwner(address);
  res.json({ agents });
});

router.get("/social-bounties", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const lastId = req.query.cursor || null;

    if (limit > 100) {
      return res.status(400).json({ error: "Limit must be 100 or less" });
    }

    // Validate sort parameter
    const validSorts = ["date_asc", "date_desc", "prize_asc", "prize_desc"];
    const sort = validSorts.includes(req.query.sort)
      ? req.query.sort
      : "date_desc";

    const result = await DatabaseService.getSocialBounties({
      limit,
      lastId,
      sort,
      sortDirection: sort.endsWith("_asc") ? 1 : -1,
    });

    if (!result) {
      return res.status(500).json({ error: "Failed to fetch social bounties" });
    }

    const totalPrize = result.bounties.reduce(
      (acc, bounty) => acc + bounty.prize,
      0
    );

    const deploymentData = await DatabaseService.getOnePage({
      name: "deployment-data",
    });

    const ownerFee = deploymentData.content.deploymentData.bounty_fee_pct;

    // const minimumBountyPrize =
    //   deploymentData.content.deploymentData.minimum_bounty_prize;

    res.json({
      bounties: result.bounties,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      sort,
      totalPrize,
      ownerFee,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/social-bounties/:id/submissions", async (req, res) => {
  try {
    const { id } = req.params;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const bounty = await DatabaseService.getBountyById(id);
    if (bounty.jailbreak?.url) {
      return res.status(400).json({ error: "Bounty already solved" });
    }
    const result = await DatabaseService.addBountySubmission(id, url);

    if (!result) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    res.json({ message: "Submission added successfully", submission });
  } catch (error) {
    console.error("Error adding submission:", error);
    res.status(500).json({ error: "Failed to add submission" });
  }
});

router.get("/social-bounties/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bounty = await DatabaseService.getBountyById(id);

    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    res.json({ bounty });
  } catch (error) {
    console.error("Error fetching bounty:", error);
    res.status(500).json({ error: "Failed to fetch bounty" });
  }
});

router.post(
  "/create-bounty",
  upload.single("image"),
  solanaAuth,
  async (req, res) => {
    try {
      const body = JSON.parse(req.body.data);

      const name = body.targetUrl.split("/").pop();
      const { error } = validateBounty({
        name,
        prize: body.prize,
        targetUrl: body.targetUrl,
        task: body.task,
      });
      if (error) {
        return res.status(400).json({
          error: error.details.map((detail) => detail.message).join(", "),
        });
      }

      const { txn } = body;

      // Check if bounty with this signature already exists
      const existingBounty = await DatabaseService.getBountyBySignature(txn);
      if (existingBounty) {
        return res.status(400).json({ error: "Bounty already exists" });
      }

      // Get deployment data for owner address
      const deploymentData = await DatabaseService.getOnePage({
        name: "deployment-data",
      });
      const ownerAddress = deploymentData.content.deploymentData.owner_address;

      // Verify the transaction using blockchain service
      const blockchainService = new BlockchainService(SOLANA_RPC, null);
      const { isValid, transferAmount } =
        await blockchainService.verifyBountyTransaction(
          txn,
          ownerAddress,
          req.user.walletAddress
        );

      if (!isValid) {
        return res.status(400).json({ error: "Invalid transaction" });
      }

      // Get SOL price in USDT
      const solPrice = await getSolPriceInUSDT();
      const usdPrize = transferAmount * solPrice;

      // Upload image
      const timestamp = Date.now();
      const fileName = `${timestamp}-${name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "-")}`;
      const imageUrl = await GoogleCloudService.uploadImageBuffer(
        req.file.buffer,
        fileName
      );

      // Create bounty object
      const bounty = {
        name,
        image: imageUrl,
        targetUrl: body.targetUrl,
        task: body.task,
        sol_prize: transferAmount,
        prize: usdPrize,
        txn: txn,
        createdAt: new Date(),
        creator: req.user.walletAddress,
      };

      const result = await DatabaseService.createBounty(bounty);
      res.json({ bounty: result });
    } catch (error) {
      console.error("Error creating bounty:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

export { router as dataRoute };
