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

// router.post("/init/:id", async (req, res) => {
//   // res.setHeader("Content-Type", "text/event-stream");
//   // res.setHeader("Access-Control-Allow-Origin", "*");

//   const id = req.params.id;
//   const clientIp = req.headers["cf-connecting-ip"] || req.ip;

//   try {
//     // Fetch challenge details
//     const challenge = await Challenge.findOne({ _id: id });
//     if (!challenge) {
//       return res.status(404).send("Challenge not found");
//     }

//     const firstPrompt = challenge.system_message;
//     // const address = req.walletAddress;

//     // Fetch last 100 chat messages for this challenge
//     const chatHistory = await Chat.find({
//       challenge: id,
//       role: { $ne: "system" },
//     })
//       .sort({ date: 1 })
//       .limit(100);

//     if (chatHistory.length > 0) {
//       // Return existing chat history to client
//       return res.status(200).json({ chatHistory });
//     }

//     const found = await Chat.findOne({
//       challenge: challenge,
//     });

//     if (!found) {
//       const newChat = await Chat.create({
//         challenge: id,
//         model: model,
//         role: "system",
//         content: firstPrompt,
//         ip: clientIp,
//       });

//       console.log("New chat document created:", newChat);
//     }

//     // Send the challenge label back to the client
//     res
//       .status(200)
//       .json({ chatHistory: [{ role: "assistant", content: challenge.label }] });
//   } catch (error) {
//     console.error("Error initializing chat:", error);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

router.post("/submit/:id", verifyJWT, async (req, res) => {
  const clientIp = req.headers["cf-connecting-ip"] || req.ip;
  const id = req.params.id;
  const address = req.walletAddress;
  const chatLimit = 20;

  try {
    // Find the challenge
    const challenge = await Challenge.findOne({ _id: id });
    if (!challenge) return res.status(404).send("Challenge not found");

    if (!address) return res.status(401).send("Invalid Address");

    // Check prompt validity
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).send("Must include prompt");
    if (prompt.length > 1000)
      return res.status(400).send("Prompt length can't exceed 200 characters");

    // Add user message to the Chat collection
    const userMessage = {
      challenge: id,
      model: model,
      role: "user",
      content: prompt,
      address: address,
      ip: clientIp,
    };

    // const found = await Chat.findOne({
    //   challenge: challenge,
    //   address: address,
    //   avatar: { $exists: true },
    // });

    // if (!found || !found.avatar) {
    //   const avatar = generateAvatar();
    //   userMessage.avatar = avatar;
    // }

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
      ip: clientIp,
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

// OLD ROUTES:
// router.post("/init/:id", verifyJWT, async (req, res) => {
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   const id = req.params.id;
//   const clientIp = req.headers["cf-connecting-ip"] || req.ip;
//   try {
//     const challenge = await Challenge.findOne({ _id: id });
//     // const firstPrompt = `${challenge.description}\n${suffix}`;
//     const firstPrompt = challenge.system_message;
//     const address = req.walletAddress;

//     let time = new Date().toISOString();
//     time = time.split("T")[0] + " " + time.split("T")[1].split(".")[0];

//     const conversation = [{ role: "system", content: firstPrompt }];

//     const stream = await openai.chat.completions.create({
//       model: model,
//       messages: conversation,
//       temperature: 1,
//       max_tokens: 2048,
//       top_p: 1,
//       frequency_penalty: 0,
//       presence_penalty: 0,
//       // stream: true,
//     });

//     // const assistant = {
//     //   role: "assistant",
//     //   content: "",
//     // };

//     // conversation.push(assistant);

//     await Conversation.findOneAndUpdate(
//       { address: address, challenge: id },
//       {
//         $set: { data: conversation },
//         model: model,
//         user: clientIp,
//       },
//       {
//         new: true,
//         upsert: true,
//         setDefaultsOnInsert: true,
//       }
//     );

//     res.write(`${challenge.label}`);
//     res.end();
//     res.flushHeaders();
//     // for await (const chunk of stream) {
//     //   if (chunk && !chunk.choices[0].finish_reason) {
//     //     // assistant.content += chunk.choices[0].delta.content;
//     //     // res.write(chunk.choices[0].delta.content);
//     //   } else {
//     //     conversation.push(assistant);
//     //     await Conversation.findOneAndUpdate(
//     //       { address: address, challenge: id },
//     //       {
//     //         $set: { data: conversation },
//     //         model: model,
//     //         user: clientIp,
//     //       },
//     //       {
//     //         new: true,
//     //         upsert: true,
//     //         setDefaultsOnInsert: true,
//     //       }
//     //     );
//     //     res.write(`${challenge.label}`);
//     //     return res.end();
//     //   }

//     //   res.flushHeaders();
//     // }
//     // res.end();
//   } catch (error) {
//     console.log(error);
//     return res.status(400).send(error);
//   }
// });

// router.post("/submit/:id", verifyJWT, async (req, res) => {
//   const clientIp = req.headers["cf-connecting-ip"] || req.ip;
//   const id = req.params.id;
//   const address = req.walletAddress;
//   try {
//     const conversation = await Conversation.findOne({
//       address: address,
//       challenge: id,
//     });
//     const challenge = await Challenge.findOne({ _id: id });
//     const data = conversation?.data ? conversation?.data : [];

//     const prompt = req.body.prompt;
//     if (!prompt) return res.send("Must include prompt");

//     if (prompt.length > 200)
//       return res.send("Prompt length can't be more than 200 characters.");

//     const newMessage = { role: "user", content: prompt };
//     await Conversation.updateOne(
//       { address: address, challenge: id },
//       {
//         $push: { data: newMessage },
//       }
//     );

//     data.push(newMessage);

//     const stream = await openai.chat.completions.create({
//       model: model,
//       messages: data,
//       temperature: 1,
//       max_tokens: 2048,
//       top_p: 1,
//       frequency_penalty: 0,
//       presence_penalty: 0,
//       stream: true,
//     });

//     const assistant = {
//       role: "assistant",
//       content: "",
//     };

//     for await (const chunk of stream) {
//       if (chunk && !chunk.choices[0].finish_reason) {
//         assistant.content += chunk.choices[0].delta.content;
//         res.write(chunk.choices[0].delta.content);
//       } else {
//         await Conversation.updateOne(
//           { address: address, challenge: id },
//           {
//             $push: { data: assistant },
//           }
//         );
//         return;
//       }

//       res.flushHeaders();
//     }
//     res.end();
//   } catch (error) {
//     console.log(error);
//     return res.status(400).send(error?.error?.message);
//   }
//   // res.send(`Your IP address is ${clientIp}`);
// });

export { router as conversationRoute };
