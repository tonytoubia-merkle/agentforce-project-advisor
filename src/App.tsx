import { SceneProvider } from '@/contexts/SceneContext';
import { ConversationProvider } from '@/contexts/ConversationContext';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { ConciergePage } from '@/components/ConciergePage';

function App() {
  return (
    <CustomerProvider>
      <SceneProvider>
        <ConversationProvider>
          <ConciergePage />
        </ConversationProvider>
      </SceneProvider>
    </CustomerProvider>
  );
}

export default App;
