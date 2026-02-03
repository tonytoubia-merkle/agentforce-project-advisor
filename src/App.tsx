import { SceneProvider } from '@/contexts/SceneContext';
import { ConversationProvider } from '@/contexts/ConversationContext';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { AdvisorPage } from '@/components/AdvisorPage';
import { ActivityToastProvider } from '@/components/ActivityToast';

function App() {
  return (
    <CustomerProvider>
      <SceneProvider>
        <ActivityToastProvider>
          <ConversationProvider>
            <AdvisorPage />
          </ConversationProvider>
        </ActivityToastProvider>
      </SceneProvider>
    </CustomerProvider>
  );
}

export default App;
