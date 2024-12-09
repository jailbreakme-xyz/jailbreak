import express from "express";
import DatabaseService from "../services/db/index.js";
import getSolPriceInUSDT from "../hooks/solPrice.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const challenges = await DatabaseService.getSettings();
    const pages = await DatabaseService.getPages({});
    const endpoints = pages.find((page) => page.name === "api-endpoints")
      ?.content?.endpoints;
    const faq = pages.find((page) => page.name === "faq")?.content?.faq;
    const jailToken = pages.find((page) => page.name === "jail-token")?.content;

    const display_conditions = ["active", "upcoming"];
    const activeChallenge = challenges.find((challenge) =>
      display_conditions.includes(challenge.status)
    );

    const solPrice = await getSolPriceInUSDT();

    const totalWinningPrize = challenges
      .filter((challenge) => challenge.winning_prize)
      .map((challenge) => {
        const treasury =
          challenge.winning_prize * (challenge.developer_fee / 100);
        const total_payout = challenge.winning_prize - treasury;

        return {
          treasury: treasury * solPrice,
          total_payout: total_payout * solPrice,
        };
      });

    const totalTreasury = totalWinningPrize.reduce(
      (acc, item) => acc + item.treasury,
      0
    );
    const totalPayout = totalWinningPrize.reduce(
      (acc, item) => acc + item.total_payout,
      0
    );

    const breakAttempts = await DatabaseService.getChatCount({ role: "user" });
    const response = {
      endpoints: endpoints,
      faq: faq,
      challenges: challenges,
      jailToken: jailToken,
      activeChallenge: activeChallenge,
      treasury: totalTreasury,
      total_payout: totalPayout,
      breakAttempts: breakAttempts,
      solPrice: solPrice,
    };

    res.send(response);
  } catch (error) {
    console.log("Error fetching settings:", error);
    res.status(500).send({ error: "Failed to fetch settings" });
  }
});

export { router as settingsRoute };
