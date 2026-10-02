export type Language = 'en' | 'hi';

export type DocumentCategory =
  | 'patents'
  | 'trademarks'
  | 'copyright'
  | 'geographical_indications'
  | 'designs'
  | 'trade_secrets'
  | 'traditional_knowledge'
  | 'biodiversity_abs'
  | 'ayush'
  | 'plant_variety'
  | 'wipo'
  | 'other';

export type IndexingStatus = 'indexed' | 'pending' | 'failed';

export interface DocumentMetadata {
  title: string;
  authority: string; // e.g. CGPDTM, CSIR-TKDL, National Biodiversity Authority, WIPO
  category: DocumentCategory;
  jurisdiction: string; // e.g. India, International, Global
  documentType: 'Act' | 'Guideline' | 'Treaty' | 'Circular' | 'Case Law' | 'Manual' | 'Regulation';
  publicationDate?: string;
  lastUpdatedDate?: string;
  officialSourceUrl?: string;
  notes?: string;
}

export interface DocumentSource {
  id: string;
  name: string;
  size: number;
  type: 'pdf' | 'txt' | 'manual';
  pageCount: number;
  uploadedAt: number;
  chunkCount: number;
  status: IndexingStatus;
  isActiveForRag: boolean; // Manual control: User can toggle inclusion in RAG!
  metadata: DocumentMetadata;
  lastIndexedAt?: number;
  description?: string;
  error?: string;
}

export interface KnowledgeChunk {
  id: string;
  docId: string;
  docTitle: string;
  authority: string;
  category: DocumentCategory;
  jurisdiction: string;
  pageNumber: number;
  chunkIndex: number;
  text: string;
  charCount: number;
  officialSourceUrl?: string;
}

export interface ScoredChunk extends KnowledgeChunk {
  score: number;
  matchedTerms: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  language: Language;
  retrievedChunks?: KnowledgeChunk[];
  usedCitations?: number[];
  foundInSources?: boolean;
  isLoading?: boolean;
  error?: string;
}
