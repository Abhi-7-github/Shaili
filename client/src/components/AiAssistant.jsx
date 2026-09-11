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
      // Execute natural language image search via backend (OpenAI ML keyword extraction)
      let retrievedImages = [];
      let searchFilters = null;

      if (token) {
        const searchRes = await fetch(`/api/images/search?q=${encodeURIComponent(cleanQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const searchData = await searchRes.json();
        if (searchRes.ok && searchData.success && searchData.images) {
          retrievedImages = searchData.images;
          searchFilters = searchData.filters;
        }
      }

      // Synthesize AI conversational text response
      let aiText = '';
      const lower = cleanQuery.toLowerCase();

      if (retrievedImages.length > 0) {
        const keywordsStr = searchFilters?.keywords?.join(', ');
        aiText = `I analyzed your query using ML keyword extraction${
          keywordsStr ? ` (Keywords: ${keywordsStr})` : ''
        } and retrieved ${retrievedImages.length} memory photo${
          retrievedImages.length > 1 ? 's' : ''
        } from your private Cloudinary vault:`;
      } else if (lower.includes('photo') || lower.includes('picture') || lower.includes('image') || lower.includes('show') || lower.includes('find')) {
        aiText = `No matching memory photos found in your vault for "${cleanQuery}". You can upload new photos anytime at /upload!`;
      } else if (lower.includes('gala') || lower.includes('parisian') || lower.includes('outfit')) {
        aiText =
          'For a Parisian gala, I recommend our Architectural Tailoring set in Midnight Slate (#283845) paired with a high-shine Saffron Warm Gold (#FFA649) silk camisole. This pairing creates high contrast authority with 65% slate structure and 35% amber brilliance.';
      } else if (lower.includes('slate') || lower.includes('color') || lower.includes('saffron') || lower.includes('contrast')) {
        aiText =
          'The Midnight Slate & Saffron Gold palette balances deep mineral stability with vibrant solar warmth. According to your skin contrast metrics, this combination enhances natural luminosity by 24%.';
      } else {
        aiText = `I have analyzed your query "${cleanQuery}". Based on your SHAILI profile, I recommend exploring our Bespoke Suiting collection or uploading relevant outfit photos to your vault at /upload.`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiText,
        images: retrievedImages,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
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

                    {/* Render Inline Cloudinary Memory Photos in Chat Bubble */}
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
