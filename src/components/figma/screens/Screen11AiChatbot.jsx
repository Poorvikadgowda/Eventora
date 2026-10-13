import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { askChatbot } from '../../../services/api';

export const Screen11AiChatbot = () => {
  const { setFigmaScreen, language, setLanguage, notify } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello Rahul! I can explain your prescribed medicines in simple language, check drug interactions, and verify CDSCO bioequivalence. How can I assist you?',
      time: '10:14 AM'
    },
    {
      id: 2,
      sender: 'user',
      text: 'Is Jan Aushadhi generic Amoxicillin as effective as Augmentin 625 Duo?',
      time: '10:15 AM'
    },
    {
      id: 3,
      sender: 'bot',
      text: 'Yes! Both contain the exact same Active Pharmaceutical Ingredients (500mg Amoxicillin + 125mg Clavulanic Acid). Under CDSCO rules, Jan Aushadhi generics undergo strict bioequivalence testing showing identical blood absorption rates (80-125% AUC CI). It cures your infection with identical efficacy for ₹42.50 instead of ₹201.27.',
      time: '10:15 AM'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const quickChips = [
    'Are generics really safe?',
    'Take with food or empty stomach?',
    'Explain in Kannada (ಕನ್ನಡ)',
    'Common side effects'
  ];

  const handleSendMessage = async (customText) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const resp = await askChatbot(textToSend, [], language);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: resp.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'All CDSCO approved generic drugs possess verified therapeutic equivalence to brand drugs, ensuring maximum patient safety and savings.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F4F9F7]">
      
      {/* Top Header with Back Arrow & Language Toggle */}
      <div className="px-4 py-3 bg-white border-b border-[#E2ECE7] flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFigmaScreen(3)}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-sm"
          >
            ←
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight flex items-center space-x-1.5">
              <span>AI Pharmacist</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-500">
              Pharmacology Explainer • Online
            </p>
          </div>
        </div>

        {/* Multilingual Voice Direct Jump */}
        <button
          onClick={() => setFigmaScreen(16)}
          className="text-[10px] font-bold text-[#00796B] bg-[#E0F2F1] hover:bg-[#b2dfdb] px-2.5 py-1 rounded-full border border-teal-200 flex items-center space-x-1 transition-colors"
        >
          <span>🎙️</span>
          <span>Voice Mode</span>
        </button>
      </div>

      {/* Chat Messages Body (Scrollable) */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-end space-x-2 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-[#00796B] text-white flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
                🤖
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                m.sender === 'user'
                  ? 'bg-[#00796B] text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-[#E2ECE7] rounded-bl-none leading-relaxed'
              }`}
            >
              <p>{m.text}</p>
              <span
                className={`block text-[9px] mt-1 text-right ${
                  m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                }`}
              >
                {m.time}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <div className="w-6 h-6 rounded-full bg-slate-200 animate-pulse" />
            <span className="italic">AI Pharmacist is analyzing molecule...</span>
          </div>
        )}
      </div>

      {/* Quick Suggestion Chips (Figma Screen 11) */}
      <div className="px-3 py-1.5 bg-white/70 backdrop-blur-sm border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto text-[10px]">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-[#E0F2F1] hover:text-[#00796B] text-slate-700 whitespace-nowrap transition-colors border border-slate-200/80 font-medium"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Box Row */}
      <div className="p-3 bg-white border-t border-[#E2ECE7]">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask medicine questions in EN, KN, HI..."
            className="flex-1 text-xs px-3.5 py-2.5 rounded-full bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00796B]/40 focus:border-[#00796B] text-slate-800"
          />
          <button
            onClick={() => handleSendMessage()}
            className="w-9 h-9 rounded-full bg-[#00796B] hover:bg-[#004D40] text-white flex items-center justify-center text-xs shadow-md shadow-teal-800/20 active:scale-95 transition-all"
          >
            ➔
          </button>
        </div>
      </div>

    </div>
  );
};
