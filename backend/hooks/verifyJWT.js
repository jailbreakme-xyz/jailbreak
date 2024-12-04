import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const verifyJWT = (req, res, next) => {
  const token = req.headers["auth-token"];

  if (!token) {
    return res.status(401).json({ error: "Authorization token missing." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.walletAddress = decoded.walletAddress;
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

export default verifyJWT;
