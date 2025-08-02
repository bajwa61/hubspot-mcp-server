#!/usr/bin/env node
import "dotenv/config";
import express from "express";
import cors from "cors";

import { APP_NAME, APP_VERSION } from "./utils/constants.js";
import { getPrompts, getPromptMessages } from "./prompts/index.js";
import { getTools, handleToolCall } from "./tools/index.js";
import "./prompts/promptsRegistry.js";
import "./tools/toolsRegistry.js";

// Express app setup
const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// MCP Protocol Implementation
class MCPServer {
  constructor() {
    this.tools = getTools();
    this.prompts = getPrompts();
  }

  // Handle MCP requests
  async handleRequest(request) {
    const { jsonrpc, method, params, id } = request;

    try {
      let result;

      switch (method) {
        case "initialize":
          result = await this.initialize(params);
          break;
        case "tools/list":
          result = await this.listTools();
          break;
        case "tools/call":
          result = await this.callTool(params);
          break;
        case "prompts/list":
          result = await this.listPrompts();
          break;
        case "prompts/get":
          result = await this.getPrompt(params);
          break;
        default:
          throw new Error(`Unknown method: ${method}`);
      }

      return {
        jsonrpc: "2.0",
        id: id,
        result: result,
      };
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: id,
        error: {
          code: -32603,
          message: error.message,
        },
      };
    }
  }

  async initialize(params) {
    return {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {},
        prompts: {},
        resources: {},
      },
      serverInfo: {
        name: APP_NAME,
        version: APP_VERSION,
      },
    };
  }

  async listTools() {
    return {
      tools: this.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema || {
          type: "object",
          properties: {},
          required: [],
        },
      })),
    };
  }

  async callTool(params) {
    const { name, arguments: args } = params;
    console.log(`MCP: Calling tool ${name} with args:`, args);

    const result = await handleToolCall(name, args || {});

    return {
      content: [
        {
          type: "text",
          text:
            typeof result === "string"
              ? result
              : JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async listPrompts() {
    return {
      prompts: this.prompts.map((prompt) => ({
        name: prompt.name,
        description: prompt.description,
        arguments: prompt.arguments || [],
      })),
    };
  }

  async getPrompt(params) {
    const { name, arguments: args } = params;
    console.log(`MCP: Getting prompt ${name} with args:`, args);

    const result = await getPromptMessages(name, args || {});

    return result;
  }
}

const mcpServer = new MCPServer();

app.post(
  "/mcp",
  asyncHandler(async (req, res) => {
    console.log("MCP Request:", req.body);

    const response = await mcpServer.handleRequest(req.body);
    console.log("MCP Response:", response);
    res.json(response);
  })
);

// MCP Capabilities endpoint
app.get("/mcp/capabilities", (req, res) => {
  res.json({
    protocolVersion: "2024-11-05",
    capabilities: {
      tools: {},
      prompts: {},
      resources: {},
    },
    serverInfo: {
      name: APP_NAME,
      version: APP_VERSION,
    },
  });
});

// Server info endpoint
app.get("/info", (req, res) => {
  res.json({
    name: APP_NAME,
    version: APP_VERSION,
    capabilities: {
      tools: {},
      prompts: {},
      resources: {},
    },
  });
});

// Handler for listing tools
app.get(
  "/tools",
  asyncHandler(async (req, res) => {
    const tools = getTools();
    res.json({
      tools: tools,
    });
  })
);

// Handler for calling tools
app.post(
  "/tools/:toolName/call",
  asyncHandler(async (req, res) => {
    const { toolName } = req.params;
    const args = req.body.arguments || req.body;

    try {
      const result = await handleToolCall(toolName, args);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: {
          code: "TOOL_EXECUTION_ERROR",
          message: error.message,
        },
      });
    }
  })
);

// Handler for listing prompts
app.get(
  "/prompts",
  asyncHandler(async (req, res) => {
    const prompts = getPrompts();
    res.json({
      prompts: prompts,
    });
  })
);

// Handler for getting specific prompt
app.post(
  "/prompts/:promptName",
  asyncHandler(async (req, res) => {
    const { promptName } = req.params;
    const args = req.body.arguments || req.body;

    try {
      const result = await getPromptMessages(promptName, args);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: {
          code: "PROMPT_EXECUTION_ERROR",
          message: error.message,
        },
      });
    }
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    mcp_ready: true,
    tools_count: mcpServer.tools.length,
    prompts_count: mcpServer.prompts.length,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
});

async function main() {
  try {
    console.error(`Starting ${APP_NAME} MCP Server...`);

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.error(`🚀 MCP Server running on port ${PORT}`);
      console.error(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
      console.error(`🔧 REST endpoints:`);
      console.error(`  GET  /info - Server information`);
      console.error(`  GET  /health - Health check`);
      console.error(`  GET  /tools - List available tools`);
      console.error(`  POST /tools/:toolName/call - Execute a tool`);
      console.error(`  GET  /prompts - List available prompts`);
      console.error(`  POST /prompts/:promptName - Get prompt messages`);
      console.error(`💡 For ngrok: ngrok http ${PORT}`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = () => {
      console.error("Shutting down server...");
      server.close(() => {
        console.error("Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

// Start the server
main();
