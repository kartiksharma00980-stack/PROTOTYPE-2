import React, { useState } from 'react';
import { ChatMessage, KnowledgeChunk, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { SourceCards } from './SourceCards';
import { Copy, Check, User, Bot, AlertCircle, Sparkles } from 'lucide-react';

interface ChatMessageViewProps {
  message: ChatMessage;
  language: Language;
  onSelectChunk?: (chunk: KnowledgeChunk) => void;
}

export const ChatMessageView: React.FC<ChatMessageViewProps> = ({
  message,
  language,
  onSelectChunk,
}) => {
  const t = TRANSLATIONS[language];
  const [copied, setCopied] = useState(false);
  const [activeCitation, setActiveCitation] = useState<number | null>(null);

  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCitationClick = (citationNum: number) => {
    setActiveCitation(citationNum);
    const element = document.getElementById(`citation-card-${citationNum}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      // Temporary highlight
      setTimeout(() => setActiveCitation(null), 3000);
    }
  };

  // Render text with interactive [1], [2] citation links
  const renderFormattedText = (text: string) => {
    // Split by citation brackets like [1], [2], [3]
    const parts = text.split(/(\[\d+\])/g);

    return parts.map((part, i) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        const citationNum = parseInt(match[1], 10);
        return (
          <button
            key={i}
            onClick={() => handleCitationClick(citationNum)}
            className="inline-flex items-center justify-center font-mono font-bold text-[11px] px-1.5 py-0.2 mx-0.5 rounded bg-[#1A3B2B] text-[#FAF7EE] hover:bg-[#2F5E45] hover:scale-105 transition-all shadow-xs cursor-pointer align-baseline"
            title={`View Source [${citationNum}]`}
          >
            [{citationNum}]
          </button>
        );
      }

      // Check for paragraph breaks
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 px-2 sm:px-0">
        <div className="max-w-[85%] sm:max-w-2xl bg-[#1A3B2B] text-[#FAF7EE] rounded-2xl rounded-br-xs p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 text-xs text-[#AFC7B9] font-medium">
            <User className="w-3.5 h-3.5" />
            <span>Question / प्रश्न</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  const isNotFound = message.foundInSources === false ||
    message.text.toLowerCase().includes('not found in the available sources') ||
    message.text.includes('उपलब्ध स्रोतों में यह जानकारी नहीं मिली');

  return (
    <div className="flex justify-start my-5 px-2 sm:px-0">
      <div className="w-full max-w-4xl bg-white border border-[#E3DCCE] rounded-2xl rounded-bl-xs p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-sm">
        {/* Assistant Header */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#F0ECE1]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EBF3EE] border border-[#C5DDD0] flex items-center justify-center text-[#1A3B2B]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#1A3B2B] uppercase tracking-wider font-serif">
                IP-SAKTI Sahayak
              </span>
              <span className="text-[11px] text-[#6E8175] ml-2">
                • Grounded Answer
              </span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-[#52695C] hover:text-[#1A3B2B] px-2.5 py-1 rounded-md hover:bg-[#F2EFE8] transition-colors"
            title="Copy answer to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t.copyAnswer}</span>
              </>
            )}
          </button>
        </div>

        {/* Not Found Banner */}
        {isNotFound && (
          <div className="mb-3.5 p-3 rounded-xl bg-[#FFF9E6] border border-[#F2D786] flex items-start gap-2.5 text-xs text-[#7A5B10]">
            <AlertCircle className="w-4 h-4 text-[#C29B38] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t.notFoundNotice}</p>
              <p className="text-[11px] text-[#8C6D1F] mt-0.5">
                The strict grounding model could not locate this fact in the 5 retrieved passages. Try uploading additional Ayush/TKDL guidelines or refining your search terms.
              </p>
            </div>
          </div>
        )}

        {/* Response Body */}
        <div className="text-sm sm:text-[15px] leading-relaxed text-[#223328] space-y-3 font-normal">
          {renderFormattedText(message.text)}
        </div>

        {/* Expandable Source Cards under each answer */}
        {message.retrievedChunks && message.retrievedChunks.length > 0 && (
          <SourceCards
            chunks={message.retrievedChunks}
            usedCitations={message.usedCitations}
            language={language}
            activeCitation={activeCitation}
            onSelectChunk={onSelectChunk}
          />
        )}
      </div>
    </div>
  );
};
