import { Breaker } from "../models/Models.js";

async function verify(req, res, next) {
  const token = req.headers["x-api-key"];
  if (!token) return res.status(401).send("x-api-key is required");
  if (typeof token != "string") return res.status(401).send("Invalid API Key");

  const isUser = await Breaker.findOne({ api_key: token });
  if (!isUser) return res.status(401).send("Invalid API Key");
  res.locals.user = isUser;
  next();
}

export default verify;
