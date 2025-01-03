import { PostgresDatabaseAdapter } from "@ai16z/adapter-postgres";
import { DirectClientInterface } from "@ai16z/client-direct";
import {
  DbCacheAdapter,
  defaultCharacter,
  ICacheManager,
  IDatabaseCacheAdapter,
  stringToUuid,
  AgentRuntime,
  CacheManager,
  Character,
  ModelProviderName,
  elizaLogger,
  settings,
  IDatabaseAdapter,
  validateCharacterConfig,
  composeContext,
  ModelClass,
  generateMessageResponse
} from "@ai16z/eliza";
import { bootstrapPlugin } from "@ai16z/plugin-bootstrap";
import { solanaPlugin } from "@ai16z/plugin-solana";
import { nodePlugin } from "@ai16z/plugin-node";
import fs from "fs";
import readline from "readline";
import yargs from "yargs";
import path from "path";
import { fileURLToPath } from "url";
import { character } from "./character.ts";
import type { DirectClient } from "@ai16z/client-direct";
import express from "express";
import multer from "multer";
import { messageHandlerTemplate } from "@ai16z/client-direct";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const upload = multer({ storage: multer.memoryStorage() });

export const wait = (minTime: number = 1000, maxTime: number = 3000) => {
  const waitTime =
    Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
  return new Promise((resolve) => setTimeout(resolve, waitTime));
};

export function parseArguments(): {
  character?: string;
  characters?: string;
} {
  try {
    return yargs(process.argv.slice(2))
      .option("character", {
        type: "string",
        description: "Path to the character JSON file",
      })
      .option("characters", {
        type: "string",
        description: "Comma separated list of paths to character JSON files",
      })
      .parseSync();
  } catch (error) {
    console.error("Error parsing arguments:", error);
    return {};
  }
}

export async function loadCharacters(
  charactersArg?: string
): Promise<Character[]> {
  const loadedCharacters = [];

  // If specific characters are provided via args, load them
  if (charactersArg) {
    let characterPaths = charactersArg.split(",").map((filePath) => {
      if (path.basename(filePath) === filePath) {
        filePath = "../characters/" + filePath;
      }
      return path.resolve(process.cwd(), filePath.trim());
    });

    for (const path of characterPaths) {
      try {
        const character = JSON.parse(fs.readFileSync(path, "utf8"));
        validateCharacterConfig(character);
        loadedCharacters.push(character);
      } catch (e) {
        console.error(`Error loading character from ${path}: ${e}`);
        process.exit(1);
      }
    }
  } else {
    // Load all characters from the characters directory
    const charactersDir = path.join(__dirname, "../characters");
    try {
      const files = fs.readdirSync(charactersDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const characterPath = path.join(charactersDir, file);
          try {
            const character = JSON.parse(fs.readFileSync(characterPath, "utf8"));
            validateCharacterConfig(character);
            loadedCharacters.push(character);
          } catch (e) {
            console.error(`Error loading character from ${characterPath}: ${e}`);
            // Continue loading other characters even if one fails
          }
        }
      }
    } catch (e) {
      console.error(`Error reading characters directory: ${e}`);
    }
  }

  // Fall back to default character if no characters were loaded
  if (loadedCharacters.length === 0) {
    console.log("No characters found, using default character");
    loadedCharacters.push(defaultCharacter);
  }

  return loadedCharacters;
}

export function getTokenForProvider(
  provider: ModelProviderName,
  character: Character
) {
  switch (provider) {
    case ModelProviderName.OPENAI:
      return (
        character.settings?.secrets?.OPENAI_API_KEY || settings.OPENAI_API_KEY
      );
    case ModelProviderName.LLAMACLOUD:
      return (
        character.settings?.secrets?.LLAMACLOUD_API_KEY ||
        settings.LLAMACLOUD_API_KEY ||
        character.settings?.secrets?.TOGETHER_API_KEY ||
        settings.TOGETHER_API_KEY ||
        character.settings?.secrets?.XAI_API_KEY ||
        settings.XAI_API_KEY ||
        character.settings?.secrets?.OPENAI_API_KEY ||
        settings.OPENAI_API_KEY
      );
    case ModelProviderName.ANTHROPIC:
      return (
        character.settings?.secrets?.ANTHROPIC_API_KEY ||
        character.settings?.secrets?.CLAUDE_API_KEY ||
        settings.ANTHROPIC_API_KEY ||
        settings.CLAUDE_API_KEY
      );
    case ModelProviderName.REDPILL:
      return (
        character.settings?.secrets?.REDPILL_API_KEY || settings.REDPILL_API_KEY
      );
    case ModelProviderName.OPENROUTER:
      return (
        character.settings?.secrets?.OPENROUTER || settings.OPENROUTER_API_KEY
      );
    case ModelProviderName.GROK:
      return character.settings?.secrets?.GROK_API_KEY || settings.GROK_API_KEY;
    case ModelProviderName.HEURIST:
      return (
        character.settings?.secrets?.HEURIST_API_KEY || settings.HEURIST_API_KEY
      );
    case ModelProviderName.GROQ:
      return character.settings?.secrets?.GROQ_API_KEY || settings.GROQ_API_KEY;
  }
}

function initializeDatabase(dataDir: string) {
  const db = new PostgresDatabaseAdapter({
    connectionString: process.env.POSTGRES_URL,
  });
  return db;
}


export function createAgent(
  character: Character,
  db: IDatabaseAdapter,
  cache: ICacheManager,
  token: string
) {
  elizaLogger.success(
    elizaLogger.successesTitle,
    "Creating runtime for character",
    character.name
  );
  return new AgentRuntime({
    databaseAdapter: db,
    token,
    modelProvider: character.modelProvider,
    evaluators: [],
    character,
    plugins: [
      bootstrapPlugin,
      nodePlugin,
      character.settings.secrets?.WALLET_PUBLIC_KEY ? solanaPlugin : null,
    ].filter(Boolean),
    providers: [],
    actions: [],
    services: [],
    managers: [],
    cacheManager: cache,
  });
}


