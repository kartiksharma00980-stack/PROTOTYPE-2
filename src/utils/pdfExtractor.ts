import * as pdfjsLib from 'pdfjs-dist';
import { PageContent } from './chunker';

// Initialize PDF.js worker
try {
  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('PDF.js worker initialization warning:', e);
}

/**
 * Extracts text page-by-page from an uploaded PDF file or ArrayBuffer in the browser.
 * If a page is image-only / scanned (< 30 characters of native text), runs optical character recognition (OCR).
 */
export async function extractTextFromPDF(
  fileOrBuffer: File | ArrayBuffer,
  onProgress?: (currentPage: number, totalPages: number, status?: string) => void
): Promise<PageContent[]> {
  const arrayBuffer = fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const extractedPages: PageContent[] = [];

  let tesseractWorker: any = null;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress?.(pageNum, numPages, `Reading page ${pageNum}/${numPages}`);
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Combine text items into coherent page text
    const pageStrings = textContent.items
      .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
      .filter((s: string) => s.trim().length > 0);

    let pageText = pageStrings.join(' ').trim();

    // OCR FALLBACK: If page is image-only or scanned (less than 30 characters of selectable text)
    if (pageText.length < 30 && typeof document !== 'undefined') {
      try {
        onProgress?.(pageNum, numPages, `Running OCR on scanned page ${pageNum}/${numPages}...`);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await (page as any).render({ canvasContext: ctx, viewport }).promise;

          if (!tesseractWorker) {
            const { createWorker } = await import('tesseract.js');
            tesseractWorker = await createWorker('eng');
          }

          const ocrResult = await tesseractWorker.recognize(canvas);
          const ocrText = ocrResult?.data?.text?.trim();
          if (ocrText && ocrText.length > pageText.length) {
            pageText = ocrText;
          }
        }
      } catch (ocrErr) {
        console.warn(`[OCR Warning] Could not perform OCR on page ${pageNum}:`, ocrErr);
      }
    }

    extractedPages.push({
      pageNumber: pageNum,
      text: pageText || `[Page ${pageNum}: Scanned or non-text content]`,
    });
  }

  if (tesseractWorker) {
    try {
      await tesseractWorker.terminate();
    } catch (e) {}
  }

  return extractedPages;
}

/**
 * Extracts pages from a plain TXT file. If file contains explicit form feeds or page marks,
 * uses them; otherwise divides every ~3000 chars into simulated pages.
 */
export async function extractTextFromTXT(file: File): Promise<PageContent[]> {
  const text = await file.text();
  const formFeedSplit = text.split(/\f|\n--- Page \d+ ---\n|\n={3,}\s*Page\s+\d+\s*={3,}/i);

  if (formFeedSplit.length > 1) {
    return formFeedSplit
      .map((content, idx) => ({
        pageNumber: idx + 1,
        text: content.trim(),
      }))
      .filter((p) => p.text.length > 0);
  }

  // If no explicit page markers, partition into pages of ~2500 chars
  const PAGE_CHAR_LEN = 2500;
  if (text.length <= PAGE_CHAR_LEN) {
    return [{ pageNumber: 1, text: text.trim() }];
  }

  const pages: PageContent[] = [];
  let start = 0;
  let pageNum = 1;

  while (start < text.length) {
    let end = start + PAGE_CHAR_LEN;
    if (end < text.length) {
      const nextNewline = text.indexOf('\n\n', end - 200);
      if (nextNewline !== -1 && nextNewline < end + 300) {
        end = nextNewline;
      }
    } else {
      end = text.length;
    }

    const chunk = text.slice(start, end).trim();
    if (chunk) {
      pages.push({ pageNumber: pageNum++, text: chunk });
    }
    start = end;
  }

  return pages;
}
