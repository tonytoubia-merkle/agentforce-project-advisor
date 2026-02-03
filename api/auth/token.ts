import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
