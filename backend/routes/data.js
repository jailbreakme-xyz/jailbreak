import express from "express";
import DatabaseService from "../services/db/index.js";
import getSolPriceInUSDT from "../hooks/solPrice.js";
const router = express.Router();

router.get("/breakers", async (req, res) => {
  const limit = 100;
  const page = Number(req.query.page) || 1;
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

export { router as dataRoute };
