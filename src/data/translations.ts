import { Language } from '../types';

export const TRANSLATIONS: Record<
  Language,
  {
    appTitle: string;
    appSubtitle: string;
    disclaimerShort: string;
    disclaimerLong: string;
    knowledgeBaseTitle: string;
    knowledgeBaseSubtitle: string;
    uploadTitle: string;
    uploadSub: string;
    uploadingPdf: string;
    dropzoneText: string;
    dropzoneSubtext: string;
    totalDocs: string;
    totalChunks: string;
    pages: string;
    chunks: string;
    exampleQuestionsTitle: string;
    chatWelcomeTitle: string;
    chatWelcomeDesc: string;
    howItWorksTitle: string;
    howStep1: string;
    howStep1Desc: string;
    howStep2: string;
    howStep2Desc: string;
    howStep3: string;
    howStep3Desc: string;
    inputPlaceholder: string;
    sendButton: string;
    searchingIndicator: string;
    retrievedSourcesHeader: string;
    viewSnippet: string;
    closeSnippet: string;
    sourceCardTitle: string;
    copied: string;
    copyAnswer: string;
    clearChat: string;
    clearChatConfirm: string;
    deleteDoc: string;
    viewChunks: string;
    restoreSamples: string;
    noDocsAlert: string;
    errorTitle: string;
    notFoundNotice: string;
    pageLabel: string;
    scoreLabel: string;
    viewDocTitle: string;
    allChunksModalTitle: string;
    dbManagerTitle: string;
    dbManagerSubtitle: string;
    voiceConversationTitle: string;
    voiceConversationSubtitle: string;
    startVoice: string;
    endVoice: string;
    voiceListening: string;
    voiceSpeaking: string;
    voiceConnecting: string;
    exportDB: string;
    importDB: string;
    addCustomTextTitle: string;
    customTextDesc: string;
    howToUpdateTitle: string;
  }
