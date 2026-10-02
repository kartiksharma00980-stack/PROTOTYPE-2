import { DocumentCategory } from '../src/types';

export interface DeveloperDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  metadata: {
    title: string;
    authority: string;
    category: DocumentCategory;
    jurisdiction: string;
    documentType: 'Act' | 'Guideline' | 'Treaty' | 'Circular' | 'Case Law' | 'Manual' | 'Regulation';
    publicationDate?: string;
    lastUpdatedDate?: string;
    officialSourceUrl?: string;
    notes?: string;
  };
  pages: {
    pageNumber: number;
    text: string;
  }[];
}
