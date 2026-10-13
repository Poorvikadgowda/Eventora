import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { sendChatMessage } from '../../services/api';
import {
  Bot,
  Send,
  Volume2,
  VolumeX,
  Languages,
  Sparkles,
  User,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const AIChatbot = () => {
  const {
    language,
    setLanguage,
    currentPrescription,
    patientHistory,
    notify
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef(null);

  // Initial welcome message based on language
  useEffect(() => {
    const welcomeTexts = {
      en: 'Hello! I am your GenericSwap AI Pharmacist. Ask me anything in simple language about active molecules, food precautions, side effects, or Jan Aushadhi generic equivalents.',
      kn: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಜೆನೆರಿಕ್-ಸ್ವಾಪ್ AI ಫಾರ್ಮಾಸಿಸ್ಟ್. ಜನೌಷಧಿ ಜೆನೆರಿಕ್ ಔಷಧಿಗಳು, ಸಕ್ರಿಯ ಅಣುಗಳು (APIs), ಸೇವಿಸುವ ವಿಧಾನ ಅಥವಾ ಅಲರ್ಜಿಗಳ ಬಗ್ಗೆ ಕನ್ನಡದಲ್ಲಿ ಕೇಳಬಹುದು.',
      hi: 'नमस्ते! मैं आपका जेनेरिक-स्वैप एआई फार्मासिस्ट हूँ। आप अपनी दवाओं, एक्टिव साल्ट (APIs), भोजन के नियमों या जन औषधि जेनेरिक विकल्पों के बारे में हिंदी में पूछ सकते हैं।'
    };

    setMessages([
      {
        role: 'assistant',
        content: welcomeTexts[language] || welcomeTexts.en,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Suggested Quick Inquiries per language
  const suggestedPrompts = {
    en: [
      'Are Jan Aushadhi generics clinically bioequivalent?',
      'How should I take Pantocid DSR?',
      'Check my active prescription with my allergies',
      'What is an Active Pharmaceutical Ingredient (API)?'
    ],
    kn: [
      'ಜನೌಷಧಿ ಜೆನೆರಿಕ್ ಔಷಧಿಗಳು ಎಷ್ಟು ಸುರಕ್ಷಿತ?',
      'ನನ್ನ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ ಮತ್ತು ಅಲರ್ಜಿ ಪರಿಶೀಲಿಸಿ',
      'ವಾರ್ಷಿಕ ಎಷ್ಟು ಹಣ ಉಳಿತಾಯವಾಗುತ್ತದೆ?',
      'ಸಕ್ರಿಯ ಅಣು (Active Molecule) ಎಂದರೇನು?'
    ],
    hi: [
      'क्या जन औषधि दवाएं ब्रांडेड जितनी असरदार हैं?',
      'मेरी मेडिकल हिस्ट्री और एलर्जी चेक करें',
      'साल भर में कितनी बचत होगी?',
      'दवा खाली पेट लेनी चाहिए या खाने के बाद?'
    ]
  };

  const handleSend = async (textToSend = null) => {
    const message = textToSend || inputMessage;
    if (!message.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await sendChatMessage(
        message,
        messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        currentPrescription,
        patientHistory,
        language,
        true
      );

      const botMsg = {
        role: 'assistant',
        content: res.response || 'I am here to guide you on active molecules and generic equivalents.',
        audio_base64: res.audio_base64,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      notify('Failed to generate response: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Text-To-Speech (TTS) using Web Speech API with fallback
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`_]/g, ''));
      
      const langCodes = {
        en: 'en-IN',
        kn: 'kn-IN',
        hi: 'hi-IN'
      };
      utterance.lang = langCodes[language] || 'en-IN';
      utterance.rate = 0.95;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      notify('Speech synthesis not supported in this browser', 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 pb-16">
      
      {/* Header with Multilingual Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Modules 10 & 11: AI Pharmacist & Multilingual Voice
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            Ask AI Pharmacist Assistant
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Plain language medicine explainer with multilingual support in English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी).
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              language === 'en' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('kn')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              language === 'kn' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ಕನ್ನಡ (Kannada)
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              language === 'hi' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            हिंदी (Hindi)
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
        
        {/* Chat Top Banner */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900">Dr. GenericSwap Bot</span>
              <span className="text-[10px] text-emerald-600 block font-semibold">● Online • CDSCO Reference Base</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                setIsSpeaking(false);
              }}
              title="Stop audio"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <VolumeX className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setMessages([
                  {
                    role: 'assistant',
                    content: 'Chat reset. How can I help you today?',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isBot = msg.role === 'assistant';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-2xl p-4 text-xs space-y-1.5 shadow-xs leading-relaxed ${
                    isBot
                      ? 'bg-slate-100/90 text-slate-800 rounded-tl-sm border border-slate-200/80'
                      : 'bg-teal-600 text-white rounded-tr-sm shadow-teal-600/10'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  <div className="flex items-center justify-between gap-3 pt-1 text-[10px] opacity-75">
                    <span>{msg.time}</span>
                    {isBot && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className="hover:opacity-100 text-teal-800 font-bold flex items-center gap-1"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Listen
                      </button>
                    )}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 text-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-100 p-4 rounded-2xl text-xs text-slate-500 italic">
                AI Pharmacist is reviewing clinical pharmacology records...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2">
          {(suggestedPrompts[language] || suggestedPrompts.en).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] bg-white hover:bg-teal-50 hover:border-teal-300 text-slate-700 hover:text-teal-900 px-3 py-1 rounded-full border border-slate-200 font-medium transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                language === 'kn'
                  ? 'ಕನ್ನಡದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಕೇಳಿ...'
                  : language === 'hi'
                  ? 'हिंदी में अपना सवाल पूछें...'
                  : 'Ask about medicines, dosage, active ingredients, or food interactions...'
              }
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
