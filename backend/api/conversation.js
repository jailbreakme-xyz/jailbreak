import express from "express";
import { Chat } from "../models/Models.js";
import verify from "./verify.js";
const router = express.Router();

router.get("/", verify, async (req, res) => {
  const address = req.user.address;
  const limit = req.query.limit || 20;
  const skip = req.query.skip || 0;

  try {
    const conversations = await Chat.find(
      { address: address },
      {
        id: "$_id",
        content: 1,
        role: 1,
        address: 1,
        challenge: 1,
        date: 1,
      }
    )
      .skip(skip)
      .limit(limit);
    res.send(conversations);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.get("/challenge/:challenge", verify, async (req, res) => {
  const address = req.user.address;
  const limit = req.query.limit || 20;
  const skip = req.query.skip || 0;

  try {
    const conversations = await Chat.find(
      { address: address, challenge: req.params.challenge },
      {
        _id: 0,
        content: 1,
        role: 1,
        address: 1,
        challenge: 1,
        date: 1,
      }
    )
      .skip(skip)
      .limit(limit);

    res.send(conversations);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

export { router as conversationsAPI };
