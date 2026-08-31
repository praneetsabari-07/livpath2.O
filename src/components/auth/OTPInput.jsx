import { useState, useRef, useEffect } from 'react';

export default function OTPInput({ length = 6, onComplete, onChange }) {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus the first input on initial mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Take only the last character if multiple are entered somehow
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    const otpValue = newOtp.join('');
    if (onChange) onChange(otpValue);
    if (otpValue.length === length && onComplete) onComplete(otpValue);

    // Move to next input if current one is filled
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        // If current is empty, move back and clear the previous one
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        if (onChange) onChange(newOtp.join(''));
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length).split('');
    if (pastedData.some(char => isNaN(char))) return;

    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtp(newOtp);

    const otpValue = newOtp.join('');
    if (onChange) onChange(otpValue);
    if (otpValue.length === length && onComplete) onComplete(otpValue);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(val => val === '');
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3 mb-stack-md w-full" onPaste={handlePaste}>
      {otp.map((data, index) => (
        <input
          key={index}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={data}
          ref={(el) => (inputRefs.current[index] = el)}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-14 sm:w-14 sm:h-16 text-center font-headline-md text-headline-md text-primary bg-surface-container-low border border-outline-variant rounded-xl focus:border-2 focus:border-[#0F766E] focus:bg-surface-container-lowest focus:ring-0 transition-all outline-none"
        />
      ))}
    </div>
  );
}
