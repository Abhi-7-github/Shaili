/**
 * Centralized Voice Command Router for ShAili
 * High-capacity parser across English, Telugu, Tamil, Hindi, Romanized Hinglish/Teluglish/Tanglish,
 * and Indian English phonetic variations.
 */

export const detectLanguage = (text = '', activeLanguage = 'en') => {
  if (!text) return activeLanguage ? activeLanguage.split('-')[0] : 'en';
  // Check native script ranges
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi

  const lower = text.toLowerCase();

  // Check Tanglish keyword signals first
  if (
    lower.includes('kaatu') ||
    lower.includes('kaattu') ||
    lower.includes('pannu') ||
    lower.includes('pannunga') ||
    lower.includes('kalyaanam') ||
    lower.includes('kalyanam') ||
    lower.includes('thira') ||
    lower.includes('moodu') ||
    lower.includes('aniyilam') ||
    lower.includes('enna') ||
    lower.includes('yenna') ||
    lower.includes('sollu') ||
    lower.includes('sollunga') ||
    lower.includes('thuniya') ||
    lower.includes('thunigal') ||
    lower.includes('kattunga') ||
    lower.includes('ennoda') ||
    lower.includes('vanakkam') ||
    lower.includes('epdi')
  ) {
    return 'ta';
  }

  // Check Teluglish keyword signals
  if (
    lower.includes('cheyyi') ||
    lower.includes('vellu') ||
    lower.includes('pelli') ||
    lower.includes('chupinchu') ||
    lower.includes('vesukovali') ||
    lower.includes('vellali') ||
    lower.includes('ekada') ||
    lower.includes('kavali')
  ) {
    return 'te';
  }

  // Check Hinglish keyword signals
  if (
    lower.includes('kholo') ||
    lower.includes('dikhao') ||
    lower.includes('jaao') ||
    lower.includes('pehnu') ||
    lower.includes('meri') ||
    lower.includes('peeche') ||
    lower.includes('batao')
  ) {
    return 'hi';
  }

  return activeLanguage ? activeLanguage.split('-')[0] : 'en';
};

