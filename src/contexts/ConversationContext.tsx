import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AgentMessage, UIAction } from '@/types/agent';
import type { CustomerSessionContext, CustomerProfile, AgentCapturedProfile, CapturedProfileField, ChatSummary, TaggedContextField } from '@/types/customer';
import { PROVENANCE_USAGE } from '@/types/customer';
import { useScene } from './SceneContext';
import { useCustomer } from './CustomerContext';
import { generateMockResponse, setMockCustomerContext, getMockAgentSnapshot, restoreMockAgentSnapshot } from '@/services/mock/mockAgent';
import type { MockAgentSnapshot } from '@/services/mock/mockAgent';
import type { AgentResponse } from '@/types/agent';
import { getAgentforceClient } from '@/services/agentforce/client';
import { getDataCloudWriteService } from '@/services/datacloud';
import { useActivityToast } from '@/components/ActivityToast';
import type { SceneSnapshot } from './SceneContext';

const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

let sessionInitialized = false;

interface SessionSnapshot {
  messages: AgentMessage[];
  suggestedActions: string[];
  sceneSnapshot: SceneSnapshot;
  agentSessionId: string | null;
  agentSequenceId: number;
  mockSnapshot: MockAgentSnapshot | null;
  sessionInitialized: boolean;
}

function buildSessionContext(customer: CustomerProfile): CustomerSessionContext {
  const recentOrders = (customer.orders || [])
    .sort((a, b) => b.orderDate.localeCompare(a.orderDate))
    .slice(0, 3);
  const recentPurchases = recentOrders.flatMap((o) =>
    o.lineItems.map((li) => li.productId)
  );
  const recentActivity = recentOrders.map((o) => {
    const items = o.lineItems.map((li) => li.productName).join(', ');
    return `Order ${o.orderId} on ${o.orderDate} (${o.channel}): ${items}`;
  });

  const chatContext = (customer.chatSummaries || [])
    .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
    .slice(0, 3)
    .map((c) => `[${c.sessionDate}] ${c.summary}`);

  const meaningfulEvents = (customer.meaningfulEvents || [])
    .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))
    .map((e) => {
      const note = e.agentNote ? ` (Note: ${e.agentNote})` : '';
      return `[${e.capturedAt}] ${e.description}${note}`;
    });

  const browseInterests = (customer.browseSessions || [])
    .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
    .slice(0, 3)
    .map((b) => `Browsed ${b.categoriesBrowsed.join(', ')} on ${b.sessionDate} (${b.durationMinutes}min, ${b.device})`);

  if (!recentActivity.length && customer.recentActivity?.length) {
    recentActivity.push(...customer.recentActivity.map((a) => a.description));
  }
  if (!recentPurchases.length && customer.purchaseHistory?.length) {
    recentPurchases.push(...customer.purchaseHistory.map((p) => p.productId));
  }

  // Agent-captured profile fields
  const captured = customer.agentCapturedProfile;
  const capturedProfile: string[] = [];
  const missingProfileFields: string[] = [];

  if (captured) {
    const fieldLabel: Record<string, string> = {
      homeType: 'Home type', homeAge: 'Home age', projectTimeline: 'Project timeline',
      budget: 'Budget', skillLevel: 'Skill level', preferredStyle: 'Preferred style',
      priorityArea: 'Priority area', teamSize: 'Team size', projectVolume: 'Project volume',
      preferredSupplier: 'Preferred supplier', deliveryPreference: 'Delivery preference',
    };
    for (const [key, label] of Object.entries(fieldLabel)) {
      const field = captured[key as keyof AgentCapturedProfile] as CapturedProfileField | undefined;
      if (field) {
        const val = Array.isArray(field.value) ? field.value.join(', ') : field.value;
        capturedProfile.push(`${label}: ${val} (${field.confidence}, ${field.capturedFrom})`);
      } else {
        missingProfileFields.push(label);
      }
    }
  } else {
    missingProfileFields.push(
      'Home type', 'Home age', 'Project timeline', 'Budget',
      'Skill level', 'Priority area',
    );
  }

  // Provenance-tagged context
  const taggedContext: TaggedContextField[] = [];

  // 1P-EXPLICIT (declared): project profile
  if (customer.projectProfile?.skillLevel) {
    taggedContext.push({ value: `Skill level: ${customer.projectProfile.skillLevel}`, provenance: 'declared', usage: 'direct' });
  }
  if (customer.projectProfile?.concerns?.length) {
    taggedContext.push({ value: `Concerns: ${customer.projectProfile.concerns.join(', ')}`, provenance: 'declared', usage: 'direct' });
  }
  if (customer.projectProfile?.homeType) {
    taggedContext.push({ value: `Home type: ${customer.projectProfile.homeType}`, provenance: 'declared', usage: 'direct' });
  }
  if (customer.projectProfile?.companyName) {
    taggedContext.push({ value: `Company: ${customer.projectProfile.companyName}`, provenance: 'declared', usage: 'direct' });
  }
  if (customer.projectProfile?.tradeSpecialty?.length) {
    taggedContext.push({ value: `Trade: ${customer.projectProfile.tradeSpecialty.join(', ')}`, provenance: 'declared', usage: 'direct' });
  }

  // 1P-BEHAVIORAL (observed): purchase history
  for (const order of (customer.orders || []).slice(0, 5)) {
    const items = order.lineItems.map((li) => li.productName).join(', ');
    taggedContext.push({ value: `Purchased ${items} on ${order.orderDate} (${order.channel})`, provenance: 'observed', usage: 'direct' });
  }

  if (customer.loyalty) {
    const pts = customer.loyalty.pointsBalance ? ` (${customer.loyalty.pointsBalance} pts)` : '';
    taggedContext.push({ value: `Loyalty: ${customer.loyalty.tier}${pts}`, provenance: 'observed', usage: 'direct' });
  }

  for (const chat of (customer.chatSummaries || []).slice(0, 3)) {
    taggedContext.push({ value: `[${chat.sessionDate}] ${chat.summary}`, provenance: 'observed', usage: 'direct' });
  }

  for (const event of customer.meaningfulEvents || []) {
    const prov = event.eventType === 'preference' || event.eventType === 'milestone' ? 'stated' : 'agent_inferred';
    taggedContext.push({ value: event.description, provenance: prov, usage: PROVENANCE_USAGE[prov] });
  }

  for (const session of (customer.browseSessions || []).slice(0, 3)) {
    taggedContext.push({
      value: `Browsed ${session.categoriesBrowsed.join(', ')} on ${session.sessionDate} (${session.durationMinutes}min)`,
      provenance: 'inferred',
      usage: 'soft',
    });
  }

  if (customer.agentCapturedProfile) {
    for (const [key, field] of Object.entries(customer.agentCapturedProfile)) {
      if (!field) continue;
      const typedField = field as CapturedProfileField;
      const prov = typedField.confidence === 'stated' ? 'stated' : 'agent_inferred';
      const val = Array.isArray(typedField.value) ? typedField.value.join(', ') : typedField.value;
      taggedContext.push({ value: `${key}: ${val}`, provenance: prov, usage: PROVENANCE_USAGE[prov] });
    }
  }

  if (customer.appendedProfile?.interests) {
    for (const interest of customer.appendedProfile.interests) {
      taggedContext.push({ value: interest, provenance: 'appended', usage: 'influence_only' });
    }
  }
  if (customer.appendedProfile?.lifestyleSignals) {
    for (const signal of customer.appendedProfile.lifestyleSignals) {
      taggedContext.push({ value: signal, provenance: 'appended', usage: 'influence_only' });
    }
  }

  return {
    customerId: customer.id,
    name: customer.name,
    email: customer.email,
    identityTier: customer.merkuryIdentity?.identityTier || 'anonymous',
    space: customer.space,
    skillLevel: customer.projectProfile?.skillLevel,
    concerns: customer.projectProfile?.concerns,
    recentPurchases,
    recentActivity,
    appendedInterests: customer.appendedProfile?.interests || [],
    loyaltyTier: customer.loyalty?.tier || customer.loyaltyTier,
    loyaltyPoints: customer.loyalty?.pointsBalance,
    chatContext,
    meaningfulEvents,
    browseInterests,
    capturedProfile,
    missingProfileFields,
    taggedContext,
    companyName: customer.projectProfile?.companyName,
    tradeSpecialty: customer.projectProfile?.tradeSpecialty,
  };
}

