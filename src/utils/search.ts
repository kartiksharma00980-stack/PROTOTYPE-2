import { KnowledgeChunk, ScoredChunk } from '../types';

// Common stop words to avoid biasing retrieval scores
const ENGLISH_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
  'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have',
  'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into',
  'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves',
  'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t',
  'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then',
  'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those',
  'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re',
  'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while',
  'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll',
  'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

const HINDI_STOP_WORDS = new Set([
  'का', 'के', 'की', 'में', 'से', 'है', 'हैं', 'को', 'पर', 'या', 'और', 'किया', 'लिए', 'था', 'थी', 'थे',
  'गया', 'गई', 'गए', 'होता', 'होती', 'होते', 'यह', 'वह', 'इस', 'उस', 'एक', 'जो', 'तो', 'भी', 'तक',
  'द्वारा', 'ने', 'हो', 'कर', 'रहा', 'रही', 'रहे', 'जाता', 'सकता', 'सकते', 'सकती', 'क्या', 'क्यों', 'कैसे'
]);

// Multilingual & Hinglish domain synonyms mapping for semantic expansion
const DOMAIN_SYNONYMS: Record<string, string[]> = {
  haldi: ['turmeric', 'curcuma', 'haridra'],
  turmeric: ['haldi', 'curcuma', 'haridra'],
  neem: ['azadirachta', 'nimba', 'fungicidal'],
  ashwagandha: ['withania', 'somnifera', 'asgandh'],
  tulsi: ['ocimum', 'sanctum', 'basil'],
  dawa: ['medicine', 'formulation', 'drug'],
  jaribooti: ['herb', 'medicinal', 'plants'],
  samhita: ['charaka', 'sushruta', 'treatise'],
  biopiracy: ['revocation', 'turmeric', 'neem', 'prior art'],
  synergy: ['synergistic', 'admixture', '3(e)', 'combination'],
  admixture: ['synergy', 'synergistic', '3(e)'],
};

/**
 * Normalizes and tokenizes English, Hindi, and Hinglish text.
 * Preserves legal section codes like "3(p)", "3(e)", "3(d)".
 */
export function tokenize(text: string): string[] {
  if (!text) return [];

  const normalized = text.toLowerCase();
  const tokens: string[] = [];
  const regex = /\b3\([a-z]\)\b|[a-z0-9]+|[\u0900-\u097F]+/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(normalized)) !== null) {
    const token = match[0].trim();
    if (token.length > 1 || /[\u0900-\u097F]/.test(token)) {
      if (!ENGLISH_STOP_WORDS.has(token) && !HINDI_STOP_WORDS.has(token)) {
        tokens.push(token);
      }
    }
  }

  return tokens;
}

/**
 * Computes cosine similarity between two sparse term frequency vectors.
 */
function cosineSimilarity(
  vecA: Map<string, number>,
  vecB: Map<string, number>
): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, valA] of vecA.entries()) {
    normA += valA * valA;
    const valB = vecB.get(term) || 0;
    if (valB > 0) {
      dotProduct += valA * valB;
    }
  }

  for (const valB of vecB.values()) {
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Hybrid BM25 + Vector Semantic Search Engine.
 * Only searches approved & active knowledge base chunks.
 */
export function searchKnowledgeBaseBM25(
  query: string,
  chunks: KnowledgeChunk[],
  topK: number = 5
): ScoredChunk[] {
  if (!query || chunks.length === 0) return [];

  const rawTokens = tokenize(query);
  const queryTokens: string[] = [];

  // Semantic query expansion with Hinglish & botanical synonyms
  for (const token of rawTokens) {
    queryTokens.push(token);
    const syns = DOMAIN_SYNONYMS[token];
    if (syns) {
      queryTokens.push(...syns);
    }
  }

  if (queryTokens.length === 0) {
    const fallback = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (fallback.length === 0) return [];
    queryTokens.push(...fallback);
  }

  const queryVector = new Map<string, number>();
  for (const t of queryTokens) {
    queryVector.set(t, (queryVector.get(t) || 0) + 1);
  }

  const N = chunks.length;

  // Pre-tokenize and construct term-frequency vectors for chunks
  const chunkTokenMaps = chunks.map((chunk) => {
    const tokens = tokenize(`${chunk.docTitle} ${chunk.authority || ''} ${chunk.category || ''} ${chunk.text}`);
    const tokenCounts = new Map<string, number>();
    for (const t of tokens) {
      tokenCounts.set(t, (tokenCounts.get(t) || 0) + 1);
    }
    return {
      chunk,
      tokens,
      length: tokens.length,
      counts: tokenCounts,
    };
  });

  const totalLength = chunkTokenMaps.reduce((sum, c) => sum + c.length, 0);
  const avgdl = totalLength / Math.max(1, N);

  // Document Frequency (DF) Map
  const dfMap = new Map<string, number>();
  for (const qTerm of queryTokens) {
    let df = 0;
    for (const doc of chunkTokenMaps) {
      if (doc.counts.has(qTerm)) {
        df++;
      }
    }
    dfMap.set(qTerm, df);
  }

  const k1 = 1.5;
  const b = 0.75;
  const scoredList: ScoredChunk[] = [];
  const lowerQuery = query.toLowerCase();

  for (const doc of chunkTokenMaps) {
    let bm25Score = 0;
    const matchedTerms: string[] = [];

    for (const qTerm of queryTokens) {
      const tf = doc.counts.get(qTerm) || 0;
      if (tf > 0) {
        matchedTerms.push(qTerm);
        const df = dfMap.get(qTerm) || 1;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        const numerator = tf * (k1 + 1);
        const denominator = tf + k1 * (1 - b + b * (doc.length / (avgdl || 1)));
        bm25Score += idf * (numerator / denominator);
      }
    }

    // Vector Cosine Similarity
    const vectorCos = cosineSimilarity(queryVector, doc.counts);

    // Boosts: Title, Authority, and Category match
    const lowerTitle = (doc.chunk.docTitle || '').toLowerCase();
    const lowerAuth = (doc.chunk.authority || '').toLowerCase();
    const lowerCat = (doc.chunk.category || '').toLowerCase();

    for (const qTerm of queryTokens) {
      if (lowerTitle.includes(qTerm)) {
        bm25Score += 2.0;
      }
      if (lowerAuth.includes(qTerm)) {
        bm25Score += 1.5;
      }
      if (lowerCat.includes(qTerm)) {
        bm25Score += 1.5;
      }
    }

    // Exact phrase substring boost
    const lowerDocText = doc.chunk.text.toLowerCase();
    if (lowerQuery.length > 5 && lowerDocText.includes(lowerQuery)) {
      bm25Score += 5.0;
    }

    // Hybrid combined score (BM25 + Semantic Vector Similarity)
    const hybridScore = bm25Score * 0.65 + vectorCos * 12.0;

    if (hybridScore > 0.4) {
      scoredList.push({
        ...doc.chunk,
        score: Number(hybridScore.toFixed(3)),
        matchedTerms: Array.from(new Set(matchedTerms)),
      });
    }
  }

  // Sort descending by hybrid relevance score
  scoredList.sort((a, b) => b.score - a.score);

  return scoredList.slice(0, topK);
}
