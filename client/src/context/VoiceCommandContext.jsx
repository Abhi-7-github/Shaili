import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseVoiceCommand } from '../services/voiceCommandRouter';
import { ttsService } from '../services/ttsService';

const VoiceCommandContext = createContext();

export const VoiceCommandProvider = ({ children }) => {
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [isContinuous, setIsContinuous] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-IN');
  const [transcript, setTranscript] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [lastExecutedCommand, setLastExecutedCommand] = useState(null);

  const recognitionRef = useRef(null);
  const sessionFinalSegmentsRef = useRef([]);
  const lastProcessedTranscriptRef = useRef('');
  const isListeningRef = useRef(false);
  const isStartingRef = useRef(false);
  const onFinalTranscriptCallbackRef = useRef(null);

  // Register external handler (e.g. from AiAssistant) to receive final transcript
  const registerFinalTranscriptHandler = useCallback((handler) => {
    onFinalTranscriptCallbackRef.current = handler;
    return () => {
      onFinalTranscriptCallbackRef.current = null;
    };
  }, []);

  // Dispatch intent action to React Router & application features
  const executeCommand = useCallback((rawText) => {
    if (!rawText || !rawText.trim()) return null;

    const parsed = parseVoiceCommand(rawText);
    if (process.env.NODE_ENV === 'development') {
      console.log('[VOICE DEBUG] Parsed Command:', parsed);
    }

    setLastExecutedCommand(parsed);

    // Speak Feedback if present
    if (parsed.feedback) {
      setVoiceFeedback(parsed.feedback);
      ttsService.speak(parsed.feedback, parsed.lang);
    }

    switch (parsed.intent) {
      case 'OPEN_DASHBOARD':
      case 'OPEN_WARDROBE':
      case 'OPEN_MEMORY_VAULT':
      case 'OPEN_OUTFIT_GENERATOR':
      case 'OPEN_TRY_ON':
        if (parsed.targetPath) {
          navigate(parsed.targetPath);
        }
        break;

      case 'GO_BACK':
        navigate(-1);
        break;

      case 'OPEN_AI_ASSISTANT':
        setIsAssistantOpen(true);
        break;

      case 'CLOSE_ASSISTANT':
        setIsAssistantOpen(false);
        break;

      case 'MEMORY_SEARCH':
      case 'FASHION_QUESTION':
        setIsAssistantOpen(true);
        break;

      default:
        break;
    }

    return parsed;
  }, [navigate]);

  const handleFinalTranscript = useCallback((finalText) => {
    if (!finalText || !finalText.trim()) return;

    setTranscript(finalText);
    const parsed = parseVoiceCommand(finalText);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[VOICE DEBUG] Complete Final Transcript Received: "${finalText}" | Intent: ${parsed.intent}`);
    }

    // If an external subscriber (e.g. AiAssistant) is registered, pass transcript to it
    if (onFinalTranscriptCallbackRef.current) {
      onFinalTranscriptCallbackRef.current(finalText, parsed);
    } else {
      executeCommand(finalText);
    }
  }, [executeCommand]);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const msg = 'Web Speech Recognition API is not supported in this browser.';
      console.warn('[Voice Command]:', msg);
      setVoiceFeedback(msg);
      return;
    }

    if (isStartingRef.current) return;
    isStartingRef.current = true;

    // Safely abort any existing recognition session before creating a fresh one
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    if ('maxAlternatives' in recognition) {
      recognition.maxAlternatives = 3;
    }
    recognition.lang = currentLanguage;

    sessionFinalSegmentsRef.current = [];
    lastProcessedTranscriptRef.current = '';
    setTranscript('');
    setVoiceFeedback('');

    recognition.onstart = () => {
      isListeningRef.current = true;
      isStartingRef.current = false;
      setIsListening(true);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[VOICE DEBUG] Recognition STARTED with language = ${currentLanguage}`);
      }
    };

    recognition.onresult = (event) => {
      const finalSegments = [];
      let interimText = '';

      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0] ? res[0].transcript : '';
        if (res.isFinal) {
          if (text.trim()) {
            finalSegments.push(text.trim());
          }
        } else {
          if (text.trim()) {
            interimText += (interimText ? ' ' : '') + text.trim();
          }
        }
      }

      sessionFinalSegmentsRef.current = finalSegments;
      const joinedFinal = finalSegments.join(' ');
      const combinedDisplay = (joinedFinal + (interimText ? (joinedFinal ? ' ' : '') + interimText : '')).trim();

      if (process.env.NODE_ENV === 'development') {
        console.log(`[VOICE DEBUG] lang: ${currentLanguage} | interim: "${interimText}" | final: "${joinedFinal}"`);
      }

      // Real-time preview update for input field
      setTranscript(combinedDisplay);
    };

    recognition.onerror = (event) => {
      isStartingRef.current = false;
      isListeningRef.current = false;
      setIsListening(false);

      if (process.env.NODE_ENV === 'development') {
        console.log(`[VOICE DEBUG] Error: ${event.error}`);
      }

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setVoiceFeedback('Microphone permission denied. Please allow microphone access in browser settings.');
      } else if (event.error === 'language-not-supported') {
        setVoiceFeedback(`Speech recognition language (${currentLanguage}) is not supported on this device/browser.`);
      } else if (event.error === 'no-speech') {
        setVoiceFeedback('No speech detected. Please try again.');
      } else if (event.error === 'network') {
        setVoiceFeedback('Network error during speech recognition. Please check connection.');
      }
    };

    recognition.onend = () => {
      isStartingRef.current = false;
      isListeningRef.current = false;
      setIsListening(false);

      if (process.env.NODE_ENV === 'development') {
        console.log('[VOICE DEBUG] Recognition ENDED');
      }

      // Collect accumulated final transcript segments for the active session
      const finalResult = sessionFinalSegmentsRef.current.join(' ').trim();

      if (finalResult && finalResult !== lastProcessedTranscriptRef.current) {
        lastProcessedTranscriptRef.current = finalResult;
        handleFinalTranscript(finalResult);
      }

      if (isContinuous && isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      isStartingRef.current = false;
      console.warn('[Speech Start Error]:', e);
    }
  }, [currentLanguage, isContinuous, handleFinalTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  const setLanguage = useCallback((langCode) => {
    setCurrentLanguage(langCode);
    if (isListeningRef.current) {
      stopListening();
      setTimeout(() => {
        startListening();
      }, 100);
    }
  }, [startListening, stopListening]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const speakText = useCallback((text, langCode) => {
    ttsService.speak(text, langCode);
  }, []);

  return (
    <VoiceCommandContext.Provider
      value={{
        isListening,
        isContinuous,
        currentLanguage,
        transcript,
        voiceFeedback,
        isAssistantOpen,
        lastExecutedCommand,
        setIsAssistantOpen,
        startListening,
        stopListening,
        toggleListening,
        toggleContinuousMode: () => setIsContinuous((prev) => !prev),
        setLanguage,
        executeCommand,
        speakText,
        registerFinalTranscriptHandler
      }}
    >
      {children}
    </VoiceCommandContext.Provider>
  );
};

export const useVoiceCommand = () => useContext(VoiceCommandContext);
export default VoiceCommandContext;
