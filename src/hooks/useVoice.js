import { useState } from 'react';
export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  return { isListening, transcript, setIsListening, setTranscript };
};