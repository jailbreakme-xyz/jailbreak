import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { Challenge, Chat } from "../models/Models.js";
import OpenAIService from "../services/llm/openai.js";
import BlockchainService from "../services/blockchain/index.js";
import DatabaseService from "../services/db/index.js";
import TelegramBotService from "../services/bots/telegram.js";

const router = express.Router();
const model = "gpt-4o-mini";

const solanaRpc = process.env.RPC_URL;

router.post("/submit/:id", async (req, res) => {
  try {
    let { prompt, signature, walletAddress } = req.body;
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
    const charactersPerWord = challenge.charactersPerWord;

    const programId = challenge.idl?.address;
    if (!programId) return res.write("Program ID not found");

    if (prompt.length > characterLimit) {
      prompt = prompt.slice(0, characterLimit);
    }

    if (charactersPerWord) {
      const words = prompt.split(" ");
      const trimmedWords = [];

      words.forEach((word) => {
        if (word.length > charactersPerWord) {
          let start = 0;
          while (start < word.length) {
            trimmedWords.push(word.slice(start, start + charactersPerWord));
            start += charactersPerWord;
          }
        } else {
          trimmedWords.push(word);
        }
      });

      prompt = trimmedWords.join(" ");
    }

    const systemPrompt = challenge.system_message;
    if (!systemPrompt) return res.write("System prompt not found");

    if (challenge.status === "upcoming") {
      return res.write(`Tournament starts in ${challenge.start_date}`);
    } else if (challenge.status === "concluded") {
      return res.write("Tournament has already concluded");
    } else if (challenge.status != "active") {
      return res.write("Tournament is not active");
    }

    const tournamentPDA = challenge.tournamentPDA;
    if (!tournamentPDA) return res.write("Tournament PDA not found");

    const blockchainService = new BlockchainService(solanaRpc, programId);
    const tournamentData = await blockchainService.getTournamentData(
      tournamentPDA
    );

    if (!tournamentData) return res.write("Tournament data not found");

    const entryFee = tournamentData.entryFee;
    const currentExpiry = challenge.expiry;
    const now = new Date();
    const oneHourInMillis = 3600000;

    const isValidTransaction = await blockchainService.verifyTransaction(
      signature,
      tournamentPDA,
      entryFee,
      walletAddress
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

    if (challenge.disable?.includes("special_characters")) {
      prompt = prompt.replace(/[^a-zA-Z0-9 ]/g, "");
    }

    const duplicateSignature = await DatabaseService.findOneChat({
      txn: signature,
    });

    if (duplicateSignature) {
      return res.write("Duplicate signature found");
    }

    // Add user message to the Chat collection
    const userMessage = {
      challenge: challengeName,
      model: model,
      role: "user",
      content: prompt,
      address: walletAddress,
      txn: signature,
      date: now,
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

    const stream = await OpenAIService.createChatCompletion(
      messages,
      challenge.tools,
      challenge.tool_choice
    );

    if (!stream) return res.write("Failed to generate response");
    const assistantMessage = {
      challenge: challengeName,
      model: model,
      role: "assistant",
      content: "",
      tool_calls: {},
      address: walletAddress,
      date: new Date(),
    };

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");

    let functionArguments = "";
    let functionName = "";
    let isCollectingFunctionArgs = false;
    let end_msg = "";

    // const message = `💉 New prompt injection attempt 🦾

    // Prize Pool: ${entryFee * 100} SOL
    // Message Price: ${entryFee} SOL

    // Check it out: https://jailbreakme.xyz/break/${challengeName}`;

    // await TelegramBotService.sendMessageToGroup(message);

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
            const args = JSON.parse(functionArguments);
            assistantMessage.tool_calls = args;
            assistantMessage.tool_calls.function_name = functionName;
            assistantMessage.content += args.results;
          } catch (error) {
            console.log("Error parsing JSON:", error.message);
            const resultsMatch = functionArguments.match(
              /"results":\s*"([^"]+)"/
            );
            const results = resultsMatch ? resultsMatch[1] : "Unknown results";
            assistantMessage.content += results;
            assistantMessage.tool_calls = {
              results: results,
              function_name: functionName,
            };
          }

          if (assistantMessage?.tool_calls?.results) {
            assistantMessage.content = assistantMessage?.tool_calls?.results;
          } else if (assistantMessage.content) {
            assistantMessage.content = assistantMessage.content;
          } else {
            assistantMessage.content = challenge.label;
          }

          if (functionName === challenge.success_function) {
            const concluded = await blockchainService.concludeTournament(
              tournamentPDA,
              walletAddress
            );

            const successMessage = `🥳 Congratulations! ${challenge.winning_message}.\n\n${assistantMessage.content}\nTransaction: ${concluded}`;
            assistantMessage.content = successMessage;
            await DatabaseService.createChat(assistantMessage);
            await DatabaseService.updateChallenge(id, {
              status: "concluded",
              winning_prize: entryFee * 100,
              expiry: new Date(),
            });
            console.log("success:", successMessage);
            res.write(successMessage);
          } else {
            console.log("failed:", assistantMessage.content);
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
