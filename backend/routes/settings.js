import express from "express";
import { Challenge } from "../models/Models.js";
import { endpoints } from "../data/endpoints.js";
import { faqData } from "../data/faq.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const challenges = await Challenge.find(
      {},
      {
        _id: 0,
        id: "$_id",
        name: 1,
        title: 1,
        image: 1,
        label: 1,
        level: 1,
        status: 1,
        pfp: 1,
        entryFee: 1,
        expiry: 1,
      }
    );

    const response = {
      endpoints: endpoints,
      faq: faqData,
      challenges: challenges,
    };
    res.send(response);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch settings" });
  }
});

export { router as settingsRoute };
