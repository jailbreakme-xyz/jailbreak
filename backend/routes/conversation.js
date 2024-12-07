import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { Challenge, Chat } from "../models/Models.js";
import OpenAIService from "../services/llm/openai.js";
import BlockchainService from "../services/blockchain/index.js";
import DatabaseService from "../services/db/index.js";

const router = express.Router();
const model = "gpt-4o-mini";

const solanaRpc = process.env.RPC_URL_DEVNET;

router.post("/submit/:id", async (req, res) => {
  try {
    const { prompt, signature, walletAddress } = req.body;
    const { id } = req.params;

    if (!prompt || !signature || !walletAddress) {
      return res.write("Missing required fields");
    }

    // Find the challenge
    const challenge = await DatabaseService.getChallengeById(id);
    if (!challenge) return res.write("Challenge not found");
    const challengeName = challenge.name;
    const contextLimit = challenge.contextLimit;
    const characterLimit = challenge.characterLimit;

    const programId = challenge.idl?.address;
    if (!programId) return res.write("Program ID not found");

    if (prompt.length > characterLimit)
      return res.write(
        `Prompt length can't exceed ${characterLimit} characters`
      );

    const systemPrompt = challenge.system_message;
    if (!systemPrompt) return res.write("Challenge is not active");

    const tournamentPDA = challenge.tournamentPDA;
    if (!tournamentPDA) return res.write("Tournament PDA not found");

    const blockchainService = new BlockchainService(solanaRpc, programId);
    const tournamentData = await blockchainService.getTournamentData(
      tournamentPDA
    );

    const entryFee = tournamentData.entryFee;
    const currentExpiry = challenge.expiry;
    const now = new Date();
    const oneHourInMillis = 3600000;

    const isValidTransaction = await blockchainService.verifyTransaction(
      signature,
      tournamentPDA,
      entryFee
    );

    if (!isValidTransaction) {
      return res.write("Transaction verification failed");
    }

    console.log("Transaction verified successfully for wallet:", walletAddress);

    // Set the entry fee regardless of expiry change
    await DatabaseService.updateChallenge(id, {
      entryFee: entryFee,
      ...(currentExpiry - now < oneHourInMillis && {
        expiry: new Date(now.getTime() + oneHourInMillis),
      }),
    });

    if (!entryFee) {
      return res.write("Entry fee not found in tournament data");
    }

    // Add user message to the Chat collection
    const userMessage = {
      challenge: challengeName,
      model: model,
      role: "user",
      content: prompt,
      address: walletAddress,
      txn: signature,
    };

    await DatabaseService.createChat(userMessage);

    // Fetch chat history for the challenge and address
    const chatHistory = await DatabaseService.getChatHistory(
      {
        challenge: challengeName,
        address: walletAddress,
      },
      { date: -1 },
      contextLimit
    );

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
      challenge: challengeName,
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
          try {
            const args = JSON.parse(functionArguments); // Attempt to parse JSON
            assistantMessage.tool_calls.function_name = functionName;
            assistantMessage.tool_calls = args;
            if (functionName === "handleChallengeFailure") {
              assistantMessage.content += args.feedback;
            } else {
              assistantMessage.content += args.evidence;
            }
          } catch (error) {
            console.error("Error parsing JSON:", error.message);
            if (functionName === "handleChallengeFailure") {
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
            } else {
              // Fallback: Attempt to extract feedback and failure_reason manually
              const evidenceMatch = functionArguments.match(
                /"evidence":\s*"([^"]+)"/
              );
              const successTypeMatch = functionArguments.match(
                /"success_type":\s*"([^"]+)"/
              );

              const evidence = evidenceMatch
                ? evidenceMatch[1]
                : "Unknown evidence";
              const successType = successTypeMatch
                ? successTypeMatch[1]
                : "Unknown success type";

              assistantMessage.content += evidence;
              assistantMessage.tool_calls = {
                success_type: successType,
                evidence: evidence,
                function_name: functionName,
              };
            }
          }

          if (functionName === "handleChallengeSuccess") {
            const concluded = await blockchainService.concludeTournament(
              tournamentPDA,
              walletAddress
            );
            const successMessage = `🥳 Congratulations! ${challenge.winning_message}\nEvidence: ${assistantMessage.content}\nTransaction: ${concluded}`;
            assistantMessage.content = successMessage;
            await DatabaseService.createChat(assistantMessage);
            await DatabaseService.updateChallenge(id, { status: "concluded" });

            res.write(successMessage);
          } else {
            await DatabaseService.createChat(assistantMessage);
            res.write(assistantMessage.content);
          }
        } else {
          // Save assistant message when stream ends
          await DatabaseService.createChat(assistantMessage);
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
