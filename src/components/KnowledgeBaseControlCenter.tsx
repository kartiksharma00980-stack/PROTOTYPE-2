import React, { useState } from 'react';
import { DocumentCategory, DocumentMetadata, DocumentSource, KnowledgeChunk, Language } from '../types';
import { KNOWLEDGE_BASE_CATEGORIES } from '../data/categories';
import { exportKnowledgeBaseAsJSON, parseImportedDatabase } from '../utils/dbStorage';
import {
  X,
  Database,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  RefreshCw,
  FolderOpen,
  Folder,
  Download,
  Upload,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  HardDrive,
  Info,
} from 'lucide-react';

interface KnowledgeBaseControlCenterProps {
  isOpen: boolean;
  documents: DocumentSource[];
  chunks: KnowledgeChunk[];
  language: Language;
  onClose: () => void;
  onOpenUploadModal: () => void;
  onEditMetadata: (doc: DocumentSource) => void;
  onToggleActiveForRag: (docId: string) => void;
  onReindexDocument: (docId: string) => void;
  onDeleteDocument: (docId: string) => void;
  onInspectDocument: (doc: DocumentSource) => void;
  onRestoreDefaults: () => void;
  onImportDatabase: (importedDocs: DocumentSource[], importedChunks: KnowledgeChunk[]) => void;
}

