import OpenAI from "openai";

class ExternalLLM {
  constructor(base_url, api_key) {
    this.openai = new OpenAI({
      baseURL: base_url,
      apiKey: api_key,
    });
  }

  async generateCompletion({
    messages,
    model,
    maxTokens = 2048,
    temperature = 1,
    stream = false,
    tools = null,
    toolChoice = "none",
  }) {
    try {
      const response = await this.openai.chat.completions.create({
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

      return response;
    } catch (error) {
      console.log("error:", error);
      console.error(
        "External LLM API Error:",
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

  async generateWithTools(prompt, tools, systemPrompt, toolChoice, model) {
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

    const formattedTools = tools.map((tool) => ({
      type: "function",
      function: tool,
    }));

    const response = await this.generateCompletion({
      messages,
      tools: formattedTools,
      toolChoice,
      model,
    });

    return response.choices[0]?.message;
  }
}

export default ExternalLLM;
