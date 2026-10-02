import { DocumentSource, KnowledgeChunk } from '../src/types';
import { chunkDocumentPages } from '../src/utils/chunker';
import { DeveloperDocument } from './types';
import { cgpdtmAyushGuidelines } from './patents/CGPDTM_Ayush_Guidelines_2019';
import { tkdlCsirFramework } from './traditional_knowledge/TKDL_CSIR_Framework';
import { wipoGratkTreaty } from './wipo/WIPO_GRATK_Treaty_2024';
import { biologicalDiversityAct } from './biodiversity/Biological_Diversity_Act_2002';
import { ayushAsuRegulations } from './ayush/Ayush_ASU_Drug_Regulations';
import { tradeSecretsVaidya } from './trade_secrets/Trade_Secrets_Vaidya_Formulations';

/**
 * Developer-Controlled Master Knowledge Base Registry.
 * Only documents manually added here by the developer are compiled and made available to RAG.
 * Normal users have read-only access to query this knowledge base through the AI assistant.
 */
export const DEVELOPER_DOCUMENTS: DeveloperDocument[] = [
  cgpdtmAyushGuidelines,
  tkdlCsirFramework,
  wipoGratkTreaty,
  biologicalDiversityAct,
  ayushAsuRegulations,
  tradeSecretsVaidya,
];

/**
 * Compiles and indexes all developer-provided documents into structured chunks.
 */
export function getDeveloperKnowledgeBase(): {
  documents: DocumentSource[];
  chunks: KnowledgeChunk[];
} {
  const documents: DocumentSource[] = [];
  const chunks: KnowledgeChunk[] = [];

  for (const item of DEVELOPER_DOCUMENTS) {
    const docChunks = chunkDocumentPages(item.id, item.name, item.pages, {
      authority: item.metadata.authority,
      category: item.metadata.category,
      jurisdiction: item.metadata.jurisdiction,
      officialSourceUrl: item.metadata.officialSourceUrl,
    });

    const docSource: DocumentSource = {
      id: item.id,
      name: item.name,
      size: 1024 * item.pages.length,
      type: 'pdf',
      pageCount: item.pages.length,
      uploadedAt: Date.now(),
      chunkCount: docChunks.length,
      status: 'indexed',
      isActiveForRag: true,
      lastIndexedAt: Date.now(),
      description: `${item.metadata.authority} • ${item.category.toUpperCase()}`,
      metadata: item.metadata,
    };

    documents.push(docSource);
    chunks.push(...docChunks);
  }

  return { documents, chunks };
}
