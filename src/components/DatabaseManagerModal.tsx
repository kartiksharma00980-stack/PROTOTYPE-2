import React, { useState } from 'react';
import { DocumentSource, KnowledgeChunk, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { chunkDocumentPages } from '../utils/chunker';
import { exportKnowledgeBaseAsJSON, parseImportedDatabase, clearPersistentDB } from '../utils/dbStorage';
import {
  X,
  Database,
  Upload,
  Download,
  PlusCircle,
  FileText,
  Trash2,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  HardDrive,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface DatabaseManagerModalProps {
  isOpen: boolean;
  documents: DocumentSource[];
  chunks: KnowledgeChunk[];
  language: Language;
  onClose: () => void;
  onUpdateDatabase: (newDocs: DocumentSource[], newChunks: KnowledgeChunk[]) => void;
  onRestoreDefaults: () => void;
  onInspectDocument: (doc: DocumentSource) => void;
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({
  isOpen,
  documents,
  chunks,
  language,
  onClose,
  onUpdateDatabase,
  onRestoreDefaults,
  onInspectDocument,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'how' | 'add' | 'export' | 'manage'>('how');

  // Custom Law / Amendment Form state
  const [customTitle, setCustomTitle] = useState('');
  const [customReference, setCustomReference] = useState('');
  const [customText, setCustomText] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddCustomLaw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customText.trim()) return;

    const docId = `custom-doc-${Date.now()}`;
    const pageText = `${customTitle.toUpperCase()}\nReference: ${customReference || 'Regulatory Update'}\n\n${customText.trim()}`;

    const newChunks = chunkDocumentPages(docId, customTitle.trim(), [
      { pageNumber: 1, text: pageText },
    ]);

    const newDoc: DocumentSource = {
      id: docId,
      name: `${customTitle.trim()}.txt`,
      size: new Blob([pageText]).size,
      type: 'txt',
      pageCount: 1,
      uploadedAt: Date.now(),
      chunkCount: newChunks.length,
      status: 'indexed',
      isActiveForRag: true,
      lastIndexedAt: Date.now(),
      description: customReference || 'Custom regulatory entry',
      metadata: {
        title: customTitle.trim(),
        authority: 'Official Regulatory Body',
        category: 'other',
        jurisdiction: 'India (National)',
        documentType: 'Circular',
        publicationDate: new Date().toISOString().slice(0, 10),
        notes: customReference || undefined,
      },
    };

    const updatedDocs = [...documents, newDoc];
    const updatedChunks = [...chunks, ...newChunks];

    onUpdateDatabase(updatedDocs, updatedChunks);

    setCustomTitle('');
    setCustomReference('');
    setCustomText('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  const handleExport = () => {
    exportKnowledgeBaseAsJSON(documents, chunks);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const { documents: importedDocs, chunks: importedChunks } = parseImportedDatabase(content);
        onUpdateDatabase(importedDocs, importedChunks);
        alert(`Successfully imported ${importedDocs.length} documents and ${importedChunks.length} chunks!`);
      } catch (err: any) {
        console.error('Import error:', err);
        setImportError(err?.message || 'Failed to parse database file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeleteDoc = (docId: string) => {
    const updatedDocs = documents.filter((d) => d.id !== docId);
    const updatedChunks = chunks.filter((c) => c.docId !== docId);
    onUpdateDatabase(updatedDocs, updatedChunks);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F2] border border-[#DDD3BF] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#243329]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#E0D8C8] bg-[#EDE8DC] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E5A44] text-[#FAF7EE] flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1A3B2B] font-serif">
                {t.dbManagerTitle}
              </h3>
              <p className="text-xs text-[#63776B]">{t.dbManagerSubtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#63776B] hover:text-[#1A3B2B] hover:bg-[#DDD3BF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E0D8C8] bg-[#F2EDE1] px-4 gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('how')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'how'
                ? 'border-[#2E5A44] text-[#1A3B2B] bg-[#FAF8F2] rounded-t-lg'
                : 'border-transparent text-[#697E72] hover:text-[#1A3B2B]'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#C29B38]" />
            <span>{t.howToUpdateTitle}</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'add'
                ? 'border-[#2E5A44] text-[#1A3B2B] bg-[#FAF8F2] rounded-t-lg'
                : 'border-transparent text-[#697E72] hover:text-[#1A3B2B]'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#2E5A44]" />
            <span>{t.addCustomTextTitle}</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'export'
                ? 'border-[#2E5A44] text-[#1A3B2B] bg-[#FAF8F2] rounded-t-lg'
                : 'border-transparent text-[#697E72] hover:text-[#1A3B2B]'
            }`}
          >
            <Download className="w-4 h-4 text-[#2E5A44]" />
            <span>Export & Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'manage'
                ? 'border-[#2E5A44] text-[#1A3B2B] bg-[#FAF8F2] rounded-t-lg'
                : 'border-transparent text-[#697E72] hover:text-[#1A3B2B]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#2E5A44]" />
            <span>All Documents ({documents.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FAF8F2]">
          {/* TAB 1: How to update the database */}
          {activeTab === 'how' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-[#1A3B2B] text-[#FAF7EE] rounded-2xl p-5 sm:p-6 border border-[#2D5A42]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#80D2A4] mb-2 uppercase tracking-wider">
                  <HardDrive className="w-4 h-4" />
                  <span>Persistent Browser Database (IndexedDB)</span>
                </div>
                <h4 className="text-lg font-bold mb-2 font-serif">
                  How the Knowledge Base Updates & Retains Data
                </h4>
                <p className="text-xs sm:text-sm text-[#C8DFD2] leading-relaxed">
                  All documents, guidelines, and amendments you add are segmented into ~1000 character overlapping chunks with page tracking and saved directly to your browser's persistent database. They survive page reloads and are instantly queried by the BM25 retrieval engine.
                </p>
              </div>

              {/* 3 Methods to Update */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white border border-[#E3DCCE] shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF3EE] text-[#2E5A44] flex items-center justify-center font-bold text-xs mb-3">
                    1
                  </div>
                  <h5 className="text-xs font-bold text-[#1A3B2B] mb-1">
                    Upload PDF / TXT Guidelines
                  </h5>
                  <p className="text-xs text-[#526559] leading-relaxed mb-3">
                    Drag-and-drop new Ayush guidelines, court decisions, or WIPO treaty amendments directly in the left sidebar.
                  </p>
                  <button
                    onClick={onClose}
                    className="text-xs font-semibold text-[#2E5A44] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Use Sidebar Upload</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E3DCCE] shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF3EE] text-[#2E5A44] flex items-center justify-center font-bold text-xs mb-3">
                    2
                  </div>
                  <h5 className="text-xs font-bold text-[#1A3B2B] mb-1">
                    Add Text Law / Amendment
                  </h5>
                  <p className="text-xs text-[#526559] leading-relaxed mb-3">
                    Paste specific legal circulars, Supreme Court rulings (e.g. Novartis), or gazette notifications in the text form.
                  </p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="text-xs font-semibold text-[#2E5A44] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Add Custom Text</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E3DCCE] shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF3EE] text-[#2E5A44] flex items-center justify-center font-bold text-xs mb-3">
                    3
                  </div>
                  <h5 className="text-xs font-bold text-[#1A3B2B] mb-1">
                    Export / Import Database (JSON)
                  </h5>
                  <p className="text-xs text-[#526559] leading-relaxed mb-3">
                    Download the complete database backup with 1-click or import an updated database JSON from colleagues.
                  </p>
                  <button
                    onClick={() => setActiveTab('export')}
                    className="text-xs font-semibold text-[#2E5A44] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Backup Options</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Add Custom Regulatory Law / Notice */}
          {activeTab === 'add' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#1A3B2B] mb-1">
                  {t.addCustomTextTitle}
                </h4>
                <p className="text-xs text-[#63776B]">
                  {t.customTextDesc}
                </p>
              </div>

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Regulatory text successfully chunked and saved to database!</span>
                </div>
              )}

              <form onSubmit={handleAddCustomLaw} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A3B2B] mb-1">
                    Document Title / Act Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. CGPDTM Office Order on Traditional Formulations 2026"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A3B2B] mb-1">
                    Official Reference / Section / Case Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={customReference}
                    onChange={(e) => setCustomReference(e.target.value)}
                    placeholder="e.g. Gazette Notification No. 104 / Section 3(p) Amendment"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A3B2B] mb-1">
                    Regulatory Content / Guidelines Text *
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Paste or write the legal text, examination criteria, or regulatory conditions here in English or Hindi..."
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden leading-relaxed resize-y"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#2E5A44] hover:bg-[#1A3B2B] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Save & Index into Database</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Export & Backup */}
          {activeTab === 'export' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800">
                  {importError}
                </div>
              )}

              {/* Export Box */}
              <div className="p-5 rounded-2xl bg-white border border-[#DDD3BF] shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF3EE] text-[#2E5A44] flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-[#1A3B2B]">
                      {t.exportDB}
                    </h5>
                    <p className="text-xs text-[#63776B]">
                      Download your active database ({documents.length} docs, {chunks.length} chunks) as a single JSON file.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleExport}
                  className="px-4 py-2 rounded-xl bg-[#1A3B2B] text-white text-xs font-semibold hover:bg-[#2E5A44] transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup File</span>
                </button>
              </div>

              {/* Import Box */}
              <div className="p-5 rounded-2xl bg-white border border-[#DDD3BF] shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF3EE] text-[#2E5A44] flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-[#1A3B2B]">
                      {t.importDB}
                    </h5>
                    <p className="text-xs text-[#63776B]">
                      Upload a previously exported database JSON file to restore all documents and chunks.
                    </p>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2E5A44] text-white text-xs font-semibold hover:bg-[#1A3B2B] transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Select JSON Database File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Reset Box */}
              <div className="p-4 rounded-2xl bg-[#FFF9E6] border border-[#F2D786] flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-[#7A5B10]">
                    Reset to Default Guidelines
                  </h5>
                  <p className="text-[11px] text-[#8C6D1F]">
                    Restore the preloaded Ayush Patent Guidelines, TKDL Framework, and WIPO GRATK Treaty baseline.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Reset database to default Ayush & TKDL documents?')) {
                      onRestoreDefaults();
                      alert('Database reset to defaults.');
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#C29B38] text-white text-xs font-semibold hover:bg-[#9C7721] transition-colors shrink-0"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Manage Documents */}
          {activeTab === 'manage' && (
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#1A3B2B] uppercase tracking-wider">
                  Stored Documents in Database ({documents.length})
                </span>
                <span className="text-xs text-[#2E5A44] font-semibold">
                  {chunks.length} Total Chunks
                </span>
              </div>

              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl bg-white border border-[#E3DCCE] hover:border-[#2E5A44] transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-[#2E5A44] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-[#1A3B2B] truncate">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[#697E72] mt-0.5">
                        <span>{doc.pageCount} {t.pages}</span>
                        <span>•</span>
                        <span className="font-mono text-[#2E5A44]">
                          {doc.chunkCount} {t.chunks}
                        </span>
                        {doc.description && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-xs">{doc.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onInspectDocument(doc)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-[#2E5A44] bg-[#EBF3EE] hover:bg-[#D8EADB] transition-colors"
                    >
                      Inspect Chunks
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete from database"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#EDE8DC] border-t border-[#E0D8C8] flex justify-between items-center text-xs text-[#63776B]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active Database: {documents.length} Docs ({chunks.length} Chunks)</span>
          </div>
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
