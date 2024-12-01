import express from "express";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { endpoints } from "./data/endpoints.js";
import { catchErrors } from "./hooks/errors.js";
import { Challenge, Settings } from "./models/Models.js";
import { faqData } from "./data/faq.js";

// import { challenges } from "./data/challenges.js";

dotenv.config();
const dbURI = process.env.DB_URI;
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express();
const dev = app.get("env") !== "production";

const port = 8001;

app.use(bodyParser.json());

app.use(express.json());
// Add headers
app.use(function (req, res, next) {
  // Origin to allow
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:8001",
    "http://18.157.122.205",
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
    "x-forwarded-for"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,auth-token,cancelToken, responsetype, x-forwarded-for"
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
import { verifyRoute } from "./routes/verify.js";

// API:
import { challengesAPI } from "./api/challenges.js";
import { conversationsAPI } from "./api/conversation.js";

app.use("/api/challenges", challengesRoute);
app.use("/api/conversation", conversationRoute);
app.use("/api/verify-wallet", verifyRoute);

app.use("/api/json/v1/challenges", challengesAPI);
app.use("/api/json/v1/conversations", conversationsAPI);

mongoose
  .connect(dbURI)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

app.get("/api/settings", async (req, res) => {
  const settings = await Settings.findOne({ _id: "67499aec7a5af63de4eb84fb" });
  const challenges = await Challenge.find(
    {},
    {
      _id: 0,
      id: "$_id",
      name: 1,
      title: 1,
      image: 1,
      label: 1,
      level: 1,
      active: 1,
      pfp: 1,
    }
  );

  const response = {
    settings: settings,
    endpoints: endpoints,
    faq: faqData,
    challenges: challenges,
  };
  res.send(response);
});

catchErrors();

app.listen(port, () => {
  console.log(`Jailbreak app listening on port ${port}`);
});
