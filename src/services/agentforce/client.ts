import type { AgentResponse } from '@/types/agent';
import type { CustomerSessionContext } from '@/types/customer';
import { parseUIDirective } from './parseDirectives';

interface SessionSnapshot {
  sessionId: string | null;
  sequenceId: number;
}

class AgentforceClient {
  private baseUrl: string;
  private agentId: string;
  private clientId: string;
  private clientSecret: string;
  private instanceUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry = 0;
  private sessionId: string | null = null;
  private sequenceId = 0;

  constructor() {
    this.baseUrl = import.meta.env.VITE_AGENTFORCE_BASE_URL || '';
    this.agentId = import.meta.env.VITE_AGENTFORCE_AGENT_ID || '';
    this.clientId = import.meta.env.VITE_AGENTFORCE_CLIENT_ID || '';
    this.clientSecret = import.meta.env.VITE_AGENTFORCE_CLIENT_SECRET || '';
    this.instanceUrl = import.meta.env.VITE_AGENTFORCE_INSTANCE_URL || '';
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        instanceUrl: this.instanceUrl,
      }),
    });

    if (!response.ok) throw new Error(`Token fetch failed: ${response.status}`);
    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000 - 60000;
    return this.accessToken!;
  }

  async initSession(ctx?: CustomerSessionContext): Promise<void> {
    const token = await this.getAccessToken();

    const variables: Record<string, string> = {};
    if (ctx) {
      variables.customerId = ctx.customerId;
      variables.customerName = ctx.name;
      variables.customerEmail = ctx.email;
      variables.identityTier = ctx.identityTier;
      variables.space = ctx.space;
      if (ctx.skillLevel) variables.skillLevel = ctx.skillLevel;
      if (ctx.concerns?.length) variables.concerns = ctx.concerns.join(', ');
      if (ctx.loyaltyTier) variables.loyaltyTier = ctx.loyaltyTier;
      if (ctx.companyName) variables.companyName = ctx.companyName;
      if (ctx.tradeSpecialty?.length) variables.tradeSpecialty = ctx.tradeSpecialty.join(', ');
    }

    const response = await fetch(`${this.baseUrl}/agents/${this.agentId}/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        externalSessionKey: `session-${Date.now()}`,
        instanceConfig: { endpoint: this.instanceUrl },
        streamingCapabilities: { chunkTypes: ['Text'] },
        variables,
      }),
    });

    if (!response.ok) throw new Error(`Session init failed: ${response.status}`);
    const data = await response.json();
    this.sessionId = data.sessionId;
    this.sequenceId = 0;
  }

  async sendMessage(content: string): Promise<AgentResponse> {
    if (!this.sessionId) throw new Error('Session not initialized');
    const token = await this.getAccessToken();
    this.sequenceId++;

    const response = await fetch(
      `${this.baseUrl}/agents/${this.agentId}/sessions/${this.sessionId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: { role: 'EndUser', type: 'Text', text: content },
          sequenceId: this.sequenceId,
          variables: {},
        }),
      }
    );

    if (!response.ok) throw new Error(`Message send failed: ${response.status}`);
    const data = await response.json();

    const rawText = data.messages
      ?.filter((m: { type: string }) => m.type === 'Text')
      .map((m: { text: string }) => m.text)
      .join(' ') || '';

    const { directive, cleanText } = parseUIDirective(rawText);

    return {
      sessionId: this.sessionId,
      message: cleanText || rawText,
      uiDirective: directive || undefined,
      suggestedActions: data.suggestedActions || [],
    };
  }

  getSessionSnapshot(): SessionSnapshot {
    return { sessionId: this.sessionId, sequenceId: this.sequenceId };
  }

  restoreSession(sessionId: string, sequenceId: number): void {
    this.sessionId = sessionId;
    this.sequenceId = sequenceId;
  }
}

let clientInstance: AgentforceClient | null = null;

export function getAgentforceClient(): AgentforceClient {
  if (!clientInstance) {
    clientInstance = new AgentforceClient();
  }
  return clientInstance;
}
