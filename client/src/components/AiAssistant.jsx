import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoiceCommand } from '../context/VoiceCommandContext';
import { ttsService } from '../services/ttsService';
import { detectLanguage } from '../services/voiceCommandRouter';
import { Sparkles, Send, X, Eye, Bot, Mic, MicOff, Volume2, VolumeX, Globe, Shirt, ExternalLink, Image as ImageIcon } from 'lucide-react';

export const AiAssistant = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const {
    isListening,
    isContinuous,
    currentLanguage,
    autoDetectedLang,
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
    '📸 Marriage & Wedding outfit photos',
    '🎉 Birthday celebration photos',
    '✨ Recommend an outfit for a wedding',
    '🎨 Analyze color contrast for navy & white',
  ];

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
      const detectedLang = detectLanguage(cleanQuery, currentLanguage);

      // Attempt to retrieve matching images from Memory Vault / Wardrobe for any query (marriage, birthday, party, colors, etc.)
      let retrievedImages = [];
      if (token) {
        try {
          const searchRes = await fetch(`/api/images/search?q=${encodeURIComponent(cleanQuery)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const searchData = await searchRes.json();
          if (searchRes.ok && searchData.success && searchData.images && searchData.images.length > 0) {
            retrievedImages = searchData.images.map((img) => ({
              id: img.id || img._id,
              url: img.url || img.cloudinaryUrl,
              title: img.originalName || img.description || (img.categories ? img.categories.join(', ') : 'Memory Photo'),
              description: img.description,
              categories: img.categories,
              tags: img.tags
            }));
          }
        } catch (e) {
          console.warn('Image search error:', e);
        }
      }

      // Fallback preview images if no user uploads exist yet for common occasions
      if (retrievedImages.length === 0) {
        if (
          lower.includes('wedding') ||
          lower.includes('marriage') ||
          lower.includes('pelli') ||
          lower.includes('shaadi') ||
          lower.includes('kalyaanam') ||
          lower.includes('kalyanam') ||
          lower.includes('கல்யாணம்') ||
          lower.includes('திருமணம்') ||
          lower.includes('పెళ్లి') ||
          lower.includes('వివాహం') ||
          lower.includes('శాది') ||
          lower.includes('शादी') ||
          lower.includes('विवाह')
        ) {
          retrievedImages = [{ id: 'w1', url: '/images/tailoring.png', title: 'Wedding & Ethnic Ensemble', categories: ['wedding', 'ethnic'] }];
        } else if (
          lower.includes('birthday') ||
          lower.includes('bday') ||
          lower.includes('party') ||
          lower.includes('పుట్టినరోజు') ||
          lower.includes('బర్త్‌డే') ||
          lower.includes('பிறந்தநாள்') ||
          lower.includes('பர்த்டே') ||
          lower.includes('जन्मदिन') ||
          lower.includes('పార్టీ') ||
          lower.includes('பார்ட்டி') ||
          lower.includes('पार्टी')
        ) {
          retrievedImages = [{ id: 'p1', url: '/images/hero_fashion.png', title: 'Birthday & Celebration Outfit', categories: ['birthday', 'party'] }];
        } else if (lower.includes('leather') || lower.includes('jacket')) {
          retrievedImages = [{ id: 'l1', url: '/images/leather.png', title: 'Leather Jacket Ensemble', categories: ['outerwear'] }];
        } else if (lower.includes('coat') || lower.includes('outerwear')) {
          retrievedImages = [{ id: 'o1', url: '/images/outerwear.png', title: 'Editorial Coat', categories: ['outerwear'] }];
        }
      }

      // Determine text response based on occasion and language
      let responseText = '';

      if (
        lower.includes('wedding') ||
        lower.includes('marriage') ||
        lower.includes('pelli') ||
        lower.includes('shaadi') ||
        lower.includes('kalyaanam') ||
        lower.includes('kalyanam') ||
        lower.includes('கல்யாணம்') ||
        lower.includes('திருமணம்') ||
        lower.includes('పెళ్లి') ||
        lower.includes('వివాహం') ||
        lower.includes('శాది') ||
        lower.includes('शादी') ||
        lower.includes('विवाह')
      ) {
        if (detectedLang === 'te') {
          responseText = '✨ పెళ్లి / వివాహ అవుట్ఫిట్ సూచన: పాస్టెల్ ఐవరీ లేదా గోల్డ్ సిల్క్ కుర్తాను ఎంబ్రాయిడరీ ఫుట్‌వేర్‌తో జత చేయండి. మీ కోసం సంబంధిత ఫోటోలు ఇవిగోండి:';
        } else if (detectedLang === 'ta') {
          responseText = '✨ திருமண உடை பரிந்துரை: பாஸ்டல் பட்டு குர்தா மற்றும் எம்பிராய்டரி காலணிகள் சிறப்பாக இருக்கும். உங்களுக்கான புகைப்படங்கள் இதோ:';
        } else if (detectedLang === 'hi') {
          responseText = '✨ शादी / विवाह का आउटफिट सुझाव: पेस्टल आइवरी या गोल्ड सिल्क कुर्ता और कढ़ाई वाली जूतियां पहनें. आपकी तस्वीरें ये रही:';
        } else {
          responseText = '✨ Wedding & Marriage Outfit Suggestion: A silk kurta in pastel ivory or gold paired with tailored ethnic bottoms and embroidered footwear. Here are the matching outfit photos:';
        }
      } else if (
        lower.includes('birthday') ||
        lower.includes('bday') ||
        lower.includes('పుట్టినరోజు') ||
        lower.includes('బర్త్‌డే') ||
        lower.includes('பிறந்தநாள்') ||
        lower.includes('பர்த்டே') ||
        lower.includes('जन्मदिन')
      ) {
        if (detectedLang === 'te') {
          responseText = '🎉 బర్త్‌డే అవుట్‌ఫిట్ సూచన: స్టైలిష్ వైబ్రంట్ కలర్ డ్రెస్ లేదా బ్లేజర్ కాంబినేషన్ ఎంచుకోండి. మీ బర్త్‌డే ఫోటోలు ఇవిగోండి:';
        } else if (detectedLang === 'ta') {
          responseText = '🎉 பிறந்தநாள் உடை பரிந்துரை: துடிப்பான வண்ண ஆடை அல்லது பிளேசர் அணிந்து அசத்துங்கள். உங்களுக்கான புகைப்படங்கள் இதோ:';
        } else if (detectedLang === 'hi') {
          responseText = '🎉 जन्मदिन का आउटफिट सुझाव: एक वाइब्रेंट ट्रेंडी ड्रेस या स्टाइलिश ब्लेज़र पहनें. आपकी बर्थडे तस्वीरें ये रही:';
        } else {
          responseText = '🎉 Birthday Celebration Outfit: Wear a chic vibrant dress or tailored blazer ensemble. Here are your celebration photos:';
        }
      } else if (
        lower.includes('party') ||
        lower.includes('nightout') ||
        lower.includes('పార్టీ') ||
        lower.includes('பார்ட்டி') ||
        lower.includes('पार्टी')
      ) {
        if (detectedLang === 'te') {
          responseText = '✨ పార్టీ లుక్: బ్లాక్ శటిల్ లేదా సిల్క్ టాప్, బీజ్ బాటమ్స్ మరియు బర్గండీ యాక్సెసరీస్ ధరించండి. సంబంధిత ఫోటోలు ఇవిగోండి:';
        } else if (detectedLang === 'ta') {
          responseText = '✨ பார்ட்டி லுக்: கருப்பு டாப் மற்றும் பழுப்பு நிற பாட்டம்ஸ் அணிவது சிறப்பாக இருக்கும். புகைப்படங்கள் இதோ:';
        } else if (detectedLang === 'hi') {
          responseText = '✨ पार्टी लुक: ब्लैक टॉप के साथ टेलर्ड बेज बॉटम्स और बर्गंडी एक्सेसरीज पहनें. आपकी तस्वीरें ये रही:';
        } else {
          responseText = '✨ Party Look: A sleek black top with tailored beige bottoms and burgundy accent accessories. Here are your party photos:';
        }
      } else if (
        lower.includes('college') ||
        lower.includes('casual') ||
        lower.includes('daily') ||
        lower.includes('కాలేజ్') ||
        lower.includes('క్యాజువల్') ||
        lower.includes('கல்லூரி')
      ) {
        if (detectedLang === 'te') {
          responseText = '✨ క్యాజువల్ స్టైల్: సౌకర్యవంతమైన కాటన్ టీ-షర్ట్ మరియు డెనిమ్ జీన్స్ ధరించండి.';
        } else if (detectedLang === 'ta') {
          responseText = '✨ கேஷுவல் லுக்: வசதியான பருத்தி டி-ஷர்ட் மற்றும் டெனிம் ஜீன்ஸ் அணியுங்கள்.';
        } else if (detectedLang === 'hi') {
          responseText = '✨ कैज़ुअल लुक: कॉटन टी-शर्ट और डेनिम जींस का कम्फर्टेबल कॉम्बिनेशन पहनें.';
        } else {
          responseText = '✨ Casual Style: Pair a breathable cotton tee with relaxed fit denim and clean white sneakers.';
        }
      } else {
        if (detectedLang === 'te') {
          responseText = retrievedImages.length > 0
            ? '✨ నేను మీ వార్డ్రోబ్ / మెమరీ వాల్ట్ నుండి కనుగొన్న ఫోటోలు ఇవిగోండి:'
            : '✨ మీ కోసం వర్సటైల్ స్టైల్ సూచన: క్లీన్ వైట్ కాటన్ టాప్ మరియు నేవీ బాటమ్స్‌తో మినిమలిస్ట్ ఫుట్‌వేర్‌ను జత చేయండి.';
        } else if (detectedLang === 'ta') {
          responseText = retrievedImages.length > 0
            ? '✨ உங்கள் நினைவகம் / வார்ட்ரோப்பிலிருந்து கண்டறிந்த புகைப்படங்கள் இதோ:'
            : '✨ உங்களுக்கான ஸ்டைல் பரிந்துரை: வெள்ளை பருத்தி டாப் மற்றும் நேவி பாட்டம்ஸ் அணிந்து சிறப்பாக காட்சியளியுங்கள்.';
        } else if (detectedLang === 'hi') {
          responseText = retrievedImages.length > 0
            ? '✨ मुझे आपकी मेमोरी वॉल्ट से ये तस्वीरें मिली हैं:'
            : '✨ स्टाईल सुझाव: क्लासिक व्हाइट कॉटन टॉप के साथ डार्क नेवी ट्राउजर पहनें.';
        } else {
          responseText = retrievedImages.length > 0
            ? '✨ Here are the matching memory and wardrobe photos found for your query:'
            : '✨ Versatile Styling Tip: Pair a crisp white cotton top with dark navy trousers and minimalist footwear.';
        }
      }

      setIsAssistantOpen(true);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          lang: detectedLang,
          text: responseText,
          images: retrievedImages.length > 0 ? retrievedImages : undefined,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      if (!isMuted) {
        ttsService.speak(responseText, detectedLang);
      }

    } catch (err) {
      console.error('Error handling chatbox query:', err);
    } finally {
      setIsTyping(false);
    }
  }, [inputQuery, executeCommand, token, currentLanguage, isMuted, setIsAssistantOpen]);

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
          className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center border-2 border-[#F5DABF] transition-all cursor-pointer ${isListening ? 'bg-[#6C151E] text-white animate-pulse' : 'bg-[#0F3D3A] text-[#FAF4ED] hover:scale-105'
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
                {currentLanguage === 'auto' && (
                  <span className="ml-1 text-[9px] bg-[#6C151E] text-white px-1.5 py-0.2 rounded font-sans uppercase font-bold">
                    Auto ({autoDetectedLang === 'te' ? 'తెలుగు' : autoDetectedLang === 'ta' ? 'தமிழ்' : autoDetectedLang === 'hi' ? 'हिंदी' : 'English'})
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1 font-mono text-[10px]">
                {[
                  { code: 'auto', label: '⚡ Auto' },
                  { code: 'en-IN', label: 'EN' },
                  { code: 'te-IN', label: 'తెలుగు' },
                  { code: 'ta-IN', label: 'தமிழ்' },
                  { code: 'hi-IN', label: 'हिंदी' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${currentLanguage === l.code || (l.code === 'auto' && currentLanguage === 'auto')
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
                    className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${msg.sender === 'user'
                        ? 'bg-[#0F3D3A] text-[#FAF4ED] rounded-tr-none'
                        : 'bg-white border border-[#F5DABF] text-[#0A2E2C] rounded-tl-none shadow-xs'
                      }`}
                  >
                    <p>{msg.text}</p>

                    {msg.images && msg.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2.5">
                        {msg.images.map((img) => (
                          <div
                            key={img.id || img.url}
                            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-[#F5DABF] bg-black/5 hover:border-[#6C151E] transition-all shadow-xs"
                            onClick={() => setActivePreviewImage(img)}
                          >
                            <img src={img.url} alt={img.title || img.description || 'Memory'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                              <span className="text-[10px] font-bold text-white truncate">{img.title || img.originalName || (img.categories ? img.categories.join(', ') : 'View Photo')}</span>
                            </div>
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
                className={`p-2.5 rounded-xl transition-all ${isListening ? 'bg-[#6C151E] text-white animate-pulse' : 'bg-[#FAF4ED] border border-[#F5DABF] text-[#0F3D3A] hover:bg-[#F5DABF]/30'
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

      {/* Full-Screen Image Lightbox Preview Modal */}
      {activePreviewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white border border-[#F5DABF] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col relative">
            {/* Lightbox Header */}
            <div className="p-4 bg-[#0F3D3A] text-[#FAF4ED] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F5DABF]" />
                <h4 className="font-serif font-bold text-sm truncate max-w-[280px]">
                  {activePreviewImage.title || activePreviewImage.originalName || activePreviewImage.description || 'Memory Outfit Photo'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewImage(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image */}
            <div className="relative bg-black flex items-center justify-center min-h-[260px] max-h-[400px]">
              <img
                src={activePreviewImage.url}
                alt="Memory Preview"
                className="w-full h-full max-h-[380px] object-contain"
              />
            </div>

            {/* Image Details & Action Buttons */}
            <div className="p-4 bg-[#FAF4ED] flex flex-col gap-3">
              {activePreviewImage.description && (
                <p className="text-xs text-[#0A2E2C] font-medium leading-relaxed">
                  {activePreviewImage.description}
                </p>
              )}
              {activePreviewImage.categories && activePreviewImage.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activePreviewImage.categories.map((cat, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full bg-[#0F3D3A]/10 text-[#0F3D3A] text-[10px] font-bold uppercase font-mono">
                      #{cat}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-[#F5DABF]">
                <button
                  type="button"
                  onClick={() => {
                    const imgUrl = activePreviewImage.url;
                    setActivePreviewImage(null);
                    setIsAssistantOpen(false);
                    navigate('/try-on', { state: { selectedGarment: imgUrl } });
                  }}
                  className="flex-1 px-3 py-2 bg-[#6C151E] hover:bg-[#520f16] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Shirt className="w-4 h-4" /> Try On in VTON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePreviewImage(null);
                    setIsAssistantOpen(false);
                    navigate('/wardrobe');
                  }}
                  className="flex-1 px-3 py-2 bg-[#0F3D3A] hover:bg-[#0A2E2C] text-[#FAF4ED] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-[#F5DABF]" /> View in Wardrobe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistant;
