import { BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProfileProvider } from './context/ProfileContext';
import { VoiceAssistantProvider } from './context/VoiceAssistantContext';
import { FloatingVoiceBall } from './components/voice/FloatingVoiceBall';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ProfileProvider>
          <VoiceAssistantProvider>
            <Router>
              <ScrollToTop />
              <AppRoutes />
              {/* Floating Voice Assistant Ball at bottom-right for accessibility */}
              <FloatingVoiceBall />
            </Router>
          </VoiceAssistantProvider>
        </ProfileProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
