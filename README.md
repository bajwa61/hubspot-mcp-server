# HubSpot MCP Server

## Description

A lightweight REST-based MCP server for integrating HubSpot CRM into automation platforms and AI agents.  
Supports full access to contacts, companies, and deals via simple HTTP endpoints, ideal for use with n8n and other no-code tools.

## Overview

This MCP server provides access to HubSpot CRM through a RESTful HTTP interface. It enables assistants, automation tools, or applications to search, create, and update contacts, companies, and deals—without directly interacting with individual HubSpot API endpoints.

The server is compatible with both code-based and no-code platforms that can make standard REST calls.

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

This MCP server can be used in orchestration environments and automation tools like n8n, Zapier, or any platform that supports making RESTful HTTP requests.

### Environment Variables

Set credentials via environment variables:

| Variable               | Description                                          |
|------------------------|------------------------------------------------------|
| `HUBSPOT_ACCESS_TOKEN` | HubSpot private app token with CRM scopes            |
| `PORT`                 | (Optional) Server port (default: 3000)               |
| `NODE_ENV`             | (Optional) Environment mode: `development` or `production` |

Create a `.env` file in your project root:

```env
HUBSPOT_ACCESS_TOKEN=pat-na1-your-token-here
PORT=3000
NODE_ENV=development
```

## Starting the Server

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

The server will run on `http://localhost:3000` or the port you configure.

## Available REST API Endpoints

### Tools

| Method | Endpoint                         | Description                      |
|--------|----------------------------------|----------------------------------|
| GET    | `/health`                        | Health check                     |
| GET    | `/tools`                         | List all available tools         |
| POST   | `/tools/:toolName/call`          | Call a specific tool             |

## Example API Calls

### Health Check

```bash
curl http://localhost:3000/health
```

### List Available Tools

```bash
curl http://localhost:3000/tools
```

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

### Create Company

```bash
curl -X POST http://localhost:3000/tools/hubspot-batch-create-objects/call \
  -H "Content-Type: application/json" \
  -d '{
    "object_type": "companies",
    "inputs": [
      {
        "properties": {
          "name": "Example Corp",
          "industry": "Technology",
          "city": "San Francisco"
        }
      }
    ]
  }'
```

### Update Deal

```bash
curl -X POST http://localhost:3000/tools/hubspot-update-object/call \
  -H "Content-Type: application/json" \
  -d '{
    "object_type": "deals",
    "object_id": "123456789",
    "properties": {
      "amount": "75000",
      "dealstage": "contractsent"
    }
  }'
```

## Requirements

- Node.js 20.0.0 or higher  
- HubSpot account with a private app that includes CRM access scopes  
- Internet connection to reach HubSpot API

## License

MIT License – See `LICENSE` file for details.
