import { motion, AnimatePresence } from 'framer-motion';
import { useScene } from '@/contexts/SceneContext';
import { useConversation } from '@/contexts/ConversationContext';
import { useCustomer } from '@/contexts/CustomerContext';
import { GenerativeBackground } from '@/components/GenerativeBackground';
import { ChatInterface } from '@/components/ChatInterface';
import { CheckoutOverlay } from '@/components/CheckoutOverlay';
import { WelcomeScreen } from '@/components/WelcomeScreen/WelcomeScreen';
import { WelcomeLoader } from '@/components/WelcomeScreen/WelcomeLoader';
import { IdentityPanel } from '@/components/IdentityPanel/IdentityPanel';

export const AdvisorPage: React.FC = () => {
  const { scene } = useScene();
  const { messages, sendMessage, isAgentTyping, isLoadingWelcome, suggestedActions } = useConversation();
  const { space } = useCustomer();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GenerativeBackground
        background={scene.background}
        setting={scene.setting}
      />

      <AnimatePresence mode="wait">
        {isLoadingWelcome ? (
          <WelcomeLoader key="loader" />
        ) : scene.welcomeActive ? (
          <WelcomeScreen key="welcome" />
        ) : (
          <motion.div
            key="main-chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 min-h-screen flex flex-col"
          >
            <ChatInterface
              position={scene.chatPosition}
              messages={messages}
              onSendMessage={sendMessage}
              isAgentTyping={isAgentTyping}
              isMinimized={scene.layout === 'checkout'}
              suggestedActions={suggestedActions}
              sceneLayout={scene.layout}
              space={space}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scene.checkoutActive && (
          <CheckoutOverlay />
        )}
      </AnimatePresence>

      <IdentityPanel />
    </div>
  );
};
