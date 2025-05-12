import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { catchErrors } from "./hooks/errors.js";

dotenv.config();
const dbURI = process.env.DB_URI;
const clientOptions = {};

const app = express();
const dev = app.get("env") !== "production";

const port = 8001;

app.use(bodyParser.json());

app.use(express.json());
// Add headers
app.use(function (req, res, next) {
  // Origin to allow
  const allowedOrigins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8001",
    "https://jailbreakme.xyz",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  // Request methods
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  // Request headers
  res.setHeader(
    "Access-Control-Expose-Headers",
    "auth-token",
    "x-forwarded-for",
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,auth-token,cancelToken, responsetype, x-forwarded-for, signature, publickey, message, timestamp, x-api-key"
  );
  next();
});

var forceSSL = function (req, res, next) {
  if (req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(["https://", req.get("Host"), req.url].join(""));
  }
  return next();
};

if (!dev) {
  app.use(forceSSL);
}

app.disable("x-powered-by");
app.set("trust proxy", true);

// UI:
import { challengesRoute } from "./routes/challenges.js";
import { conversationRoute } from "./routes/conversation.js";
import { settingsRoute } from "./routes/settings.js";
import { transactionsRoute } from "./routes/transactions.js";
import { programRoute } from "./routes/program.js";
import { dataRoute } from "./routes/data.js";
import { breakerRoute } from "./routes/breaker.js";
import { authRoute } from "./routes/auth.js";
import { submissionRoute } from "./routes/submission.js";
import { mcpRoute } from "./routes/mcp.js";
// API:
import { conversationsAPI } from "./api/conversation.js";
import { challengeAPI } from "./api/challenge.js";
import { agentAPI } from "./api/agent.js";

app.use("/api/challenges", challengesRoute);
app.use("/api/conversation", conversationRoute);
app.use("/api/settings", settingsRoute);
app.use("/api/transactions", transactionsRoute);
app.use("/api/program", programRoute);
app.use("/api/data", dataRoute);
app.use("/api/breaker", breakerRoute);
app.use("/api/auth", authRoute);
app.use("/api/submissions", submissionRoute);
app.use("/api/mcp", mcpRoute);
app.use("/api/json/v1/conversations", conversationsAPI);
// app.use("/api/json/v1/challenges", challengeAPI);
// app.use("/api/json/v1/agents", agentAPI);

app.get("/api/check-headers", (req, res) => {
  res.json({ headers: req.headers });
});

catchErrors();

async function connectToDatabase() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(dbURI, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Database connected!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

app.listen(port, () => {
  console.log(`Jailbreak app listening on port ${port}`);
  connectToDatabase().catch(console.dir);
});