> = {
  en: {
    appTitle: 'IP-SAKTI Sahayak',
    appSubtitle: 'Ayurveda & Traditional Knowledge IP Regulatory Assistant',
    disclaimerShort: 'Information only, not legal advice.',
    disclaimerLong:
      'Information only, not legal advice. Responses are strictly grounded in retrieved regulatory documents and TKDL prior art. Consult a registered patent attorney for legal proceedings.',
    knowledgeBaseTitle: 'Regulatory Knowledge Base',
    knowledgeBaseSubtitle: 'Uploaded Acts, Guidelines & TKDL treaties',
    uploadTitle: 'Upload Documents',
    uploadSub: 'Upload PDF or TXT files (e.g. Ayush guidelines, TKDL, WIPO GRATK)',
    uploadingPdf: 'Extracting pages & indexing chunks...',
    dropzoneText: 'Click or drag PDF/TXT file here',
    dropzoneSubtext: 'Extracted page-by-page and chunked into ~1000 characters in browser memory',
    totalDocs: 'Documents',
    totalChunks: 'Indexed Chunks',
    pages: 'pages',
    chunks: 'chunks',
    exampleQuestionsTitle: 'Example Questions',
    chatWelcomeTitle: 'Welcome to IP-SAKTI Sahayak',
    chatWelcomeDesc:
      'A specialized multilingual legal assistant for patent examiners, Ayush researchers, and innovators. Ask any question regarding Ayurveda patentability, Section 3(p), Section 3(e), TKDL prior art, or WIPO treaties.',
    howItWorksTitle: 'Strict Grounding Architecture',
    howStep1: '1. Ingest Guidelines',
    howStep1Desc: 'Upload or use preloaded Ayush Patent Guidelines, TKDL, and WIPO treaties.',
    howStep2: '2. BM25 Retrieval',
    howStep2Desc: 'Finds the top 5 most relevant ~1000 char passages with source and page tracking.',
    howStep3: '3. Grounded Synthesis',
    howStep3Desc: 'Gemini answers strictly from those 5 chunks with [1], [2] citations or states "Not found".',
    inputPlaceholder: 'Ask an IP question in English or Hindi (e.g. Can an Ayurvedic formulation be patented?)...',
    sendButton: 'Send Query',
    searchingIndicator: 'Retrieving top 5 sources & verifying grounded citations...',
    retrievedSourcesHeader: 'Retrieved Sources (5 chunks consulted)',
    viewSnippet: 'View Snippet',
    closeSnippet: 'Hide Snippet',
    sourceCardTitle: 'Grounded Source Excerpt',
    copied: 'Copied to clipboard!',
    copyAnswer: 'Copy answer',
    clearChat: 'Clear Conversation',
    clearChatConfirm: 'Are you sure you want to clear this conversation?',
    deleteDoc: 'Remove document',
    viewChunks: 'Inspect Chunks',
    restoreSamples: 'Restore Default Documents',
    noDocsAlert: 'Knowledge base is empty. Please upload documents or restore defaults.',
    errorTitle: 'Query Error',
    notFoundNotice: 'Not found in the available sources.',
    pageLabel: 'Page',
    scoreLabel: 'Relevance',
    viewDocTitle: 'Document Chunks Inspector',
    allChunksModalTitle: 'Indexed Chunks for',
    dbManagerTitle: 'Database & Knowledge Manager',
    dbManagerSubtitle: 'Update, export, import and manage regulatory knowledge in browser database',
    voiceConversationTitle: 'Live Voice Conversation',
    voiceConversationSubtitle: 'Speak naturally in English or Hindi with Gemini 3.8 Live API',
    startVoice: 'Start Voice Mode',
    endVoice: 'End Voice Call',
    voiceListening: 'Listening to your question...',
    voiceSpeaking: 'IP-SAKTI is responding...',
    voiceConnecting: 'Connecting to Gemini Live API...',
    exportDB: 'Export Database (JSON)',
    importDB: 'Import Database (JSON)',
    addCustomTextTitle: 'Add Custom Law / Amendment',
    customTextDesc: 'Add specific patent notifications, case laws, or circulars directly into the database.',
    howToUpdateTitle: 'How to Update the Database',
  },
  hi: {
    appTitle: 'आईपी-शक्ति सहायक',
    appSubtitle: 'आयुर्वेद एवं पारंपरिक ज्ञान बौद्धिक संपदा विनियामक सहायक',
    disclaimerShort: 'केवल सूचना हेतु, विधिक सलाह नहीं।',
    disclaimerLong:
      'केवल सूचना हेतु, विधिक सलाह नहीं। उत्तर सख्ती से उपलब्ध पेटेंट दिशानिर्देशों और टीकेडीएल स्रोतों पर आधारित हैं। विधिक कार्यवाही के लिए पंजीकृत पेटेंट अटॉर्नी से परामर्श करें।',
    knowledgeBaseTitle: 'विनियामक ज्ञान कोष',
    knowledgeBaseSubtitle: 'अपलोड किए गए अधिनियम, दिशानिर्देश एवं टीकेडीएल संधियां',
    uploadTitle: 'दस्तावेज़ अपलोड करें',
    uploadSub: 'पीडीएफ या टीएक्सटी फ़ाइलें अपलोड करें (जैसे आयुष दिशानिर्देश, टीकेडीएल, डब्ल्यूआईपीओ)',
    uploadingPdf: 'पृष्ठ निकाले जा रहे हैं एवं चंक बनाए जा रहे हैं...',
    dropzoneText: 'यहाँ PDF/TXT फ़ाइल क्लिक करें या खींचें',
    dropzoneSubtext: 'ब्राउज़र मेमोरी में पृष्ठ-दर-पृष्ठ निकाल कर ~1000 वर्णों में विभाजित किया जाता है',
    totalDocs: 'दस्तावेज़',
    totalChunks: 'इंडेक्स किए गए चंक्स',
    pages: 'पृष्ठ',
    chunks: 'चंक्स',
    exampleQuestionsTitle: 'उदाहरण प्रश्न',
    chatWelcomeTitle: 'आईपी-शक्ति सहायक में आपका स्वागत है',
    chatWelcomeDesc:
      'पेटेंट परीक्षकों, आयुष शोधकर्ताओं एवं नवाचारकर्ताओं के लिए एक विशेष बहुभाषी सहायक। आयुर्वेद पेटेंट पात्रता, धारा 3(p), धारा 3(e), टीकेडीएल पूर्व-कला या डब्ल्यूआईपीओ संधियों पर कोई भी प्रश्न पूछें।',
    howItWorksTitle: 'सख्त स्रोत-सत्यापित कार्यप्रणाली',
    howStep1: '1. दिशानिर्देश लोड',
    howStep1Desc: 'आयुष पेटेंट दिशानिर्देश, टीकेडीएल एवं डब्ल्यूआईपीओ संधियां उपयोग या अपलोड करें।',
    howStep2: '2. BM25 खोज',
    howStep2Desc: 'पृष्ठ संख्या और स्रोत के साथ शीर्ष 5 सबसे प्रासंगिक ~1000 वर्णों के अंश खोजता है।',
    howStep3: '3. सत्यापित उत्तर',
    howStep3Desc: 'जेमिनी केवल उन 5 अंशों से [1], [2] उद्धरणों के साथ उत्तर देता है अन्यथा "नहीं मिला" कहता है।',
    inputPlaceholder: 'अंग्रेजी या हिंदी में बौद्धिक संपदा प्रश्न पूछें (जैसे: क्या आयुर्वेदिक फॉर्मूलेशन का पेटेंट हो सकता है?)...',
    sendButton: 'प्रश्न भेजें',
    searchingIndicator: 'शीर्ष 5 स्रोतों की खोज एवं उद्धरण सत्यापन जारी है...',
    retrievedSourcesHeader: 'प्राप्त स्रोत (5 अंश उपयोग किए गए)',
    viewSnippet: 'अंश देखें',
    closeSnippet: 'अंश छिपाएं',
    sourceCardTitle: 'सत्यापित स्रोत अंश',
    copied: 'कॉपी हो गया!',
    copyAnswer: 'उत्तर कॉपी करें',
    clearChat: 'बातचीत साफ़ करें',
    clearChatConfirm: 'क्या आप बातचीत साफ़ करना चाहते हैं?',
    deleteDoc: 'दस्तावेज़ हटाएं',
    viewChunks: 'चंक्स देखें',
    restoreSamples: 'डिफ़ॉल्ट दस्तावेज़ पुनर्स्थापित करें',
    noDocsAlert: 'ज्ञान कोष खाली है। कृपया दस्तावेज़ अपलोड करें या डिफ़ॉल्ट बहाल करें।',
    errorTitle: 'खोज में त्रुटि',
    notFoundNotice: 'उपलब्ध स्रोतों में यह जानकारी नहीं मिली।',
    pageLabel: 'पृष्ठ',
    scoreLabel: 'प्रासंगिकता',
    viewDocTitle: 'दस्तावेज़ चंक निरीक्षक',
    allChunksModalTitle: 'के लिए इंडेक्स किए गए चंक्स',
    dbManagerTitle: 'डेटाबेस एवं ज्ञान प्रबंधक',
    dbManagerSubtitle: 'ब्राउज़र डेटाबेस में विनियामक ज्ञान को अपडेट, निर्यात, आयात और प्रबंधित करें',
    voiceConversationTitle: 'लाइव आवाज़ बातचीत',
    voiceConversationSubtitle: 'जेमिनी 3.8 लाइव एपीआई के साथ अंग्रेजी या हिंदी में स्वाभाविक रूप से बोलें',
    startVoice: 'आवाज़ मोड शुरू करें',
    endVoice: 'आवाज़ कॉल समाप्त करें',
    voiceListening: 'आपका प्रश्न सुना जा रहा है...',
    voiceSpeaking: 'आईपी-शक्ति उत्तर दे रहा है...',
    voiceConnecting: 'जेमिनी लाइव एपीआई से कनेक्ट हो रहा है...',
    exportDB: 'डेटाबेस निर्यात करें (JSON)',
    importDB: 'डेटाबेस आयात करें (JSON)',
    addCustomTextTitle: 'कस्टम कानून / संशोधन जोड़ें',
    customTextDesc: 'विशिष्ट पेटेंट अधिसूचनाएं, केस लॉ या परिपत्र सीधे डेटाबेस में जोड़ें।',
    howToUpdateTitle: 'डेटाबेस को कैसे अपडेट करें',
  },
};

