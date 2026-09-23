import { useState, useRef, useEffect } from 'react';
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
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const { language } = useLanguageContext();
  const t = (key, fallback) => translations[language]?.[key] || translations['en']?.[key] || fallback || key;
  
  // 'idle' | 'camera' | 'selected' | 'processing' | 'error'
  const [status, setStatus] = useState('idle');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [cameraError, setCameraError] = useState('');

  // Stop camera tracks cleanly
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Cleanup camera stream when component unmounts or status changes away from camera
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Start real camera access
  const startCamera = async (mode = facingMode) => {
    stopCameraStream();
    setCameraError('');
    setStatus('camera');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported on this browser or device.');
      }

      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      // Fallback try with simple video: true
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
        }
      } catch (fallbackErr) {
        console.error('All camera attempts failed:', fallbackErr);
        setCameraError(
          language === 'ta'
            ? 'கேமரா அணுகல் கிடைக்கவில்லை. உங்கள் சாதன அனுமதியைச் சரிபார்க்கவும் அல்லது ஆவணத்தை பதிவேற்றவும்.'
            : 'Camera access denied or unavailable. Please grant permission or choose file upload.'
        );
      }
    }
  };

  // Toggle front and back camera
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture frame from video feed
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreviewUrl(dataUrl);

      // Convert to File
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const capturedFile = new File([blob], `Scanned_Certificate_${Date.now()}.jpg`, {
              type: 'image/jpeg',
            });
            setFile(capturedFile);
            stopCameraStream();
            setStatus('selected');
          }
        },
        'image/jpeg',
        0.9
      );
    }
  };

  const handleCloseCamera = () => {
    stopCameraStream();
    setStatus('idle');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl('');
      }
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
    stopCameraStream();
    setStatus('idle');
    setFile(null);
    setPreviewUrl('');
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
            
            {/* Stepper Integration */}
            {!isEditMode && <OnboardingStepper currentStep={2} className="mb-stack-md" />}
            
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
              {t('cert_title', 'Certificate Verification')}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto">
              {t('cert_subtitle', 'Upload or scan your certificates to get verified badges and priority in job matching.')}
            </p>
          </div>

          {/* Dynamic Area based on Status */}
          {status === 'idle' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-stack-lg relative z-20">
              {/* Scan Option - Real Camera Access */}
              <div 
                onClick={() => startCamera('environment')}
                className="bg-white/85 backdrop-blur-md border border-white/50 rounded-[2rem] p-8 flex flex-col items-center text-center cursor-pointer hover:-translate-y-1 transition-transform duration-300 shadow-soft hover:shadow-interactive group relative overflow-hidden"
              >
                <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center mb-6 relative border border-surface-variant group-hover:border-secondary transition-colors">
                  <span className="material-symbols-outlined text-[2.5rem] text-primary">photo_camera</span>
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary rounded-tl-sm"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary rounded-tr-sm"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-secondary rounded-bl-sm"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-secondary rounded-br-sm"></div>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-2">
                  {t('cert_scanTitle', 'Scan with Camera')}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8 flex-grow">
                  {t('cert_scanSubtitle', 'Use your device camera to scan and snap your certificate directly.')}
                </p>
                <button 
                  type="button"
                  className="bg-primary-container text-on-primary w-full py-3.5 px-6 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 group-hover:bg-primary transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">videocam</span>
                  <span>{t('cert_openCamera', 'Open Camera')}</span>
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
                <button 
                  type="button"
                  className="bg-surface-container-highest text-primary w-full py-3.5 px-6 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 group-hover:bg-surface-dim transition-colors border border-outline-variant group-hover:border-primary focus:outline-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">folder_open</span>
                  <span>{t('cert_chooseFile', 'Choose File')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Device Camera Viewfinder Modal */}
          {status === 'camera' && (
            <div className="bg-slate-950 border-2 border-teal-500 rounded-[2rem] p-4 sm:p-6 flex flex-col items-center w-full max-w-xl shadow-2xl relative z-30 mb-stack-lg animate-fade-in text-white">
              <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                    {language === 'ta' ? 'நேரடி கேமரா ஸ்கேனர்' : 'Live Camera Scanner'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseCamera}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {cameraError ? (
                <div className="p-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-3xl">no_photography</span>
                  </div>
                  <p className="text-xs sm:text-sm text-red-200">{cameraError}</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => startCamera(facingMode)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
                    >
                      {language === 'ta' ? 'மீண்டும் முயற்சி செய்' : 'Retry Camera'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopCameraStream();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                    >
                      {language === 'ta' ? 'கோப்பைத் தேர்ந்தெடு' : 'Upload File Instead'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Document Alignment Frame Guides */}
                  <div className="absolute inset-6 border-2 border-teal-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                    <div className="flex justify-between">
                      <div className="w-6 h-6 border-t-4 border-l-4 border-amber-400"></div>
                      <div className="w-6 h-6 border-t-4 border-r-4 border-amber-400"></div>
                    </div>
                    <p className="text-center text-[11px] font-bold text-teal-200 bg-slate-900/80 px-3 py-1 rounded-full mx-auto backdrop-blur-sm">
                      {language === 'ta' ? 'சான்றிதழை இந்த எல்லைக்குள் வைக்கவும்' : 'Align certificate inside the frame'}
                    </p>
                    <div className="flex justify-between">
                      <div className="w-6 h-6 border-b-4 border-l-4 border-amber-400"></div>
                      <div className="w-6 h-6 border-b-4 border-r-4 border-amber-400"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Shutter and Camera Actions */}
              {!cameraError && (
                <div className="w-full flex items-center justify-around pt-4 mt-2">
                  <button
                    type="button"
                    onClick={handleToggleCamera}
                    title="Flip camera"
                    className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-teal-300 transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-2xl">flip_camera_ios</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 text-slate-950 flex items-center justify-center shadow-xl ring-4 ring-teal-500 hover:scale-105 transition-all cursor-pointer"
                    title="Capture Photo"
                  >
                    <span className="material-symbols-outlined text-3xl text-teal-700" style={{ fontVariationSettings: "'FILL' 1" }}>
                      camera
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseCamera}
                    className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center justify-center"
                    title="Cancel"
                  >
                    <span className="material-symbols-outlined text-2xl">close</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Document Ready or Processing View */}
          {(status === 'selected' || status === 'processing' || status === 'error') && (
            <div className="bg-white/90 backdrop-blur-lg border border-white/50 rounded-[2rem] p-6 sm:p-8 md:p-10 flex flex-col items-center w-full max-w-md shadow-interactive relative z-20 mb-stack-lg">
              {/* Photo Snapshot Preview if available */}
              {previewUrl ? (
                <div className="w-full h-48 rounded-2xl overflow-hidden mb-5 border-2 border-teal-500/40 relative shadow-md bg-slate-900">
                  <img src={previewUrl} alt="Certificate preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                    <span className="material-symbols-outlined text-xs">check</span>
                    <span>Ready</span>
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center mb-6 text-on-secondary-container relative">
                  {status === 'processing' ? (
                    <span className="material-symbols-outlined text-[2.5rem] animate-spin">sync</span>
                  ) : status === 'error' ? (
                    <span className="material-symbols-outlined text-[2.5rem] text-error">error</span>
                  ) : (
                    <span className="material-symbols-outlined text-[2.5rem]">check_circle</span>
                  )}
                </div>
              )}
              
              <h3 className="font-headline-md text-headline-md text-primary mb-2 text-center">
                {status === 'processing'
                  ? t('cert_processing', 'Verifying Certificate...')
                  : status === 'error'
                  ? t('cert_failed', 'Verification Failed')
                  : t('cert_ready', 'Certificate Scanned Successfully')}
              </h3>
              
              {status === 'error' ? (
                <p className="font-body-md text-body-md text-error mb-6 text-center">{errorMessage}</p>
              ) : (
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 text-center">
                  <span className="font-semibold text-primary block truncate max-w-xs mx-auto" title={file?.name}>
                    {file?.name}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {status === 'processing'
                      ? t('cert_processingSubtitle', 'Please wait while we securely process your document.')
                      : t('cert_readySubtitle', 'Click below to verify and complete your profile.')}
                  </span>
                </p>
              )}
              
              <div className="flex flex-col w-full gap-3">
                {status !== 'processing' && (
                  <button 
                    onClick={handleVerify}
                    className="bg-primary-container hover:bg-primary text-on-primary w-full py-4 px-6 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 transition-colors shadow-soft hover:shadow-interactive focus:outline-none cursor-pointer"
                  >
                    <span>{status === 'error' ? t('cert_tryAgain', 'Try Again') : t('cert_verifyBtn', 'Verify Certificate')}</span>
                    <span className="material-symbols-outlined text-[1.125rem]">arrow_forward</span>
                  </button>
                )}
                
                {status !== 'processing' && (
                  <button 
                    onClick={resetState}
                    className="bg-transparent border border-outline-variant text-on-surface-variant w-full py-3 px-6 rounded-xl font-label-md text-label-md hover:bg-surface-container-low transition-colors focus:outline-none cursor-pointer"
                  >
                    {t('cert_differentDoc', 'Retake or Use different document')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Voice Guidance & Security Badge */}
          <div className="flex flex-col items-center gap-4 w-full max-w-md relative z-20">
            <button
              type="button"
              onClick={() => {
                const guideText =
                  language === 'ta'
                    ? 'கேமராவை ஆன் செய்து உங்கள் 10-ஆம் வகுப்பு அல்லது தொழில் சான்றிதழை எல்லைக்குள் வைத்து புகைப்படம் எடுக்கவும்.'
                    : 'Open camera and align your certificate inside the frame to scan and verify.';
                alert(guideText);
              }}
              className="flex items-center gap-3 bg-[#F0FDFA] px-6 py-3 rounded-full border border-secondary-container hover:bg-secondary-container/30 transition-colors w-full justify-center group relative overflow-hidden focus:outline-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-secondary">volume_up</span>
              <span className="font-label-md text-label-md text-secondary font-bold">
                {t('cert_needHelp', 'Need help? Listen to the instructions.')}
              </span>
            </button>
            <div className="flex items-center gap-2 text-on-primary-fixed-variant opacity-80 text-xs">
              <span className="material-symbols-outlined text-[1.125rem]">shield</span>
              <span>{t('cert_securityBadge', 'Your certificate is securely verified and protected.')}</span>
            </div>
          </div>
          
        </div>
      </main>

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