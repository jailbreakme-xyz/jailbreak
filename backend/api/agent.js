import express from "express";
import DatabaseService from "../services/db/index.js";

const router = express.Router();
router.use(express.json());

router.get("/", async (req, res) => {
  try {
    const results = await DatabaseService.getChallengesByQuery({});
    res.send(results);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

export { router as agentAPI };
