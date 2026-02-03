import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { CustomerProfile } from '@/types/customer';
import { resolveMerkuryIdentity } from '@/services/merkury/mockTag';
import { getPersonaById } from '@/mocks/customerPersonas';
import { getDataCloudService } from '@/services/datacloud';

const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

interface CustomerContextValue {
  customer: CustomerProfile | null;
  selectedPersonaId: string | null;
  isLoading: boolean;
  isResolving: boolean;
  error: Error | null;
  space: 'consumer' | 'b2b';
  setSpace: (space: 'consumer' | 'b2b') => void;
  selectPersona: (personaId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPersonaSession: (personaId: string) => void;
  _isRefreshRef: React.MutableRefObject<boolean>;
  _onSessionReset: (cb: (personaId: string) => void) => () => void;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [space, setSpaceState] = useState<'consumer' | 'b2b'>(
    (import.meta.env.VITE_DEFAULT_SPACE as 'consumer' | 'b2b') || 'consumer'
  );
  const isRefreshRef = useRef(false);
  const sessionResetCallbacksRef = useRef<Set<(personaId: string) => void>>(new Set());

  const onSessionReset = useCallback((cb: (personaId: string) => void) => {
    sessionResetCallbacksRef.current.add(cb);
    return () => { sessionResetCallbacksRef.current.delete(cb); };
  }, []);

  const setSpace = useCallback((newSpace: 'consumer' | 'b2b') => {
    setSpaceState(newSpace);
    // Clear current persona when switching spaces
    setSelectedPersonaId(null);
    setCustomer(null);
  }, []);

  const selectPersona = useCallback(async (personaId: string) => {
    setSelectedPersonaId(personaId);
    setIsResolving(true);
    setError(null);

    try {
      const resolution = await resolveMerkuryIdentity(personaId);
      console.log('[merkury] Identity resolved:', resolution.identityTier, 'confidence:', resolution.confidence);

      if (resolution.identityTier === 'appended') {
        const appendedProfile: CustomerProfile = {
          id: resolution.merkuryId || `appended-${personaId}`,
          name: 'Guest',
          email: '',
          space,
          projectProfile: {} as CustomerProfile['projectProfile'],
          orders: [],
          purchaseHistory: [],
          chatSummaries: [],
          meaningfulEvents: [],
          browseSessions: [],
          loyalty: null,
          savedPaymentMethods: [],
          shippingAddresses: [],
          recentActivity: [],
          merkuryIdentity: {
            merkuryId: resolution.merkuryId || '',
            identityTier: 'appended',
            confidence: resolution.confidence,
            resolvedAt: new Date().toISOString(),
          },
          appendedProfile: resolution.appendedData,
        };
        console.log('[customer] Appended-tier identity — using minimal profile with 3P signals only');
        setCustomer(appendedProfile);
      } else if (resolution.identityTier === 'anonymous' || !resolution.merkuryId) {
        console.log('[customer] Anonymous — no identity resolved, staying on default experience');
        setCustomer(null);
      } else if (useMockData) {
        const persona = getPersonaById(personaId);
        if (persona) {
          setCustomer(persona.profile);
        } else {
          setCustomer(null);
        }
      } else {
        setIsLoading(true);
        const merkuryIdentity = {
          merkuryId: resolution.merkuryId!,
          identityTier: resolution.identityTier,
          confidence: resolution.confidence,
          resolvedAt: new Date().toISOString(),
        };
        try {
          const dataCloudService = getDataCloudService();
          const profile = await dataCloudService.getCustomerProfile(resolution.merkuryId);
          profile.merkuryIdentity = merkuryIdentity;
          if (resolution.appendedData) profile.appendedProfile = resolution.appendedData;
          setCustomer(profile);
        } catch (dcError) {
          console.error('[datacloud] Profile fetch failed:', dcError);
          console.warn('[datacloud] Falling back to mock persona data');
          const persona = getPersonaById(personaId);
          if (persona) {
            const fallback = { ...persona.profile, merkuryIdentity };
            setCustomer(fallback);
          } else {
            throw new Error('Failed to load customer profile from Data Cloud');
          }
        } finally {
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Identity resolution failed:', err);
      setError(err instanceof Error ? err : new Error('Identity resolution failed'));
      setCustomer(null);
    } finally {
      setIsResolving(false);
    }
  }, [space]);

  const refreshProfile = useCallback(async () => {
    if (!selectedPersonaId) return;
    isRefreshRef.current = true;
    await selectPersona(selectedPersonaId);
    isRefreshRef.current = false;
  }, [selectedPersonaId, selectPersona]);

  const resetPersonaSession = useCallback((personaId: string) => {
    for (const cb of sessionResetCallbacksRef.current) cb(personaId);
    if (personaId === selectedPersonaId) {
      selectPersona(personaId);
    }
  }, [selectedPersonaId, selectPersona]);

  return (
    <CustomerContext.Provider value={{
      customer, selectedPersonaId, isLoading, isResolving, error,
      space, setSpace,
      selectPersona, refreshProfile, resetPersonaSession,
      _isRefreshRef: isRefreshRef, _onSessionReset: onSessionReset,
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = (): CustomerContextValue => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within CustomerProvider');
  }
  return context;
};
