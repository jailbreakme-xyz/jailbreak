import express from "express";
import verify from "./verify.js";
import DatabaseService from "../services/db/index.js";
const router = express.Router();

router.get("/", verify, async (req, res) => {
  const address = req.user.address;
  const limit = parseInt(req.query.limit) || 20;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const conversations = await DatabaseService.getUserConversations(
      address,
      skip,
      limit
    );
    res.send(conversations);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.get("/tournament/:tournament", verify, async (req, res) => {
  const address = req.user.address;
  const limit = parseInt(req.query.limit) || 20;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const conversations = await DatabaseService.getChallengeConversations(
      address,
      req.params.challenge,
      skip,
      limit
    );
    res.send(conversations);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

export { router as conversationsAPI };
