import express from "express";
import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import verifyJWT from "../hooks/verifyJWT.js";
import { Conversation, Challenge, Chat } from "../models/Models.js";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_SECRET,
});

const router = express.Router();
const model = "gpt-4o-mini";

router.post("/submit/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const address = req.walletAddress;
  const chatLimit = 20;
  const characterLimit = 1000;

  try {
    // Find the challenge
    const challenge = await Challenge.findOne({ _id: id });
    if (!challenge) return res.status(404).send("Challenge not found");

    if (!address) return res.status(401).send("Invalid Address");

    // Check prompt validity
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).send("Must include prompt");
    if (prompt.length > characterLimit)
      return res.status(400).send("Prompt length can't exceed 200 characters");

    // Add user message to the Chat collection
    const userMessage = {
      challenge: id,
      model: model,
      role: "user",
      content: prompt,
      address: address,
    };

    await Chat.create(userMessage);

    const systemPrompt = challenge.system_message;

    if (!systemPrompt) return res.status(500).send("Challenge is not active");

    // Fetch chat history for the challenge and address
    const chatHistory = await Chat.find({
      challenge: id,
      role: { $ne: "system" },
    })
      .sort({ date: 1 })
      .limit(chatLimit) // Sort by date to maintain chronological order
      .select("role content -_id"); // Only include role and content

    const messages = [{ role: "system", content: systemPrompt }];

    chatHistory.map((chat) => {
      messages.push({
        role: chat.role,
        content: chat.content,
      });
    });

    // Stream GPT response
    const stream = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
    });

    const assistantMessage = {
      challenge: id,
      model: model,
      role: "assistant",
      content: "",
      address: address,
    };

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");

    for await (const chunk of stream) {
      if (chunk && !chunk.choices[0].finish_reason) {
        assistantMessage.content += chunk.choices[0].delta.content;
        res.write(chunk.choices[0].delta.content);
      } else {
        // Save assistant message when stream ends
        await Chat.create(assistantMessage);
        return res.end();
      }

      res.flushHeaders();
    }

    res.end();
  } catch (error) {
    console.error("Error handling submit:", error);
    return res.status(500).send(error?.error?.message || "Server error");
  }
});

export { router as conversationRoute };
