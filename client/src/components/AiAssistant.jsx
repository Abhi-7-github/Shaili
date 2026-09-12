import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, X, Eye, Bot } from 'lucide-react';

export const AiAssistant = () => {
  const { token, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activePreviewImage, setActivePreviewImage] = useState(null);

  const userGender = user?.gender || 'women';

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Bonjour ${user?.name || ''}! I am your ShAili AI Stylist. Ask me for outfit recommendations, color harmony tips, or styling advice for any occasion!`,
      time: 'Just now',
    },
  ]);

  const presetQueries = [
    '📸 Show my beach trip photos',
    '📸 Find my red dress picture',
    '✨ Recommend an outfit for a wedding',
    '🎨 Analyze color contrast for navy & white',
  ];

  const handleSendQuery = async (textToSend) => {
    const rawQuery = textToSend || inputQuery;
    if (!rawQuery.trim()) return;

    const cleanQuery = rawQuery.replace(/^📸\s*/, '').trim();

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
      if (/[\u0C00-\u0C7F]/.test(cleanQuery) || lower.includes('pelli') || lower.includes('vesukovali')) {
        detectedLang = 'te';
      } else if (/[\u0B80-\u0BFF]/.test(cleanQuery) || lower.includes('kalyaanam') || lower.includes('enna')) {
        detectedLang = 'ta';
      } else if (/[\u0900-\u097F]/.test(cleanQuery) || lower.includes('shaadi') || lower.includes('pehnu')) {
        detectedLang = 'hi';
      }

      let intent = 'general';
      const searchKw = ['show', 'photo', 'picture', 'find', 'memory'];
      const outfitKw = ['outfit', 'wear', 'suggest', 'recommend', 'party', 'wedding', 'college', 'casual'];

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

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            lang: detectedLang,
            text: retrievedImages.length > 0 ? 'Here are the memory photos I found for you:' : 'No matching memory photos found for your query.',
            images: retrievedImages,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        // AI Styling recommendation
        let responseText = 'For a versatile look, pair a crisp white cotton top with dark navy trousers and minimalist footwear.';
        if (lower.includes('wedding') || lower.includes('pelli') || lower.includes('shaadi')) {
          responseText = '✨ Wedding Outfit Suggestion: A silk kurta in pastel ivory or gold paired with tailored ethnic bottoms and embroidered footwear.';
        } else if (lower.includes('party')) {
          responseText = '✨ Party Look: A sleek black top with tailored beige bottoms and burgundy accent accessories.';
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
      }
    } catch (err) {
      console.error('Error handling chatbox query:', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Fixed Floating Circular Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#0F3D3A] text-[#FAF4ED] shadow-2xl flex items-center justify-center border-2 border-[#F5DABF] hover:scale-105 transition-all cursor-pointer group"
          title="Activate ShAili AI Stylist"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-[#F5DABF]" />
          ) : (
            <Sparkles className="w-6 h-6 text-[#F5DABF] group-hover:rotate-12 transition-transform" />
          )}
        </button>
      </div>

      {/* Floating Chat Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-4 sm:p-6 bg-[#0A2E2C]/50 backdrop-blur-xs">
          <div className="bg-white border border-[#F5DABF] rounded-3xl w-full max-w-md h-[560px] max-h-[85vh] shadow-2xl flex flex-col justify-between overflow-hidden my-auto">
            {/* Header */}
            <div className="p-4 bg-[#0F3D3A] text-[#FAF4ED] flex items-center justify-between border-b border-[#F5DABF]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#6C151E] flex items-center justify-center text-[#F5DABF]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold tracking-tight">ShAili AI Assistant</h3>
                  <span className="text-[10px] font-mono text-[#F5DABF] block">AI Stylist Online</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-[#FAF4ED]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages List */}
            <div className="p-4 flex-grow overflow-y-auto space-y-3 bg-[#FAF4ED]">
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
              <input
                type="text"
                placeholder="Ask AI Stylist..."
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
