import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { textToSpeech, askChatbot } from '../../../services/api';

export const Screen16MultilingualVoice = () => {
  const { setFigmaScreen, language, setLanguage, notify } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLang, setSelectedLang] = useState(language || 'kn');
  const [currentText, setCurrentText] = useState(
    'ಜನೌಷಧಿ ಜೆನೆರಿಕ್ ಔಷಧಿಗಳು ಬ್ರ್ಯಾಂಡೆಡ್ ಔಷಧಿಗಳಂತೆಯೇ ಅದೇ ಸಕ್ರಿಯ ಅಣು ಮತ್ತು ಶಕ್ತಿಯನ್ನು ಹೊಂದಿರುತ್ತವೆ. ಇವು CDSCO ನಿಂದ ಪ್ರಮಾಣೀಕರಿಸಲ್ಪಟ್ಟಿವೆ.'
  );

  const langPresets = {
    kn: {
      label: 'ಕನ್ನಡ (Kannada)',
      sampleQuery: 'ಜನೌಷಧಿ ಔಷಧಿಗಳು ಸುರಕ್ಷಿತವೇ?',
      response: 'ಹೌದು! ಜನೌಷಧಿ ಜೆನೆರಿಕ್ ಔಷಧಿಗಳು ಬ್ರ್ಯಾಂಡೆಡ್ ಔಷಧಿಗಳಂತೆಯೇ ಅದೇ ಸಕ್ರಿಯ ಅಣು (Active Molecule) ಮತ್ತು ಶಕ್ತಿಯನ್ನು ಹೊಂದಿರುತ್ತವೆ. ಇವು CDSCO ನಿಂದ ಪ್ರಮಾಣೀಕರಿಸಲ್ಪಟ್ಟಿವೆ ಮತ್ತು ಶೇಕಡಾ 80% ರಷ್ಟು ಹಣವನ್ನು ಉಳಿಸುತ್ತವೆ.',
      voiceLocale: 'kn-IN'
    },
    hi: {
      label: 'हिन्दी (Hindi)',
      sampleQuery: 'क्या जन औषधि दवाएं सुरक्षित हैं?',
      response: 'जी हाँ! जन औषधि जेनेरिक दवाओं में वही एक्टिव सॉल्ट (API) और असर होता है। यह CDSCO प्रमाणित हैं और आपको 80% तक बचत कराती हैं।',
      voiceLocale: 'hi-IN'
    },
    en: {
      label: 'English',
      sampleQuery: 'Are generic medicines bioequivalent?',
      response: 'Yes! Certified generic medicines contain the exact same active pharmaceutical molecule, dosage form, and therapeutic efficacy as branded counterparts.',
      voiceLocale: 'en-US'
    }
  };

  const handleLangChange = (code) => {
    setSelectedLang(code);
    setLanguage(code);
    setCurrentText(langPresets[code].response);
  };

  const handlePlayVoice = async () => {
    setIsPlaying(true);

    // Try HTML5 Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentText);
      utterance.lang = langPresets[selectedLang].voiceLocale;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      notify(`Playing spoken audio in ${langPresets[selectedLang].label}`, 'info');
    } else {
      // Backend gTTS fallback
      try {
        const ttsResp = await textToSpeech(currentText, selectedLang);
        if (ttsResp.audio_base64) {
          const audio = new Audio(ttsResp.audio_base64);
          audio.play();
          audio.onended = () => setIsPlaying(false);
        }
      } catch (err) {
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="px-4 py-4 space-y-4 bg-[#F4F9F7]">
      
      {/* Top Header with Back Arrow */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setFigmaScreen(11)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 shadow-sm"
        >
          ←
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            Multilingual Voice
          </h2>
          <p className="text-[11px] text-slate-500">
            Spoken AI Pharmacology in Local Languages
          </p>
        </div>
      </div>

      {/* Language Selector Pills (Matching Figma Screen 16) */}
      <div className="flex items-center space-x-2 text-xs font-bold">
        {Object.entries(langPresets).map(([code, item]) => (
          <button
            key={code}
            onClick={() => handleLangChange(code)}
            className={`flex-1 py-2 rounded-2xl transition-all shadow-sm ${
              selectedLang === code
                ? 'bg-[#00796B] text-white'
                : 'bg-white text-slate-700 border border-[#E2ECE7] hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Spoken Voice Visualizer Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E2ECE7] shadow-sm text-center space-y-4">
        
        {/* Animated Mic Sphere */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          {isPlaying && (
            <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
          )}
          <button
            onClick={handlePlayVoice}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl text-white shadow-xl transition-all active:scale-95 ${
              isPlaying ? 'bg-emerald-600 scale-105' : 'bg-[#00796B] hover:bg-[#004D40]'
            }`}
          >
            {isPlaying ? '🔊' : '🎙️'}
          </button>
        </div>

        {/* Audio Waveform Bars Simulation */}
        <div className="flex justify-center items-center space-x-1.5 h-8">
          {[12, 24, 36, 18, 28, 42, 20, 32, 16, 26].map((h, i) => (
            <div
              key={i}
              className={`w-1.5 bg-[#00796B] rounded-full transition-all duration-300 ${
                isPlaying ? 'animate-pulse' : 'opacity-40'
              }`}
              style={{ height: isPlaying ? `${Math.max(8, (h * Math.random()).toFixed(0))}px` : '8px' }}
            />
          ))}
        </div>

        <span className="text-[11px] font-bold text-slate-700 block">
          {isPlaying ? 'Playing Audio Speech...' : 'Tap to Listen in ' + langPresets[selectedLang].label}
        </span>
      </div>

      {/* Vernacular Speech Content Box */}
      <div className="bg-white rounded-3xl p-4 border border-[#E2ECE7] shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-800">
          <span>Clinical Answer in Vernacular</span>
          <button
            onClick={handlePlayVoice}
            className="text-[10px] font-bold text-[#00796B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
          >
            ▶ Replay Audio
          </button>
        </div>

        <div className="bg-[#F4F9F7] rounded-2xl p-3 border border-[#E2ECE7] text-xs text-slate-800 leading-relaxed font-medium">
          {currentText}
        </div>

        <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
          <span>🛡️</span>
          <span>Validated by Indian Pharmacopoeia & CDSCO Generic Formularies</span>
        </div>
      </div>

      {/* Return to Chat or Home */}
      <button
        onClick={() => setFigmaScreen(11)}
        className="w-full py-3 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#00796B] border border-emerald-200 font-bold text-xs transition-colors flex items-center justify-center space-x-1"
      >
        <span>💬 Return to Text Chat Assistant</span>
      </button>

    </div>
  );
};
