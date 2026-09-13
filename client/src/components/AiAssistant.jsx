import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVoiceCommand } from '../context/VoiceCommandContext';
import { ttsService } from '../services/ttsService';
import { Sparkles, Send, X, Eye, Bot, Mic, MicOff, Volume2, VolumeX, Globe } from 'lucide-react';

export const AiAssistant = () => {
  const { token, user } = useAuth();
  const {
    isListening,
    isContinuous,
    currentLanguage,
    transcript,
    voiceFeedback,
    isAssistantOpen,
    setIsAssistantOpen,
    startListening,
    stopListening,
    toggleListening,
    toggleContinuousMode,
    setLanguage,
    executeCommand,
    registerFinalTranscriptHandler
  } = useVoiceCommand();

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activePreviewImage, setActivePreviewImage] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Bonjour ${user?.name || ''}! I am your ShAili AI Stylist. Ask me for outfit recommendations, color harmony tips, or styling advice for any occasion!`,
      time: 'Just now',
      lang: 'en'
    },
  ]);

  const presetQueries = [
    '📸 Show my beach trip photos',
    '📸 Find my red dress picture',
    '✨ Recommend an outfit for a wedding',
    '🎨 Analyze color contrast for navy & white',
  ];

  // Auto-fill transcript when speaking
  useEffect(() => {
    if (transcript) {
      setInputQuery(transcript);
    }
  }, [transcript]);

  // Toggle Mute
  const handleToggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    ttsService.setMuted(nextState);
  };

  const handleSendQuery = useCallback(async (textToSend) => {
    const rawQuery = textToSend || inputQuery;
    if (!rawQuery || !rawQuery.trim()) return;

    const cleanQuery = rawQuery.replace(/^📸\s*/, '').trim();

    // 1. First check if input is an explicit Voice Command (e.g., "Open wardrobe", "Go home")
    const parsedCommand = executeCommand(rawQuery);
    if (parsedCommand && ['OPEN_DASHBOARD', 'OPEN_WARDROBE', 'OPEN_MEMORY_VAULT', 'OPEN_OUTFIT_GENERATOR', 'OPEN_TRY_ON', 'GO_BACK', 'CLOSE_ASSISTANT', 'DESTRUCTIVE_CONFIRM', 'UNSUPPORTED_ACTION'].includes(parsedCommand.intent)) {
      if (!textToSend) setInputQuery('');
      return;
    }

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: rawQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    try {
      const lower = cleanQuery.toLowerCase();
      let detectedLang = 'en';
      if (/[\u0C00-\u0C7F]/.test(cleanQuery) || lower.includes('pelli') || lower.includes('vesukovali') || lower.includes('chupinchu')) {
        detectedLang = 'te';
      } else if (/[\u0B80-\u0BFF]/.test(cleanQuery) || lower.includes('kalyaanam') || lower.includes('enna') || lower.includes('kaatu') || lower.includes('aniyilam')) {
        detectedLang = 'ta';
      } else if (/[\u0900-\u097F]/.test(cleanQuery) || lower.includes('shaadi') || lower.includes('pehnu') || lower.includes('dikhao')) {
        detectedLang = 'hi';
      }

      let intent = 'general';
      const searchKw = ['show', 'photo', 'picture', 'find', 'memory', 'chupinchu', 'dikhao', 'kaatu', 'తీయండి', 'ఫోటోలు', 'புகைப்படங்கள்', 'तस्वीरें'];
      const outfitKw = ['outfit', 'wear', 'suggest', 'recommend', 'party', 'wedding', 'college', 'casual', 'vesukovali', 'pehnu', 'aniyilam'];

      if (searchKw.some((kw) => lower.includes(kw))) {
        intent = 'search';
      } else if (outfitKw.some((kw) => lower.includes(kw))) {
        intent = 'recommendation';
      }

      if (intent === 'search') {
        let retrievedImages = [];
        if (token) {
          try {
            const searchRes = await fetch(`/api/images/search?q=${encodeURIComponent(cleanQuery)}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const searchData = await searchRes.json();
            if (searchRes.ok && searchData.success && searchData.images) {
              retrievedImages = searchData.images;
            }
          } catch (e) {
            console.warn('Image search error:', e);
          }
        }

        const replyText = retrievedImages.length > 0 
          ? (detectedLang === 'te' ? 'నేను మీ కోసం కనుగొన్న జ్ఞాపకాల ఫోటోలు ఇవిగోండి:' : detectedLang === 'ta' ? 'உங்களுக்காக நான் கண்டறிந்த புகைப்படங்கள் இதோ:' : detectedLang === 'hi' ? 'मुझे आपकी ये यादों की तस्वीरें मिली हैं:' : 'Here are the memory photos I found for you:')
          : (detectedLang === 'te' ? 'మీ ప్రశ్నతో సరిపోలే ఫోటోలు ఏవీ దొరకలేదు.' : detectedLang === 'ta' ? 'பொருந்தக்கூடிய புகைப்படங்கள் எதுவும் கிடைக்கவில்லை.' : detectedLang === 'hi' ? 'कोई मेल खाती तस्वीर नहीं मिली.' : 'No matching memory photos found for your query.');

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            lang: detectedLang,
            text: replyText,
            images: retrievedImages,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        // Speak chatbot response aloud using TTS
        ttsService.speak(replyText, detectedLang);

      } else {
        // AI Styling recommendation
        let responseText = 'For a versatile look, pair a crisp white cotton top with dark navy trousers and minimalist footwear.';
        if (lower.includes('wedding') || lower.includes('pelli') || lower.includes('shaadi') || lower.includes('kalyaanam')) {
          if (detectedLang === 'te') {
            responseText = '✨ పెళ్లి అవుట్ఫిట్ సూచన: పాస్టెల్ ఐవరీ లేదా గోల్డ్ సిల్క్ కుర్తాను ఎంబ్రాయిడరీ ఫుట్‌వేర్‌తో జత చేయండి.';
          } else if (detectedLang === 'ta') {
            responseText = '✨ திருமண உடை பரிந்துரை: பாஸ்டல் பட்டு குர்தா மற்றும் எம்பிராய்டரி காலணிகள் சிறப்பாக இருக்கும்.';
          } else if (detectedLang === 'hi') {
            responseText = '✨ शादी का आउटफिट सुझाव: पेस्टल आइवरी या गोल्ड सिल्क कुर्ता और कढ़ाई वाली जूतियां पहनें.';
          } else {
            responseText = '✨ Wedding Outfit Suggestion: A silk kurta in pastel ivory or gold paired with tailored ethnic bottoms and embroidered footwear.';
          }
        } else if (lower.includes('party')) {
          if (detectedLang === 'te') {
            responseText = '✨ పార్టీ లుక్: బ్లాక్ టాప్, బీజ్ బాటమ్స్ మరియు బర్గండీ యాక్సెసరీస్ ధరించండి.';
          } else if (detectedLang === 'ta') {
            responseText = '✨ பார்ட்டி லுக்: கருப்பு டாப் மற்றும் பழுப்பு நிற பாட்டம்ஸ் அணிவது சிறப்பாக இருக்கும்.';
          } else if (detectedLang === 'hi') {
            responseText = '✨ पार्टी लुक: ब्लैक टॉप के साथ टेलर्ड बेज बॉटम्स और बर्गंडी एक्सेसरीज पहनें.';
          } else {
            responseText = '✨ Party Look: A sleek black top with tailored beige bottoms and burgundy accent accessories.';
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            lang: detectedLang,
            text: responseText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        // Speak chatbot response aloud using TTS
        ttsService.speak(responseText, detectedLang);
      }
    } catch (err) {
      console.error('Error handling chatbox query:', err);
    } finally {
      setIsTyping(false);
    }
  }, [inputQuery, executeCommand, token]);

  // Subscribe to final recognized speech transcript
  useEffect(() => {
    if (registerFinalTranscriptHandler) {
      const unregister = registerFinalTranscriptHandler((finalText, parsedCommand) => {
        if (parsedCommand && ['OPEN_DASHBOARD', 'OPEN_WARDROBE', 'OPEN_MEMORY_VAULT', 'OPEN_OUTFIT_GENERATOR', 'OPEN_TRY_ON', 'GO_BACK', 'CLOSE_ASSISTANT'].includes(parsedCommand.intent)) {
          executeCommand(finalText);
          return;
        }
        setInputQuery(finalText);
        handleSendQuery(finalText);
      });
      return () => unregister();
    }
  }, [registerFinalTranscriptHandler, handleSendQuery, executeCommand]);

  return (
    <>
      {/* Fixed Floating Circular Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Quick Mic Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center border-2 border-[#F5DABF] transition-all cursor-pointer ${
            isListening ? 'bg-[#6C151E] text-white animate-pulse' : 'bg-[#0F3D3A] text-[#FAF4ED] hover:scale-105'
          }`}
          title={isListening ? 'Listening for Voice Commands...' : 'Activate Voice Assistant'}
        >
          {isListening ? <Mic className="w-5 h-5 text-red-200 animate-spin" /> : <Mic className="w-5 h-5 text-[#F5DABF]" />}
        </button>

        {/* Main Floating Trigger Button */}
        <button
          type="button"
          onClick={() => setIsAssistantOpen(!isAssistantOpen)}
          className="w-14 h-14 rounded-full bg-[#0F3D3A] text-[#FAF4ED] shadow-2xl flex items-center justify-center border-2 border-[#F5DABF] hover:scale-105 transition-all cursor-pointer group"
          title="Activate ShAili AI Stylist"
        >
          {isAssistantOpen ? (
            <X className="w-6 h-6 text-[#F5DABF]" />
          ) : (
            <Sparkles className="w-6 h-6 text-[#F5DABF] group-hover:rotate-12 transition-transform" />
          )}
        </button>
      </div>

      {/* Floating Chat Drawer Modal */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-4 sm:p-6 bg-[#0A2E2C]/50 backdrop-blur-xs">
          <div className="bg-white border border-[#F5DABF] rounded-3xl w-full max-w-md h-[580px] max-h-[85vh] shadow-2xl flex flex-col justify-between overflow-hidden my-auto">
            {/* Header */}
            <div className="p-4 bg-[#0F3D3A] text-[#FAF4ED] flex items-center justify-between border-b border-[#F5DABF]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#6C151E] flex items-center justify-center text-[#F5DABF]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold tracking-tight">ShAili Voice & AI Assistant</h3>
                  <span className="text-[10px] font-mono text-[#F5DABF] flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`} />
                    {isListening ? 'Listening...' : 'Voice Commands Ready'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Mute/Unmute TTS Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-[#FAF4ED]"
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-300" /> : <Volume2 className="w-4 h-4 text-[#F5DABF]" />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsAssistantOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-[#FAF4ED]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Language Selector Bar */}
            <div className="px-4 py-2 bg-[#0A2E2C] flex items-center justify-between border-b border-[#F5DABF]/20 text-xs text-[#FAF4ED]">
              <span className="flex items-center gap-1 font-mono text-[10px] text-[#F5DABF]">
                <Globe className="w-3.5 h-3.5" /> Language:
              </span>
              <div className="flex items-center gap-1 font-mono text-[10px]">
                {[
                  { code: 'en-IN', label: 'EN' },
                  { code: 'te-IN', label: 'తెలుగు' },
                  { code: 'ta-IN', label: 'தமிழ்' },
                  { code: 'hi-IN', label: 'हिंदी' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                      currentLanguage === l.code
                        ? 'bg-[#6C151E] text-white font-bold'
                        : 'bg-white/10 hover:bg-white/20 text-[#FAF4ED]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages List */}
            <div className="p-4 flex-grow overflow-y-auto space-y-3 bg-[#FAF4ED]">
              {voiceFeedback && (
                <div className="p-2.5 rounded-xl bg-[#6C151E]/10 border border-[#6C151E]/30 text-xs font-mono font-bold text-[#6C151E] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6C151E] shrink-0" />
                  <span>{voiceFeedback}</span>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#0F3D3A] text-[#FAF4ED] rounded-tr-none'
                        : 'bg-white border border-[#F5DABF] text-[#0A2E2C] rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.images && msg.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {msg.images.map((img) => (
                          <div
                            key={img.id}
                            className="aspect-square rounded-xl overflow-hidden cursor-pointer border border-[#F5DABF]"
                            onClick={() => setActivePreviewImage(img)}
                          >
                            <img src={img.url} alt="Memory" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="text-[9px] opacity-70 block text-right mt-1 font-mono">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-[#F5DABF] w-fit text-xs text-[#0A2E2C]">
                  <span className="w-2 h-2 rounded-full bg-[#0F3D3A] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#6C151E] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#0F3D3A] animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Preset Query Chips */}
            <div className="p-2.5 bg-white border-t border-[#F5DABF] flex gap-1.5 overflow-x-auto scrollbar-none">
              {presetQueries.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSendQuery(preset)}
                  className="px-2.5 py-1 rounded-full bg-[#FAF4ED] border border-[#F5DABF] text-[11px] font-semibold text-[#0A2E2C] whitespace-nowrap hover:bg-[#F5DABF]/50 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="p-3 bg-white border-t border-[#F5DABF] flex items-center gap-2"
            >
              {/* Mic Toggle Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all ${
                  isListening ? 'bg-[#6C151E] text-white animate-pulse' : 'bg-[#FAF4ED] border border-[#F5DABF] text-[#0F3D3A] hover:bg-[#F5DABF]/30'
                }`}
                title={isListening ? 'Stop Listening' : 'Start Voice Input'}
              >
                {isListening ? <Mic className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-[#0F3D3A]" />}
              </button>

              <input
                type="text"
                placeholder={isListening ? 'Listening to your voice...' : 'Ask AI Stylist or speak command...'}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-xs text-[#0A2E2C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="p-2.5 bg-[#0F3D3A] hover:bg-[#0A2E2C] text-[#FAF4ED] rounded-xl transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4 text-[#F5DABF]" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistant;
