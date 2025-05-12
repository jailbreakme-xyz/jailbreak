import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import {
  detectJailbreak,
  simulateResponse,
  vectorSearch,
} from "../services/mcp/index.js";
import fs from "fs";

dotenv.config();

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse capabilities.json once at startup
let capabilities;
try {
  capabilities = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../mcp/capabilities.json"), "utf8")
  );
} catch (error) {
  console.error("Error loading capabilities.json:", error);
  process.exit(1);
}

// JSON-RPC 2.0 error codes
const ErrorCode = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
};

// Create JSON-RPC 2.0 response
function createResponse(id, result = null, error = null) {
  const response = {
    jsonrpc: "2.0",
    id,
  };

  if (error) {
    response.error = error;
  } else {
    response.result = result;
  }

  return response;
}

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// MCP endpoint to get capabilities
router.get("/capabilities.json", (req, res) => {
  res.json(capabilities);
});

// Main JSON-RPC 2.0 endpoint
router.post("/", async (req, res) => {
  // Validate JSON-RPC 2.0 request
  const { jsonrpc, id, method, params } = req.body;
  if (jsonrpc !== "2.0") {
    return res.json(
      createResponse(id, null, {
        code: ErrorCode.INVALID_REQUEST,
        message: "Invalid JSON-RPC 2.0 request",
      })
    );
  }

  // Process based on method
  try {
    let result;

    switch (method) {
      case "detectJailbreak":
        if (!params || !params.prompt) {
          throw {
            code: ErrorCode.INVALID_PARAMS,
            message: "Missing required parameter: prompt",
          };
        }
        result = await detectJailbreak(params);
        break;

      case "simulateResponse":
        if (!params || !params.prompt) {
          throw {
            code: ErrorCode.INVALID_PARAMS,
            message: "Missing required parameter: prompt",
          };
        }
        result = await simulateResponse(params);
        break;

      case "vectorSearch":
        if (!params || !params.query) {
          throw {
            code: ErrorCode.INVALID_PARAMS,
            message: "Missing required parameter: query",
          };
        }
        result = await vectorSearch(params);
        break;

      default:
        throw {
          code: ErrorCode.METHOD_NOT_FOUND,
          message: `Method not found: ${method}`,
        };
    }

    return res.json(createResponse(id, result));
  } catch (error) {
    // Handle different types of errors
    if (error.code) {
      // JSON-RPC error with code already set
      return res.json(createResponse(id, null, error));
    } else {
      // Convert regular errors to internal error format
      console.error("Internal error:", error);
      return res.json(
        createResponse(id, null, {
          code: ErrorCode.INTERNAL_ERROR,
          message: error.message || "Internal server error",
        })
      );
    }
  }
});

export { router as mcpRoute };
