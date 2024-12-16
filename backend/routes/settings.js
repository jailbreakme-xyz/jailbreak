import express from "express";
import DatabaseService from "../services/db/index.js";
import getSolPriceInUSDT from "../hooks/solPrice.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const challenges = await DatabaseService.getSettings();
    const pages = await DatabaseService.getPages({});
    const topBreakersAndChatters =
      await DatabaseService.getTopBreakersAndChatters();

    const endpoints = pages.find((page) => page.name === "api-endpoints")
      ?.content?.endpoints;
    const faq = pages.find((page) => page.name === "faq")?.content?.faq;
    const jailToken = pages.find((page) => page.name === "jail-token")?.content;
    const beta = pages.find((page) => page.name === "beta")?.content;

    let activeChallenge = challenges?.find(
      (challenge) => challenge.status === "active"
    );

    if (!activeChallenge) {
      const upcomingChallenge = challenges?.find(
        (challenge) => challenge.status === "upcoming"
      );
      if (upcomingChallenge) {
        activeChallenge = upcomingChallenge;
      } else {
        activeChallenge = challenges?.sort(
          (a, b) => a.start_date - b.start_date
        )[0];
      }
    }

    const solPrice = await getSolPriceInUSDT();

    const totalWinningPrize = challenges
      ?.filter((challenge) => challenge.usd_prize)
      ?.map((challenge) => {
        const treasury = challenge.usd_prize * (challenge.developer_fee / 100);
        const total_payout = challenge.usd_prize - treasury;

        return {
          treasury: treasury,
          total_payout: total_payout,
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

    // console.log(JSON.stringify(topBreakers, null, 2));
    const breakAttempts = await DatabaseService.getChatCount({ role: "user" });
    const response = {
      endpoints: endpoints,
      faq: faq,
      beta: beta,
      challenges: challenges,
      jailToken: jailToken,
      activeChallenge: activeChallenge,
      treasury: totalTreasury,
      total_payout: totalPayout,
      breakAttempts: breakAttempts,
      solPrice: solPrice,
      topBreakers: topBreakersAndChatters.topBreakers,
      topChatters: topBreakersAndChatters.topChatters,
    };

    res.send(response);
  } catch (error) {
    console.log("Error fetching settings:", error);
    res.status(500).send({ error: "Failed to fetch settings" });
  }
});

export { router as settingsRoute };
