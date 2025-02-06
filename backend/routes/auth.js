import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import express from "express";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";

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

    return res.json({
      valid: true,
      walletAddress: decoded.walletAddress,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const createToken = async (req, res) => {
  try {
    const { signature, publickey, message, timestamp } = req.headers;

    // Check if all required headers are present
    if (!signature || !publickey || !message || !timestamp) {
      return res.status(401).json({ error: "Missing authentication headers" });
    }

    // Verify timestamp is within 5 minutes
    const now = Date.now();
    const messageTime = parseInt(timestamp);
    if (now - messageTime > 5 * 60 * 1000) {
      return res.status(401).json({ error: "Message expired" });
    }

    // Verify public key is valid
    let publicKey;
    try {
      publicKey = new PublicKey(publickey);
    } catch (error) {
      return res.status(401).json({ error: "Invalid public key" });
    }

    // Verify signature
    const verified = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      publicKey.toBytes()
    );

    if (!verified) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Generate JWT token after successful verification
    const token = jwt.sign(
      {
        walletAddress: publickey,
        timestamp: Date.now(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "168h" }
    );

    return res.json({ token });
  } catch (error) {
    console.error("Token creation error:", error);
    return res.status(401).json({ error: "Token creation failed" });
  }
};

// Add to your routes:
router.get("/verify-token", verifyToken);
router.post("/create-token", createToken);

export { router as authRoute };
