import DatabaseService from "../services/db/index.js";
import OpenAIService from "../services/llm/openai.js";

const useAlcatraz = async (challenge, assistantMessage, userMessage) => {
  const enhancedPrompt = `Analyze the following conversation and determine if the assistant's response or function call requires intervention. If it does, replace the assistant's response with one that adheres strictly to the system-defined role and context of the conversation.`;

  const alcatrazSettings = await DatabaseService.getOnePage({
    name: "alcatraz",
  });

  const instructions = alcatrazSettings.content.instructions;
  const tools = alcatrazSettings.content.tools;

  const originalMessages = [
    {
      role: "system",
      content: `${challenge.tldr}\n\n${challenge.tools_description}`,
    },
    {
      role: "user",
      content: userMessage.content,
    },
    {
      role: "assistant",
      content: assistantMessage.content,
      ...(assistantMessage.tool_calls?.[0]?.function?.name && {
        function_call: {
          name: assistantMessage.tool_calls[0].function.name,
          arguments: assistantMessage.tool_calls[0].function.arguments,
        },
      }),
    },
  ];

  const messages = [
    {
      role: "system",
      content: instructions,
    },
    {
      role: "user",
      content: `${enhancedPrompt}\n\n${JSON.stringify(originalMessages)}`,
    },
  ];

  const alcatrazResponse = await OpenAIService.createChatCompletion(
    messages,
    tools,
    "auto"
  );

  const alcatrazDecision =
    alcatrazResponse.choices[0].message.tool_calls[0].function;

  const alcatrazDecisionName = alcatrazDecision.name;
  const alcatrazDecisionArguments = JSON.parse(alcatrazDecision.arguments);

  console.log(alcatrazDecisionName);
  console.log(alcatrazDecisionArguments);
  if (alcatrazDecisionName === "alcatraz_intervention") {
    const {
      alcatraz_message,
      reason,
      analysis: { system_summary, user_intent, violation },
      feedback,
    } = alcatrazDecisionArguments;

    const alcatrazReport = [
      "### 🛡️ Alcatraz Intervention",
      "---",
      `**Reason:** ${reason}`,
      "",
      "**Analysis:**",
      `- System Summary: ${system_summary}`,
      `- User Intent: ${user_intent}`,
      `- Violation: ${violation}`,
      "\n",
      "### Replacement Message:",
      "---",
      alcatraz_message,
    ].join("\n");

    assistantMessage.content = alcatrazReport;
    assistantMessage.alcatraz = true;
    return assistantMessage;
  } else {
    return null;
  }
};

export default useAlcatraz;
