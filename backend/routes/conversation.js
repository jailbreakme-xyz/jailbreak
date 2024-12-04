import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { Challenge, Chat } from "../models/Models.js";
import OpenAIService from "../services/llm/openai.js";
import BlockchainService from "../services/blockchain/index.js";

const router = express.Router();
const model = "gpt-4o-mini";

const solanaRpc = process.env.RPC_URL_DEVNET;

router.post("/submit/:id", async (req, res) => {
  try {
    const { prompt, signature, walletAddress } = req.body;
    const { id } = req.params;
    const contextLimit = 100;
    const characterLimit = 4000;

    if (!prompt || !signature || !walletAddress) {
      return res.write("Missing required fields");
    }

    // Find the challenge
    const challenge = await Challenge.findOne({ _id: id });
    if (!challenge) return res.write("Challenge not found");

    const programId = challenge.idl?.address;
    if (!programId) return res.write("Program ID not found");

    const tournamentPDA = challenge.tournamentPDA;
    if (!tournamentPDA) return res.write("Tournament PDA not found");

    const blockchainService = new BlockchainService(solanaRpc, programId);
    const tournamentData = await blockchainService.getTournamentData(
      tournamentPDA
    );
    const entryFee = tournamentData.entryFee;
    const currentExpiry = challenge.expiry;
    const newExpiry = new Date(currentExpiry.getTime() + 3600000);

    await Challenge.updateOne(
      { _id: id },
      {
        $set: {
          entryFee: entryFee,
          expiry: newExpiry,
        },
      }
    );

    if (!entryFee) {
      return res.write("Entry fee not found in tournament data");
    }

    const isValidTransaction = await blockchainService.verifyTransaction(
      signature,
      tournamentPDA,
      entryFee
    );

    if (!isValidTransaction) {
      return res.write("Transaction verification failed");
    }

    console.log("Transaction verified successfully for wallet:", walletAddress);

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
      txn: signature,
    };

    await Chat.create(userMessage);

    const systemPrompt = challenge.system_message;

    if (!systemPrompt) return res.write("Challenge is not active");

    // Fetch chat history for the challenge and address
    const chatHistory = await Chat.find({
      challenge: id,
      address: walletAddress,
      // role: { $ne: "system" },
    })
      .sort({ date: -1 })
      .limit(contextLimit) // Sort by date to maintain chronological order
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
          try {
            const args = JSON.parse(functionArguments); // Attempt to parse JSON
            assistantMessage.content += args.feedback;
            assistantMessage.tool_calls = args;
            assistantMessage.tool_calls.function_name = functionName;
          } catch (error) {
            console.error("Error parsing JSON:", error.message);

            // Fallback: Attempt to extract feedback and failure_reason manually
            const feedbackMatch = functionArguments.match(
              /"feedback":\s*"([^"]+)"/
            );
            const failureReasonMatch = functionArguments.match(
              /"failure_reason":\s*"([^"]+)"/
            );

            const feedback = feedbackMatch
              ? feedbackMatch[1]
              : "Unknown feedback";
            const failureReason = failureReasonMatch
              ? failureReasonMatch[1]
              : "Unknown failure reason";

            assistantMessage.content += feedback;
            assistantMessage.tool_calls = {
              failure_reason: failureReason,
              feedback: feedback,
              function_name: functionName,
            };
          }

          if (functionName === "handleChallengeSuccess") {
            const concluded = await blockchainService.concludeTournament(
              tournamentPDA,
              walletAddress
            );
            const successMessage = `🥳 Congratulations! ${args.feedback} Tournament concluded: ${concluded}`;
            assistantMessage.content = successMessage;
            await Chat.create(assistantMessage);
            await Challenge.updateOne(
              { _id: id },
              { $set: { status: "concluded" } }
            );

            res.write(successMessage);
          } else {
            await Chat.create(assistantMessage);
            res.write(assistantMessage.content);
          }
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
