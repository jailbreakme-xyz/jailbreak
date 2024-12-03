import express from "express";
import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";
import verifyJWT from "../hooks/verifyJWT.js";
import { Conversation, Challenge, Chat } from "../models/Models.js";
import OpenAIService from "../services/llm/openai.js";
import BlockchainService from "../services/blockchain/index.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_SECRET,
});

const router = express.Router();
const model = "gpt-4o-mini";

router.post("/submit/:id", async (req, res) => {
  try {
    const { prompt, transactionSignature, walletAddress } = req.body;
    const { id } = req.params;
    const chatLimit = 20;
    const characterLimit = 1000;

    // if (!prompt || !transactionSignature || !walletAddress) {
    //   return res.write("Missing required fields");
    // }

    // const isValid = await BlockchainService.verifyTransaction(
    //   transactionSignature,
    //   id,
    //   walletAddress
    // );

    // if (!isValid) {
    //   return res.write("Invalid transaction");
    // }

    // Find the challenge
    const challenge = await Challenge.findOne({ _id: id });
    if (!challenge) return res.write("Challenge not found");

    if (prompt.length > characterLimit)
      return res.write(
        `Prompt length can't exceed ${characterLimit} characters`
      );

    // Add user message to the Chat collection
    const userMessage = {
      challenge: id,
      model: model,
      role: "user",
      content: prompt,
      address: walletAddress,
    };

    await Chat.create(userMessage);

    // const walletPublicKey = new PublicKey(walletAddress);

    // const solutionHash = await BlockchainService.createSolutionHash(
    //   assistantMessage.content
    // );

    // const tournamentData = await BlockchainService.getTournamentData(
    //   challenge.tournamentAddress
    // );

    // const transaction = await BlockchainService.submitSolution(
    //   walletPublicKey,
    //   solutionHash,
    //   Number(tournamentData.entryFee) / LAMPORTS_PER_SOL
    // );

    const systemPrompt = challenge.system_message;

    if (!systemPrompt) return res.write("Challenge is not active");

    // Fetch chat history for the challenge and address
    const chatHistory = await Chat.find({
      challenge: id,
      role: { $ne: "system" },
    })
      .sort({ date: -1 })
      .limit(chatLimit) // Sort by date to maintain chronological order
      .select("role content -_id"); // Only include role and content

    const messages = [{ role: "system", content: systemPrompt }];

    chatHistory.reverse().map((chat) => {
      messages.push({
        role: chat.role,
        content: chat.content,
      });
    });

    const stream = await OpenAIService.createChatCompletion({
      messages: messages,
      model: model,
    });

    const assistantMessage = {
      challenge: id,
      model: model,
      role: "assistant",
      content: "",
      tool_calls: {},
      address: walletAddress,
    };

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");

    let functionArguments = "";
    let functionName = "";
    let isCollectingFunctionArgs = false;
    let end_msg = "";

    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta;
      const finishReason = chunk.choices[0].finish_reason;

      if (chunk && !finishReason) {
        // Handle content
        if (delta.content) {
          assistantMessage.content += delta.content;
          res.write(delta.content);
        }

        // Handle tool calls
        if (delta.tool_calls) {
          isCollectingFunctionArgs = true;
          const toolCall = delta.tool_calls[0];

          if (toolCall.function?.name) {
            functionName = toolCall.function.name;
          }

          if (toolCall.function?.arguments) {
            functionArguments += toolCall.function.arguments;
          }
        }
      } else {
        const allowedFinishReasons = ["tool_calls", "stop"];
        const finishReasonObj = OpenAIService.finish_reasons.find(
          (reason) => reason.name === finishReason
        );

        if (!finishReasonObj) {
          end_msg = "The conversation was ended for an unspecified reason.";
          res.write(end_msg);
          res.end();
        } else if (!allowedFinishReasons.includes(finishReason)) {
          end_msg = finishReasonObj.description;
          res.write(end_msg);
          res.end();
        } else if (isCollectingFunctionArgs) {
          // Save assistant message when stream ends with function args
          console.log(walletAddress, functionArguments);
          const args = JSON.parse(functionArguments);
          assistantMessage.content += args.feedback;
          assistantMessage.tool_calls = args;
          assistantMessage.tool_calls.function_name = functionName;
          if (functionName === "handleChallengeSuccess") {
            // TODO: Handle Success
          } else {
            // TODO: Handle Failure
          }
          //   Send back the feedback
          await Chat.create(assistantMessage);
          res.write(args.feedback);
        } else {
          // Save assistant message when stream ends
          await Chat.create(assistantMessage);
          return res.end();
        }
      }
      res.flushHeaders();
    }

    res.end();
  } catch (error) {
    console.error("Error handling submit:", error);
    return res.write(error?.error?.message || "Server error");
  }
});

export { router as conversationRoute };
