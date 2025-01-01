import OpenAI from "openai";
import dotenv from "dotenv";
import { JailXOpenAIClient } from "jailx";

dotenv.config();

class JailXService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_AI_SECRET,
    });
    this.jailX = process.env.JAILX_ID;
    this.model = "gpt-4o-mini";
    this.client = new JailXOpenAIClient(process.env.OPEN_AI_SECRET);
  }

  async createJailXThread() {
    const thread = await this.client.createThread();
    return thread;
  }

  async useJailX(threadId, messages) {
    const thread = await this.client.addMessageToThread(threadId, messages);
    return thread;
  }

  async runJailX(threadId, tool_choice) {
    const run = await this.client.createRun(threadId, this.jailX, {
      tool_choice: tool_choice,
      parallel_tool_calls: false,
      stream: true,
    });

    for await (const chunk of run) {
      if (chunk.event === "thread.run.requires_action") {
        const required_action = chunk.data.required_action;
        const toolCalls = required_action.submit_tool_outputs.tool_calls[0];
        const functionName = toolCalls.function.name;
        const functionArguments = toolCalls.function.arguments;
        const jsonArgs = JSON.parse(functionArguments);

        return { functionName, jsonArgs };
      }
    }
  }
}

export default new JailXService();
