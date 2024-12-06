import express from "express";
import { Challenge } from "../models/Models.js";
import verify from "./verify.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const challenges = await Challenge.find(
      {},
      {
        _id: 0,
        id: "$_id",
        title: 1,
        description: "$label",
        level: 1,
        active: 1,
      }
    );
    res.send(challenges);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const challenges = await Challenge.findOne(
      { _id: req.params.id },
      {
        _id: 0,
        id: "$_id",
        title: 1,
        description: "$label",
        level: 1,
        status: 1,
        model: 1,
      }
    );
    res.send(challenges);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.get("/levels/:level", async (req, res) => {
  try {
    const challenges = await Challenge.find(
      { level: { $regex: req.params.level, $options: "i" } },
      {
        _id: 0,
        id: "$_id",
        title: 1,
        description: "$label",
        level: 1,
      }
    );
    res.send(challenges);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.post("/new-challenge", verify, async (req, res) => {
  try {
    const title = req.body.title;
    const label = req.body.label;
    const description = req.body.description;
    const image = req.body.image;

    if (!title || !label || !description || !image)
      return res
        .status(400)
        .send("Must include title, label, description and image");

    const savedChallenge = new Challenge({
      title: title,
      label: label,
      description: description,
      image: image,
    });

    await savedChallenge.save();

    res.send(savedChallenge);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

export { router as challengesAPI };
