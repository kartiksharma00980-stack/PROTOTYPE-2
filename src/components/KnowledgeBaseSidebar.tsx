import React from 'react';
import { DocumentSource, Language } from '../types';
import { TRANSLATIONS, EXAMPLE_QUESTIONS } from '../data/translations';
import { KNOWLEDGE_BASE_CATEGORIES } from '../data/categories';
import {
  FileText,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Layers,
  X,
  FileCheck,
  BookOpen,
} from 'lucide-react';

interface KnowledgeBaseSidebarProps {
  documents: DocumentSource[];
  totalChunks: number;
  language: Language;
  onSelectExampleQuestion: (question: string) => void;
  onInspectDocument: (doc: DocumentSource) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const KnowledgeBaseSidebar: React.FC<KnowledgeBaseSidebarProps> = ({
  documents,
  totalChunks,
  language,
  onSelectExampleQuestion,
  onInspectDocument,
  isOpenMobile,
  onCloseMobile,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-80 sm:w-88 bg-[#F5F2EB] border-r border-[#E0D8C8] flex flex-col h-full transform transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#E0D8C8] bg-[#EDE8DC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2E5A44] text-[#FAF7EE] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#80D2A4]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A3B2B] uppercase tracking-wide">
                Official Knowledge Base
              </h2>
              <p className="text-[11px] text-[#63776B]">Verified Acts, Guidelines & Treaties</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-[#547361] hover:text-[#1A3B2B] lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Informational Verification Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1E3F2E] to-[#142C20] text-[#FAF7EE] shadow-sm border border-[#3E6F54] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#80D2A4] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Strict Grounding</span>
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-mono text-[#D8EADB]">
                {documents.length} Official Sources
              </span>
            </div>

            <p className="text-xs text-[#C5DCD0] leading-snug">
              Every answer is strictly cited from authoritative statutory guidelines and TKDL prior art.
            </p>
          </div>

          {/* Approved Official Acts List (Read-Only Reference) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1A3B2B] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#2E5A44]" />
                <span>Active Statutes & Guidelines</span>
              </span>
              <span className="text-[11px] font-mono text-[#2E5A44] font-semibold">
                {totalChunks} {t.chunks}
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {documents.map((doc) => {
                const catInfo = KNOWLEDGE_BASE_CATEGORIES.find((c) => c.id === doc.metadata?.category);

                return (
                  <div
                    key={doc.id}
                    onClick={() => onInspectDocument(doc)}
                    className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#DDD3BF] hover:border-[#2E5A44] hover:bg-[#F2EFE7] transition-all cursor-pointer group"
                    title="Click to view statutory excerpts"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-base mt-0.5 shrink-0">{catInfo?.icon || '📜'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#1A3B2B] group-hover:text-[#2E5A44] transition-colors line-clamp-2">
                          {doc.metadata?.title || doc.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#697E72] mt-1 flex-wrap">
                          <span className="font-medium text-[#2E5A44]">
                            {catInfo?.name || doc.metadata?.category}
                          </span>
                          <span>•</span>
                          <span>{doc.pageCount} pgs</span>
                          <span>•</span>
                          <span className="font-mono text-[#2E5A44] font-medium">{doc.chunkCount} chk</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggested Questions Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1A3B2B] uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#C29B38]" />
                <span>{t.exampleQuestionsTitle}</span>
              </span>
            </div>

            <div className="space-y-1.5">
              {EXAMPLE_QUESTIONS.map((item, idx) => {
                const questionText = language === 'hi' ? item.textHi : item.textEn;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectExampleQuestion(questionText);
                      onCloseMobile();
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-[#FAF8F2] border border-[#DDD3BF] hover:border-[#2E5A44] hover:bg-[#F2EFE7] text-xs text-[#243329] leading-snug transition-all flex items-start justify-between gap-2 group cursor-pointer"
                  >
                    <span className="line-clamp-2">{questionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#889B8F] group-hover:text-[#2E5A44] group-hover:translate-x-0.5 shrink-0 mt-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E0D8C8] bg-[#EDE8DC] text-[11px] text-[#697E72] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-[#2E5A44]" />
            <span>Developer-Controlled Knowledge</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-800 font-bold">VERIFIED RAG</span>
        </div>
      </aside>
    </>
  );
};