function buildWelcomeMessage(ctx: CustomerSessionContext): string {
  const isAppended = ctx.identityTier === 'appended';
  const isAnonymous = ctx.identityTier === 'anonymous';
  const isB2B = ctx.space === 'b2b';

  const lines: string[] = ['[WELCOME]'];

  if (isAppended) {
    lines.push(`Customer: First-time visitor (identity resolved via Merkury, NOT a hand-raiser)`);
    lines.push(`Identity: appended`);
    lines.push(`Space: ${ctx.space}`);
    lines.push(`[INSTRUCTION] Do NOT greet by name. Use appended signals to subtly curate product selections. Frame recommendations as "popular picks" or "you might be interested in" — never "based on your profile".`);
  } else if (isAnonymous) {
    lines.push(`Customer: Anonymous visitor`);
    lines.push(`Identity: anonymous`);
    lines.push(`Space: ${ctx.space}`);
  } else {
    lines.push(`Customer: ${ctx.name} (greet by first name)`, `Email: ${ctx.email || 'unknown'}`, `Identity: ${ctx.identityTier}`, `Space: ${ctx.space}`);
    if (isB2B && ctx.companyName) {
      lines.push(`Company: ${ctx.companyName}`);
      if (ctx.tradeSpecialty?.length) lines.push(`Trade: ${ctx.tradeSpecialty.join(', ')}`);
    }
    if (ctx.email) lines.push(`[INSTRUCTION] The customer has been identified via their email address (${ctx.email}). Call Identify Customer By Email with this address to resolve their contactId before performing any profile updates or event captures.`);
  }

  lines.push('');
  lines.push('[DATA USAGE RULES]');
  lines.push('Context below is tagged by provenance. Follow these rules strictly:');
  lines.push('- [CONFIRMED]: Customer stated or declared this. Reference explicitly.');
  lines.push('- [OBSERVED/INFERRED]: Behavioral signals. Reference gently ("You were looking at...", "It seems like...").');
  lines.push('- [INFLUENCE ONLY]: Third-party data. NEVER mention directly. Use only to curate product selection.');

  if (ctx.taggedContext?.length) {
    const direct = ctx.taggedContext.filter(f => f.usage === 'direct');
    const soft = ctx.taggedContext.filter(f => f.usage === 'soft');
    const influence = ctx.taggedContext.filter(f => f.usage === 'influence_only');

    if (direct.length) {
      lines.push('');
      lines.push('[CONFIRMED — OK to reference directly]');
      direct.forEach(f => lines.push(`  ${f.value}`));
    }
    if (soft.length) {
      lines.push('');
      lines.push('[OBSERVED/INFERRED — reference gently]');
      soft.forEach(f => lines.push(`  ${f.value}`));
    }
    if (influence.length) {
      lines.push('');
      lines.push('[INFLUENCE ONLY — use to curate selections, NEVER reference directly]');
      influence.forEach(f => lines.push(`  ${f.value}`));
    }
  }

  if (ctx.missingProfileFields?.length) {
    lines.push('');
    lines.push(`[ENRICHMENT OPPORTUNITY] Try to naturally learn: ${ctx.missingProfileFields.join(', ')}`);
  }

  return lines.join('\n');
}

