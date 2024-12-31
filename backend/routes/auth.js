import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import express from "express";

const router = express.Router();

dotenv.config();

export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.walletAddress !== req.headers.address) {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.json({
      verified: true,
      walletAddress: decoded.walletAddress,
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Add to your routes:
router.get("/verify-token", verifyToken);

export { router as authRoute };