export const KnowledgeBaseControlCenter: React.FC<KnowledgeBaseControlCenterProps> = ({
  isOpen,
  documents,
  chunks,
  language,
  onClose,
  onOpenUploadModal,
  onEditMetadata,
  onToggleActiveForRag,
  onReindexDocument,
  onDeleteDocument,
  onInspectDocument,
  onRestoreDefaults,
  onImportDatabase,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  if (!isOpen) return null;

  // Compute status stats
  const totalDocs = documents.length;
  const indexedDocs = documents.filter((d) => d.status === 'indexed').length;
  const pendingDocs = documents.filter((d) => d.status === 'pending').length;
  const failedDocs = documents.filter((d) => d.status === 'failed').length;
  const activeRagDocs = documents.filter((d) => d.isActiveForRag).length;

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.metadata?.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && doc.isActiveForRag) ||
      (statusFilter === 'inactive' && !doc.isActiveForRag);

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      doc.name.toLowerCase().includes(q) ||
      (doc.metadata?.title || '').toLowerCase().includes(q) ||
      (doc.metadata?.authority || '').toLowerCase().includes(q) ||
      (doc.metadata?.category || '').toLowerCase().includes(q);

    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Category counts
  const categoryCounts: Record<string, number> = {};
  KNOWLEDGE_BASE_CATEGORIES.forEach((c) => {
    categoryCounts[c.id] = documents.filter((d) => d.metadata?.category === c.id).length;
  });

  const handleExport = () => {
    exportKnowledgeBaseAsJSON(documents, chunks);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const { documents: importedDocs, chunks: importedChunks } = parseImportedDatabase(content);
        onImportDatabase(importedDocs, importedChunks);
        alert(`Successfully imported ${importedDocs.length} documents and ${importedChunks.length} chunks!`);
      } catch (err: any) {
        console.error('Import error:', err);
        alert(`Import failed: ${err?.message || 'Invalid database JSON file.'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F2] border border-[#DDD3BF] rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-[#243329]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E0D8C8] bg-[#EDE8DC] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E5A44] text-[#FAF7EE] flex items-center justify-center shadow-inner shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#80D2A4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#1A3B2B] font-serif">
                  Approved Knowledge Base & Source Control
                </h3>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2E5A44] text-[#FAF7EE]">
                  Manual Control Active
                </span>
              </div>
              <p className="text-xs text-[#63776B]">
                Only personally uploaded & approved documents are indexed and made available for RAG
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenUploadModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#2E5A44] hover:bg-[#1A3B2B] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Official Document</span>
              <span className="sm:hidden">Add</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#63776B] hover:text-[#1A3B2B] hover:bg-[#DDD3BF] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Dashboard Banner */}
        <div className="p-3 sm:p-4 bg-[#F2EDE1] border-b border-[#E0D8C8]">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-2.5 rounded-xl bg-white border border-[#DDD3BF]">
              <span className="text-[10px] uppercase font-bold text-[#697E72] block">Total Documents</span>
              <span className="text-lg font-bold text-[#1A3B2B] font-mono">{totalDocs}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#DDD3BF]">
              <span className="text-[10px] uppercase font-bold text-[#2E5A44] block">Active for RAG</span>
              <span className="text-lg font-bold text-[#2E5A44] font-mono">{activeRagDocs} / {totalDocs}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#DDD3BF]">
              <span className="text-[10px] uppercase font-bold text-[#697E72] block">Total Chunks</span>
              <span className="text-lg font-bold text-[#1A3B2B] font-mono">{chunks.length}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#DDD3BF]">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Status: Indexed</span>
              <span className="text-lg font-bold text-emerald-800 font-mono">{indexedDocs}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#DDD3BF] col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-[#697E72] block">External Web Scrape</span>
              <span className="text-xs font-bold text-rose-700 block mt-1">Blocked (Strict)</span>
            </div>
          </div>
        </div>

        {/* Main Body: Two Columns (Left Folder Tree, Right Document Table) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Category Folder Structure */}
          <div className="w-full md:w-64 bg-[#F7F4EC] border-b md:border-b-0 md:border-r border-[#E0D8C8] p-3 overflow-y-auto flex md:flex-col gap-1 text-xs shrink-0">
            <div className="hidden md:flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[#55695C] uppercase tracking-wider">
              <span>Folder Categories</span>
              <FolderOpen className="w-3.5 h-3.5 text-[#2E5A44]" />
            </div>

            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-[#2E5A44] text-[#FAF7EE] font-semibold'
                  : 'text-[#2C3E32] hover:bg-[#EAE4D7]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>📁</span>
                <span>All Categories</span>
              </span>
              <span className="font-mono text-[10px] opacity-80">{totalDocs}</span>
            </button>

            {KNOWLEDGE_BASE_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#2E5A44] text-[#FAF7EE] font-semibold'
                      : 'text-[#2C3E32] hover:bg-[#EAE4D7]'
                  }`}
                  title={cat.folder}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : count > 0 ? 'bg-[#E3DCce] text-[#2E5A44] font-bold' : 'opacity-40'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Quick Actions in Left Sidebar */}
            <div className="hidden md:block pt-4 mt-auto border-t border-[#E0D8C8] space-y-1.5">
              <button
                onClick={handleExport}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD3BF] text-[#1A3B2B] hover:bg-[#EDE8DC] flex items-center gap-1.5 font-medium"
              >
                <Download className="w-3.5 h-3.5 text-[#2E5A44]" />
                <span>Export Knowledge Base</span>
              </button>

              <label className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD3BF] text-[#1A3B2B] hover:bg-[#EDE8DC] flex items-center gap-1.5 font-medium cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#2E5A44]" />
                <span>Import Knowledge Base</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              <button
                onClick={() => {
                  if (window.confirm('Reset Knowledge Base to default Ayush & TKDL documents?')) {
                    onRestoreDefaults();
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-[#8C6D1F] hover:bg-[#FFF9E6] flex items-center gap-1.5 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restore Default Documents</span>
              </button>
            </div>
          </div>

          {/* Right Column: Search & Document Table */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF8F2]">
            {/* Search & Status Filters */}
            <div className="p-3 bg-[#F2EDE1] border-b border-[#E0D8C8] flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-4 h-4 text-[#7D9183] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Knowledge Base by title, authority, or keywords..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] placeholder-[#8A9E91] focus:border-[#2E5A44] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#63776B] font-medium hidden sm:inline">RAG Filter:</span>
                <div className="bg-white border border-[#DDD3BF] rounded-lg p-0.5 flex">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      statusFilter === 'all' ? 'bg-[#2E5A44] text-white' : 'text-[#63776B]'
                    }`}
                  >
                    All ({documents.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      statusFilter === 'active' ? 'bg-[#2E5A44] text-white' : 'text-[#63776B]'
                    }`}
                  >
                    Active for RAG ({activeRagDocs})
                  </button>
                  <button
                    onClick={() => setStatusFilter('inactive')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      statusFilter === 'inactive' ? 'bg-[#2E5A44] text-white' : 'text-[#63776B]'
                    }`}
                  >
                    Paused ({totalDocs - activeRagDocs})
                  </button>
                </div>
              </div>
            </div>

            {/* Document Cards List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredDocs.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <Folder className="w-10 h-10 text-[#C2B7A0] mx-auto" />
                  <p className="text-sm font-semibold text-[#1A3B2B]">
                    No approved documents found in this view.
                  </p>
                  <p className="text-xs text-[#63776B] max-w-sm mx-auto">
                    Upload your official PDF documents or change category filter to populate your Knowledge Base.
                  </p>
                  <button
                    onClick={onOpenUploadModal}
                    className="px-4 py-2 rounded-xl bg-[#2E5A44] hover:bg-[#1A3B2B] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Official Document</span>
                  </button>
                </div>
              ) : (
                filteredDocs.map((doc) => {
                  const catInfo = KNOWLEDGE_BASE_CATEGORIES.find((c) => c.id === doc.metadata?.category);
                  const isIndexed = doc.status === 'indexed';

                  return (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-2xl bg-white border transition-all shadow-2xs ${
                        doc.isActiveForRag
                          ? 'border-[#D1DEC8] hover:border-[#2E5A44]'
                          : 'border-[#E5DFD3] opacity-75 bg-[#FAF9F6]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        {/* Document Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#EBF3EE] text-[#1E5235]">
                              <span>{catInfo?.icon || '📜'}</span>
                              <span>{catInfo?.name || doc.metadata?.category}</span>
                            </span>

                            <span className="text-[11px] font-mono text-[#697E72] bg-[#F2EDE1] px-2 py-0.5 rounded-md">
                              {catInfo?.folder || `knowledge_base/${doc.metadata?.category}/`}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                isIndexed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : doc.status === 'failed'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {doc.status}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-[#1A3B2B] leading-snug">
                            {doc.metadata?.title || doc.name}
                          </h4>

                          <div className="flex items-center gap-3 text-xs text-[#526559] mt-1.5 flex-wrap">
                            <span className="font-semibold text-[#1C2E22]">
                              🏛️ {doc.metadata?.authority || 'Official Authority'}
                            </span>
                            <span>•</span>
                            <span>{doc.metadata?.jurisdiction || 'India'}</span>
                            <span>•</span>
                            <span>{doc.pageCount} Pages</span>
                            <span>•</span>
                            <span className="font-mono text-[#2E5A44] font-semibold">{doc.chunkCount} Chunks</span>
                            {doc.metadata?.publicationDate && (
                              <>
                                <span>•</span>
                                <span>Published: {doc.metadata.publicationDate}</span>
                              </>
                            )}
                          </div>

                          {doc.metadata?.officialSourceUrl && (
                            <div className="mt-1.5">
                              <a
                                href={doc.metadata.officialSourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-[#2E5A44] hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>{doc.metadata.officialSourceUrl}</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Controls & Actions */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EDE8DC]">
                          {/* Active for RAG Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-[#44594C]">
                              {doc.isActiveForRag ? 'Active for RAG' : 'Paused in RAG'}
                            </span>
                            <button
                              onClick={() => onToggleActiveForRag(doc.id)}
                              className="text-[#2E5A44] hover:scale-105 transition-all"
                              title={doc.isActiveForRag ? 'Click to exclude from RAG search' : 'Click to include in RAG search'}
                            >
                              {doc.isActiveForRag ? (
                                <ToggleRight className="w-7 h-7 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <ToggleLeft className="w-7 h-7 text-gray-400" />
                              )}
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEditMetadata(doc)}
                              className="p-1.5 rounded-lg text-[#55695C] hover:text-[#1A3B2B] hover:bg-[#EAE4D7] transition-colors"
                              title="Edit metadata"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onInspectDocument(doc)}
                              className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[#2E5A44] bg-[#EBF3EE] hover:bg-[#D8EADB] transition-colors"
                              title="Inspect extracted chunks"
                            >
                              Chunks
                            </button>

                            <button
                              onClick={() => onReindexDocument(doc.id)}
                              className="p-1.5 rounded-lg text-[#55695C] hover:text-[#1A3B2B] hover:bg-[#EAE4D7] transition-colors"
                              title="Re-index document"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Remove "${doc.name}" from your active Knowledge Base?`)) {
                                  onDeleteDocument(doc.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-[#EDE8DC] border-t border-[#E0D8C8] flex flex-wrap items-center justify-between text-xs text-[#63776B] gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#2E5A44]" />
            <span>
              All data is strictly held in your browser's persistent database (IndexedDB). No unapproved external sources enter RAG.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2E5A44] text-white hover:bg-[#1A3B2B] font-semibold transition-colors"
          >
            Close Control Center
          </button>
        </div>
      </div>
    </div>
  );
};
