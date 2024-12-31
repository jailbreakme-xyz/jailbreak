import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import jwt from "jsonwebtoken";

export const solanaAuth = async (req, res, next) => {
  try {
    // Check for existing JWT token first
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ") && authHeader.split(" ")[1]) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = { token, walletAddress: decoded.walletAddress };
        return next(); // Skip Solana auth if JWT is valid
      } catch (err) {
        // Token invalid/expired - continue with Solana auth
      }
    }

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
    try {
      new PublicKey(publickey);
    } catch (error) {
      return res.status(401).json({ error: "Invalid public key" });
    }

    // Verify signature
    const verified = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      bs58.decode(publickey)
    );

    if (!verified) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Generate JWT token after successful verification
    const token = jwt.sign(
      { walletAddress: publickey },
      process.env.JWT_SECRET,
      { expiresIn: "168h" }
    );

    req.user = { walletAddress: publickey, token };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};
