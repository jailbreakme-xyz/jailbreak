import { DirectClient } from "@elizaos/client-direct";
import {
  AgentRuntime,
  elizaLogger,
  settings,
  stringToUuid,
  type Character,
} from "@elizaos/core";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import { createNodePlugin } from "@elizaos/plugin-node";
// import { solanaPlugin } from "@elizaos/plugin-solana";
import walletPlugin from "./plugins/solana/index.ts";
import fs from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDbCache } from "./cache/index.ts";
import { character } from "./character.ts";
import { initializeClients } from "./clients/index.ts";
import {
  getTokenForProvider,
  loadCharacters,
  parseArguments,
} from "./config/index.ts";
import { initializeDatabase } from "./database/index.ts";
import express from "express";
import multer from "multer";
import { messageHandlerTemplate } from "@elizaos/client-direct";
import { composeContext, generateMessageResponse, ModelClass, validateCharacterConfig } from "@elizaos/core";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const wait = (minTime: number = 1000, maxTime: number = 3000) => {
  const waitTime =
    Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
  return new Promise((resolve) => setTimeout(resolve, waitTime));
};

let nodePlugin: any | undefined;

export function createAgent(
  character: Character,
  db: any,
  cache: any,
  token: string
) {
  elizaLogger.success(
    elizaLogger.successesTitle,
    "Creating runtime for character",
    character.name,
  );

  nodePlugin ??= createNodePlugin();

  // const filteredActions = solanaPlugin.actions.filter(action => action.name === "SEND_TOKEN");
  // solanaPlugin.actions = filteredActions;
  // solanaPlugin.evaluators = [];
  // solanaPlugin.providers = [];

  return new AgentRuntime({
    databaseAdapter: db,
    token,
    modelProvider: character.modelProvider,
    evaluators: [],
    character,
    plugins: [
      bootstrapPlugin,
      nodePlugin,
      character.settings?.secrets?.SOLANA_PUBLIC_KEY ? walletPlugin : null,
    ].filter(Boolean),
    providers: [],
    actions: [],
    services: [],
    managers: [],
    cacheManager: cache,
  });
}

async function startAgent(character: Character, directClient: DirectClient) {
  try {
    character.id ??= stringToUuid(character.name);
    character.username ??= character.name;

    const token = getTokenForProvider(character.modelProvider, character);

    const db = await initializeDatabase();

    // await db.init();

    const cache = initializeDbCache(character, db);
    const runtime = createAgent(character, db, cache, token as string);
    // Initialize plugin
    // runtime.plugins.push(solanaPlugin);

    await runtime.initialize();

    runtime.clients = await initializeClients(character, runtime);

    directClient.registerAgent(runtime);

    // report to console
    elizaLogger.debug(`Started ${character.name} as ${runtime.agentId}`);

    return runtime;
  } catch (error) {
    elizaLogger.error(
      `Error starting agent for character ${character.name}:`,
      error,
    );
    console.error(error);
    throw error;
  }
}

const checkPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
};

const upload = multer({ storage: multer.memoryStorage() });

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

  app.get("/agents", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.json(Array.from(agents.values()).map((agent) => ({
      id: agent.agentId,
      name: agent.character.name,
      model: agent.modelProvider,
      actions: agent.actions,
    })));
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

  app.post("/upload-character", upload.single('character'), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Parse the uploaded JSON file
      let characterConfig;
      try {
        characterConfig = JSON.parse(req.file.buffer.toString());
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON file" });
      }

      // Validate the character configuration
      try {
        validateCharacterConfig(characterConfig);
      } catch (e) {
        return res.status(400).json({ 
          error: "Invalid character configuration", 
          details: e.message 
        });
      }

      // Generate filename from character name
      const filename = `${characterConfig.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      const charactersDir = path.join(__dirname, "../characters");
      const filePath = path.join(charactersDir, filename);

      // Ensure characters directory exists
      if (!fs.existsSync(charactersDir)) {
        fs.mkdirSync(charactersDir, { recursive: true });
      }

      // Save the character file
      fs.writeFileSync(filePath, JSON.stringify(characterConfig, null, 2));

      // Start the new character
      try {
        const runtime = await startAgent(characterConfig, directClient);
        agents.set(runtime.agentId, runtime);

        res.json({
          message: "Character uploaded and started successfully",
          character: {
            id: runtime.agentId,
            name: characterConfig.name,
            model: characterConfig.modelProvider
          }
        });
      } catch (e) {
        // If character fails to start, remove the file
        fs.unlinkSync(filePath);
        throw e;
      }

    } catch (error) {
      next(error);
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
    console.log(err)
    res.status(500).json(response);
  });
}


const startAgents = async () => {
  try {
    const directClient = new DirectClient();
    const args = parseArguments();
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Setup endpoints BEFORE any other middleware
    const agents = new Map<string, AgentRuntime>();
    setupApiEndpoints(app, directClient, agents);
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
      const runtime = await startAgent(character, directClient);
      agents.set(runtime.agentId, runtime);
    }

    // Start the Express server
    const port = process.env.PORT || 3030;
    app.listen(port, () => {
      elizaLogger.info(`Server is running on port ${port}`);
    });

  } catch (error) {
    console.log(error)
    elizaLogger.error("Error starting agents:", error);
  }
};

startAgents().catch((error) => {
  elizaLogger.error("Unhandled error in startAgents:", error);
  process.exit(1);
});
