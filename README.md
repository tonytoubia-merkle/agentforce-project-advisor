# Agentforce Project Advisor

AI-powered home improvement shopping advisor built with React, TypeScript, and Salesforce Agentforce. Deployed on Vercel.

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

# Run the Vite dev server
npm run dev
```

The app runs at **http://localhost:5174**. API routes (`/api/*`) are served as Vercel serverless functions in production; in local dev they proxy to `localhost:3000` (use `vercel dev` to run them locally).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |

## Deployment (Vercel)

1. Connect the GitHub repo to Vercel
2. Set environment variables in the Vercel dashboard (see `.env.example`)
3. Vercel auto-detects Vite and uses the config in `vercel.json`

The `/api/auth/token` endpoint runs as a serverless function to proxy OAuth token requests, keeping client secrets off the browser.

## Environment Variables

Copy `.env.example` to `.env` and configure:

- **Agentforce**: `VITE_AGENTFORCE_*` — your Connected App credentials and agent ID
- **Image Generation**: `VITE_IMAGE_PROVIDER` — `none`, `imagen`, `firefly`, or `cms-only`
- **Feature Flags**: `VITE_USE_MOCK_DATA=true` enables demo mode with sample personas and products

## Architecture

```
api/             Vercel serverless functions (OAuth token proxy)
src/
  components/    React UI (Chat, Products, Checkout, Welcome, ActivityToast)
  contexts/      React Context providers (Conversation, Customer, Scene)
  services/      API clients (Agentforce, Data Cloud, Merkury)
  mocks/         Demo personas and product catalog
  types/         TypeScript interfaces
```

## Mock Mode

Set `VITE_USE_MOCK_DATA=true` (the default) to run the full UI with sample data and without any external API dependencies.
