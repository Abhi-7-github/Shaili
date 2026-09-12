const { GoogleGenAI } = require('@google/genai');
const Image = require('../models/Image');

let aiClient = null;
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' && geminiApiKey !== 'your_ai_api_key_here') {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.warn('Gemini client initialization failed in aiChatService:', err.message);
  }
}

/**
 * Categorize items to help the AI understand wardrobe structure
 */
const categorizeItem = (item) => {
  const text = [...(item.categories || []), ...(item.tags || [])].join(' ').toLowerCase();
  if (text.includes('shirt') || text.includes('t-shirt') || text.includes('top') || text.includes('kurta') || text.includes('sweater') || text.includes('jacket') || text.includes('blouse')) return 'top';
  if (text.includes('pant') || text.includes('jeans') || text.includes('trouser') || text.includes('shorts') || text.includes('skirt') || text.includes('bottom') || text.includes('legging')) return 'bottom';
  if (text.includes('shoe') || text.includes('sneaker') || text.includes('boot') || text.includes('heel') || text.includes('sandal') || text.includes('footwear') || text.includes('flat')) return 'footwear';
  if (text.includes('dress') || text.includes('saree') || text.includes('lehenga') || text.includes('suit') || text.includes('gown')) return 'dress';
  return 'accessory';
};

/**
 * Generate a conversational response based on user query
 */