async function getAgentResponse(content: string): Promise<AgentResponse> {
  if (useMockData) {
    return generateMockResponse(content);
  }
  const client = getAgentforceClient();
  if (!sessionInitialized) {
    await client.initSession();
    sessionInitialized = true;
  }
  return client.sendMessage(content);
}

function writeConversationSummary(customerId: string, msgs: AgentMessage[]): void {
  if (msgs.length < 2) return;

  const topics = extractTopicsFromMessages(msgs);
  const summary: ChatSummary = {
    sessionDate: new Date().toISOString().split('T')[0],
    summary: `Customer discussed ${topics.join(', ')}. ${msgs.length} messages exchanged.`,
    sentiment: 'neutral',
    topicsDiscussed: topics,
  };

  const sessionId = uuidv4();
  getDataCloudWriteService().writeChatSummary(customerId, sessionId, summary).catch((err) => {
    console.error('[datacloud] Failed to write chat summary:', err);
  });
}

function extractTopicsFromMessages(msgs: AgentMessage[]): string[] {
  const allText = msgs.map((m) => m.content.toLowerCase()).join(' ');
  const topics: string[] = [];
  if (allText.includes('drill') || allText.includes('tool')) topics.push('power tools');
  if (allText.includes('paint') || allText.includes('primer')) topics.push('paint');
  if (allText.includes('deck') || allText.includes('outdoor')) topics.push('outdoor');
  if (allText.includes('kitchen') || allText.includes('faucet')) topics.push('kitchen');
  if (allText.includes('bathroom') || allText.includes('vanity')) topics.push('bathroom');
  if (allText.includes('floor') || allText.includes('tile')) topics.push('flooring');
  if (allText.includes('light') || allText.includes('lamp')) topics.push('lighting');
  if (allText.includes('lumber') || allText.includes('drywall')) topics.push('building materials');
  if (allText.includes('quote') || allText.includes('order')) topics.push('ordering');
  if (allText.includes('plumb') || allText.includes('pipe')) topics.push('plumbing');
  if (allText.includes('electric') || allText.includes('wire')) topics.push('electrical');
  return topics.length ? topics : ['general inquiry'];
}