export const EXAMPLE_QUESTIONS = [
  {
    textEn: 'Can a traditional Ayurvedic formulation be patented in India?',
    textHi: 'क्या भारत में किसी पारंपरिक आयुर्वेदिक फॉर्मूलेशन का पेटेंट कराया जा सकता है?',
  },
  {
    textEn: 'What does TKDL do to prevent wrongful patents?',
    textHi: 'गलत पेटेंट (बायोपायरेसी) रोकने के लिए टीकेडीएल (TKDL) क्या करता है?',
  },
  {
    textEn: 'आयुर्वेदिक फॉर्मूलेशन के पेटेंट के लिए क्या शर्तें हैं?',
    textHi: 'आयुर्वेदिक फॉर्मूलेशन के पेटेंट के लिए क्या शर्तें हैं?',
  },
  {
    textEn: 'What is the synergy requirement under Section 3(e) of the Indian Patents Act?',
    textHi: 'भारतीय पेटेंट अधिनियम की धारा 3(e) के तहत सिनर्जिस्टिक प्रभाव (Synergy) की क्या शर्त है?',
  },
  {
    textEn: 'Is National Biodiversity Authority (NBA) approval mandatory before patent grant?',
    textHi: 'क्या पेटेंट मिलने से पहले राष्ट्रीय जैव विविधता प्राधिकरण (NBA) की मंजूरी अनिवार्य है?',
  },
  {
    textEn: 'What is the mandatory disclosure requirement in the 2024 WIPO GRATK Treaty?',
    textHi: '2024 डब्ल्यूआईपीओ (WIPO) जीआरएटीके संधि में अनिवार्य प्रकटीकरण नियम क्या है?',
  },
];
