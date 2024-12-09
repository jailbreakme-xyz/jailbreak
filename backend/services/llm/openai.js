import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_AI_SECRET,
    });
    this.model = "gpt-4o-mini";
    this.finish_reasons = [
      {
        name: "length",
        description: "The conversation was too long for the context window.",
      },
      {
        name: "tool_calls",
        description: "The assistant is waiting for a tool call response.",
      },
      {
        name: "content_filter",
        description:
          "The conversation was blocked by OpenAI's content filters.",
      },
      {
        name: "stop",
        description: "The conversation was ended by the user.",
      },
      {
        name: "other",
        description: "The conversation was ended for an unspecified reason.",
      },
    ];
  }

  async createChatCompletion(messages, tools, tool_choice) {
    try {
      const stream = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.9,
        max_tokens: 1024,
        top_p: 0.7,
        frequency_penalty: 1.0,
        presence_penalty: 1.0,
        stream: true,
        tools: tools,
        tool_choice: tool_choice,
        parallel_tool_calls: false,
      });

      return stream;
    } catch (error) {
      console.error("OpenAI Service Error:", error);
      return false;
    }
  }
}

export default new OpenAIService();
