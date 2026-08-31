import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyCertificate } from '../../services/certificateService';
import { useLanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';
import OnboardingStepper from '../../components/layout/OnboardingStepper';

export default function CertificateVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  // 'edit' when reached from My Profile; otherwise part of onboarding.
  const isEditMode = location.state?.mode === 'edit';
  const fileInputRef = useRef(null);
  const { language } = useLanguageContext();
  const t = (key, fallback) => translations[language]?.[key] || translations['en']?.[key] || fallback || key;
  
  // 'idle' | 'scanning' | 'selected' | 'processing' | 'error'
  const [status, setStatus] = useState('idle');
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleScanClick = () => {
    setStatus('scanning');
    
    // Simulate camera scan taking 3 seconds
    setTimeout(() => {
      setFile({ name: 'Scanned_Certificate.jpg', size: 1024 * 1024 * 2.5, type: 'image/jpeg' });
      setStatus('selected');
    }, 3000);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('selected');
    }
  };

  const handleVerify = async () => {
    if (!file) return;
    
    setStatus('processing');
    setErrorMessage('');
    
    try {
      await verifyCertificate(file);
      navigate(isEditMode ? '/profile' : '/personal-details');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || t('cert_failed', 'Verification failed. Please try again.'));
    }
  };

  const resetState = () => {
    setStatus('idle');
    setFile(null);
    setErrorMessage('');
  };

  return (
    <div className="bg-[#F4F6F1] font-body-md text-on-surface min-h-screen relative overflow-x-hidden flex flex-col">
      {/* Background Decor Layer */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-40">
        <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-[#006a63] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-[#d3e3ff] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed"></div>
        <div className="absolute top-[40%] right-[30%] w-64 h-64 bg-[#0F766E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
      </div>
      
      {/* Journey Paths Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M -100 200 C 300 100, 500 600, 1400 400" fill="none" opacity="0.3" stroke="#006a63" strokeWidth="1.5" strokeDasharray="6,6"></path>
          <path d="M -100 600 C 400 800, 800 200, 1400 700" fill="none" opacity="0.2" stroke="#c9915d" strokeWidth="1" strokeDasharray="6,6"></path>
          
          <circle cx="300" cy="250" fill="#006a63" r="4" className="animate-pulse-ring"></circle>
          <circle cx="900" cy="450" fill="#c9915d" r="3" className="animate-pulse-ring" style={{ animationDelay: '0.5s' }}></circle>
          <circle cx="1100" cy="600" fill="#006a63" r="5" className="animate-pulse-ring" style={{ animationDelay: '1s' }}></circle>
        </svg>
      </div>

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-stack-md max-w-container-max mx-auto w-full">
        <div className="w-full max-w-4xl flex flex-col items-center">

          {/* Contextual Header & Progress */}
          <div className="text-center mb-stack-md w-full max-w-2xl">
            <div className="w-16 h-16 bg-primary-container rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <span className="material-symbols-outlined text-[2rem] text-on-primary">verified_user</span>
            </div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4 font-bold">
              {t('cert_title', 'Verify Your Community Certificate')}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
              {t('cert_subtitle', 'To continue, please verify your community certificate. You can scan your certificate using your camera or upload an existing file.')}
            </p>
            
            {/* Progress */}
            <OnboardingStepper currentStep={2} />
          </div>

          {/* Dynamic Area based on Status */}
          {status === 'idle' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-stack-lg relative z-20">
              {/* Scan Option */}
              <div 
                onClick={handleScanClick}
                className="bg-white/85 backdrop-blur-md border border-white/50 rounded-[2rem] p-8 flex flex-col items-center text-center cursor-pointer hover:-translate-y-1 transition-transform duration-300 shadow-soft hover:shadow-interactive group relative overflow-hidden"
              >
                <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center mb-6 relative border border-surface-variant group-hover:border-secondary transition-colors">
                  <span className="material-symbols-outlined text-[2.5rem] text-primary">photo_camera</span>
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary rounded-tl-sm"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary rounded-tr-sm"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-secondary rounded-bl-sm"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-secondary rounded-br-sm"></div>
                  
                  {/* CSS scan line animation placeholder */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_linear_infinite]"></div>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-2">
                  {t('cert_scanTitle', 'Scan with Camera')}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8 flex-grow">
                  {t('cert_scanSubtitle', 'Use your camera to scan your certificate directly.')}
                </p>
                <button className="bg-primary-container text-on-primary w-full py-3 px-6 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 group-hover:bg-primary transition-colors focus:outline-none">
                  {t('cert_openCamera', 'Open Camera')}
                  <span className="material-symbols-outlined text-[1.125rem]">arrow_forward</span>
                </button>
              </div>

              {/* Upload Option */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/85 backdrop-blur-md border border-white/50 rounded-[2rem] p-8 flex flex-col items-center text-center cursor-pointer hover:-translate-y-1 transition-transform duration-300 shadow-soft hover:shadow-interactive group relative z-20"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                />
                <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center mb-6 border border-surface-variant group-hover:border-secondary transition-colors">
                  <span className="material-symbols-outlined text-[2.5rem] text-primary">upload_file</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-2">
                  {t('cert_uploadTitle', 'Upload a File')}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-2">
                  {t('cert_uploadSubtitle', 'Choose a clear photo or document from your device.')}
                </p>
                <p className="font-label-sm text-label-sm text-outline mb-6 flex-grow">
                  {t('cert_uploadFormats', 'JPG, PNG or PDF format.')}
                </p>
                <button className="bg-surface-container-highest text-primary w-full py-3 px-6 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 group-hover:bg-surface-dim transition-colors border border-outline-variant group-hover:border-primary focus:outline-none">
                  {t('cert_chooseFile', 'Choose File')}
                  <span className="material-symbols-outlined text-[1.125rem]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {status === 'scanning' && (
            <div className="bg-white/90 backdrop-blur-lg border border-secondary rounded-[2rem] p-12 flex flex-col items-center text-center w-full max-w-md shadow-interactive relative z-20 mb-stack-lg">
              <div className="w-32 h-32 relative mb-6">
                <div className="absolute inset-0 border-4 border-dashed border-secondary/30 rounded-lg animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute inset-2 border-2 border-secondary/60 rounded-lg flex items-center justify-center bg-secondary/10">
                  <span className="material-symbols-outlined text-[3rem] text-secondary">document_scanner</span>
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-secondary shadow-[0_0_8px_#0F766E] animate-[scan_2s_linear_infinite]"></div>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary mb-2 animate-pulse">
                {t('cert_scanning', 'Scanning Document...')}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t('cert_holdSteady', 'Please hold your camera steady.')}
              </p>
            </div>
          )}

          {(status === 'selected' || status === 'processing' || status === 'error') && (
            <div className="bg-white/90 backdrop-blur-lg border border-white/50 rounded-[2rem] p-8 md:p-12 flex flex-col items-center w-full max-w-md shadow-interactive relative z-20 mb-stack-lg">
              <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center mb-6 text-on-secondary-container relative">
                {status === 'processing' ? (
                  <span className="material-symbols-outlined text-[2.5rem] animate-spin">sync</span>
                ) : status === 'error' ? (
                  <span className="material-symbols-outlined text-[2.5rem] text-error">error</span>
                ) : (
                  <span className="material-symbols-outlined text-[2.5rem]">check_circle</span>
                )}
              </div>
              
              <h3 className="font-headline-md text-headline-md text-primary mb-2">
                {status === 'processing' ? t('cert_processing', 'Verifying Certificate...') : status === 'error' ? t('cert_failed', 'Verification Failed') : t('cert_ready', 'Document Ready')}
              </h3>
              
              {status === 'error' ? (
                <p className="font-body-md text-body-md text-error mb-8 text-center">{errorMessage}</p>
              ) : (
                <p className="font-body-md text-body-md text-on-surface-variant mb-8 text-center">
                  <span className="font-semibold text-primary block truncate w-64" title={file?.name}>{file?.name}</span>
                  {status === 'processing' ? t('cert_processingSubtitle', 'Please wait while we securely process your document.') : t('cert_readySubtitle', 'Your document is ready for verification.')}
                </p>
              )}
              
              <div className="flex flex-col w-full gap-3">
                {status !== 'processing' && (
                  <button 
                    onClick={status === 'error' ? handleVerify : handleVerify}
                    className="bg-primary-container hover:bg-primary text-on-primary w-full py-4 px-6 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-colors shadow-soft hover:shadow-interactive focus:outline-none"
                  >
                    {status === 'error' ? t('cert_tryAgain', 'Try Again') : t('cert_verifyBtn', 'Verify Certificate')}
                    <span className="material-symbols-outlined text-[1.125rem]">arrow_forward</span>
                  </button>
                )}
                
                {status !== 'processing' && (
                  <button 
                    onClick={resetState}
                    className="bg-transparent border border-outline-variant text-on-surface-variant w-full py-3 px-6 rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors focus:outline-none"
                  >
                    {t('cert_differentDoc', 'Use a different document')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Voice Guidance & Security Badge */}
          <div className="flex flex-col items-center gap-6 w-full max-w-md relative z-20">
            <button className="flex items-center gap-3 bg-[#F0FDFA] px-6 py-3 rounded-full border border-secondary-container hover:bg-secondary-container/30 transition-colors w-full justify-center group relative overflow-hidden focus:outline-none">
              <div className="absolute inset-0 border-2 border-secondary rounded-full scale-110 opacity-0 group-hover:animate-[pulse-ring_2s_infinite]"></div>
              <span className="material-symbols-outlined text-secondary">volume_up</span>
              <span className="font-label-md text-label-md text-secondary">
                {t('cert_needHelp', 'Need help? Listen to the instructions.')}
              </span>
            </button>
            <div className="flex items-center gap-2 text-on-primary-fixed-variant opacity-80">
              <span className="material-symbols-outlined text-[1.125rem]">shield</span>
              <span className="font-label-sm text-label-sm">
                {t('cert_securityBadge', 'Your certificate is securely verified and protected.')}
              </span>
            </div>
          </div>
          
        </div>
      </main>

      {/* Global CSS for page specific animations not covered by tailwind config */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}