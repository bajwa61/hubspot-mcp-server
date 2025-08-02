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

app.use(cors());
app.use(express.json());

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

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
    console.error(`Starting ${APP_NAME} REST API Server...`);

    const server = app.listen(PORT, () => {
      console.error(`Server running on port ${PORT}`);
      console.error(`Available endpoints:`);
      console.error(`  GET  /info - Server information`);
      console.error(`  GET  /health - Health check`);
      console.error(`  GET  /tools - List available tools`);
      console.error(`  POST /tools/:toolName/call - Execute a tool`);
      console.error(`  GET  /prompts - List available prompts`);
      console.error(`  POST /prompts/:promptName - Get prompt messages`);
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
