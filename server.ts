import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

const port = Number(process.env.PORT) || 3000;
const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    model: 'gemini-3.8-flash',
    liveModel: 'gemini-3.8-live',
    ragMode: 'strict_manual_knowledge_base',
  });
});

// Official Categories REST endpoint
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json({
    categories: [
      { id: 'patents', name: 'Patents', folder: 'knowledge_base/patents/' },
      { id: 'ayush', name: 'Ayush Regulatory', folder: 'knowledge_base/ayush/' },
      { id: 'traditional_knowledge', name: 'Traditional Knowledge (TKDL)', folder: 'knowledge_base/traditional_knowledge/' },
      { id: 'biodiversity_abs', name: 'Biodiversity & ABS', folder: 'knowledge_base/biodiversity_abs/' },
      { id: 'wipo', name: 'WIPO Treaties', folder: 'knowledge_base/wipo/' },
      { id: 'geographical_indications', name: 'Geographical Indications (GI)', folder: 'knowledge_base/geographical_indications/' },
      { id: 'trademarks', name: 'Trademarks', folder: 'knowledge_base/trademarks/' },
      { id: 'copyright', name: 'Copyright', folder: 'knowledge_base/copyright/' },
      { id: 'designs', name: 'Industrial Designs', folder: 'knowledge_base/designs/' },
      { id: 'trade_secrets', name: 'Trade Secrets', folder: 'knowledge_base/trade_secrets/' },
      { id: 'plant_variety', name: 'Plant Variety & Farmers Rights', folder: 'knowledge_base/plant_variety/' },
      { id: 'other', name: 'Other Regulatory', folder: 'knowledge_base/other/' },
    ],
  });
});

interface ChunkPayload {
  index: number;
  id: string;
  docTitle: string;
  authority?: string;
  category?: string;
  jurisdiction?: string;
  pageNumber: number;
  text: string;
  officialSourceUrl?: string;
}

