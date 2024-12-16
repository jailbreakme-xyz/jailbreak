async function validatePrompt(prompt, challenge, transaction) {
  const characterLimit = challenge.characterLimit;
  const charactersPerWord = challenge.charactersPerWord;

  if (prompt.length > characterLimit) {
    prompt = prompt.slice(0, characterLimit);
  }

  if (charactersPerWord) {
    const words = prompt.split(" ");
    const trimmedWords = [];

    words.forEach((word) => {
      if (word.length > charactersPerWord) {
        let start = 0;
        while (start < word.length) {
          trimmedWords.push(word.slice(start, start + charactersPerWord));
          start += charactersPerWord;
        }
      } else {
        trimmedWords.push(word);
      }
    });

    prompt = trimmedWords.join(" ");
  }

  if (challenge.disable?.includes("special_characters")) {
    prompt = prompt.replace(/[^a-zA-Z0-9 ]/g, "");
  }

  // if (challenge.suffix) {
  //   const suffix = JSON.stringify(transaction[challenge.suffix]);
  //   prompt += `\n${suffix}`;
  // }
  return prompt;
}

export default validatePrompt;
