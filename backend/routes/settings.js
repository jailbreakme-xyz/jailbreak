import express from "express";
import DatabaseService from "../services/db/index.js";
import getSolPriceInUSDT from "../hooks/solPrice.js";
const router = express.Router();

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

router.get("/", async (req, res) => {
  try {
    const pages = await DatabaseService.getPages({});
    const topBreakersAndChatters =
      await DatabaseService.getTopBreakersAndChatters();

    const endpoints = pages.find((page) => page.name === "api-endpoints")
      ?.content?.endpoints;
    const faq = pages.find((page) => page.name === "faq")?.content?.faq;
    const jailToken = pages.find((page) => page.name === "jail-token")?.content;
    const beta = pages.find((page) => page.name === "beta")?.content;

    const solPrice = await getSolPriceInUSDT();
    const totalGrossPrize = await DatabaseService.countTotalUsdPrize();
    const totalNetPrize = totalGrossPrize[0].netTotal.toFixed(2);
    const totalPayout = totalGrossPrize[0].grossTotal.toFixed(2);
    const breakAttempts = await DatabaseService.getChatCount({ role: "user" });
    let activeChallenge = null;

    let topChallengesByPrize =
      await DatabaseService.getSortedChallengesByStatus(
        "active",
        { usd_prize: -1 },
        { limit: 10 }
      );

    const heroChallenges = await DatabaseService.getChallengesByQuery({
      hero: true,
    });

    activeChallenge =
      heroChallenges.length > 0
        ? heroChallenges[Math.floor(Math.random() * heroChallenges.length)]
        : topChallengesByPrize[0];

    // Fallback
    if (topChallengesByPrize.length < 10) {
      topChallengesByPrize = await DatabaseService.getSortedChallengesByStatus(
        "concluded",
        { usd_prize: -1 },
        { limit: 10 }
      );
      if (topChallengesByPrize.length < 10) {
        topChallengesByPrize =
          await DatabaseService.getSortedChallengesByStatus(
            "upcoming",
            { start_date: 1 },
            { limit: 10 }
          );
      }
    }

    let topChallengesByVolume =
      await DatabaseService.getSortedChallengesByStatus(
        "active",
        { break_attempts: -1, start_date: -1 },
        { limit: 50 }
      );

    if (topChallengesByVolume.length < 10) {
      topChallengesByVolume = await DatabaseService.getSortedChallengesByStatus(
        "concluded",
        { break_attempts: -1, start_date: -1 },
        { limit: 50 }
      );
      if (topChallengesByVolume.length < 10) {
        topChallengesByVolume =
          await DatabaseService.getSortedChallengesByStatus(
            "upcoming",
            { break_attempts: -1, start_date: -1 },
            { limit: 50 }
          );
      }
    }

    let latestChallenges = await DatabaseService.getSortedChallengesByStatus(
      "active",
      { start_date: -1 },
      { limit: 10 }
    );

    if (latestChallenges.length < 10) {
      latestChallenges = [
        ...latestChallenges,
        ...(await DatabaseService.getSortedChallengesByStatus(
          "upcoming",
          { start_date: 1 },
          { limit: 10 }
        )),
      ];
      if (latestChallenges.length < 10) {
        latestChallenges = [
          ...latestChallenges,
          ...(await DatabaseService.getSortedChallengesByStatus(
            "concluded",
            { start_date: -1 },
            { limit: 10 }
          )),
        ];
      }
    }

    const response = {
      endpoints: endpoints,
      faq: faq,
      beta: beta,
      challenges: topChallengesByPrize.slice(0, 10),
      jailToken: jailToken,
      activeChallenge: activeChallenge
        ? activeChallenge
        : topChallengesByPrize[0],
      totalNetPrize: totalNetPrize,
      total_payout: totalPayout,
      breakAttempts: breakAttempts,
      solPrice: solPrice,
      topChatters: topBreakersAndChatters.topChatters,
      latestChallenges: latestChallenges.slice(0, 10),
      trendingAgents: topChallengesByVolume,
      heroChallenges: heroChallenges,
    };

    res.send(response);
  } catch (error) {
    console.log("Error fetching settings:", error);
    res.status(500).send({ error: "Failed to fetch settings" });
  }
});

export { router as settingsRoute };
