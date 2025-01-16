import express from "express";
import { validateSubmission } from "../validators/submissionValidator.js";
import DatabaseService from "../services/db/index.js";

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

export { router as submissionRoute };
