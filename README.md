# AI-Powered HubSpot Assistant (via MCP)

A lightweight, AI-ready backend that connects **HubSpot CRM** to assistants or applications via the **Model Context Protocol (MCP)**. Perfect for building intelligent agents or UI apps that need real-time CRM data access using natural language.

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [Architecture](#architecture)
* [Getting Started](#getting-started)
* [API Reference](#api-reference)
* [Example API Calls](#example-api-calls)
* [AI Agent Setup](#ai-agent-setup)
* [Example Use Cases](#example-use-cases)
* [Contributing](#contributing)
* [License](#license)

## Overview

This project exposes **HubSpot CRM tools** through a universal interface called **MCP (Model Context Protocol)**. You can connect AI assistants or your own frontend apps via simple HTTP requests.

Instead of calling individual HubSpot APIs, your assistant can auto-discover available tools like `search contacts`, `create deal`, or `update company`, and act on them intelligently.

## Key Features

* **CRM Search & Creation**: Search, create, or update contacts, companies, and deals
* **AI-Assistant Compatible**: Works with Claude, GPT, and other modern AI models
* **Auto Tool Discovery**: Assistant dynamically finds tools via MCP
* **HTTP-First Design**: Use in UI apps, chatbots, or headless AI agents
* **MCP + REST Support**: Call tools via either protocol
* **n8n Integration**: Easily plug into no-code workflows and AI agents

## Architecture

```
User → AI Agent or UI → MCP Client → MCP Server → HubSpot API
```

Your app or AI assistant sends requests to the MCP server, which handles authentication and tool execution with the HubSpot API.

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd hubspot-mcp-server
npm install
```

### 2. Configure `.env`

```env
# HubSpot Access Token
HUBSPOT_ACCESS_TOKEN=pat-na1-your-token-here

# Server Settings
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

> You must [create a HubSpot private app](https://developers.hubspot.com/docs/api/private-apps) and grant CRM scopes.

### 3. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```
## API Reference

### MCP Endpoints

| Method | Endpoint            | Description              |
| ------ | ------------------- | ------------------------ |
| POST   | `/mcp`              | Main MCP interface       |
| GET    | `/mcp/capabilities` | List all available tools |

### REST API Endpoints

| Method | Endpoint                | Description                    |
| ------ | ----------------------- | ------------------------------ |
| GET    | `/health`               | Server status                  |
| GET    | `/tools`                | List available tools           |
| POST   | `/tools/:toolName/call` | Call a specific tool           |
| GET    | `/prompts`              | Optional: list prompt names    |
| POST   | `/prompts/:promptName`  | Optional: fetch prompt content |

## Example API Calls

### Search Contacts

```bash
curl -X POST http://localhost:3000/tools/hubspot-search-objects/call \
  -H "Content-Type: application/json" \
  -d '{
    "object_type": "contacts",
    "limit": 10,
    "properties": ["firstname", "lastname", "email"]
  }'
```

### Create a Company

```bash
curl -X POST http://localhost:3000/tools/hubspot-batch-create-objects/call \
  -H "Content-Type: application/json" \
  -d '{
    "object_type": "companies",
    "inputs": [{
      "properties": {
        "name": "TechStart Inc",
        "industry": "Technology",
        "city": "San Francisco"
      }
    }]
  }'
```

## AI Agent Setup

You can connect this server to **any AI assistant** or **chat-based UI** that supports HTTP requests and dynamic tool calling.

### Option 1: Custom AI Agent

Configure your AI agent to:

* Send MCP requests to `/mcp`
* Auto-discover tools from `/mcp/capabilities`
* Parse and call tool definitions returned from the server

Example agent configuration:

```json
{
  "endpoint": "https://your-ngrok-url/mcp",
  "protocol": "mcp",
  "toolChoice": "auto",
  "memory": {
    "type": "bufferWindowMemory",
    "windowSize": 12
  }
}
```

### Option 2: n8n Workflow

1. Create a new workflow in n8n
2. Add an **AI Agent** node
3. Add an **AI Model** (Claude, GPT, etc.) and connect to the agent
4. Add **MCP Client Tool** node:

   * `Endpoint URL`: `https://your-ngrok-url/mcp`
   * `Server Transport`: `httpStreamable`
5. Connect all nodes

Your AI Agent in n8n can now auto-discover tools and query your HubSpot CRM via natural language.

## Example Use Cases

* **CRM Search**
  "Find all contacts from Acme Corp."

* **Deal Management**
  "Create a \$50,000 deal with XYZ Ltd in the 'Proposal Sent' stage."

* **Pipeline Analysis**
  "List deals that haven’t had a follow-up in over 30 days."

## Contributing

1. Fork the repo
2. Run `npm install`
3. Add your feature or fix
4. Run `npm run lint` and `npm test`
5. Submit a pull request

## License

This project is open-source under the [MIT License](LICENSE).
