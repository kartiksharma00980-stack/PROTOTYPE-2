import React, { useState } from 'react';
import { DocumentCategory, DocumentMetadata, DocumentSource, Language } from '../types';
import {
  KNOWLEDGE_BASE_CATEGORIES,
  AUTHORITIES_LIST,
  JURISDICTIONS_LIST,
  DOCUMENT_TYPES,
} from '../data/categories';
import { extractTextFromPDF, extractTextFromTXT } from '../utils/pdfExtractor';
import { chunkDocumentPages, PageContent } from '../utils/chunker';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building2,
  FolderOpen,
  Globe2,
  Calendar,
  Link2,
  Sparkles,
  ArrowRight,
  Eye,
  Loader2,
} from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onApproveAndIndex: (newDoc: DocumentSource, newChunks: any[]) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  language,
  onClose,
  onApproveAndIndex,
}) => {
  const [step, setStep] = useState<'upload' | 'metadata' | 'preview'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [extractedPages, setExtractedPages] = useState<PageContent[]>([]);

  // Metadata form states
  const [title, setTitle] = useState('');
  const [authority, setAuthority] = useState(AUTHORITIES_LIST[0]);
  const [customAuthority, setCustomAuthority] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('patents');
  const [jurisdiction, setJurisdiction] = useState(JURISDICTIONS_LIST[0]);
  const [documentType, setDocumentType] = useState<'Act' | 'Guideline' | 'Treaty' | 'Circular' | 'Case Law' | 'Manual' | 'Regulation'>('Guideline');
  const [publicationDate, setPublicationDate] = useState(new Date().toISOString().slice(0, 10));
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');
  const [officialSourceUrl, setOfficialSourceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setStep('upload');
    setFile(null);
    setIsProcessing(false);
    setProcessingStatus('');
    setExtractedPages([]);
    setTitle('');
    setAuthority(AUTHORITIES_LIST[0]);
    setCustomAuthority('');
    setCategory('patents');
    setJurisdiction(JURISDICTIONS_LIST[0]);
    setDocumentType('Guideline');
    setPublicationDate(new Date().toISOString().slice(0, 10));
    setLastUpdatedDate('');
    setOfficialSourceUrl('');
    setNotes('');
    setErrorMsg(null);
  };

  const handleFileSelected = async (selectedFile: File) => {
    setErrorMsg(null);
    setFile(selectedFile);
    setIsProcessing(true);
    setProcessingStatus(`Extracting text from ${selectedFile.name}...`);

    try {
      let pages: PageContent[] = [];
      const isPdf = selectedFile.name.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        pages = await extractTextFromPDF(selectedFile, (curr, total) => {
          setProcessingStatus(`Extracting ${selectedFile.name} — Page ${curr} of ${total}...`);
        });
      } else {
        pages = await extractTextFromTXT(selectedFile);
      }

      if (pages.length === 0 || pages.every((p) => !p.text.trim())) {
        throw new Error('No readable text could be extracted from this document.');
      }

      setExtractedPages(pages);

      // Guess metadata from filename
      const cleanName = selectedFile.name
        .replace(/\.(pdf|txt|text|md)$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      setTitle(cleanName);

      // Guess category from keywords
      const lower = cleanName.toLowerCase();
      if (lower.includes('tkdl') || lower.includes('traditional knowledge')) {
        setCategory('traditional_knowledge');
        setAuthority('Council of Scientific and Industrial Research (CSIR) - TKDL');
      } else if (lower.includes('ayush') || lower.includes('ayurveda') || lower.includes('siddha')) {
        setCategory('ayush');
        setAuthority('Ministry of Ayush, Government of India');
      } else if (lower.includes('biodiversity') || lower.includes('nba') || lower.includes('biological')) {
        setCategory('biodiversity_abs');
        setAuthority('National Biodiversity Authority (NBA)');
      } else if (lower.includes('wipo') || lower.includes('gratk') || lower.includes('geneva')) {
        setCategory('wipo');
        setAuthority('World Intellectual Property Organization (WIPO)');
      }

      setIsProcessing(false);
      setStep('metadata');
    } catch (err: any) {
      console.error('File extraction failed:', err);
      setErrorMsg(err?.message || 'Failed to extract text from file.');
      setIsProcessing(false);
    }
  };

  const handleApproveAndIndex = () => {
    if (!title.trim()) {
      setErrorMsg('Document Title is required.');
      return;
    }

    const finalAuthority =
      authority === 'Other / Custom Authority' ? customAuthority.trim() || 'Custom Authority' : authority;

    const metadata: DocumentMetadata = {
      title: title.trim(),
      authority: finalAuthority,
      category,
      jurisdiction,
      documentType,
      publicationDate: publicationDate || undefined,
      lastUpdatedDate: lastUpdatedDate || undefined,
      officialSourceUrl: officialSourceUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Execute chunking with verified metadata
    const chunks = chunkDocumentPages(docId, title.trim(), extractedPages, {
      authority: finalAuthority,
      category,
      jurisdiction,
      officialSourceUrl: officialSourceUrl.trim(),
    });

    const newDoc: DocumentSource = {
      id: docId,
      name: file ? file.name : `${title}.txt`,
      size: file ? file.size : 1024,
      type: file && file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'txt',
      pageCount: extractedPages.length,
      uploadedAt: Date.now(),
      chunkCount: chunks.length,
      status: 'indexed',
      isActiveForRag: true,
      metadata,
      lastIndexedAt: Date.now(),
      description: `${finalAuthority} • ${category.toUpperCase()}`,
    };

    onApproveAndIndex(newDoc, chunks);
    resetForm();
    onClose();
  };

  const totalExtractedChars = extractedPages.reduce((sum, p) => sum + p.text.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F2] border border-[#DDD3BF] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#243329]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#E0D8C8] bg-[#EDE8DC] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#2E5A44] text-[#FAF7EE] flex items-center justify-center shadow-inner shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-[#1A3B2B] font-serif truncate">
                Manual Knowledge Base Ingestion Pipeline
              </h3>
              <p className="text-xs text-[#63776B]">
                Upload official PDF, verify metadata, and approve for RAG
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#63776B] hover:text-[#1A3B2B] hover:bg-[#DDD3BF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Steps Indicator */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#F2EDE1] border-b border-[#E0D8C8] text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${step === 'upload' ? 'text-[#1A3B2B]' : 'text-[#7D9183]'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'upload' ? 'bg-[#1A3B2B] text-white' : 'bg-[#DDE5E0] text-[#55695C]'}`}>
              1
            </span>
            <span>Upload Document</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#B2C4B8]" />
          <div className={`flex items-center gap-1.5 ${step === 'metadata' ? 'text-[#1A3B2B]' : 'text-[#7D9183]'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'metadata' ? 'bg-[#1A3B2B] text-white' : 'bg-[#DDE5E0] text-[#55695C]'}`}>
              2
            </span>
            <span>Verify Metadata</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#B2C4B8]" />
          <div className={`flex items-center gap-1.5 ${step === 'preview' ? 'text-[#1A3B2B]' : 'text-[#7D9183]'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'preview' ? 'bg-[#1A3B2B] text-white' : 'bg-[#DDE5E0] text-[#55695C]'}`}>
              3
            </span>
            <span>Preview & Approve</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#FAF8F2]">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-5 max-w-xl mx-auto py-4">
              <div className="text-center space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-[#1A3B2B]">
                  Select Official Document for Knowledge Base
                </h4>
                <p className="text-xs text-[#63776B]">
                  Upload official guidelines, gazette notifications, treaties, or court rulings in PDF or TXT format.
                </p>
              </div>

              <div
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.txt,.text,.md';
                  input.onchange = (e: any) => {
                    if (e.target?.files?.[0]) {
                      handleFileSelected(e.target.files[0]);
                    }
                  };
                  input.click();
                }}
                className="border-2 border-dashed border-[#CEC3AE] hover:border-[#2E5A44] bg-[#FAF8F2] hover:bg-[#F3EFE6] rounded-2xl p-8 text-center cursor-pointer transition-all duration-200"
              >
                {isProcessing ? (
                  <div className="py-4 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-8 h-8 text-[#2E5A44] animate-spin" />
                    <p className="text-xs font-semibold text-[#1A3B2B]">{processingStatus}</p>
                    <p className="text-[11px] text-[#697E72]">Extracting page content into memory...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#E5ECE7] mx-auto flex items-center justify-center text-[#2E5A44]">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A3B2B]">Click to browse and upload file</p>
                      <p className="text-xs text-[#697E72] mt-0.5">Supports PDF and TXT documents</p>
                    </div>
                    <span className="inline-flex text-[10px] font-mono text-[#2E5A44] bg-[#E8EFEA] px-2.5 py-1 rounded-full">
                      Strict Source Control — No internet scraping
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Enter / Verify Metadata */}
          {step === 'metadata' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-[#EBF3EE] border border-[#C5DDD0] p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2E5A44]" />
                  <span className="font-semibold text-[#1A3B2B]">{file?.name}</span>
                  <span className="text-[#55695C]">({extractedPages.length} pages, {totalExtractedChars.toLocaleString()} chars)</span>
                </div>
                <button
                  onClick={() => setStep('preview')}
                  className="text-xs font-semibold text-[#2E5A44] hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Text</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1A3B2B] mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Guidelines for Examination of Ayush Patent Applications"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A3B2B] mb-1 flex items-center gap-1">
                    <FolderOpen className="w-3.5 h-3.5 text-[#2E5A44]" />
                    <span>Category / Folder *</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
                  >
                    {KNOWLEDGE_BASE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name} ({cat.folder})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A3B2B] mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#2E5A44]" />
                    <span>Authority / Organization *</span>
                  </label>
                  <select
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
                  >
                    {AUTHORITIES_LIST.map((auth, idx) => (
                      <option key={idx} value={auth}>
                        {auth}
                      </option>
                    ))}
                  </select>
                </div>

                {authority === 'Other / Custom Authority' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1A3B2B] mb-1">
                      Enter Custom Authority Name *
                    </label>
                    <input
                      type="text"
                      value={customAuthority}
                      onChange={(e) => setCustomAuthority(e.target.value)}
                      placeholder="e.g. Controller General of Patents / Judicial Bench"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#1A3B2B] mb-1 flex items-center gap-1">
                    <Globe2 className="w-3.5 h-3.5 text-[#2E5A44]" />
                    <span>Jurisdiction</span>
                  </label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
                  >
                    {JURISDICTIONS_LIST.map((jur, idx) => (
                      <option key={idx} value={jur}>
                        {jur}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A3B2B] mb-1">
                    Document Type
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
                  >
                    {DOCUMENT_TYPES.map((dt, idx) => (
                      <option key={idx} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A3B2B] mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#2E5A44]" />
                    <span>Publication Date</span>
                  </label>
                  <input
                    type="date"
                    value={publicationDate}
                    onChange={(e) => setPublicationDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A3B2B] mb-1 flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5 text-[#2E5A44]" />
                    <span>Official Source URL</span>
                  </label>
                  <input
                    type="url"
                    value={officialSourceUrl}
                    onChange={(e) => setOfficialSourceUrl(e.target.value)}
                    placeholder="https://ipindia.gov.in/..."
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1A3B2B] mb-1">
                    Regulatory Notes / Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Key statutory clauses or scope covered..."
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Preview Extracted Pages */}
          {step === 'preview' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A3B2B]">
                  Extracted Pages Preview ({extractedPages.length} Pages)
                </span>
                <span className="text-xs text-[#55695C] font-mono">
                  ~{Math.round(totalExtractedChars / 1000)} chunks will be generated
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {extractedPages.map((p) => (
                  <div key={p.pageNumber} className="p-3 bg-white rounded-xl border border-[#DDD3BF] text-xs">
                    <span className="font-semibold text-[#2E5A44] block mb-1">
                      Page {p.pageNumber}:
                    </span>
                    <p className="font-mono text-[11px] text-[#2C3E32] whitespace-pre-wrap leading-relaxed line-clamp-4">
                      {p.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-[#EDE8DC] border-t border-[#E0D8C8] flex justify-between items-center gap-3">
          {step === 'upload' ? (
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#63776B] hover:text-[#1A3B2B]"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setStep(step === 'preview' ? 'metadata' : 'upload')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#63776B] hover:text-[#1A3B2B]"
            >
              Back
            </button>
          )}

          {step === 'metadata' && (
            <div className="flex gap-2">
              <button
                onClick={() => setStep('preview')}
                className="px-4 py-2 rounded-xl bg-white border border-[#DDD3BF] text-xs font-semibold text-[#1A3B2B] hover:bg-[#F2EDE1]"
              >
                Preview Pages
              </button>
              <button
                onClick={handleApproveAndIndex}
                className="px-5 py-2 rounded-xl bg-[#2E5A44] hover:bg-[#1A3B2B] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Index into Knowledge Base</span>
              </button>
            </div>
          )}

          {step === 'preview' && (
            <button
              onClick={handleApproveAndIndex}
              className="px-5 py-2 rounded-xl bg-[#2E5A44] hover:bg-[#1A3B2B] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Index into Knowledge Base</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