const generateChatResponse = async (query, history, userId, detectedLang = 'en') => {
  const langMap = { en: 'English', te: 'Telugu', ta: 'Tamil', hi: 'Hindi' };
  const targetLanguage = langMap[detectedLang] || 'English';

  if (!aiClient && (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here')) {
    if (query.toLowerCase().includes('show') || query.toLowerCase().includes('photo') || query.toLowerCase().includes('picture')) {
      return { intent: 'search', message: '' };
    }
    throw new Error('Offline mode triggered');
  }

  const client = aiClient || new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const systemPrompt = `You are SHAILI AI, a general conversational fashion stylist.
Your task is to analyze the user's input and determine if they want to SEARCH their memory vault OR get a general OUTFIT RECOMMENDATION.

If the user asks to "Show my family photos", "Find my pictures", "photos", etc., their intent is "search".
If they ask "What should I wear?", "Suggest an outfit", "Give me a casual look", etc., their intent is "recommendation".

RULES FOR RECOMMENDATIONS:
1. You are providing GENERAL fashion advice. DO NOT assume or claim that the user owns any specific item.
2. Say "A blue shirt" instead of "Your blue shirt". Do NOT inspect their wardrobe.
3. Provide recommendations based on the occasion (e.g., wedding, college, work, Diwali, party). 
4. Use appropriate Indian fashion terminology where relevant (Kurta, Saree, Lehenga, Sherwani).
5. You must output the response in TEXT format. DO NOT render image URLs.
6. MUST RESPOND IN THIS LANGUAGE: ${targetLanguage}. 
   - If the user uses Romanized Telugu (e.g., "pelli ki em vesukovali"), you must recognize it as Telugu and respond with natural Telugu.
   - If the user uses Romanized Hindi (e.g., "shaadi mein kya pehnu"), recognize it as Hindi and respond with natural Hindi.
   - If the user uses Romanized Tamil, recognize it as Tamil.
   - DO NOT perform literal, word-by-word machine translations.
   - Responses MUST sound fluent, natural, and conversational to a native speaker. 
   - DO NOT begin with a repetitive greeting (like "नमस्ते") unless the user explicitly greeted you. Go straight to the recommendation.
   - Do not mix English sentences into Telugu/Tamil/Hindi unless the user explicitly used that style. Use widely understood fashion terms naturally.
7. Use this consistent format for recommendations (translate these labels into natural ${targetLanguage}, for example in Hindi use "✨ आउटफिट सुझाव", "स्टाइल", "क्यों अच्छा लगेगा", "सुझाव"):

✨ Recommended Outfit

[A natural, fluent paragraph describing the outfit combination (top, bottom, footwear) all together.]

Style: [Style name]
Why it works: [Short, natural explanation]
Optional/Tip: [Optional accessory/styling tip]

You MUST output your response as a JSON object strictly matching this schema:
{
  "intent": "search" | "recommendation",
  "message": "Your ${targetLanguage} text response here (leave empty if intent is search)"
}`;

  const formattedHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    const chat = client.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        responseMimeType: "application/json"
      },
      history: formattedHistory
    });

    const response = await chat.sendMessage({ message: query });
    const parsed = JSON.parse(response.text);

    return {
      intent: parsed.intent || 'recommendation',
      message: parsed.message || ''
    };
  } catch (error) {
    console.error('Gemini Chat API Error:', error);
    if (query.toLowerCase().includes('show') || query.toLowerCase().includes('photo') || query.toLowerCase().includes('picture')) {
      return { intent: 'search', message: '' };
    }

    // BACKEND LOCAL FALLBACK (When Gemini hits 429 Quota Exceeded)
    const lower = query.toLowerCase();
    let occasion = 'general';
    if (lower.includes('wedding') || lower.includes('marriage') || lower.includes('shaadi') || lower.includes('pelli') || lower.includes('கல்யாணம்') || lower.includes('திருமணம்') || lower.includes('शादी') || lower.includes('పెళ్లి')) occasion = 'wedding';
    else if (lower.includes('birthday') || lower.includes('పుట్టినరోజు') || lower.includes('பிறந்தநாள்') || lower.includes('जन्मदिन')) occasion = 'birthday';
    else if (lower.includes('party') || lower.includes('పార్టీ') || lower.includes('பார்ட்டி') || lower.includes('पार्टी')) occasion = 'party';
    else if (lower.includes('college') || lower.includes('కాలేజీ') || lower.includes('கல்லூரி') || lower.includes('कॉलेज') || lower.includes('school')) occasion = 'college';
    else if (lower.includes('office') || lower.includes('work') || lower.includes('interview') || lower.includes('ஆபீஸ்') || lower.includes('అఫీస్') || lower.includes('ऑफिस')) occasion = 'office';
    else if (lower.includes('travel') || lower.includes('trip') || lower.includes('vacation') || lower.includes('ట్రావెల్') || lower.includes('பயணம்') || lower.includes('यात्रा')) occasion = 'travel';
    else if (lower.includes('date') || lower.includes('డేట్') || lower.includes('டேட்') || lower.includes('डेट')) occasion = 'date';
    else if (lower.includes('festival') || lower.includes('diwali') || lower.includes('pongal') || lower.includes('sankranti') || lower.includes('దీపావళి') || lower.includes('தீபாவளி') || lower.includes('दिवाली')) occasion = 'festival';

    let fallbackMessage = '';

    if (targetLanguage === 'Telugu') {
      const templates = {
        wedding: '✨ పెళ్లికి आउटफिट సూచన\n\nక్రీమ్ లేదా పాస్టెల్ రంగు కుర్తా, తెల్లటి పైజామా మరియు బ్రౌన్ ఫార్మల్ షూస్ వేసుకోవచ్చు.\n\nస్టైల్: సంప్రదాయ మరియు ఎలిగెంట్\nఎందుకు బాగుంటుంది: ఇది సంప్రదాయంగా, సింపుల్గా మరియు సొగసుగా కనిపిస్తుంది.',
        birthday: '✨ పుట్టినరోజు పార్టీకి సూచన\n\nక్యాజువల్ షర్ట్ లేదా టీ షర్ట్ తో పాటు జీన్స్ లేదా చినోస్ వేసుకోవచ్చు. స్నీకర్స్ వేసుకుంటే బాగుంటుంది.\n\nస్టైల్: స్మార్ట్ క్యాజువల్\nఎందుకు బాగుంటుంది: ఇది పార్టీకి సౌకర్యవంతంగా మరియు ట్రెండీగా ఉంటుంది.',
        party: '✨ పార్టీకి సూచన\n\nట్రెండీ క్యాజువల్ షర్ట్ తో పాటు ఫిట్టెడ్ జీన్స్ మరియు స్టైలిష్ షూస్ వేసుకోవచ్చు.\n\nస్టైల్: పార్టీవేర్\nఎందుకు బాగుంటుంది: మీరు ఎట్రాక్టివ్ గా కనిపిస్తారు.',
        college: '✨ కాలేజీకి సూచన\n\nకంఫర్టబుల్ టీ షర్ట్ లేదా క్యాజువల్ షర్ట్ తో పాటు కాటన్ ప్యాంట్ లేదా జీన్స్ వేసుకోవచ్చు.\n\nస్టైల్: క్యాజువల్\nఎందుకు బాగుంటుంది: రోజంతా సౌకర్యంగా ఉంటుంది.',
        office: '✨ ఆఫీస్ కి సూచన\n\nలైట్ కలర్ ఫార్మల్ షర్ట్, డార్క్ ట్రౌజర్స్ మరియు లెదర్ షూస్ వేసుకోవచ్చు.\n\nస్టైల్: ప్రొఫెషనల్\nఎందుకు బాగుంటుంది: ఇది డీసెంట్ గా ఉంటుంది.',
        travel: '✨ ప్రయాణానికి సూచన\n\nటీ షర్ట్, ట్రాక్ ప్యాంట్ లేదా జీన్స్ మరియు కంఫర్టబుల్ స్నీకర్స్ వేసుకోవచ్చు.\n\nస్టైల్: కంఫర్ట్ వల్\nఎందుకు బాగుంటుంది: ప్రయాణంలో సౌకర్యంగా ఉంటుంది.',
        festival: '✨ పండుగకు సూచన\n\nసంప్రదాయ కుర్తా మరియు పైజామా వేసుకోవచ్చు.\n\nస్టైల్: ఎత్నిక్\nఎందుకు బాగుంటుంది: పండుగ వాతావరణానికి తగినట్లుగా ఉంటుంది.',
        date: '✨ డేట్ కి సూచన\n\nనీట్ గా ఉండే క్యాజువల్ షర్ట్ మరియు జీన్స్ వేసుకోవచ్చు.\n\nస్టైల్: స్మార్ట్ క్యాజువల్\nఎందుకు బాగుంటుంది: మంచి ఇంప్రెషన్ ఇస్తుంది.',
        general: '✨ आउटफिट సూచన\n\nసందర్భాన్ని బట్టి క్యాజువల్ లేదా ఫార్మల్ దుస్తులు ఎంచుకోండి. మీకు సౌకర్యంగా ఉండే రంగులు వాడండి.'
      };
      fallbackMessage = templates[occasion] || templates['general'];
    } else if (targetLanguage === 'Tamil') {
      const templates = {
        wedding: '✨ கல்யாணத்திற்கான ஆடை பரிந்துரை\n\nகிரீம் அல்லது பாஸ்டல் நிற குர்தாவுடன் வெள்ளை பைஜாமா மற்றும் பழுப்பு நிற ஃபார்மல் காலணிகளை அணியலாம்.\n\nஸ்டைல்: பாரம்பரியம் மற்றும் நேர்த்தி\nஏன் இது சிறந்தது: இது பாரம்பரியமாகவும் நேர்த்தியாகவும் இருக்கும்.',
        birthday: '✨ பிறந்தநாள் பார்ட்டிக்கான பரிந்துரை\n\nகேஷுவல் ஷர்ட் அல்லது டி-ஷர்ட் உடன் ஜீன்ஸ் மற்றும் ஸ்னீக்கர்ஸ் அணியலாம்.\n\nஸ்டைல்: ஸ்மார்ட் கேஷுவல்\nஏன் இது சிறந்தது: பார்ட்டிக்கு இது வசதியாகவும் ஸ்டைலாகவும் இருக்கும்.',
        party: '✨ பார்ட்டி ஆடை பரிந்துரை\n\nட்ரெண்டியான கேஷுவல் ஷர்ட் மற்றும் டார்க் ஜீன்ஸ் அணியலாம்.\n\nஸ்டைல்: பார்ட்டிவேர்\nஏன் இது சிறந்தது: இது மிகவும் ஸ்டைலாக இருக்கும்.',
        college: '✨ கல்லூரிக்கு பரிந்துரை\n\nவசதியான டி-ஷர்ட் மற்றும் ஜீன்ஸ் அணியலாம்.\n\nஸ்டைல்: கேஷுவல்\nஏன் இது சிறந்தது: நாள் முழுவதும் வசதியாக இருக்கும்.',
        office: '✨ அலுவலகத்திற்கு பரிந்துரை\n\nஃபார்மல் ஷர்ட் மற்றும் பேண்ட் அணியலாம்.\n\nஸ்டைல்: புரொபஷனல்\nஏன் இது சிறந்தது: இது மிகவும் நேர்த்தியாக இருக்கும்.',
        travel: '✨ பயணத்திற்கு பரிந்துரை\n\nடி-ஷர்ட், டிராக் பேண்ட் மற்றும் ஸ்னீக்கர்ஸ் அணியலாம்.\n\nஸ்டைல்: கேஷுவல்\nஏன் இது சிறந்தது: பயணத்தில் வசதியாக இருக்கும்.',
        festival: '✨ பண்டிகைக்கான பரிந்துரை\n\nபாரம்பரிய குர்தா அணியலாம்.\n\nஸ்டைல்: எத்னிக்\nஏன் இது சிறந்தது: பண்டிகை கொண்டாட்டங்களுக்கு ஏற்றது.',
        date: '✨ டேட் பரிந்துரை\n\nஸ்மார்ட் கேஷுவல் ஷர்ட் மற்றும் ஜீன்ஸ் அணியலாம்.\n\nஸ்டைல்: ஸ்மார்ட் கேஷுவல்\nஏன் இது சிறந்தது: அழகான தோற்றத்தை தரும்.',
        general: '✨ ஆடை பரிந்துரை\n\nசூழலுக்கு ஏற்ப வசதியான ஆடைகளை அணியுங்கள்.'
      };
      fallbackMessage = templates[occasion] || templates['general'];
    } else if (targetLanguage === 'Hindi') {
      const templates = {
        wedding: '✨ शादी के लिए आउटफिट सुझाव\n\nशादी के लिए आप क्रीम या पेस्टल रंग का कुर्ता, सफेद पायजामा और भूरे रंग के फॉर्मल जूते पहन सकते हैं। यह लुक पारंपरिक और आकर्षक लगेगा।\n\nस्टाइल: पारंपरिक और एलिगेंट\nसुझाव: एक अच्छी घड़ी या हल्की एक्सेसरी के साथ लुक को पूरा कर सकते हैं।',
        birthday: '✨ जन्मदिन की पार्टी के लिए सुझाव\n\nआप एक स्टाइलिश कैजुअल शर्ट या टी-शर्ट के साथ जींस और स्नीकर्स पहन सकते हैं।\n\nस्टाइल: स्मार्ट कैजुअल\nक्यों अच्छा लगेगा: यह आरामदायक और फैशनेबल है।',
        party: '✨ पार्टी के लिए सुझाव\n\nएक ट्रेंडी शर्ट और डार्क जींस के साथ स्टाइलिश जूते पहनें।\n\nस्टाइल: पार्टी वियर\nक्यों अच्छा लगेगा: यह आकर्षक और शानदार लुक देगा।',
        college: '✨ कॉलेज के लिए सुझाव\n\nएक आरामदायक टी-शर्ट या कैजुअल शर्ट के साथ जींस और स्नीकर्स पहनें।\n\nस्टाइल: कैजुअल\nक्यों अच्छा लगेगा: यह दिन भर के लिए बहुत आरामदायक है।',
        office: '✨ ऑफिस के लिए सुझाव\n\nहल्के रंग की फॉर्मल शर्ट, डार्क ट्राउजर और फॉर्मल जूते पहनें।\n\nस्टाइल: प्रोफेशनल\nक्यों अच्छा लगेगा: यह ऑफिस के माहौल के लिए बिल्कुल सही है।',
        travel: '✨ यात्रा के लिए सुझाव\n\nएक आरामदायक टी-शर्ट, ट्रैक पैंट या स्ट्रेचेबल जींस और स्नीकर्स पहनें।\n\nस्टाइल: कैजुअल\nक्यों अच्छा लगेगा: यात्रा के दौरान यह बहुत आरामदायक रहेगा।',
        festival: '✨ त्योहार के लिए सुझाव\n\nत्योहार की थीम के अनुसार पारंपरिक कुर्ता पहनें।\n\nस्टाइल: एथनिक\nक्यों अच्छा लगेगा: यह त्योहार के माहौल में चार चांद लगाएगा।',
        date: '✨ डेट के लिए सुझाव\n\nएक साफ-सुथरी स्मार्ट-कैजुअल शर्ट और डार्क जींस पहनें।\n\nस्टाइल: स्मार्ट कैजुअल\nक्यों अच्छा लगेगा: यह एक बेहतरीन इंप्रेशन देगा।',
        general: '✨ आउटफिट सुझाव\n\nआप अवसर के अनुसार कैजुअल या फॉर्मल कपड़े पहन सकते हैं। सुनिश्चित करें कि आप आरामदायक महसूस करें।'
      };
      fallbackMessage = templates[occasion] || templates['general'];
    } else {
      const templates = {
        wedding: '✨ Wedding Outfit Suggestion\n\nFor a wedding, you could try a cream or pastel kurta with a white pajama and brown formal footwear.\n\nStyle: Traditional & Elegant\nWhy it works: This creates a traditional and elegant look.',
        birthday: '✨ Birthday Party Outfit\n\nTry a stylish casual look such as a well-fitted shirt or top with jeans or chinos and clean sneakers.\n\nStyle: Smart Casual\nWhy it works: Perfect balance of comfort and style for a fun party.',
        party: '✨ Party Outfit Recommendation\n\nGo for a trendy casual shirt with dark denim and stylish shoes.\n\nStyle: Trendy\nWhy it works: Ensures you stand out while feeling comfortable.',
        college: '✨ College Outfit\n\nWear a comfortable graphic t-shirt or casual shirt paired with jeans and everyday sneakers.\n\nStyle: Casual\nWhy it works: Ideal for a long day of classes and hanging out.',
        office: '✨ Office Outfit Suggestion\n\nA crisp light-colored formal shirt with dark trousers and leather shoes.\n\nStyle: Professional\nWhy it works: Maintains a neat, appropriate professional appearance.',
        travel: '✨ Travel Outfit\n\nA breathable t-shirt, comfortable track pants or stretch jeans, and walking shoes.\n\nStyle: Comfort Casual\nWhy it works: Keeps you relaxed during long journeys.',
        date: '✨ Date Outfit\n\nA smart-casual well-fitted shirt, clean chinos or dark jeans, and loafers.\n\nStyle: Smart Casual\nWhy it works: Looks put-together but not overly formal.',
        festival: '✨ Festival Outfit\n\nA traditional kurta with pajamas or ethnic wear suitable for the festive vibe.\n\nStyle: Ethnic/Festive\nWhy it works: Perfect for cultural celebrations.',
        general: '✨ General Outfit Recommendation\n\nChoose an outfit that balances comfort and style based on your destination and the weather.'
      };
      fallbackMessage = templates[occasion] || templates['general'];
    }

    return { intent: 'recommendation', message: fallbackMessage };
  }
};

module.exports = {
  generateChatResponse
};
