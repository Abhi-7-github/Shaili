/**
 * Language-Aware Text-To-Speech (TTS) Service for ShAili
 * Handles multilingual TTS using Web Speech API with fallback & text cleansing.
 */

class TTSService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isMuted = false;
    this.currentUtterance = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  /**
   * Clean raw text from markdown, emojis, technical metadata, and JSON
   */
  cleanText(text) {
    if (!text || typeof text !== 'string') return '';

    return text
      // Remove emojis
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      // Remove markdown bold/italics
      .replace(/[*_~`#]/g, '')
      // Remove URLs
      .replace(/https?:\/\/\S+/g, '')
      // Remove bullet symbols
      .replace(/^[\s•\-–—]+/gm, '')
      .trim();
  }

  /**
   * Find best voice matching language code (en, te, ta, hi) and preferring female voices
   */
  getVoiceForLanguage(langCode = 'en') {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }

    const targetLangMap = {
      en: ['en-IN', 'en-US', 'en-GB', 'en'],
      te: ['te-IN', 'te', 'hi-IN', 'en-IN'],
      ta: ['ta-IN', 'ta', 'hi-IN', 'en-IN'],
      hi: ['hi-IN', 'hi', 'en-IN']
    };

    const targetLangs = targetLangMap[langCode] || targetLangMap.en;

    // 1. Try to find exact female voice in target language
    for (const langTag of targetLangs) {
      const match = this.voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(langTag.toLowerCase()) &&
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural'))
      );
      if (match) return match;
    }

    // 2. Try to find any voice in target language
    for (const langTag of targetLangs) {
      const match = this.voices.find((v) => v.lang.toLowerCase().startsWith(langTag.toLowerCase()));
      if (match) return match;
    }

    // 3. Fallback to any female voice or default voice
    const femaleFallback = this.voices.find((v) => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google'));
    return femaleFallback || this.voices[0] || null;
  }

  /**
   * Speak response aloud
   */
  speak(text, langCode = 'en', onEndCallback = null) {
    if (!this.synth || this.isMuted) return;

    const cleanedText = this.cleanText(text);
    if (!cleanedText) return;

    // Cancel ongoing speech
    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const voice = this.getVoiceForLanguage(langCode);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        const langLocaleMap = { en: 'en-IN', te: 'te-IN', ta: 'ta-IN', hi: 'hi-IN' };
        utterance.lang = langLocaleMap[langCode] || 'en-IN';
      }

      utterance.pitch = 1.0;
      utterance.rate = 1.0;

      if (onEndCallback) {
        utterance.onend = onEndCallback;
        utterance.onerror = (e) => {
          console.warn('[TTS Error]:', e);
          onEndCallback();
        };
      }

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[TTS Speak Exception]:', err.message);
    }
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) this.stop();
  }
}

export const ttsService = new TTSService();
export default ttsService;
