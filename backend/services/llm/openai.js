import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_AI_SECRET,
    });
    this.jailX = process.env.JAILX_ID;
    this.agent_generator = process.env.AGENT_GENERATOR_ID;
    this.agent_generator_thread = process.env.AGENT_GENERATOR_THREAD_ID;
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

  async createThread() {
    const thread = await this.openai.beta.threads.create();
    return thread;
  }

  async getThread(threadId) {
    const thread = await this.openai.beta.threads.retrieve(threadId);
    return thread;
  }

  async getThreadMessages(threadId, limit) {
    const threadMessages = await this.openai.beta.threads.messages.list(
      threadId,
      {
        limit: limit,
      }
    );
    return threadMessages.data;
  }

  async addMessageToThread(threadId, content) {
    const message = await this.openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: content,
    });
    return message;
  }

  async createRun(
    threadId,
    assistantId,
    tool_choice,
    stream = true,
    max_completion_tokens = 1024
  ) {
    const run = await this.openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      tool_choice: tool_choice,
      parallel_tool_calls: false,
      stream: stream,
      max_completion_tokens: max_completion_tokens,
    });
    return run;
  }

  async submitRun(threadId, runId, tool_outputs) {
    const run = await this.openai.beta.threads.runs.submitToolOutputs(
      threadId,
      runId,
      {
        tool_outputs,
      }
    );
    return run;
  }

  async createThreadAndRun(assistantId, messages, tool_choice) {
    const run = await this.openai.beta.threads.createAndRun({
      assistant_id: assistantId,
      tool_choice: tool_choice,
      stream: false,
      parallel_tool_calls: false,
      thread: {
        messages: messages,
      },
    });

    return run;
  }

  async getRun(threadId, runId) {
    const run = await this.openai.beta.threads.runs.retrieve(threadId, runId);
    return run;
  }

  async generateImage(prompt, name, instructions, opening_message) {
    // Build content array with non-empty fields
    // const details = [];
    // if (name) details.push(`${name}`);
    // if (instructions) details.push(`${instructions}`);
    // if (opening_message) details.push(`${opening_message}`);

    // const fullPrompt = `A portrait profile picture of ${details.join(", ")}`;

    try {
      // Try DALL-E 3 first
      try {
        const response = await this.openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        });
        return response.data[0].url;
      } catch (dalle3Error) {
        console.log(
          "DALL-E 3 generation failed, falling back to DALL-E 2:",
          dalle3Error.message
        );

        // Fallback to DALL-E 2
        const response = await this.openai.images.generate({
          model: "dall-e-2",
          prompt: prompt,
          n: 1,
          size: "512x512",
          quality: "standard",
        });
        return response.data[0].url;
      }
    } catch (error) {
      console.error("Image generation error:", error);
      throw error;
    }
  }

  async generateAgent(name, instructions, opening_message) {
    // Build content array with non-empty fields
    const details = [];
    if (name) details.push(`Name: ${name}`);
    if (instructions) details.push(`Instructions: ${instructions}`);
    if (opening_message) details.push(`Opening Message: ${opening_message}`);

    const content =
      "Generate a new, unique, and engaging tournament scenario. Requirements:\n" +
      "- Create a distinctive theme that hasn't been used before\n" +
      "- Include a compelling secret element that must remain hidden throughout the tournament\n" +
      "- Follow the example format from your instructions\n" +
      "- Ensure the narrative is cohesive and engaging\n\n" +
      (details.length > 0 ? "Using these details:\n" + details.join("\n") : "");

    const assistant = this.agent_generator;

    // const thread = this.agent_generator_thread;

    const newThread = await this.createThread();
    const thread = newThread.id;

    await this.addMessageToThread(thread, content);

    const newAgentRun = await this.createRun(
      thread,
      assistant,
      "none",
      false,
      1024 * 3
    );

    // const prompt = [
    //   {
    //     role: "user",
    //     content: content,
    //   },
    // ];

    // Wait for run to complete
    let runStatus = await this.getRun(thread, newAgentRun.id);
    while (runStatus.status !== "completed") {
      if (runStatus.status === "failed" || runStatus.status === "cancelled") {
        throw new Error(`Run failed with status: ${runStatus.status}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await this.getRun(thread, newAgentRun.id);
    }

    // Get the latest message and parse JSON content
    const messages = await this.getThreadMessages(thread, 1);

    try {
      const agentData = JSON.parse(messages[0].content[0].text.value);

      // Generate image based on the intro
      if (agentData.label) {
        const imageUrl = await this.generateImage(
          agentData.dall_e_prompt,
          agentData.name,
          agentData.instructions,
          agentData.opening_message
        );
        return { ...agentData, imageUrl };
      }

      return agentData;
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      return messages[0].content[0].text.value;
    }
  }

  async createAgent(
    instructions,
    name,
    tools = [],
    model = "gpt-4o-mini",
    top_p = 0.7,
    temperature = 0.9
  ) {
    try {
      const newAgent = await this.openai.beta.assistants.create({
        instructions: instructions,
        name: name,
        tools: tools,
        model: model,
        top_p: top_p,
        temperature: temperature,
      });
      return newAgent;
    } catch (error) {
      console.error("Error creating assistant:", error);
      throw error;
    }
  }

  async retrieveAgent(assistantId) {
    const agent = await this.openai.beta.assistants.retrieve(assistantId);
    return agent;
  }
}

export default new OpenAIService();
