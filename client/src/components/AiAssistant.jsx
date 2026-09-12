import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, X, Image as ImageIcon, Tag, Eye } from 'lucide-react';

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
      text: `Bonjour ${user?.name || ''}! I am your SHAILI AI Assistant. I have loaded your ${userGender.toUpperCase()} style DNA profile. Ask me for outfit recommendations or query your uploaded photos!`,
      time: 'Just now',
    },
  ]);


  const presetQueries = [
    '📸 Show my beach trip photos',
    '📸 Find my red dress picture',
    '✨ Recommend an outfit for a Parisian gala evening',
    '🎨 Analyze Midnight Slate & Saffron Gold contrast',
  ];

  const handleSendQuery = async (textToSend) => {
    const rawQuery = textToSend || inputQuery;
    if (!rawQuery.trim()) return;

    // Clean query text for display
    const cleanQuery = rawQuery.replace(/^📸\s*/, '').trim();

    // Add User Message
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

      // 1. LANGUAGE DETECTION
      let detectedLang = 'en'; // default to english
      if (/[\u0C00-\u0C7F]/.test(cleanQuery) || lower.includes('pelli') || lower.includes('vesukovali') || lower.includes('cheyyi')) {
        detectedLang = 'te';
      } else if (/[\u0B80-\u0BFF]/.test(cleanQuery) || lower.includes('kalyaanam') || lower.includes('kalyaanathukku') || lower.includes('enna') || lower.includes('aniyalaam')) {
        detectedLang = 'ta';
      } else if (/[\u0900-\u097F]/.test(cleanQuery) || lower.includes('shaadi') || lower.includes('kya') || lower.includes('pehnu') || lower.includes('liye')) {
        detectedLang = 'hi';
      }

      // Check context history for language if not confidently detected
      if (detectedLang === 'en' && messages.length > 1) {
        const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai' && m.lang);
        if (lastAiMsg) detectedLang = lastAiMsg.lang;
      }

      // 2. INTENT ROUTING
      let intent = 'general';
      const searchKw = ['show', 'photo', 'picture', 'find', 'memory', 'చూపించు', 'ఫోటోలు', 'காட்டு', 'புகைப்படங்களை', 'दिखाओ', 'तस्वीरें'];
      const outfitKw = [
        'outfit', 'wear', 'suggest', 'recommend', 'party', 'wedding', 'marriage', 'college', 'casual', 'vesukovali', 'pehnu', 'what can i', 'pelli', 'shaadi',
        'शादी', 'पहनूं', 'पार्टी', 'कॉलेज', 'ऑफिस', 'यात्रा', 'दिवाली', 'सुझाव', 'क्या पहनूं',
        'పెళ్లికి', 'పెళ్లి', 'పుట్టినరోజు', 'కాలేజీకి', 'ఆఫీసుకి', 'డేట్కి', 'ట్రావెల్కి', 'దీపావళికి', 'వేసుకోవాలి', 'ఏం వేసుకోవాలి',
        'கல்யாணத்திற்கு', 'பிறந்தநாள்', 'பார்ட்டிக்கு', 'கல்லூரிக்கு', 'அலுவலகத்திற்கு', 'டேட்டிற்கு', 'பயணத்திற்கு', 'தீபாவளிக்கு', 'அணியலாம்'
      ];

      const hasSearchKw = searchKw.some(kw => lower.includes(kw));
      const hasOutfitKw = outfitKw.some(kw => lower.includes(kw));
      const isExplicitSearch = (lower.includes('show') || lower.includes('find') || lower.includes('చూపించు') || lower.includes('காட்டு') || lower.includes('दिखाओ')) && (lower.includes('photo') || lower.includes('picture') || lower.includes('ఫోటోలు') || lower.includes('புகைப்படங்களை') || lower.includes('तस्वीरें'));

      if (isExplicitSearch) {
        intent = 'search';
      } else if (hasOutfitKw) {
        intent = 'recommendation';
      } else if (hasSearchKw) {
        intent = 'search';
      }

      if (intent === 'search') {
        let retrievedImages = [];
        if (token) {
          const searchRes = await fetch(`/api/images/search?q=${encodeURIComponent(cleanQuery)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const searchData = await searchRes.json();
          if (searchRes.ok && searchData.success && searchData.images) {
            retrievedImages = searchData.images;
          }
        }

        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          lang: detectedLang,
          text: retrievedImages.length > 0 ? 'Here are the memory photos I found for you:' : 'No matching memory photos found for your query.',
          images: retrievedImages,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

      } else if (intent === 'recommendation') {
        const chatHistory = messages.filter(m => m.text).slice(-6).map(m => ({ role: m.sender === 'ai' ? 'assistant' : 'user', content: m.text }));

        try {
          const headers = { 'Content-Type': 'application/json' };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const chatRes = await fetch('/api/chat/message', {
            method: 'POST',
            headers,
            body: JSON.stringify({ query: cleanQuery, history: chatHistory, language: detectedLang })
          });

          if (!chatRes.ok) throw new Error('Backend AI unavailable');
          const chatData = await chatRes.json();

          setMessages((prev) => [...prev, {
            id: Date.now() + 1,
            sender: 'ai',
            lang: detectedLang,
            text: chatData.message || 'Sure, here is a recommendation for you.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        } catch (chatErr) {
          console.warn('Backend chat API failed, using local fallback:', chatErr);

          // LOCAL FALLBACK GENERAL RECOMMENDATIONS
          let fText = '';
          if (detectedLang === 'te') fText = '✨ పండుగ/పెళ్లికి आउटफिट సూచన\n\nక్రీమ్ లేదా పాస్టెల్ రంగు కుర్తా, తెల్లటి పైజామా మరియు బ్రౌన్ ఫార్మల్ షూస్ వేసుకోవచ్చు.\n\nస్టైల్: సంప్రదాయ మరియు ఎలిగెంట్\nఎందుకు బాగుంటుంది: ఇది సంప్రదాయంగా, సింపుల్గా మరియు సొగసుగా కనిపిస్తుంది.';
          else if (detectedLang === 'ta') fText = '✨ கல்யாணத்திற்கான ஆடை பரிந்துரை\n\nகிரீம் அல்லது பாஸ்டல் நிற குர்தாவுடன் வெள்ளை பைஜாமா மற்றும் பழுப்பு நிற ஃபார்மல் காலணிகளை அணியலாம்.\n\nஸ்டைல்: பாரம்பரியம் மற்றும் நேர்த்தி\nஏன் இது சிறந்தது: இது பாரம்பரியமாகவும் நேர்த்தியாகவும் இருக்கும்.';
          else if (detectedLang === 'hi') fText = '✨ शादी के लिए आउटफिट सुझाव\n\nशादी के लिए आप क्रीम या पेस्टल रंग का कुर्ता, सफेद पायजामा और भूरे रंग के फॉर्मल जूते पहन सकते हैं। यह लुक पारंपरिक और आकर्षक लगेगा।\n\nस्टाइल: पारंपरिक और एलिगेंट\nसुझाव: एक अच्छी घड़ी या हल्की एक्सेसरी के साथ लुक को पूरा कर सकते हैं।';
          else fText = '✨ Wedding Outfit Recommendation\n\nFor a wedding, you could try a cream or pastel kurta with a white pajama and brown formal footwear. This creates a traditional and elegant look.';

          setMessages((prev) => [...prev, {
            id: Date.now() + 1,
            sender: 'ai',
            lang: detectedLang,
            text: fText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        }
      } else {
        // GENERAL CONVERSATION
        let gText = 'Hello! I can help you search your memory vault or recommend general outfits for any occasion.';
        if (detectedLang === 'te') gText = 'నమస్కారం! నేను షైలీ AI. మీకు బట్టలు ఎంచుకోవడంలో సహాయం చేయగలను.';
        if (detectedLang === 'ta') gText = 'வணக்கம்! நான் ஷைலி AI. உங்களுக்கு ஆடைகளை தேர்ந்தெடுக்க உதவ முடியும்.';
        if (detectedLang === 'hi') gText = 'नमस्ते! मैं शैली AI हूँ। मैं आपको कपड़े चुनने में मदद कर सकती हूँ।';

        setMessages((prev) => [...prev, {
          id: Date.now() + 1,
          sender: 'ai',
          lang: detectedLang,
          text: gText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }
    } catch (err) {
      console.error('Error handling chatbox query:', err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Sorry, I encountered an issue querying your memory vault. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Circular AI Trigger Button */}
      <div className="ai-floating-trigger-container">
        <button
          className={`ai-circular-button ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          title="Activate SHAILI AI Stylist & Memory Assistant"
        >
          <img src="/images/ai_button.png" alt="AI Stylist" className="ai-button-img" />
          <span className="ai-pulse-ring"></span>
        </button>
      </div>

      {/* AI Mode Drawer Panel */}
      {isOpen && (
        <div className="ai-drawer-overlay" onClick={() => setIsOpen(false)}>
          <div className="ai-drawer-card" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="ai-drawer-header">
              <div className="ai-header-brand">
                <div className="ai-avatar-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3>SHAILI AI STYLIST &amp; MEMORY RETRIEVAL</h3>
                  <span className="ai-status-tag">
                    <span className="live-dot"></span> OPENAI ML RETRIEVAL ONLINE
                  </span>
                </div>
              </div>
              <button className="close-ai-drawer" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="ai-chat-body">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                  <div className="chat-bubble">
                    <p>{msg.text}</p>

                    {/* Render Inline Cloudinary Memory Photos in Chat Bubble (Only for Search intent) */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="chat-inline-images-grid">
                        {msg.images.map((img) => (
                          <div
                            key={img.id}
                            className="chat-inline-img-card"
                            onClick={() => setActivePreviewImage(img)}
                          >
                            <img src={img.url} alt={img.description || 'Retrieved photo'} loading="lazy" />
                            <div className="chat-inline-img-overlay">
                              <Eye size={14} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <span className="chat-time">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chat-bubble-row ai">
                  <div className="chat-bubble typing-bubble">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preset Query Chips */}
            <div className="ai-preset-chips">
              {presetQueries.map((preset, index) => (
                <button
                  key={index}
                  className="preset-chip"
                  onClick={() => handleSendQuery(preset)}
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
              className="ai-input-form"
            >
              <input
                type="text"
                placeholder="Ask AI or query photos (e.g. show my beach trip photos)..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
              />
              <button type="submit" className="send-query-btn" disabled={!inputQuery.trim()}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal for Chatbox Inline Images */}
      {activePreviewImage && (
        <div className="lightbox-overlay" onClick={() => setActivePreviewImage(null)}>
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setActivePreviewImage(null)}>
              <X size={24} />
            </button>
            <div className="lightbox-image-box">
              <img src={activePreviewImage.url} alt={activePreviewImage.description || 'Memory'} />
            </div>
            <div className="lightbox-sidebar">
              <h3>Memory Details</h3>
              <p className="desc-text">{activePreviewImage.description || 'Uploaded Memory Photo'}</p>
              {activePreviewImage.tags && activePreviewImage.tags.length > 0 && (
                <div className="tags-wrap">
                  {activePreviewImage.tags.map((t, i) => (
                    <span key={i} className="tag">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
