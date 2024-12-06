import express from "express";
import verify from "./verify.js";
import DatabaseService from "../services/db/index.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const challenges = await DatabaseService.getAllTournaments();
    res.send(challenges);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const challenges = await DatabaseService.getTournamentById(req.params.id);
    res.send(challenges);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.post("/new-tournament", verify, async (req, res) => {
  try {
    const {
      title,
      name,
      description,
      image,
      pfp,
      task,
      label,
      level,
      model,
      system_message,
      characterLimit,
      contextLimit,
      chatLimit,
      tools,
    } = req.body;

    if (!title || !name || !description)
      return res
        .status(400)
        .send("Must include at least title, name, and description");

    const savedChallenge = await DatabaseService.createTournament({
      title,
      name,
      description,
      image,
      pfp,
      task,
      label,
      level,
      model,
      system_message,
      characterLimit,
      contextLimit,
      chatLimit,
      tools,
    });

    res.send(savedChallenge);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

export { router as tournamentsAPI };