interface ConversationContextValue {
  messages: AgentMessage[];
  isAgentTyping: boolean;
  isLoadingWelcome: boolean;
  suggestedActions: string[];
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
}

const ConversationContext = createContext<ConversationContextValue | null>(null);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isLoadingWelcome, setIsLoadingWelcome] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([
    'Help me plan a project',
    'Show me power tools',
    'What do you recommend?',
  ]);
  const { processUIDirective, resetScene, getSceneSnapshot, restoreSceneSnapshot } = useScene();
  const { customer, selectedPersonaId, space, isResolving, identifyByEmail, _isRefreshRef, _onSessionReset } = useCustomer();
  const { showCapture } = useActivityToast();
  const messagesRef = useRef<AgentMessage[]>([]);
  const suggestedActionsRef = useRef<string[]>([]);
  const prevCustomerIdRef = useRef<string | null>(null);
  const prevPersonaIdRef = useRef<string | null>(null);
  const sessionCacheRef = useRef<Map<string, SessionSnapshot>>(new Map());

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { suggestedActionsRef.current = suggestedActions; }, [suggestedActions]);

  useEffect(() => {
    return _onSessionReset((personaId: string) => {
      sessionCacheRef.current.delete(personaId);
      console.log('[session] Cleared cached session for', personaId);
    });
  }, [_onSessionReset]);

  useEffect(() => {
    const prevId = prevCustomerIdRef.current;
    prevCustomerIdRef.current = customer?.id || null;
    if (prevId && prevId !== customer?.id && messagesRef.current.length > 1) {
      writeConversationSummary(prevId, messagesRef.current);
    }
  }, [customer?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveCurrentSession = useCallback((personaId: string) => {
    const client = getAgentforceClient();
    const agentSnap = client.getSessionSnapshot();
    const snapshot: SessionSnapshot = {
      messages: [...messagesRef.current],
      suggestedActions: [...suggestedActionsRef.current],
      sceneSnapshot: getSceneSnapshot(),
      agentSessionId: agentSnap.sessionId,
      agentSequenceId: agentSnap.sequenceId,
      mockSnapshot: useMockData ? getMockAgentSnapshot() : null,
      sessionInitialized,
    };
    sessionCacheRef.current.set(personaId, snapshot);
    console.log('[session] Saved session for', personaId, `(${snapshot.messages.length} messages)`);
  }, [getSceneSnapshot]);

  useEffect(() => {
    if (_isRefreshRef.current) {
      console.log('[session] Profile refresh — keeping conversation intact');
      return;
    }

    // Wait for identity resolution to complete before acting on persona changes
    if (isResolving) {
      console.log('[session] Identity resolution in progress — waiting...');
      return;
    }

    const prevPersonaId = prevPersonaIdRef.current;
    prevPersonaIdRef.current = selectedPersonaId;

    if (prevPersonaId && prevPersonaId !== selectedPersonaId && messagesRef.current.length > 0) {
      saveCurrentSession(prevPersonaId);
    }

    if (!customer) {
      resetScene();
      setMessages([]);
      const defaultActions = space === 'b2b'
        ? ['Show me building materials', 'I need to restock', 'Get a bulk quote']
        : ['Help me plan a project', 'Show me power tools', 'What do you recommend?'];
      setSuggestedActions(defaultActions);
      setIsLoadingWelcome(false);
      return;
    }

    const cached = selectedPersonaId ? sessionCacheRef.current.get(selectedPersonaId) : null;

    if (cached) {
      console.log('[session] Restoring cached session for', selectedPersonaId, `(${cached.messages.length} messages)`);
      setMessages(cached.messages);
      setSuggestedActions(cached.suggestedActions);

      // Check if the cached scene has an incomplete background (was still loading when saved)
      const sceneBg = cached.sceneSnapshot.background;
      const isIncompleteBackground =
        (sceneBg.type === 'generative' && (!sceneBg.value || sceneBg.isLoading)) ||
        (sceneBg.type === 'image' && !sceneBg.value);

      if (isIncompleteBackground) {
        // Restore scene but use fallback background instead of incomplete one
        console.log('[session] Cached scene had incomplete background, using fallback');
        restoreSceneSnapshot({
          ...cached.sceneSnapshot,
          background: {
            type: 'gradient',
            value: 'linear-gradient(135deg, #1a2332 0%, #1e293b 50%, #0f172a 100%)',
          },
        });
      } else {
        restoreSceneSnapshot(cached.sceneSnapshot);
      }
      setIsLoadingWelcome(false);

      if (useMockData && cached.mockSnapshot) {
        restoreMockAgentSnapshot(cached.mockSnapshot);
      } else if (cached.agentSessionId) {
        getAgentforceClient().restoreSession(cached.agentSessionId, cached.agentSequenceId);
      }
      sessionInitialized = cached.sessionInitialized;
      return;
    }

    const sessionCtx = buildSessionContext(customer);

    if (useMockData) {
      setMockCustomerContext(sessionCtx);
    } else {
      sessionInitialized = false;
    }

    resetScene();
    setMessages([]);
    setSuggestedActions([]);
    setIsLoadingWelcome(true);

    const welcomeMsg = buildWelcomeMessage(sessionCtx);

    const timer = setTimeout(async () => {
      try {
        if (!useMockData) {
          try {
            await getAgentforceClient().initSession(sessionCtx);
            sessionInitialized = true;
          } catch (err) {
            console.error('Failed to init session:', err);
          }
        }
        const response = await getAgentResponse(welcomeMsg);

        if (response.uiDirective && response.uiDirective.action !== 'WELCOME_SCENE') {
          const d = response.uiDirective;
          response.uiDirective = {
            ...d,
            action: 'WELCOME_SCENE' as UIAction,
            payload: {
              ...d.payload,
              welcomeMessage: d.payload?.welcomeMessage || response.message?.split('.')[0] || 'Welcome!',
              welcomeSubtext: d.payload?.welcomeSubtext || response.message || '',
            },
          };
        }

        if (sessionCtx.identityTier !== 'known' && response.uiDirective?.payload) {
          response.uiDirective.payload.sceneContext = {
            ...response.uiDirective.payload.sceneContext,
            setting: 'neutral',
            generateBackground: false,
          };
        }

        const agentMessage: AgentMessage = {
          id: uuidv4(),
          role: 'agent',
          content: response.message,
          timestamp: new Date(),
          uiDirective: response.uiDirective,
        };
        setMessages([agentMessage]);
        let actions = response.suggestedActions || [];
        if (!actions.length && response.uiDirective?.action === 'WELCOME_SCENE') {
          if (sessionCtx.space === 'b2b') {
            if (sessionCtx.recentPurchases?.length) {
              actions = ['Reorder last materials', 'Check delivery status', 'Get a quote'];
            } else {
              actions = ['Show me building materials', 'I need bulk pricing', 'Set up an account'];
            }
          } else {
            if (sessionCtx.recentPurchases?.length) {
              actions = ['Continue my project', "What's new?", 'Show me something different'];
            } else if (sessionCtx.identityTier === 'appended') {
              actions = ['What do you recommend?', 'Show me popular items', 'Help me plan a project'];
            } else {
              actions = ['Help me plan a project', 'Show me power tools', 'What do you recommend?'];
            }
          }
        }
        setSuggestedActions(actions);

        if (response.uiDirective) {
          await processUIDirective(response.uiDirective);
        }
      } catch (error) {
        console.error('Welcome failed:', error);
      } finally {
        setIsLoadingWelcome(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customer, selectedPersonaId, isResolving]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: AgentMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setSuggestedActions([]);
    setIsAgentTyping(true);

    try {
      const response = await getAgentResponse(content);

      if (response.uiDirective?.action === 'WELCOME_SCENE') {
        response.uiDirective = {
          ...response.uiDirective,
          action: (response.uiDirective.payload?.products?.length ? 'SHOW_PRODUCTS' : 'CHANGE_SCENE') as UIAction,
        };
      }

      const agentMessage: AgentMessage = {
        id: uuidv4(),
        role: 'agent',
        content: response.message,
        timestamp: new Date(),
        uiDirective: response.uiDirective,
      };
      setMessages((prev) => [...prev, agentMessage]);
      setSuggestedActions(response.suggestedActions || []);
      setIsAgentTyping(false);

      // Handle identity capture directive
      if (response.uiDirective?.action === 'IDENTIFY_CUSTOMER' && response.uiDirective.payload?.customerEmail) {
        await identifyByEmail(response.uiDirective.payload.customerEmail);
      }

      // Fire activity toasts for background captures
      if (response.uiDirective?.payload?.captures) {
        for (const capture of response.uiDirective.payload.captures) {
          showCapture(capture);
        }
      }

      if (response.uiDirective && response.uiDirective.action !== 'IDENTIFY_CUSTOMER') {
        await processUIDirective(response.uiDirective);
      }
    } catch (error) {
      console.error('Failed to get agent response:', error);
      const errorMessage: AgentMessage = {
        id: uuidv4(),
        role: 'agent',
        content: "I'm sorry, I encountered an issue. Could you try again?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsAgentTyping(false);
    }
  }, [processUIDirective, identifyByEmail, showCapture]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setSuggestedActions(
      space === 'b2b'
        ? ['Show me building materials', 'I need to restock', 'Get a bulk quote']
        : ['Help me plan a project', 'Show me power tools', 'What do you recommend?']
    );
  }, [space]);

  return (
    <ConversationContext.Provider
      value={{ messages, isAgentTyping, isLoadingWelcome, suggestedActions, sendMessage, clearConversation }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = (): ConversationContextValue => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within ConversationProvider');
  }
  return context;
};
