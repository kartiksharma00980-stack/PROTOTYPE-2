import React, { useState } from 'react';
import { DocumentSource, KnowledgeChunk, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { X, Search, FileText, Hash, Layers } from 'lucide-react';

interface ChunksModalProps {
  document: DocumentSource | null;
  chunks: KnowledgeChunk[];
  language: Language;
  onClose: () => void;
}

export const ChunksModal: React.FC<ChunksModalProps> = ({
  document,
  chunks,
  language,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const [filterText, setFilterText] = useState('');

  if (!document) return null;

  const docChunks = chunks.filter((c) => c.docId === document.id);
  const filteredChunks = docChunks.filter(
    (c) =>
      c.text.toLowerCase().includes(filterText.toLowerCase()) ||
      c.pageNumber.toString().includes(filterText)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F2] border border-[#DDD3BF] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E0D8C8] bg-[#EDE8DC] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#2E5A44] text-[#FAF7EE] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#1A3B2B] truncate font-serif">
                {document.name}
              </h3>
              <div className="flex items-center gap-3 text-xs text-[#63776B] mt-0.5">
                <span>
                  {document.pageCount} {t.pages}
                </span>
                <span>•</span>
                <span className="font-semibold text-[#2E5A44]">
                  {docChunks.length} {t.chunks} (~1000 chars each)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#63776B] hover:text-[#1A3B2B] hover:bg-[#DDD3BF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-3 bg-[#F2EDE1] border-b border-[#E0D8C8] flex items-center gap-2">
          <Search className="w-4 h-4 text-[#7A8E81] ml-1 shrink-0" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search chunks by keyword or page number..."
            className="w-full bg-transparent text-xs sm:text-sm text-[#1A3B2B] placeholder-[#8C9E93] focus:outline-hidden"
          />
          {filterText && (
            <button
              onClick={() => setFilterText('')}
              className="text-xs text-[#7A8E81] hover:text-[#1A3B2B] px-1.5"
            >
              Clear
            </button>
          )}
        </div>

        {/* Chunks List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#FAF8F2]">
          {filteredChunks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7B6E57]">
              No chunks match your search query.
            </div>
          ) : (
            filteredChunks.map((chunk, idx) => (
              <div
                key={chunk.id || idx}
                className="p-4 rounded-xl bg-white border border-[#E3DCCE] shadow-2xs hover:border-[#2E5A44] transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#F0ECE1]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#EBF3EE] text-[#1A3B2B]">
                      Chunk #{chunk.chunkIndex + 1}
                    </span>
                    <span className="text-xs font-medium text-[#544B36] bg-[#EFEBE1] px-2 py-0.5 rounded">
                      {t.pageLabel} {chunk.pageNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#788C80] font-mono">
                    <Hash className="w-3 h-3" />
                    <span>{chunk.charCount} characters</span>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] leading-relaxed text-[#2C3E32] font-mono whitespace-pre-wrap bg-[#FAF9F6] p-3 rounded-lg border border-[#EDE8DC]">
                  {chunk.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#EDE8DC] border-t border-[#E0D8C8] flex justify-between items-center text-xs text-[#63776B]">
          <span>
            Showing {filteredChunks.length} of {docChunks.length} chunks
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2E5A44] text-white hover:bg-[#1A3B2B] font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
