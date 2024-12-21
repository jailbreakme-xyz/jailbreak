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
  const limit = 100;
  const page = Number(req.query.page) || 1;
  const agents = await DatabaseService.getSettings();

  res.send({ agents: agents });
});

export { router as dataRoute };
