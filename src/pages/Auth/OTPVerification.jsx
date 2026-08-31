import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { verifyOTP, sendOTP } from '../../services/authService';
import OTPInput from '../../components/auth/OTPInput';

export default function OTPVerification() {
  const navigate = useNavigate();
  const { phoneData, setPhoneData } = useAuth();
  const { t, language } = useLanguage();
  const { speak } = useVoiceAssistant();

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState(phoneData?.message || '');

  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Redirect to phone entry if phoneData is missing
  useEffect(() => {
    if (!phoneData) {
      navigate('/auth/phone', { replace: true });
    }
  }, [phoneData, navigate]);

  // Resend Timer countdown
  useEffect(() => {
    let timer;
    if (resendTimer > 0 && !canResend) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [resendTimer, canResend]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(30);
    setError('');

    try {
      const res = await sendOTP(phoneData.number);
      setStatusMessage(res.message);
      if (res.demoOtp) {
        setPhoneData({ ...phoneData, demoOtp: res.demoOtp, smsSent: res.smsSent });
      }
    } catch (err) {
      console.error('Failed to resend OTP', err);
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6 || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      await verifyOTP(phoneData, otp);
      navigate('/auth/user-detection');
    } catch (err) {
      console.error(err);
      setError(t('auth_invalidOtp') || 'Invalid OTP code. Please try again or use the demo code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFillDemo = () => {
    const code = phoneData?.demoOtp || '123456';
    setOtp(code);
    speak(
      language === 'ta'
        ? `சரிபார்ப்புக் குறியீடு ${code} உள்ளிடப்பட்டது.`
        : `Verification code ${code} entered.`
    );
  };

  if (!phoneData) return null;

  const displayPhone = `${phoneData.countryCode || '+91'} ${phoneData.number.replace(
    /(\d{5})(\d{5})/,
    '$1 $2'
  )}`;

  return (
    <div className="bg-f4f6f1 text-on-surface font-sans min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Background Atmospheric Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-dots opacity-50"></div>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-secondary-container rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed"></div>

        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M -100 200 C 300 100, 600 400, 1000 600 C 1300 750, 1400 900, 1600 1000"
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
      <main className="flex-grow flex flex-col md:flex-row relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md gap-stack-lg min-h-[60vh] pb-32">
        {/* Left Panel */}
        <div className="hidden md:flex flex-1 flex-col justify-center items-start pl-8 pr-16 relative">
          <h1 className="font-display-lg text-display-lg text-primary mb-stack-md leading-tight">
            {t('auth_verifyTitle') || 'Secure access to your journey.'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg max-w-md">
            {t('auth_welcomeSubtitle') ||
              'LivPath AI uses advanced verification to keep your livelihood opportunities safe and private.'}
          </p>

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
        <div className="flex-1 flex items-center justify-center relative w-full pb-12">
          <div className="bg-surface-container-lowest/90 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-interactive p-8 md:p-12 border border-white/50 flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-container/10 text-primary-container rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl">dialpad</span>
            </div>

            <h2 className="font-headline-lg text-headline-lg text-primary text-center mb-2">
              {t('auth_verifyTitle') || 'Verify your number'}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mb-2">
              {t('auth_verifySubtitle') || 'We sent a verification code to'}
            </p>

            <div className="flex items-center justify-center gap-2 mb-stack-md">
              <span className="font-label-md text-label-md font-bold text-primary">{displayPhone}</span>
              <button
                onClick={() => navigate('/auth/phone')}
                className="font-label-sm text-label-sm text-secondary hover:underline flex items-center focus:outline-none"
              >
                <span className="material-symbols-outlined text-[1rem] mr-1">edit</span>{' '}
                {t('auth_changeNumber') || 'Change'}
              </button>
            </div>

            {/* Twilio / OTP Status Card */}
            {phoneData?.demoOtp && (
              <div className="w-full mb-4 bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs text-sky-950 font-medium">
                    {phoneData.smsSent
                      ? '📱 Twilio SMS Sent'
                      : `Code: `}
                    <strong className="text-primary-container ml-1">{phoneData.demoOtp}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillDemo}
                  className="px-2.5 py-1 text-[11px] font-bold bg-primary-container text-white rounded-lg hover:bg-primary shadow-xs transition-transform active:scale-95"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* OTP Input Boxes */}
            <form onSubmit={handleVerify} className="w-full flex flex-col items-center mt-2">
              <OTPInput length={6} value={otp} onChange={setOtp} onComplete={(val) => setOtp(val)} />

              {error && (
                <div className="w-full text-center text-error font-label-md text-label-md mb-4 bg-error-container/50 py-2 px-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              {/* Resend Countdown */}
              <div className="mb-stack-lg text-center mt-3">
                <span className="font-body-md text-body-md text-on-surface-variant">
                  {t('auth_didntReceive') || "Didn't receive code?"}{' '}
                </span>
                <span className="font-label-md text-label-md text-outline">
                  {canResend ? (
                    <button
                      onClick={handleResend}
                      className="text-secondary font-bold hover:underline focus:outline-none ml-1"
                    >
                      {t('auth_resendNow') || 'Resend code now'}
                    </button>
                  ) : (
                    `${t('auth_resendIn') || 'Resend in'} 00:${
                      resendTimer < 10 ? `0${resendTimer}` : resendTimer
                    }`
                  )}
                </span>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={handleVerify}
                disabled={otp.length !== 6 || isLoading}
                className={`w-full font-label-md text-label-md py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container shadow-md ${
                  otp.length !== 6 || isLoading
                    ? 'bg-surface-variant text-outline cursor-not-allowed'
                    : 'bg-primary-container hover:bg-primary text-on-primary shadow-soft hover:shadow-interactive active:scale-95 group'
                }`}
                type="submit"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    <span>{t('auth_verifying') || 'Verifying...'}</span>
                  </>
                ) : (
                  <>
                    <span>{t('auth_verifyBtn') || 'Verify & Continue'}</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Voice Prompt Hint */}
            <div className="mt-6 flex items-center gap-3 bg-teal-50/80 border border-teal-200/80 p-3 rounded-xl w-full justify-center">
              <span className="material-symbols-outlined text-secondary text-sm">mic</span>
              <span className="font-label-sm text-label-sm text-teal-900 font-semibold">
                {t('auth_voiceSmsHint') || 'Say "Read code from SMS" to autofill'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
