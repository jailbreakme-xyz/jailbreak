import { OpenAI } from "openai";
import { EmbeddedChat, Chat } from "../../models/Models.js";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_SECRET_KEY,
});

const EMBEDDING_MODEL = "text-embedding-3-large";

/**
 * Creates embedding vector for a text input using OpenAI's API
 * @param {string} text - The text to generate an embedding for
 * @returns {Promise<number[]>} The embedding vector
 * @throws {Error} If the embedding creation fails
 */
async function createEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: 1536,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
}

/**
 * Finds prompts similar to the input embedding using vector search
 * @param {number[]} embedding - The embedding vector to find similar documents for
 * @param {number} [limit=3] - Maximum number of results to return
 * @param {Object} [filters={}] - Optional MongoDB filters to apply
 * @returns {Promise<Array<Object>>} Array of similar prompts with metadata
 */
async function findSimilarPrompts(embedding, limit = 3, filters = {}) {
  const pipeline = [];
  const vectorSearchStage = {
    $vectorSearch: {
      index: "vector_index",
      queryVector: embedding,
      path: "embedding",
      numCandidates: Math.max(100, limit * 3),
      limit: limit,
    },
  };

  pipeline.push(vectorSearchStage);

  if (filters) {
    pipeline.push({
      $match: filters,
    });
  }

  pipeline.push({
    $project: {
      _id: 1,
      content: 1,
      challenge: 1,
      address: 1,
      metadata: 1,
      score: { $meta: "vectorSearchScore" },
    },
  });

  const results = await EmbeddedChat.aggregate(pipeline);
  return results;
}

/**
 * Detects if a prompt resembles a jailbreak attempt using vector similarity
 * @param {Object} params - Detection parameters
 * @param {string} params.prompt - The user prompt to analyze
 * @returns {Promise<Object>} Object containing classification, score, and similar prompts
 * @throws {Error} If the prompt is invalid or processing fails
 */
async function detectJailbreak({ prompt }) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Invalid input: prompt must be a non-empty string");
  }

  const embedding = await createEmbedding(prompt);
  const similarResults = await findSimilarPrompts(embedding, 5);

  let score = 0;
  if (similarResults.length > 0) {
    const highestSimilarity = similarResults[0].score;
    if (highestSimilarity > 0.92) {
      score = 0.9 + (highestSimilarity - 0.92) * 1;
    } else if (highestSimilarity > 0.85) {
      score = 0.6 + (highestSimilarity - 0.85) * 3.75;
    } else if (highestSimilarity > 0.75) {
      score = 0.3 + (highestSimilarity - 0.75) * 3;
    } else if (highestSimilarity > 0.65) {
      score = 0.1 + (highestSimilarity - 0.65) * 2;
    } else {
      score = highestSimilarity * 0.15;
    }
  }

  score = Math.round(score * 1000) / 1000;
  let classification = "unknown";
  if (score < 0.3) {
    classification = "safe";
  } else if (score >= 0.45) {
    classification = "unsafe";
  }

  const similar_prompts = similarResults.map((result) => ({
    prompt: result.content,
    similarity_score: result.score,
  }));

  return {
    classification,
    score,
    similar_prompts,
  };
}

/**
 * Simulates responses to a prompt by finding semantically similar historical exchanges
 * @param {Object} params - Simulation parameters
 * @param {string} params.prompt - The user prompt to simulate responses for
 * @returns {Promise<Object>} Object containing array of simulated responses
 * @throws {Error} If the prompt is invalid or processing fails
 */
async function simulateResponse({ prompt }) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Invalid input: prompt must be a non-empty string");
  }

  let simulated_responses = [];
  try {
    const embedding = await createEmbedding(prompt);
    const similarResults = await findSimilarPrompts(embedding, 50, {
      "metadata.thread_id": { $exists: true },
    });

    const responses = await Chat.find({
      role: "assistant",
      thread_id: {
        $in: similarResults.map((result) => result.metadata.thread_id),
      },
    });

    simulated_responses = responses
      .map((result) => ({
        prompt: similarResults.find(
          (r) => r.metadata.thread_id === result.thread_id
        )?.content,
        response: result.content,
        similarity: similarResults.find(
          (r) => r.metadata.thread_id === result.thread_id
        )?.score,
      }))
      .sort((a, b) => b.similarity - a.similarity);
  } catch (error) {
    console.error("Error finding similar prompts:", error);
  }

  return {
    simulated_responses,
  };
}

/**
 * Performs semantic search for prompts similar to the query
 * @param {Object} params - Search parameters
 * @param {string} params.query - The search query
 * @param {number} [params.limit=5] - Maximum number of results to return
 * @returns {Promise<Object>} Object containing search results
 * @throws {Error} If the query is invalid or search fails
 */
async function vectorSearch({ query, limit = 5 }) {
  if (!query || typeof query !== "string") {
    throw new Error("Invalid input: query must be a non-empty string");
  }

  try {
    const embedding = await createEmbedding(query);
    const results = await findSimilarPrompts(embedding, limit);

    return {
      results: results.map((result) => ({
        content: result.content,
        challenge: result.challenge,
        score: result.score,
        win: result.metadata?.win,
        alcatraz: result.metadata?.alcatraz,
      })),
    };
  } catch (error) {
    console.error("Error in vector search:", error);
    throw error;
  }
}

export { detectJailbreak, simulateResponse, vectorSearch };
