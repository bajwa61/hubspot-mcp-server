# HubSpot MCP Server

A Model Context Protocol (MCP) server for HubSpot CRM integration, compatible with Windows, macOS, and Linux.

## Overview

This MCP server provides access to HubSpot CRM using a unified JSON-RPC 2.0 interface. It enables assistants, automation tools, or applications to search, create, and update contacts, companies, and deals—without directly interacting with individual HubSpot API endpoints. It is ideal for integration into both code-based and no-code environments.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/bajwa61/hubspot-mcp-server
   cd hubspot-mcp-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

## Configuration

This MCP server can be used within orchestration environments or automation tools like **n8n**, **LangChain**, **Flowise**, or any JSON-RPC-compatible client.

### Environment Variables

Set credentials via environment variables:

| Variable               | Description                                          |
|------------------------|------------------------------------------------------|
| `HUBSPOT_ACCESS_TOKEN` | HubSpot private app token with CRM scopes            |
| `PORT`                 | (Optional) Server port (default: 3000)               |
| `NODE_ENV`             | (Optional) Environment mode: `development` or `production` |

You may also provide the access token directly in the `params` of the JSON-RPC request if preferred.

### JSON Configuration for Orchestration Tool

```json
{
  "mcpServers": {
    "hubspot": {
      "command": "node",
      "args": ["path/to/build/index.js"],
      "env": {
        "HUBSPOT_ACCESS_TOKEN": "your-hubspot-private-app-token",
        "PORT": "3000",
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Example: n8n Integration

To use the MCP server with **n8n**, create a workflow where a custom AI Agent interacts with HubSpot via your MCP server.

#### Steps

1. **Add an AI Agent node**  
   This node handles natural language input and determines tool calls.

2. **Add an MCP Agent node**  
   - Type: `MCP Tool Runner`  
   - Base URL: `https://your-server-url/mcp`  
   - Server Transport: `httpStreamable` or `httpBatchable`

3. **Connect AI Agent → MCP Agent**  
   Pipe output from the AI Agent into the MCP Tool Runner node.

4. **Optional: Add an Output node**  
   Display responses from HubSpot (e.g., contact search, deal creation).

#### Example Configuration (n8n)

**AI Agent Node**

```json
{
  "type": "agent",
  "name": "HubSpot Assistant",
  "model": "gpt-4",
  "toolChoice": "auto",
  "memory": {
    "type": "bufferWindowMemory",
    "windowSize": 12
  }
}
```

**MCP Agent Node**

```json
{
  "type": "mcp",
  "baseUrl": "https://your-server-url/mcp",
  "transport": "httpStreamable"
}
```

> Replace `https://your-server-url` with your actual deployment or tunneling address (e.g., from ngrok).

## API Methods

### Contacts

| Method             | Description                    |
|--------------------|--------------------------------|
| `search_contacts`  | Search contacts by filters     |
| `create_contact`   | Create a new contact           |
| `update_contact`   | Update an existing contact     |

### Companies

| Method               | Description                    |
|----------------------|--------------------------------|
| `search_companies`   | Search companies by filters    |
| `create_company`     | Create a new company           |
| `update_company`     | Update an existing company     |

### Deals

| Method           | Description                    |
|------------------|--------------------------------|
| `search_deals`   | Search deals by filters        |
| `create_deal`    | Create a new deal              |
| `update_deal`    | Update an existing deal        |

## Example JSON-RPC Calls

### Search Contacts

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "search_contacts",
  "params": {
    "limit": 10,
    "properties": ["firstname", "lastname", "email"]
  }
}
```

### Create Company

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "create_company",
  "params": {
    "properties": {
      "name": "TechStart Inc",
      "industry": "Technology",
      "city": "San Francisco"
    }
  }
}
```

### Create Deal

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "create_deal",
  "params": {
    "properties": {
      "amount": "50000",
      "dealname": "ABC Corp Proposal",
      "dealstage": "appointmentscheduled",
      "pipeline": "default"
    }
  }
}
```

## Requirements

- Node.js 20.0.0 or higher  
- HubSpot account with a private app that includes CRM access scopes  

## License

MIT License
