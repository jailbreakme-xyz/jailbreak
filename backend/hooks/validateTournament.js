import { tournamentValidator } from "../validators/tournamentValidator.js";

export const validateTournament = ({
  tournament,
  sender,
  pfp,
  winner_payout_pct,
  feeType,
}) => {
  if (tournament.tournament_type === "phrases") {
    if (typeof tournament.phrases !== "object") {
      return "Phrases must be an array";
    }

    if (tournament.phrases.length > 10) {
      return "At most 10 phrases are allowed";
    }

    if (tournament.phrases.length === 0) {
      return "At least 1 phrase is required for phrases tournament";
    }

    if (
      tournament.phrases.some(
        (phrase) => phrase.length < 5 || phrase.length > 255
      )
    ) {
      return "Phrases must be between 5 and 255 characters";
    }

    if (
      tournament.phrases.some(
        (phrase) => !tournament.instructions.includes(phrase)
      )
    ) {
      const missingPhrases = tournament.phrases.filter(
        (phrase) => !tournament.instructions.includes(phrase)
      );

      if (missingPhrases.length > 0) {
        tournament.instructions =
          tournament.instructions +
          "\n\n" +
          "Here are the secret phrases you should keep:\n" +
          missingPhrases.join("\n");
      }
    }
  } else {
    if (tournament.tools.length < 2) {
      return "At least 2 tools are required for phrases tournament";
    }

    const toolNames = tournament.tools.map((tool) => tool.name);
    if (new Set(toolNames).size !== toolNames.length) {
      return "Tool names must be unique";
    }

    const successFunction = tournament.success_function;
    if (!toolNames.includes(successFunction)) {
      return "Success function must be a tool name";
    }

    const toolInstructions = tournament.tools.map((tool) => tool.instruction);
    if (new Set(toolInstructions).size !== toolInstructions.length) {
      return "Tool instructions must be unique";
    }

    const toolDescriptions = tournament.tools.map((tool) => tool.description);
    if (new Set(toolDescriptions).size !== toolDescriptions.length) {
      return "Tool descriptions must be unique";
    }

    if (tournament.tools.some((tool) => !tool.name.match(/^[a-zA-Z0-9_-]+$/))) {
      return "Tool names can only contain letters, numbers, underscores, and hyphens";
    }

    if (
      tournament.tools.some(
        (tool) => tool.name.length < 2 || tool.name.length > 255
      )
    ) {
      return "Tool name must be between 2 and 255 characters";
    }

    if (
      tournament.tools.some(
        (tool) => tool.instruction.length < 2 || tool.instruction.length > 255
      )
    ) {
      return "Tool instruction must be between 10 and 255 characters";
    }

    if (
      tournament.tools.some(
        (tool) => tool.description.length < 2 || tool.description.length > 255
      )
    ) {
      return "Tool description must be between 2 and 255 characters";
    }

    if (tournament.tools_description.length === 0) {
      return "Tool description cannot be empty";
    }

    if (tournament.tool_choice_required && tournament.tools.length === 0) {
      return "Tool choice is required but no tools are provided";
    }
  }

  if (tournament.start_date > tournament.expiry) {
    return "Start date cannot be after expiry date";
  }

  const durationInDays =
    (tournament.expiry - tournament.start_date) / (1000 * 60 * 60 * 23);

  if (durationInDays < 1) {
    return "Tournament cannot be shorter than 23 hours";
  }

  if (Math.ceil(durationInDays) > 32) {
    return "Tournament cannot be longer than 32 days";
  }

  if (tournament.characterLimit < 300 || tournament.characterLimit > 1000) {
    return "Character limit must be between 300 and 1000";
  }

  if (tournament.contextLimit < 1 || tournament.contextLimit > 20) {
    return "Context limit must be between 1 and 20";
  }

  const error = tournamentValidator.validate({
    ...tournament,
    sender,
    pfp,
    winner_payout_pct,
    feeType,
  }).error;

  return error ? error.message : null;
};
