import { DocumentSource, KnowledgeChunk } from '../types';

const DB_NAME = 'IP_SAKTI_DATABASE';
const DB_VERSION = 1;
const STORE_DOCS = 'documents';
const STORE_CHUNKS = 'chunks';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
        db.createObjectStore(STORE_CHUNKS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Persists all documents and chunks into the browser's IndexedDB database.
 */
export async function saveKnowledgeBase(
  documents: DocumentSource[],
  chunks: KnowledgeChunk[]
): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_DOCS, STORE_CHUNKS], 'readwrite');
      const docsStore = tx.objectStore(STORE_DOCS);
      const chunksStore = tx.objectStore(STORE_CHUNKS);

      // Clear existing records first
      docsStore.clear();
      chunksStore.clear();

      // Put all docs
      for (const doc of documents) {
        docsStore.put(doc);
      }

      // Put all chunks
      for (const chunk of chunks) {
        chunksStore.put(chunk);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Failed to save to IndexedDB, falling back to LocalStorage:', error);
    try {
      localStorage.setItem('ip_sakti_docs', JSON.stringify(documents));
      // Save chunks if size permits
      localStorage.setItem('ip_sakti_chunks_count', chunks.length.toString());
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }
}

/**
 * Loads persisted documents and chunks from IndexedDB.
 */
export async function loadKnowledgeBase(): Promise<{
  documents: DocumentSource[];
  chunks: KnowledgeChunk[];
} | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_DOCS, STORE_CHUNKS], 'readonly');
      const docsStore = tx.objectStore(STORE_DOCS);
      const chunksStore = tx.objectStore(STORE_CHUNKS);

      const docsReq = docsStore.getAll();
      const chunksReq = chunksStore.getAll();

      tx.oncomplete = () => {
        const docs = docsReq.result as DocumentSource[];
        const chunks = chunksReq.result as KnowledgeChunk[];

        if (docs && docs.length > 0 && chunks && chunks.length > 0) {
          resolve({ documents: docs, chunks });
        } else {
          resolve(null);
        }
      };

      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Could not load from IndexedDB:', error);
    return null;
  }
}

/**
 * Clears the persistent database.
 */
export async function clearPersistentDB(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_DOCS, STORE_CHUNKS], 'readwrite');
      tx.objectStore(STORE_DOCS).clear();
      tx.objectStore(STORE_CHUNKS).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn('Error clearing IndexedDB:', error);
  }
}

/**
 * Exports the entire database as a downloadable JSON file.
 */
export function exportKnowledgeBaseAsJSON(
  documents: DocumentSource[],
  chunks: KnowledgeChunk[]
): void {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalDocuments: documents.length,
    totalChunks: chunks.length,
    documents,
    chunks,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IP_SAKTI_Knowledge_Base_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses and validates an imported JSON database file.
 */
export function parseImportedDatabase(jsonContent: string): {
  documents: DocumentSource[];
  chunks: KnowledgeChunk[];
} {
  const parsed = JSON.parse(jsonContent);

  if (!Array.isArray(parsed.documents) || !Array.isArray(parsed.chunks)) {
    throw new Error('Invalid database format. Must contain "documents" and "chunks" arrays.');
  }

  const documents: DocumentSource[] = parsed.documents.map((d: any) => ({
    id: String(d.id || `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
    name: String(d.name || 'Untitled Document'),
    size: Number(d.size || 0),
    type: (d.type === 'pdf' || d.type === 'txt' ? d.type : 'pdf') as any,
    pageCount: Number(d.pageCount || 1),
    uploadedAt: Number(d.uploadedAt || Date.now()),
    chunkCount: Number(d.chunkCount || 0),
    status: (d.status === 'failed' || d.status === 'pending' ? d.status : 'indexed') as any,
    isActiveForRag: d.isActiveForRag !== false,
    lastIndexedAt: Number(d.lastIndexedAt || Date.now()),
    description: d.description ? String(d.description) : undefined,
    metadata: {
      title: String(d.metadata?.title || d.name || 'Untitled'),
      authority: String(d.metadata?.authority || 'Official Authority'),
      category: d.metadata?.category || 'patents',
      jurisdiction: String(d.metadata?.jurisdiction || 'India'),
      documentType: d.metadata?.documentType || 'Guideline',
      publicationDate: d.metadata?.publicationDate || undefined,
      lastUpdatedDate: d.metadata?.lastUpdatedDate || undefined,
      officialSourceUrl: d.metadata?.officialSourceUrl || undefined,
      notes: d.metadata?.notes || undefined,
    },
  }));

  const chunks: KnowledgeChunk[] = parsed.chunks.map((c: any, idx: number) => ({
    id: String(c.id || `chunk-${idx}`),
    docId: String(c.docId),
    docTitle: String(c.docTitle || 'Untitled'),
    authority: String(c.authority || 'Official Authority'),
    category: c.category || 'patents',
    jurisdiction: String(c.jurisdiction || 'India'),
    pageNumber: Number(c.pageNumber || 1),
    chunkIndex: Number(c.chunkIndex ?? idx),
    text: String(c.text || ''),
    charCount: Number(c.charCount || (c.text ? c.text.length : 0)),
    officialSourceUrl: c.officialSourceUrl || undefined,
  }));

  return { documents, chunks };
}