export const parseVoiceCommand = (rawTranscript = '') => {
  const transcript = (rawTranscript || '').trim();
  const lower = transcript.toLowerCase();
  const lang = detectLanguage(transcript);

  if (!transcript) {
    return { intent: 'EMPTY', lang: 'en', transcript: '' };
  }

  // 1. Destructive Actions Protection
  if (
    lower.includes('delete') ||
    lower.includes('remove') ||
    lower.includes('logout') ||
    lower.includes('log out') ||
    lower.includes('తొలగించు') ||
    lower.includes('నీకు') ||
    lower.includes('हटाओ')
  ) {
    const confirmationMessages = {
      en: 'Are you sure you want to perform this action?',
      te: 'మీరు నిజంగా ఈ చర్యను నిర్వహించాలనుకుంటున్నారా?',
      ta: 'நீங்கள் நிச்சயமாக இந்த நடவடிக்கையை செய்ய விரும்புகிறீர்களா?',
      hi: 'क्या आप वाकई यह कार्रवाई करना चाहते हैं?'
    };
    return {
      intent: 'DESTRUCTIVE_CONFIRM',
      lang,
      transcript,
      feedback: confirmationMessages[lang] || confirmationMessages.en,
      requiresConfirmation: true
    };
  }

  // 2. Unsupported Actions (e.g., Voice Upload)
  if (
    (lower.includes('upload') || lower.includes('అప్‌లోడ్') || lower.includes('अपलोड')) &&
    (lower.includes('photo') || lower.includes('picture') || lower.includes('image') || lower.includes('voice'))
  ) {
    const unsupportedMessages = {
      en: 'Voice upload is not available yet. Please use the upload button.',
      te: 'వాయిస్ అప్‌లోడ్ ఇంకా అందుబాటులో లేదు. దయచేసి అప్‌లోడ్ బటన్‌ను ఉపయోగించండి.',
      ta: 'குரல் பதிவேற்றம் இன்னும் கிடைக்கவில்லை. தயவுசெய்து பதிவேற்ற பொத்தானைப் பயன்படுத்தவும்.',
      hi: 'वॉयस अपलोड अभी उपलब्ध नहीं है. कृपया अपलोड बटन का उपयोग करें.'
    };
    return {
      intent: 'UNSUPPORTED_ACTION',
      lang,
      transcript,
      feedback: unsupportedMessages[lang] || unsupportedMessages.en
    };
  }

  // 3. Navigation: Dashboard / Home
  if (
    lower.includes('dashboard') ||
    lower.includes('dash board') ||
    lower.includes('home') ||
    lower.includes('main page') ||
    lower.includes('డాష్బోర్డ్') ||
    lower.includes('హోమ్') ||
    lower.includes('టాஷ்போர்ட்') ||
    lower.includes('முகப்பு') ||
    lower.includes('सेल') ||
    lower.includes('डैशबोर्ड') ||
    lower.includes('होम') ||
    lower.includes('ghar')
  ) {
    const feedbacks = {
      en: 'Opening your dashboard.',
      te: 'మీ డాష్బోర్డ్ను ఓపెన్ చేస్తున్నాను.',
      ta: 'உங்கள் டாஷ்போர்டை திறக்கிறேன்.',
      hi: 'आपका डैशबोर्ड खोल रही हूँ.'
    };
    return { intent: 'OPEN_DASHBOARD', targetPath: '/home', lang, transcript, feedback: feedbacks[lang] || feedbacks.en };
  }

  // 4. Navigation: Wardrobe / Clothes
  if (
    lower.includes('wardrobe') ||
    lower.includes('ward robe') ||
    lower.includes('vardrobe') ||
    lower.includes('var drop') ||
    lower.includes('clothes') ||
    lower.includes('clothing') ||
    lower.includes('almarah') ||
    lower.includes('almirah') ||
    lower.includes('వార్డ్రోబ్') ||
    lower.includes('వార్డ్‌రోబ్') ||
    lower.includes('గుడ్డలు') ||
    lower.includes('కూడా') ||
    lower.includes('வார்ட்ரோப்') ||
    lower.includes('துணிகள்') ||
    lower.includes('वार्डरोब') ||
    lower.includes('कपड़े') ||
    lower.includes('कपड़ा')
  ) {
    const feedbacks = {
      en: 'Opening your wardrobe.',
      te: 'మీ వార్డ్రోబ్ను ఓపెన్ చేస్తున్నాను.',
      ta: 'உங்கள் வார்ட்ரோப்பை திறக்கிறேன்.',
      hi: 'आपकी वार्डरोब खोल रही हूँ.'
    };
    return { intent: 'OPEN_WARDROBE', targetPath: '/wardrobe', lang, transcript, feedback: feedbacks[lang] || feedbacks.en };
  }

  // 5. Navigation: Memory Vault / Inspo Gallery
  if (
    lower.includes('memory vault') ||
    lower.includes('memories') ||
    lower.includes('gallery') ||
    lower.includes('photo vault') ||
    lower.includes('మెమరీ వాల్ట్') ||
    lower.includes('మెమరీ') ||
    lower.includes('యాజ్ఞాపకాలు') ||
    lower.includes('మెమొరీస్') ||
    lower.includes('மெமரி வால்ட்') ||
    lower.includes('மேமரி') ||
    lower.includes('मेमोरी वॉल्ट') ||
    lower.includes('यादें')
  ) {
    const feedbacks = {
      en: 'Opening your Memory Vault.',
      te: 'మీ మెమరీ వాల్ట్ను ఓపెన్ చేస్తున్నాను.',
      ta: 'உங்கள் மெமரி வால்ட்டை திறக்கிறேன்.',
      hi: 'आपकी मेमोरी वॉल्ट खोल रही हूँ.'
    };
    return { intent: 'OPEN_MEMORY_VAULT', targetPath: '/profile', lang, transcript, feedback: feedbacks[lang] || feedbacks.en };
  }

  // 6. Navigation: Outfit Generator / AI Stylist / Studio
  if (
    lower.includes('outfit generator') ||
    lower.includes('generate outfit') ||
    lower.includes('outfit studio') ||
    lower.includes('ai stylist') ||
    lower.includes('stylist') ||
    lower.includes('style generator') ||
    lower.includes('అవుట్ఫిట్ జనరేటర్') ||
    lower.includes('స్టైలిస్ట్') ||
    lower.includes('అవుట్‌ఫిట్') ||
    lower.includes('அவுட்ஃபிட்') ||
    lower.includes('ஸ்டைலிஸ்ட்') ||
    lower.includes('आउटफिट जनरेटर') ||
    lower.includes('स्टाइलिस्ट')
  ) {
    const feedbacks = {
      en: 'Opening the Outfit Generator.',
      te: 'అవుట్ఫిట్ జనరేటర్ను ఓపెన్ చేస్తున్నాను.',
      ta: 'அவுட்ஃபிட் ஜெனரேட்டரை திறக்கிறேன்.',
      hi: 'आउटफिट जनरेटर खोल रही हूँ.'
    };
    return { intent: 'OPEN_OUTFIT_GENERATOR', targetPath: '/aistyle', lang, transcript, feedback: feedbacks[lang] || feedbacks.en };
  }

  // 7. Navigation: Virtual Try-On
  if (
    lower.includes('try on') ||
    lower.includes('tryon') ||
    lower.includes('virtual try') ||
    lower.includes('try-on') ||
    lower.includes('tri on') ||
    lower.includes('trial') ||
    lower.includes('ట్రై ఆన్') ||
    lower.includes('ట్రై-ఆన్') ||
    lower.includes('డ్రెస్ ట్రై') ||
    lower.includes('டிரை ஆன்') ||
    lower.includes('ट्राई ऑन') ||
    lower.includes('ट्राई-ऑन')
  ) {
    const feedbacks = {
      en: 'Opening AI Virtual Try-On.',
      te: 'AI వర్చువల్ ట్రై-ఆన్ ఓపెన్ చేస్తున్నాను.',
      ta: 'AI வெர்ச்சுவல் டிரை-ஆன் திறக்கிறேன்.',
      hi: 'AI वर्चुअल ट्राई-ऑन खोल रही हूँ.'
    };
    return { intent: 'OPEN_TRY_ON', targetPath: '/try-on', lang, transcript, feedback: feedbacks[lang] || feedbacks.en };
  }

  // 8. Navigation: Go Back
  if (
    lower.includes('go back') ||
    lower.includes('back') ||
    lower.includes('previous') ||
    lower.includes('venakki') ||
    lower.includes('వెనక్కి') ||
    lower.includes('వెనుకకు') ||
    lower.includes('பின்செல்') ||
    lower.includes('पीछे जाओ') ||
    lower.includes('peeche') ||
    lower.includes('wapas')
  ) {
    const feedbacks = {
      en: 'Going back.',
      te: 'వెనక్కి వెళ్తున్నాను.',
      ta: 'பின்செல்கிறேன்.',
      hi: 'पीछे जा रही हूँ.'
    };
    return { intent: 'GO_BACK', lang, transcript, feedback: feedbacks[lang] || feedbacks.en };
  }

  // 9. Open / Close Assistant
  if (
    lower.includes('open assistant') ||
    lower.includes('open chatbot') ||
    lower.includes('talk to shaili') ||
    lower.includes('hey shaili') ||
    lower.includes('hi shaili') ||
    lower.includes('అసిస్టెంట్ ఓపెన్') ||
    lower.includes('అసిస్టెంట్') ||
    lower.includes('அசிஸ்டெண்ட்டை திற') ||
    lower.includes('असिस्टेंट खोलो')
  ) {
    const feedbacks = {
      en: 'Opening AI Assistant.',
      te: 'AI అసిస్టెంట్ను ఓపెన్ చేస్తున్నాను.',
      ta: 'AI அசிஸ்டெண்ட்டை திறக்கிறேன்.',
      hi: 'AI असिस्टेंट खोल रही हूँ.'
    };
    return { intent: 'OPEN_AI_ASSISTANT', lang, transcript, feedback: feedbacks[lang] || feedbacks.en };
  }

  if (
    lower.includes('close assistant') ||
    lower.includes('close chatbot') ||
    lower.includes('hide assistant') ||
    lower.includes('అసిస్టెంట్ మూసివేయి') ||
    lower.includes('మూసివేయి') ||
    lower.includes('அசிஸ்டெண்ட்டை மூடு') ||
    lower.includes('असिस्टेंट बंद करो')
  ) {
    const feedbacks = {
      en: 'Closing AI Assistant.',
      te: 'AI అసిస్టెంట్ను మూసివేస్తున్నాను.',
      ta: 'AI அசிஸ்டெண்ட்டை மூடுகிறேன்.',
      hi: 'AI असिस्टेंट बंद कर रही हूँ.'
    };
    return { intent: 'CLOSE_ASSISTANT', lang, transcript, feedback: feedbacks[lang] || feedbacks.en };
  }

  // 10. Memory Photo Search Intent
  const searchKeywords = [
    'photo',
    'photos',
    'picture',
    'pictures',
    'image',
    'images',
    'tashveer',
    'pic',
    'pics',
    'ఫోటో',
    'ఫోటోలు',
    'బొమ్మలు',
    'புகைப்பட',
    'புகைப்படங்கள்',
    'படம்',
    'तस्वीर',
    'तस्वीरें',
    'फोटो',
    'chupinchu',
    'dikhao',
    'kaatu',
    'find my',
    'show my',
    'show'
  ];
  if (searchKeywords.some((kw) => lower.includes(kw))) {
    return { intent: 'MEMORY_SEARCH', lang, transcript, feedback: null };
  }

  // 11. Fashion Recommendation Intent
  const fashionKeywords = [
    'wear',
    'outfit',
    'dress',
    'suggest',
    'recommend',
    'combos',
    'pairing',
    'color',
    'style',
    'vesukovali',
    'వేసుకోవాలి',
    'తొడుక్కోవాలి',
    'అణియలాం',
    'அணியலாம்',
    'உடை',
    'pahanu',
    'पहनूं',
    'pehnu',
    'pehno',
    'aniyilam',
    'party',
    'పార్టీ',
    'பார்ட்டி',
    'पार्टी',
    'wedding',
    'pelli',
    'పెళ్లి',
    'shaadi',
    'शादी',
    'kalyaanam',
    'கல்யாணம்',
    'college',
    'casual',
    'date',
    'formal',
    'batao',
    'suggesth',
    'tip'
  ];
  if (fashionKeywords.some((kw) => lower.includes(kw))) {
    return { intent: 'FASHION_QUESTION', lang, transcript, feedback: null };
  }

  // 12. General Conversational / Chatbot Intent
  return { intent: 'FASHION_QUESTION', lang, transcript, feedback: null };
};
