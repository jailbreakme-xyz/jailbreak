import express from "express";
import { validateSubmission } from "../validators/submissionValidator.js";
import DatabaseService from "../services/db/index.js";
import { solanaAuth } from "../middleware/solanaAuth.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { value, error } = await validateSubmission(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        validationErrors: error,
      });
    }

    const submission = await DatabaseService.createSubmission(value);
    res.json({
      success: true,
      submission,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      validationErrors: error.details, // Will be present if it's a Joi validation error
    });
  }
});

router.post("/request-api-key", solanaAuth, async (req, res) => {
  const user = req.user;
  const sender = user.walletAddress;
  const cfIp = req.headers["cf-connecting-ip"];

  const result = await DatabaseService.createApiKey(sender, cfIp);

  if (result.error) {
    return res.status(result.code).json({
      success: false,
      error: result.message,
    });
  }

  res.json({
    success: true,
    apiKey: result.apiKey,
  });
});

export { router as submissionRoute };