// Grounded Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { question, chunks, language } = req.body as {
      question?: string;
      chunks?: ChunkPayload[];
      language?: 'en' | 'hi';
    };

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please check your environment variables.',
      });
    }

    const validChunks = Array.isArray(chunks) ? chunks : [];

    // If no chunks found or provided, return strict message
    if (validChunks.length === 0) {
      const fallback = language === 'hi'
        ? 'उपलब्ध अनुमोदित ज्ञान कोष (Approved Knowledge Base) में इस प्रश्न का विश्वसनीय उत्तर देने के लिए पर्याप्त साक्ष्य नहीं मिले।'
        : 'I could not find sufficient evidence in the current approved Knowledge Base to provide a reliable answer.';
      return res.json({
        answer: fallback,
        usedCitations: [],
        foundInSources: false,
      });
    }

    // Format chunks for strict grounding with Authority, Category, and Page Number
    const contextFormatted = validChunks
      .map(
        (c, idx) =>
          `[Source ${idx + 1}] (Document: "${c.docTitle}", Authority: "${c.authority || 'Official Body'}", Category: "${c.category || 'General'}", Page: ${c.pageNumber}):\n${c.text.trim()}`
      )
      .join('\n\n---\n\n');

    const isHindiScript = /[\u0900-\u097F]/.test(question);
    const isHinglish = !isHindiScript && /\b(kya|hai|hain|kaise|kyun|dawa|samhita|nuskha|aur|mein|ke|ki|tarah|patenting|karein|karna|hoga)\b/i.test(question);

    const systemInstruction = `You are "IP-SAKTI Sahayak", an authoritative legal and regulatory assistant for Intellectual Property, Traditional Knowledge, and Ayurveda.

CRITICAL SOURCE CONTROL & GROUNDING RULES:
1. Search and answer ONLY using the evidence explicitly stated in the APPROVED RETRIEVED SOURCES provided below. Do NOT use outside internet data, unverified assumptions, or speculative legal advice.
2. If sufficient evidence is NOT found in the provided sources to answer the user's specific question, you MUST reply EXACTLY with:
   - In English: "I could not find sufficient evidence in the current approved Knowledge Base to provide a reliable answer."
   - In Hindi: "उपलब्ध अनुमोदित ज्ञान कोष (Approved Knowledge Base) में इस प्रश्न का विश्वसनीय उत्तर देने के लिए पर्याप्त साक्ष्य नहीं मिले।"
   Do not compensate for missing evidence by inventing an answer, guessing statutes, or making claims not backed by the excerpts.
3. Every factual sentence or claim MUST cite its source immediately using bracket notation like [1], [2], or [1][3], matching the Source numbers from the context.
4. Language Adaptability:
   - If user asks in Devanagari Hindi (${isHindiScript}): Reply in formal Hindi.
   - If user asks in Hinglish (${isHinglish}): Reply in clear conversational Hinglish with legal English terms preserved.
   - If user asks in English: Reply in clear professional English.
5. Keep the tone professional, objective, legally grounded, and structured. Always mention specific section numbers, authorities (e.g. CGPDTM, NBA, CSIR, WIPO), and page references when present in the sources.`;

    const userPrompt = `User Question:
"${question}"

RETRIEVED SOURCES:
${contextFormatted}

Provide your grounded response following the rules above.`;

    // Try models with fallback in case of transient 503/high-demand errors
    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let generatedText = '';

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.1, // Low temperature for high factual precision and grounding
          },
        });
        generatedText = response.text?.trim() || '';
        if (generatedText) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini API] Model ${modelName} encountered error:`, err?.message || err);
        // Small delay before trying next model
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    if (!generatedText) {
      if (lastError) {
        throw lastError;
      }
      generatedText = isHindiScript
        ? 'उपलब्ध अनुमोदित ज्ञान कोष (Approved Knowledge Base) में इस प्रश्न का विश्वसनीय उत्तर देने के लिए पर्याप्त साक्ष्य नहीं मिले।'
        : 'I could not find sufficient evidence in the current approved Knowledge Base to provide a reliable answer.';
    }

    const answer = generatedText;

    // Parse citation numbers used in answer
    const citationMatches = answer.match(/\[(\d+)\]/g) || [];
    const usedIndices = Array.from(
      new Set(
        citationMatches
          .map(c => parseInt(c.replace(/\[|\]/g, ''), 10))
          .filter(n => !isNaN(n) && n >= 1 && n <= validChunks.length)
      )
    ).sort((a, b) => a - b);

    const isNotFound = answer.toLowerCase().includes('not found in the available sources') ||
      answer.includes('उपलब्ध स्रोतों में यह जानकारी नहीं मिली');

    return res.json({
      answer,
      usedCitations: usedIndices,
      foundInSources: !isNotFound,
    });
  } catch (error: any) {
    console.error('Error handling /api/chat:', error);
    return res.status(500).json({
      error: error?.message || 'An error occurred while generating the grounded answer.',
    });
  }
});

// Setup Server & Live API WebSocket
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const server = http.createServer(app);

  // Setup WebSocket Server for Live API (/live)
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    if (pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Live API] Client connected to /live');

    if (!ai) {
      clientWs.send(JSON.stringify({ type: 'error', error: 'Gemini API is not configured on the server.' }));
      clientWs.close();
      return;
    }

    try {
      const liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
          systemInstruction: `You are IP-SAKTI Sahayak, an authoritative, friendly voice assistant specializing in Ayurveda, traditional knowledge, and intellectual property.
You speak fluent English and Hindi. When the user asks in Hindi, reply in Hindi. When in English, reply in English.
Answer questions accurately regarding:
- Section 3(p) of the Patents Act, 1970 (Traditional Knowledge Bar)
- Section 3(e) (Mere Admixture and Synergistic Effect Requirement)
- Section 3(d) (Therapeutic Efficacy and Novartis precedent)
- Section 6 of Biological Diversity Act (Mandatory National Biodiversity Authority - NBA approval)
- Traditional Knowledge Digital Library (TKDL) and landmark biopiracy revocations (Turmeric, Neem)
- WIPO GRATK Treaty (Mandatory disclosure of country of origin of genetic resources)
Keep spoken answers concise, conversational, and directly addressing the user's inquiry.`,
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(JSON.stringify({ type: 'audio', audio: part.inlineData.data }));
                }
                if (part.text) {
                  clientWs.send(JSON.stringify({ type: 'text', text: part.text }));
                }
              }
            }

            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }
          },
          onerror: (err: any) => {
            console.error('[Live API session error]:', err);
            clientWs.send(JSON.stringify({ type: 'error', error: err?.message || 'Live session error' }));
          },
          onclose: () => {
            clientWs.send(JSON.stringify({ type: 'closed' }));
          },
        },
      });

      clientWs.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio) {
            // Forward 16kHz PCM audio to Gemini Live API
            liveSession.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          }
        } catch (e) {
          console.error('[Live API] Failed to parse client message:', e);
        }
      });

      clientWs.on('close', () => {
        console.log('[Live API] Client disconnected');
      });
    } catch (err: any) {
      console.error('[Live API] Connection error:', err);
      clientWs.send(JSON.stringify({ type: 'error', error: err?.message || 'Could not connect to Gemini Live API' }));
      clientWs.close();
    }
  });

  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`[IP-SAKTI Sahayak] Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
