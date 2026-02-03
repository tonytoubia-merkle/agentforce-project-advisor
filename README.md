# Agentforce Project Advisor

AI-powered home improvement shopping advisor built with React, TypeScript, and Salesforce Agentforce.

## Prerequisites

- Node.js 20+
- npm 9+
- Salesforce org with Agentforce enabled and a Connected App configured for OAuth client credentials

## Quick Start

```bash
# Install dependencies
npm install

# Copy env template and fill in your credentials
cp .env.example .env

# Run in development (starts Express server + Vite dev server)
npm run dev
```

The app runs at **http://localhost:5174** with the API server on port 3001.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both server and client in dev mode |
| `npm run dev:server` | Start only the Express API server |
| `npm run dev:client` | Start only the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |

## Environment Variables

Copy `.env.example` to `.env` and configure:

- **Agentforce**: `VITE_AGENTFORCE_*` — your Connected App credentials and agent ID
- **Image Generation**: `VITE_IMAGE_PROVIDER` — `none`, `imagen`, `firefly`, or `cms-only`
- **Feature Flags**: `VITE_USE_MOCK_DATA=true` enables demo mode with sample personas and products

## Architecture

```
server/          Express API (OAuth token proxy)
src/
  components/    React UI (Chat, Products, Checkout, Welcome)
  contexts/      React Context providers (Conversation, Customer, Scene)
  services/      API clients (Agentforce, Data Cloud, Merkury)
  mocks/         Demo personas and product catalog
  types/         TypeScript interfaces
```

## Docker

```bash
docker compose up --build
```

## Mock Mode

Set `VITE_USE_MOCK_DATA=true` (the default) to run the full UI with sample data and without any external API dependencies.
