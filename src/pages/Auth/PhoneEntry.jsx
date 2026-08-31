import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { sendOTP } from '../../services/authService';

export default function PhoneEntry() {
  const navigate = useNavigate();
  const { setPhoneData } = useAuth();
  const { t, language } = useLanguage();
  const { speak } = useVoiceAssistant();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isValid = phoneNumber.length === 10 && /^\d+$/.test(phoneNumber);

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      const result = await sendOTP(phoneNumber);
      setPhoneData({
        countryCode: '+91',
        number: phoneNumber,
        demoOtp: result.demoOtp || '123456',
        smsSent: result.smsSent,
        message: result.message,
      });
      navigate('/auth/otp');
    } catch (error) {
      console.error('Failed to send OTP:', error);
      setErrorMsg('Failed to send OTP. Please check the number and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleListenHelp = () => {
    const text =
      language === 'ta'
        ? 'வணக்கம்! உங்கள் 10 இலக்க மொபைல் எண்ணை உள்ளிடவும். தொடர்ந்து என்பதைக் கிளிக் செய்தால் உங்களுக்கு சரிபார்ப்புக் குறியீடு அனுப்பப்படும்.'
        : language === 'hi'
        ? 'नमस्ते! कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें। ओटीपी पाने के लिए जारी रखें पर क्लिक करें।'
        : 'Please enter your 10-digit mobile phone number. Tap continue to receive your verification code.';
    speak(text);
  };

  return (
    <div className="bg-f4f6f1 text-on-surface font-sans min-h-screen flex flex-col relative overflow-x-hidden font-body-md">
      {/* Background Atmospheric Orbs & Paths */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-dots opacity-50"></div>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-secondary-container rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed"></div>

        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-100 200 Q 300 100 600 400 T 1200 300"
            fill="none"
            stroke="#006a63"
            strokeDasharray="6,12"
            strokeWidth="2"
          ></path>
          <circle cx="200" cy="165" fill="#f59e0b" r="6"></circle>
          <circle cx="800" cy="400" fill="#006a63" r="8"></circle>
        </svg>
      </div>

      {/* Main Content: Two-Zone Layout */}
      <main className="flex-grow flex flex-col md:flex-row relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md gap-stack-lg min-h-[70vh] pb-24">
        {/* Left Panel: Brand & Voice Context */}
        <div className="hidden md:flex flex-1 flex-col justify-center items-start pl-8 pr-16 relative">
          <div className="absolute inset-y-0 left-0 w-full bg-surface-container-lowest/30 backdrop-blur-md rounded-3xl border border-white/20 -z-10"></div>
          <h1 className="font-display-lg text-display-lg text-primary mb-stack-md leading-tight">
            {t('auth_welcomeTitle') || 'Welcome to your journey.'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg max-w-md">
            {t('auth_welcomeSubtitle') ||
              'LivPath AI uses advanced verification to keep your livelihood opportunities safe and private.'}
          </p>

          {/* Feature Callouts */}
          <div className="flex flex-col gap-stack-sm w-full max-w-xs">
            <div className="flex items-center gap-4 bg-surface-container-lowest/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined">graphic_eq</span>
              </div>
              <span className="font-label-md text-label-md text-primary font-bold">
                {t('auth_voiceHelp') || 'Voice Guided Setup'}
              </span>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-lowest/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <span className="font-label-md text-label-md text-primary font-bold">
                {t('auth_securePrivate') || 'Secure & Private'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Auth Form */}
        <div className="flex-1 flex items-center justify-center relative w-full">
          <div className="bg-surface-container-lowest/90 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-interactive p-8 md:p-12 border border-white/50 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-6">
              <button
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div className="w-12 h-12 bg-primary-container/10 text-primary-container rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">account_circle</span>
              </div>
            </div>

            <h2 className="font-headline-lg text-headline-lg text-primary text-center mb-2 w-full">
              {t('auth_loginTitle') || 'Login or Sign Up'}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mb-stack-md">
              {t('auth_loginSubtitle') || 'Enter your mobile number to get started.'}
            </p>

            {errorMsg && (
              <div className="w-full text-center text-error font-label-md text-label-md mb-4 bg-error-container/50 py-2 px-3 rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleContinue} className="flex flex-col gap-stack-md w-full">
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface-variant sr-only" htmlFor="mobile-number">
                  {t('auth_mobileLabel') || 'Mobile Number'}
                </label>
                <div className="flex relative rounded-xl shadow-xs">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-outline-variant bg-surface-container-low text-on-surface-variant font-bold font-body-md">
                    +91
                  </span>
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline">phone_iphone</span>
                    </div>
                    <input
                      className="focus:ring-2 focus:ring-primary-container focus:border-primary-container block w-full pl-10 pr-4 border-outline-variant border rounded-none rounded-r-xl bg-surface h-14 font-body-lg text-body-lg text-on-surface outline-none tracking-wider"
                      id="mobile-number"
                      name="mobile-number"
                      placeholder="98765 43210"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              </div>

              {/* Primary Button */}
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className={`w-full h-14 font-label-md text-label-md rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container shadow-md ${
                  !isValid || isLoading
                    ? 'bg-surface-variant text-outline cursor-not-allowed'
                    : 'bg-primary-container hover:bg-primary text-on-primary hover:-translate-y-0.5 hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    <span>{t('auth_verifying') || 'Sending OTP...'}</span>
                  </>
                ) : (
                  <>
                    <span>{t('auth_getOtp') || 'Get Verification Code'}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>

              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 text-center">
                <p className="text-xs text-blue-900 font-medium">
                  🔒 {language === 'ta' ? 'Twilio SMS & நேரடி AI சரிபார்ப்பு' : 'Twilio SMS & Verified Real Authentication'}
                </p>
              </div>
            </form>

            <div className="flex flex-col gap-stack-sm w-full mt-6 pt-6 border-t border-surface-variant">
              <button
                type="button"
                onClick={handleListenHelp}
                className="flex items-center justify-center gap-2 text-primary-container font-label-md text-label-md hover:underline focus:outline-none rounded-lg p-2 w-full font-bold"
              >
                <span className="material-symbols-outlined text-lg">volume_up</span>
                <span>{language === 'ta' ? 'வழிமுறைகளைக் குரலில் கேட்க' : 'Need help? Listen to instructions'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
