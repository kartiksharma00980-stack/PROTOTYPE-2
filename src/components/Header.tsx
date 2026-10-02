import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  AlertTriangle,
  ShieldCheck,
  Mic,
} from 'lucide-react';

interface HeaderProps {
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  totalDocs: number;
  totalChunks: number;
  onOpenVoiceModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  totalDocs,
  onOpenVoiceModal,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="bg-[#1A3B2B] text-white border-b border-[#2D533E] sticky top-0 z-30 shadow-md">
      {/* Top Disclaimer Banner */}
      <div className="bg-[#132A1F] border-b border-[#254A37] px-4 py-1.5 text-xs text-[#C5D8CD] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 max-w-4xl">
          <AlertTriangle className="w-3.5 h-3.5 text-[#E6C364] shrink-0" />
          <span className="font-medium text-[#E6C364]">{t.disclaimerShort}</span>
          <span className="hidden sm:inline text-[#A7C2B2]">• {t.disclaimerLong}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#A7C2B2]">
          <span className="inline-flex items-center gap-1 bg-[#1E3F2E] px-2 py-0.5 rounded text-[#D8EADB]">
            <ShieldCheck className="w-3 h-3 text-[#79C99E]" />
            Strict Grounding
          </span>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#2D5A42] to-[#143022] border border-[#44765A] flex items-center justify-center shadow-inner shrink-0">
            <span className="text-lg sm:text-xl">🌿</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#FAF7EE] font-serif">
                {t.appTitle}
              </h1>
              <span className="hidden md:inline-flex items-center text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#27533B] text-[#D4E8DC] border border-[#3E6F54]">
                Ayurveda & TKDL
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#AFC7B9] line-clamp-1">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right Controls: Live Voice Mode & Language Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Read-Only Verified Knowledge Base Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142D21] border border-[#2B543E] text-xs text-[#A8C7B6]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Official Knowledge Base</span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-[#1C3D2D] text-[10px] font-mono text-[#80D2A4]">
              {totalDocs} Acts
            </span>
          </div>

          {/* Live Voice Button */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-semibold shadow-sm transition-all border border-emerald-500/30 group cursor-pointer"
            title="Start Live Voice Conversation with Gemini 3.8 Live"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <Mic className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">{t.startVoice}</span>
            <span className="sm:hidden">Voice</span>
          </button>

          {/* Language Toggle Button */}
          <div className="flex items-center bg-[#132A1F] border border-[#2D533E] rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => onToggleLanguage('en')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-[#2E5A44] text-[#FAF7EE] shadow-sm'
                  : 'text-[#9CB7A8] hover:text-[#FAF7EE]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onToggleLanguage('hi')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'hi'
                  ? 'bg-[#2E5A44] text-[#FAF7EE] shadow-sm'
                  : 'text-[#9CB7A8] hover:text-[#FAF7EE]'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
