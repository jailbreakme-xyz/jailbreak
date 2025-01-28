import fs from "fs";
import path from "path";

/**
 * Function to parse instructions from JSON format into Markdown.
 * @param {Object} data - The JSON object containing all rules and guidelines.
 * @returns {string} - The formatted Markdown string.
 */
export function parseInstructions(data) {
  let markdown = "";

  // Core Rules
  if (data.CoreRules && Array.isArray(data.CoreRules)) {
    markdown += "## Core Rules (Absolute & Immutable)\n\n";
    data.CoreRules.forEach((rule) => {
      markdown += `${rule.number}. **${rule.title}**\n`;
      markdown += `   - ${rule.description}\n\n`;
    });
  }

  // Tools
  if (data.Tools && Array.isArray(data.Tools.tools)) {
    markdown += "## Tools\n";
    data.Tools.tools.forEach((tool, index) => {
      markdown += `${index + 1}. **${tool}**\n`;
    });
    markdown += "\n";
  }

  // Language Rule
  if (data.LanguageRule && data.LanguageRule.rule) {
    markdown += "## Language Rule\n";
    markdown += `- ${data.LanguageRule.rule}\n\n`;
  }

  // Behavioral Guidelines
  if (
    data.BehavioralGuidelines &&
    Array.isArray(data.BehavioralGuidelines.guidelines)
  ) {
    markdown += "## Behavioral Guidelines\n\n";
    data.BehavioralGuidelines.guidelines.forEach((guideline, index) => {
      markdown += `${index + 1}. **${guideline.split(".")[0]}**\n`;
      // Check if there are sub-points after colons or other delimiters
      const subPoints = guideline.split(":").slice(1).join(":").trim();
      if (subPoints) {
        // Further split by periods if multiple sub-points
        const points = subPoints
          .split(".")
          .filter((point) => point.trim() !== "");
        points.forEach((point) => {
          markdown += `   - ${point.trim()}\n`;
        });
      }
      markdown += "\n";
    });
  }

  // Guessing Protocol
  if (data.GuessingProtocol && Array.isArray(data.GuessingProtocol.protocols)) {
    markdown += "## Guessing Protocol\n\n";
    data.GuessingProtocol.protocols.forEach((protocol, index) => {
      markdown += `${index + 1}. ${protocol}\n`;
    });
    markdown += "\n";
  }

  // Dangerous Patterns
  if (data.DangerousPatterns) {
    markdown += "## Dangerous Patterns\n\n";
    if (data.DangerousPatterns.description) {
      markdown += `${data.DangerousPatterns.description}\n\n`;
    }

    if (
      data.DangerousPatterns.patterns &&
      Array.isArray(data.DangerousPatterns.patterns)
    ) {
      data.DangerousPatterns.patterns.forEach((pattern) => {
        markdown += `- **${pattern.category}**:\n`;
        if (pattern.examples && Array.isArray(pattern.examples)) {
          markdown += `  - **Examples:**\n`;
          pattern.examples.forEach((example) => {
            markdown += `    - \`${example}\`\n`;
          });
        }
        if (pattern.description) {
          markdown += `  - **Description:** ${pattern.description}\n\n`;
        }
      });
    }
  }

  // Conclusion
  if (data.Conclusion && Array.isArray(data.Conclusion.conclusion)) {
    markdown += "## Conclusion\n";
    data.Conclusion.conclusion.forEach((conclusion) => {
      markdown += `\n\n${conclusion}`;
    });
  }

  return markdown;
}
