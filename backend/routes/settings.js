import express from "express";
import DatabaseService from "../services/db/index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const challenges = await DatabaseService.getSettings();
    const pages = await DatabaseService.getPages();
    const endpoints = pages.find((page) => page.name === "api-endpoints")
      ?.content?.endpoints;
    const faq = pages.find((page) => page.name === "faq")?.content?.faq;
    const jailToken = pages.find((page) => page.name === "jail-token")?.content;

    const response = {
      endpoints: endpoints,
      faq: faq,
      challenges: challenges,
      jailToken: jailToken,
    };

    res.send(response);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch settings" });
  }
});

export { router as settingsRoute };
