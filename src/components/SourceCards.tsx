import React, { useState } from 'react';
import { KnowledgeChunk, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { KNOWLEDGE_BASE_CATEGORIES } from '../data/categories';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building2,
  FolderOpen,
} from 'lucide-react';

interface SourceCardsProps {
  chunks: KnowledgeChunk[];
  usedCitations?: number[];
  language: Language;
  activeCitation?: number | null;
  onSelectChunk?: (chunk: KnowledgeChunk) => void;
}

export const SourceCards: React.FC<SourceCardsProps> = ({
  chunks,
  usedCitations = [],
  language,
  activeCitation,
  onSelectChunk,
}) => {
  const t = TRANSLATIONS[language];
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  if (!chunks || chunks.length === 0) return null;

  const toggleSnippet = (idx: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const expandAll = () => {
    const next: Record<number, boolean> = {};
    chunks.forEach((_, i) => (next[i] = true));
    setExpandedIndices(next);
  };

  const collapseAll = () => {
    setExpandedIndices({});
  };

  return (
    <div className="mt-4 pt-3.5 border-t border-[#E5DECD] text-[#243329]">
      {/* Header bar with Approved Knowledge Base confirmation */}
      <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
        <button
          onClick={() => setIsSectionOpen(!isSectionOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-[#1A3B2B] hover:text-[#2E5A44] transition-colors"
        >
          <span className="w-5 h-5 rounded-md bg-[#E8EFEA] text-[#1A3B2B] flex items-center justify-center font-mono text-[11px] font-bold">
            {chunks.length}
          </span>
          <span>{t.retrievedSourcesHeader}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Approved Knowledge Base
          </span>
          {isSectionOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#547361]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#547361]" />
          )}
        </button>

        {isSectionOpen && (
          <div className="flex items-center gap-2 text-[11px] text-[#547361]">
            <button
              onClick={expandAll}
              className="hover:text-[#1A3B2B] underline decoration-dotted"
            >
              Expand all
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="hover:text-[#1A3B2B] underline decoration-dotted"
            >
              Collapse all
            </button>
          </div>
        )}
      </div>

      {/* List of cards */}
      {isSectionOpen && (
        <div className="space-y-2 mt-2">
          {chunks.map((chunk, index) => {
            const citationNumber = index + 1;
            const isCited = usedCitations.includes(citationNumber);
            const isTargeted = activeCitation === citationNumber;
            const isExpanded = expandedIndices[index] ?? false;
            const catInfo = KNOWLEDGE_BASE_CATEGORIES.find((c) => c.id === chunk.category);

            return (
              <div
                key={chunk.id || index}
                id={`citation-card-${citationNumber}`}
                className={`rounded-xl border text-xs transition-all duration-200 ${
                  isTargeted
                    ? 'border-[#2E5A44] bg-[#F2F7F4] ring-2 ring-[#2E5A44]/30 shadow-sm'
                    : isCited
                    ? 'border-[#D2E0D8] bg-[#F8FAF8]'
                    : 'border-[#E8E3D5] bg-[#FCFBF8] opacity-90'
                }`}
              >
                {/* Card Header */}
                <div className="p-3 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2 py-0.5 rounded-md shrink-0 mt-0.5 ${
                        isCited
                          ? 'bg-[#1A3B2B] text-[#FAF7EE]'
                          : 'bg-[#E5ECE7] text-[#4A5D52]'
                      }`}
                    >
                      [{citationNumber}]
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <FileText className="w-3.5 h-3.5 text-[#446A55] shrink-0" />
                        <span className="font-bold text-[#1C2E22] truncate max-w-[280px] sm:max-w-md">
                          {chunk.docTitle}
                        </span>

                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#E7E2D5] text-[#554C37]">
                          {t.pageLabel} {chunk.pageNumber}
                        </span>

                        {chunk.category && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#EBF3EE] text-[#1E5235]">
                            <span>{catInfo?.icon || '📜'}</span>
                            <span>{catInfo?.name || chunk.category}</span>
                          </span>
                        )}

                        {isCited && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#D4EAD9] text-[#1B5731]">
                            <CheckCircle2 className="w-3 h-3" />
                            Cited
                          </span>
                        )}
                      </div>

                      {/* Authority & URL subline */}
                      <div className="flex items-center gap-2 text-[11px] text-[#63776B] flex-wrap">
                        {chunk.authority && (
                          <span>🏛️ {chunk.authority}</span>
                        )}
                        {chunk.officialSourceUrl && (
                          <a
                            href={chunk.officialSourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#2E5A44] hover:underline"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>Official Source</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onSelectChunk && (
                      <button
                        onClick={() => onSelectChunk(chunk)}
                        title="View chunk full view"
                        className="p-1 text-[#547361] hover:text-[#1A3B2B] hover:bg-[#E2EDE5] rounded transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleSnippet(index)}
                      className="px-2 py-1 text-[11px] font-semibold rounded-md text-[#2E5A44] hover:bg-[#E8EFEA] flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? t.closeSnippet : t.viewSnippet}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Excerpt Body */}
                {isExpanded ? (
                  <div className="px-3 pb-3 pt-1 border-t border-[#E5DECD]/60 bg-white/80 rounded-b-xl">
                    <p className="text-[12px] leading-relaxed text-[#2C3E32] font-mono whitespace-pre-wrap bg-[#FBF9F4] p-3 rounded-lg border border-[#EDE7D9]">
                      {chunk.text}
                    </p>
                  </div>
                ) : (
                  <div className="px-3 pb-2 text-[11px] text-[#5A6D61] line-clamp-2">
                    {chunk.text.slice(0, 160)}...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
