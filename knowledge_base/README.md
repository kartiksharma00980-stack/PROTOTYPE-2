# Developer-Controlled Knowledge Base

> **CONFIDENTIAL / DEVELOPER ONLY**  
> Normal users NEVER have access to upload, edit, or delete documents. All knowledge used by IP-SAKTI Sahayak is manually curated by the developer in this directory.

---

## Folder Taxonomy

```
knowledge_base/
├── patents/                  # Indian Patents Act 1970, Rules, Sections 3(p), 3(e), 3(d)
├── traditional_knowledge/    # TKDL Framework, TKRC Classification, Biopiracy Revocations
├── wipo/                     # WIPO GRATK Treaty (2024), International Disclosure Standards
├── biodiversity/             # Biological Diversity Act 2002, Section 6 NBA Approvals
├── ayush/                    # Ministry of Ayush Guidelines, ASU Drug Rules & Standards
├── trade_secrets/            # Confidential formulations, Vaidya know-how & NDAs
├── trademarks/               # Trade Marks Act 1999, Brand protection
├── copyright/                # Copyright Act 1957, Classical texts compilations
├── geographical_indications/ # GI of Goods Act 1999, Traditional Agro-Herbal GIs
├── designs/                  # Designs Act 2000, Traditional implements
├── plant_variety/            # PPV&FR Act 2001, Traditional medicinal plant varieties
├── types.ts                  # Document and Metadata type definitions
└── index.ts                  # Master registry compiling documents for RAG
```

---

## How to Manually Add a New Document

1. Create a new `.ts` file in the appropriate category subfolder (e.g. `knowledge_base/patents/new_guideline.ts`):
   ```ts
   import { DeveloperDocument } from '../types';

   export const newGuideline: DeveloperDocument = {
     id: 'doc-unique-id',
     name: 'Official_File_Name.pdf',
     category: 'patents',
     metadata: {
       title: 'Official Document Title',
       authority: 'Ministry / Organization Name',
       category: 'patents',
       jurisdiction: 'India (National)',
       documentType: 'Guideline',
       publicationDate: '2026-01-15',
       officialSourceUrl: 'https://ipindia.gov.in/...',
     },
     pages: [
       { pageNumber: 1, text: 'Text of page 1...' },
       { pageNumber: 2, text: 'Text of page 2...' },
     ],
   };
   ```

2. Open `knowledge_base/index.ts` and add your document to `DEVELOPER_DOCUMENTS`:
   ```ts
   import { newGuideline } from './patents/new_guideline';

   export const DEVELOPER_DOCUMENTS: DeveloperDocument[] = [
     // ... existing documents
     newGuideline,
   ];
   ```

3. Save the file. The system will automatically chunk (~1,000 characters with sentence-overlap), index, and make the new document available for RAG retrieval on restart/rebuild.
