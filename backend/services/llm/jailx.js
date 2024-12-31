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
      stream: false,
    });
    return run;
  }
}

export default new JailXService();
