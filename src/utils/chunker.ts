import { KnowledgeChunk, DocumentCategory } from '../types';

export interface PageContent {
  pageNumber: number;
  text: string;
}

export interface ChunkOptions {
  authority?: string;
  category?: DocumentCategory;
  jurisdiction?: string;
  officialSourceUrl?: string;
}

const TARGET_CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 180;

/**
 * Splits text into chunks of ~1000 characters with ~180 characters overlap,
 * snapping to sentence boundaries or whitespace where possible.
 */
export function chunkDocumentPages(
  docId: string,
  docTitle: string,
  pages: PageContent[],
  options?: ChunkOptions
): KnowledgeChunk[] {
  const allChunks: KnowledgeChunk[] = [];
  let globalChunkIndex = 0;

  const authority = options?.authority || 'Official Authority';
  const category: DocumentCategory = options?.category || 'patents';
  const jurisdiction = options?.jurisdiction || 'India';
  const officialSourceUrl = options?.officialSourceUrl || '';

  for (const page of pages) {
    const rawText = page.text.replace(/\r\n/g, '\n').trim();
    if (!rawText) continue;

    if (rawText.length <= TARGET_CHUNK_SIZE + 100) {
      allChunks.push({
        id: `${docId}-p${page.pageNumber}-c${globalChunkIndex}`,
        docId,
        docTitle,
        authority,
        category,
        jurisdiction,
        pageNumber: page.pageNumber,
        chunkIndex: globalChunkIndex++,
        text: rawText,
        charCount: rawText.length,
        officialSourceUrl,
      });
      continue;
    }

    let start = 0;
    while (start < rawText.length) {
      let end = start + TARGET_CHUNK_SIZE;

      if (end >= rawText.length) {
        end = rawText.length;
      } else {
        // Search forward or backward for a clean sentence boundary (., !, ?, ।, \n)
        const windowText = rawText.slice(end - 100, Math.min(rawText.length, end + 100));
        const boundaryRegex = /[.?!।\n]\s+/g;
        let bestBreak = -1;
        let match: RegExpExecArray | null;

        while ((match = boundaryRegex.exec(windowText)) !== null) {
          const breakPoint = (end - 100) + match.index + 1;
          if (breakPoint > start + 400 && breakPoint < rawText.length) {
            bestBreak = breakPoint;
          }
        }

        if (bestBreak !== -1) {
          end = bestBreak;
        } else {
          // Fallback to space
          const spaceIndex = rawText.lastIndexOf(' ', end);
          if (spaceIndex > start + 300) {
            end = spaceIndex;
          }
        }
      }

      const chunkText = rawText.slice(start, end).trim();
      if (chunkText.length > 50) {
        allChunks.push({
          id: `${docId}-p${page.pageNumber}-c${globalChunkIndex}`,
          docId,
          docTitle,
          authority,
          category,
          jurisdiction,
          pageNumber: page.pageNumber,
          chunkIndex: globalChunkIndex++,
          text: chunkText,
          charCount: chunkText.length,
          officialSourceUrl,
        });
      }

      if (end >= rawText.length) break;
      // Step forward by (end - overlap)
      start = Math.max(start + 100, end - CHUNK_OVERLAP);
    }
  }

  return allChunks;
}
