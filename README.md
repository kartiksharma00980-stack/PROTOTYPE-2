# IP-SAKTI Sahayak (आईपी-शक्ति सहायक)

> **Ayurveda & Traditional Knowledge IP Regulatory Assistant with Strict Manual Source Control & Grounded RAG**

An authoritative, multilingual legal and regulatory AI assistant for patent examiners, Ayush researchers, inventors, and legal practitioners. Designed for the Smart India Hackathon (SIH) to address biopiracy prevention, traditional knowledge defense (TKDL), and compliance under the Indian Patents Act (Sections 3(p), 3(e), 3(d)), Biological Diversity Act, and WIPO treaties.

---

## Architecture Overview

```
                          ┌───────────────────────────┐
                          │       USER / ADMIN        │
                          └─────────────┬─────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                 [Query / Chat]             [Upload Official PDF]
                         │                             │
                         ▼                             ▼
                 REST / WebSocket             Page-by-Page Parser
                         │                      (with OCR Fallback)
                         ▼                             │
               Query Expansion & Tokenize              ▼
            (English, Hindi, Hinglish)       Enter / Verify Metadata
                         │                             │
                         ▼                             ▼
             ┌───────────────────────┐         Chunking (~1000 chars)
             │   Hybrid Retrieval    │                 │
             │   BM25 + Dense Vector ◄─────────────────┘
             │  (Approved Docs Only) │        Persistent Database
             └───────────┬───────────┘            (IndexedDB)
                         │
                         ▼ (Top 5 Ranked Passages)
             ┌───────────────────────┐
             │ Context Construction  │
             └───────────┬───────────┘
                         │
                         ▼
             ┌───────────────────────┐
             │  Gemini 3.8 Flash     │
             │  (Strict Grounding)   │
             └───────────┬───────────┘
                         │
                         ▼
            Grounded Answer + Citations [1], [2]
            (Or "No Evidence Found in Approved Knowledge Base")
```

---

## Key Features

1. **Strict Manual Knowledge Base Control**:
   - Zero web scraping, zero automated internet downloads, zero synthetic sources.
   - User personally uploads, verifies metadata, reviews page text, and approves indexing.
   - Independent **Active for RAG** toggle switch per document.

2. **Organized Regulatory Category Structure**:
   ```
   knowledge_base/
   ├── patents/                    # Indian Patents Act 1970, Guidelines, Sections 3(p), 3(e), 3(d)
   ├── ayush/                      # Ministry of Ayush Guidelines, ASU Drug Rules & Pharmacopoeia
   ├── traditional_knowledge/      # TKDL Framework, TKRC Classification, Biopiracy Revocations
   ├── biodiversity_abs/           # Biological Diversity Act 2002, Section 6 NBA Approvals
   ├── wipo/                       # WIPO GRATK Treaty (2024), Mandatory Genetic Resource Disclosures
   ├── geographical_indications/   # GI of Goods Act 1999, Traditional Agro-Herbal GIs
   ├── trademarks/                 # Trade Marks Act 1999, Brand protection for herbal formulations
   ├── copyright/                  # Copyright Act 1957, Classical texts compilations
   ├── designs/                    # Designs Act 2000, Traditional packaging & implements
   ├── trade_secrets/              # Confidential formulations, Vaidya trade secrets & know-how
   ├── plant_variety/              # PPV&FR Act 2001, Traditional medicinal plant varieties
   └── other/                      # Judicial Precedents (Novartis), Custom Gazette Orders
   ```

3. **Hybrid BM25 + Vector Semantic Retrieval**:
   - Tokenizes English legal terms, Devanagari Hindi, and Hinglish queries.
   - Computes BM25 frequency scores and vector cosine similarities with botanical/Ayurvedic synonym expansion (`haldi` ↔ `turmeric`, `neem` ↔ `azadirachta`, `admixture` ↔ `synergy`).

4. **Scanned PDF OCR Pipeline**:
   - Extracts native selectable PDF text using `pdfjs-dist`.
   - Automatically detects scanned/image-based pages (< 30 characters of text) and executes browser-based OCR with `tesseract.js` without forcing OCR when unnecessary.

5. **Strict Grounding & Zero Hallucination**:
   - When evidence exists, the model cites exact bracketed source numbers `[1]`, `[2]`.
   - When evidence is absent, the model strictly refuses to guess and outputs:
     > *"I could not find sufficient evidence in the current approved Knowledge Base to provide a reliable answer."*

6. **Multilingual & Multimodal**:
   - Responds natively in English, Devanagari Hindi, and conversational Hinglish.
   - Built-in real-time voice mode powered by `gemini-3.8-live` over WebSocket (`/live`).

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Node.js, Express, WebSocket (`ws`), Vite.
- **AI Models**: Google Gemini 3.8 Flash (`gemini-3.8-flash`) & Gemini 3.8 Live (`gemini-3.8-live`).
- **Document Processing**: `pdfjs-dist`, `tesseract.js`.
- **Local Storage**: IndexedDB (browser-side persistence with JSON export/import).

---

## Local Setup & Development

### Prerequisites
- Node.js (v18+)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/ip-sakti-sahayak.git
cd ip-sakti-sahayak
npm install
```

### 2. Environment Variables
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Fill in your API key:
```env
GEMINI_API_KEY="your_actual_gemini_api_key"
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## API Endpoints

- `GET /api/health` — Server health check and model readiness status.
- `GET /api/categories` — Official regulatory category taxonomy and folder mappings.
- `POST /api/chat` — Grounded Q&A endpoint accepting `{ question, chunks, language }`.
- `WS /live` — Real-time bidirectional audio WebSocket connected to Gemini 3.8 Live API.

---

## SIH Demonstration Steps (For Judges)

1. **Ask a Preloaded Domain Question**:
   - Select *"Can a traditional Ayurvedic formulation be patented under Section 3(e)?"*.
   - Observe the top 5 retrieved source passages with document, page number, authority, and category.
   - Observe bracketed citations `[1]`, `[2]` and the verification stamp **"Approved Knowledge Base"**.

2. **Demonstrate No-Evidence Refusal**:
   - Ask an off-topic question (e.g. *"What is the recipe for baking chocolate chip cookies on Mars?"*).
   - Observe the strict refusal: *"I could not find sufficient evidence in the current approved Knowledge Base to provide a reliable answer."*

3. **Demonstrate Manual Source Control**:
   - Open **"Knowledge Base"** in the top bar.
   - Toggle an active document to **Paused**; repeat the question and demonstrate that paused documents are completely excluded from AI retrieval.
   - Click **"+ Upload Official Document"**, upload a PDF or TXT notice, verify its metadata, and approve indexing.

4. **Demonstrate Live Voice Mode**:
   - Click **"Voice Mode"** and speak naturally in English or Hindi to interact with Gemini 3.8 Live API in real-time.
