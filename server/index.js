import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
}

// OAuth token proxy — keeps client_secret off the browser
app.post('/api/auth/token', async (req, res) => {
  const { clientId, clientSecret, instanceUrl } = req.body;

  if (!clientId || !clientSecret || !instanceUrl) {
    return res.status(400).json({ error: 'Missing clientId, clientSecret, or instanceUrl' });
  }

  try {
    const tokenUrl = `${instanceUrl}/services/oauth2/token`;
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[auth] Token request failed:', response.status, text);
      return res.status(response.status).json({ error: 'Token request failed', detail: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[auth] Token proxy error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback — serve index.html for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
});