function intializeDbCache(character: Character, db: IDatabaseCacheAdapter) {
  const cache = new CacheManager(new DbCacheAdapter(db, character.id));
  return cache;
}

async function startAgent(character: Character, directClient: DirectClient) {
  try {
    character.id ??= stringToUuid(character.name);
    character.username ??= character.name;

    const token = getTokenForProvider(character.modelProvider, character);
    const dataDir = path.join(__dirname, "../data");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const db = initializeDatabase(dataDir);

    await db.init();

    const cache = intializeDbCache(character, db);
    const runtime = createAgent(character, db, cache, token);

    await runtime.initialize();

    // const clients = await initializeClients(character, runtime);

    directClient.registerAgent(runtime);

    return runtime;
    // return clients;
  } catch (error) {
    elizaLogger.error(
      `Error starting agent for character ${character.name}:`,
      error
    );
    console.error(error);
    throw error;
  }
}

function verifyApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  const apiKey = req.headers['jailbreak-api-key'];
  
  if (!settings.JAILBREAK_API_KEY) {
    elizaLogger.error("JAILBREAK_API_KEY not set in environment variables");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!apiKey || apiKey !== settings.JAILBREAK_API_KEY) {
    return res.status(401).json({ error: "Unauthorized", details: "Invalid API key" });
  }

  next();
}

function setupApiEndpoints(app: express.Application, directClient: DirectClient, agents: Map<string, AgentRuntime>) {
  elizaLogger.info("Setting up API endpoints...");
  
  // Apply API key verification to all routes
  app.use(verifyApiKey);
  
  // Override the existing message endpoint
  app._router.stack = app._router.stack.filter(layer => {
    return !(layer.route && layer.route.path === '/:agentId/message');
  });

  app.post("/:agentId/message", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const agentId = req.params.agentId;
      elizaLogger.debug(`Processing message request for agent: ${agentId}`);
      
      const roomId = stringToUuid(req.body.roomId ?? "default-room-" + agentId);
      const userId = stringToUuid(req.body.userId ?? "user");
      
      let runtime = agents.get(agentId);
      if (!runtime) {
        runtime = Array.from(agents.values()).find(
          (a) => a.character.name.toLowerCase() === agentId.toLowerCase()
        );
      }

      if (!runtime) {
        return res.status(404).json({ error: "Agent not found", details: `No agent found with ID ${agentId}` });
      }

      await runtime.ensureConnection(
        userId,
        roomId,
        req.body.userName,
        req.body.name,
        "direct"
      );

      const text = req.body.text;
      if (!text) {
        return res.status(400).json({ error: "Bad Request", details: "Message text is required" });
      }

      const messageId = stringToUuid(Date.now().toString());
      const content = {
        text,
        attachments: [],
        source: "direct",
        inReplyTo: undefined
      };

      const userMessage = {
        content,
        userId,
        roomId,
        agentId: runtime.agentId
      };

      const memory = {
        id: messageId,
        agentId: runtime.agentId,
        userId,
        roomId,
        content,
        createdAt: Date.now()
      };

      await runtime.messageManager.createMemory(memory);

      const state = await runtime.composeState(userMessage, {
        agentName: runtime.character.name
      });

      const context = composeContext({
        state,
        template: messageHandlerTemplate
      });

      const response = await generateMessageResponse({
        runtime,
        context,
        modelClass: ModelClass.SMALL
      });

      if (!response) {
        return res.status(500).json({ 
          error: "Internal Server Error", 
          details: "No response generated" 
        });
      }

      const responseMessage = {
        ...userMessage,
        userId: runtime.agentId,
        content: response
      };

      await runtime.messageManager.createMemory(responseMessage);

      let message = null;
      await runtime.evaluate(memory, state);
      
      await runtime.processActions(
        memory,
        [responseMessage],
        state,
        async (newMessages) => {
          message = newMessages;
          return [memory];
        }
      );

      if (message) {
        res.json([message, response]);
      } else {
        res.json([response]);
      }

    } catch (error) {
      next(error); // Pass to error handler
    }
  });
}

// Add error handling middleware
function setupErrorHandling(app: express.Application) {
  // Handle 404s
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(404).json({ error: "Not Found", details: "The requested resource does not exist" });
  });

  // Global error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    
    // Don't expose internal error details in production
    const response = {
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    };
    
    res.status(500).json(response);
  });
}

const startAgents = async () => {
  try {
    const directClient = await DirectClientInterface.start();
    const args = parseArguments();
    const app = (directClient as any).app;
    
    // Setup endpoints BEFORE any other middleware
    const agents = new Map<string, AgentRuntime>();
    setupApiEndpoints(app, directClient as DirectClient, agents);
    setupErrorHandling(app);

    // Then load and start agents
    let charactersArg = args.characters || args.character;
    let characters = [character];
    if (charactersArg) {
      characters = await loadCharacters(charactersArg);
    } else {
      characters = await loadCharacters();
    }

    for (const character of characters) {
      const runtime = await startAgent(character, directClient as DirectClient);
      agents.set(runtime.agentId, runtime);
    }

  } catch (error) {
    elizaLogger.error("Error starting agents:", error);
  }
};

startAgents().catch((error) => {
  elizaLogger.error("Unhandled error in startAgents:", error);
  process.exit(1); // Exit the process after logging
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("SIGINT", () => {
  rl.close();
  process.exit(0);
});




