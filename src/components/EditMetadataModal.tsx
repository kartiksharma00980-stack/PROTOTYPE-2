import React, { useState, useEffect } from 'react';
import { DocumentCategory, DocumentMetadata, DocumentSource } from '../types';
import {
  KNOWLEDGE_BASE_CATEGORIES,
  AUTHORITIES_LIST,
  JURISDICTIONS_LIST,
  DOCUMENT_TYPES,
} from '../data/categories';
import { X, CheckCircle2, Edit3, Building2, FolderOpen, Globe2, Calendar, Link2 } from 'lucide-react';

interface EditMetadataModalProps {
  document: DocumentSource | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveMetadata: (docId: string, updatedMetadata: DocumentMetadata) => void;
}

export const EditMetadataModal: React.FC<EditMetadataModalProps> = ({
  document,
  isOpen,
  onClose,
  onSaveMetadata,
}) => {
  const [title, setTitle] = useState('');
  const [authority, setAuthority] = useState(AUTHORITIES_LIST[0]);
  const [customAuthority, setCustomAuthority] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('patents');
  const [jurisdiction, setJurisdiction] = useState(JURISDICTIONS_LIST[0]);
  const [documentType, setDocumentType] = useState<any>('Guideline');
  const [publicationDate, setPublicationDate] = useState('');
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');
  const [officialSourceUrl, setOfficialSourceUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (document) {
      setTitle(document.metadata?.title || document.name);
      setCategory(document.metadata?.category || 'patents');
      setJurisdiction(document.metadata?.jurisdiction || JURISDICTIONS_LIST[0]);
      setDocumentType(document.metadata?.documentType || 'Guideline');
      setPublicationDate(document.metadata?.publicationDate || '');
      setLastUpdatedDate(document.metadata?.lastUpdatedDate || '');
      setOfficialSourceUrl(document.metadata?.officialSourceUrl || '');
      setNotes(document.metadata?.notes || '');

      const auth = document.metadata?.authority || AUTHORITIES_LIST[0];
      if (AUTHORITIES_LIST.includes(auth)) {
        setAuthority(auth);
        setCustomAuthority('');
      } else {
        setAuthority('Other / Custom Authority');
        setCustomAuthority(auth);
      }
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalAuthority =
      authority === 'Other / Custom Authority' ? customAuthority.trim() || 'Custom Authority' : authority;

    const updated: DocumentMetadata = {
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

    onSaveMetadata(document.id, updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F2] border border-[#DDD3BF] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#243329]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E0D8C8] bg-[#EDE8DC] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2E5A44] text-[#FAF7EE] flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A3B2B] font-serif">Edit Document Metadata</h3>
              <p className="text-xs text-[#63776B] truncate max-w-sm">{document.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#63776B] hover:text-[#1A3B2B] hover:bg-[#DDD3BF]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A3B2B] mb-1">Document Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#1A3B2B] mb-1 flex items-center gap-1">
                <FolderOpen className="w-3.5 h-3.5 text-[#2E5A44]" />
                <span>Category *</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
              >
                {KNOWLEDGE_BASE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A3B2B] mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#2E5A44]" />
                <span>Authority / Organization</span>
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
                  Custom Authority Name
                </label>
                <input
                  type="text"
                  value={customAuthority}
                  onChange={(e) => setCustomAuthority(e.target.value)}
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
              <label className="block text-xs font-semibold text-[#1A3B2B] mb-1">Document Type</label>
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
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#DDD3BF] rounded-xl text-[#1A3B2B] focus:border-[#2E5A44] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-[#E0D8C8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#63776B] hover:text-[#1A3B2B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2E5A44] hover:bg-[#1A3B2B] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Update Metadata</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
