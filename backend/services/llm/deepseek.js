import axios from "axios";

class DeepSeekService {
  constructor() {
    this.api = axios.create({
      baseURL: "https://api.deepseek.com",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      maxBodyLength: Infinity,
    });
  }

  async generateCompletion({
    messages,
    model = "deepseek-chat",
    maxTokens = 2048,
    temperature = 1,
    stream = false,
    tools = null,
    toolChoice = "none",
  }) {
    try {
      const response = await this.api.post("/chat/completions", {
        messages,
        model,
        frequency_penalty: 0,
        max_tokens: maxTokens,
        presence_penalty: 0,
        response_format: {
          type: "text",
        },
        stop: null,
        stream,
        stream_options: null,
        temperature,
        top_p: 1,
        tools,
        tool_choice: toolChoice,
        logprobs: false,
        top_logprobs: null,
      });

      return response.data;
    } catch (error) {
      console.error(
        "DeepSeek API Error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.error?.message || "Failed to generate completion"
      );
    }
  }

  async chatCompletion(prompt, systemPrompt) {
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await this.generateCompletion({ messages });
    return response.choices[0]?.message?.content;
  }

  async streamCompletion(prompt, systemPrompt) {
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await this.generateCompletion({
      messages,
      stream: true,
    });

    return response;
  }

  async generateWithTools(prompt, tools, systemPrompt) {
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await this.generateCompletion({
      messages,
      tools,
      toolChoice: "auto",
    });

    return response.choices[0]?.message;
  }
}

// Export singleton instance
export const deepseekService = new DeepSeekService();
