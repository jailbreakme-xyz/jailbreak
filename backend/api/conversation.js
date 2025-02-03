import express from "express";
import SearchDBService from "../services/db/search.js";
import { Chat } from "../models/Models.js";
import { validateSearchQuery } from "../validators/searchQueryValidator.js";
import verify from "../middleware/verify.js";
import apiRateLimit from "../middleware/apiRateLimit.js";

const router = express.Router();
router.use(express.json());

router.post("/search", verify, apiRateLimit, async (req, res) => {
  const { error, value } = validateSearchQuery(req.body);

  if (error) {
    return res.status(400).send({
      error: "Invalid query parameters",
      details: error.details.map((detail) => detail.message),
    });
  }

  if (
    !value.challenge &&
    !value.address &&
    !value.content &&
    !value.role &&
    !value.win &&
    !value.start_date
  ) {
    return res.status(400).send({
      error:
        "At least one of the following parameters is required: challenge, address, content, role, win, or start_date",
    });
  }

  try {
    const searchService = new SearchDBService(Chat);
    const results = await searchService.getChallengeConversations(
      value.challenge,
      {
        win: value.win,
        address: value.address,
        content: value.content,
        role: value.role,
        startDate: value.start_date,
        endDate: value.end_date,
        sortField: "date",
        sortOrder: value.sort_order,
        cursor: value.cursor,
        limit: value.limit,
      }
    );

    res.send(results);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.get("/search/default", async (req, res) => {
  try {
    const searchService = new SearchDBService(Chat);
    const results = await searchService.getChallengeConversations("myrios");
    res.send(results);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

export { router as conversationsAPI };
