import express from "express";
import DatabaseService from "../services/db/index.js";
import { solanaAuth } from "../middleware/solanaAuth.js";

const router = express.Router();

router.get("/full-agent/:agentId", solanaAuth, async (req, res) => {
  const agentId = req.params.agentId;
  const user = req.user;

  console.log(agentId, user.walletAddress);
  const agent = await DatabaseService.getFullAgent(agentId, user.walletAddress);
  res.json({ agent, token: user.token });
});

router.put("/update-agent/:agentId", solanaAuth, async (req, res) => {
  try {
    const agentId = req.params.agentId;
    const user = req.user;

    const agent = await DatabaseService.getFullAgent(
      agentId,
      user.walletAddress
    );
    if (!agent || agent.owner !== user.walletAddress) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this agent" });
    }

    if (agent.status === "active") {
      return res.status(403).json({ error: "Cannot update active agent" });
    }

    // Update agent details
    const updatedAgent = await DatabaseService.updateAgent(agentId, updates);
    res.json(updatedAgent);
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({ error: "Failed to update agent" });
  }
});

export { router as breakerRoute };
