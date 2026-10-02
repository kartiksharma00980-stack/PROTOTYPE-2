import { DeveloperDocument } from '../types';

export const tradeSecretsVaidya: DeveloperDocument = {
  id: 'doc-trade-secrets-vaidya',
  name: 'Trade_Secrets_and_Traditional_Know_How.pdf',
  category: 'trade_secrets',
  metadata: {
    title: 'Trade Secrets & Confidential Know-How Protection for Ayurvedic Practitioners',
    authority: 'Indian Common Law / Commercial & Contractual Legal Framework',
    category: 'trade_secrets',
    jurisdiction: 'India (National)',
    documentType: 'Manual',
    publicationDate: '2023-01-10',
    lastUpdatedDate: '2023-09-20',
    officialSourceUrl: 'https://ipindia.gov.in',
    notes: 'Legal principles governing non-disclosure agreements (NDAs), hereditary Vaidya formulations, and trade secret protection under Section 27 of the Indian Contract Act.',
  },
  pages: [
    {
      pageNumber: 1,
      text: `TRADE SECRETS IN AYURVEDA AND TRADITIONAL MEDICINE: LEGAL REPERTOIRE

1. CONCEPT OF TRADE SECRETS IN AYURVEDIC FORMULATIONS:
Unlike patents, which require public disclosure of the entire formula and process in exchange for a 20-year monopoly, Trade Secrets offer indefinite protection without disclosure, provided reasonable steps are taken to maintain secrecy.
Many traditional Vaidyas and family lineages preserve unique processing methods (Shodhana, Bhavana cycles, exact herbal calcination / Bhasma heating curves) as closely guarded secrets.

2. REQUIREMENTS FOR TRADE SECRET PROTECTION IN INDIA:
In the absence of a specific sui generis Trade Secret Act, Indian courts protect trade secrets under common law, equity, breach of confidence, and Section 27 of the Indian Contract Act, 1872:
(a) The information must have commercial value because it is secret;
(b) It must not be generally known among or readily accessible to experts in Ayurveda;
(c) The owner must take reasonable measures (e.g. Non-Disclosure Agreements, physical segregation of formula mixing) to keep it secret.`,
    },
    {
      pageNumber: 2,
      text: `TRADE SECRETS VS. SECTION 3(p) PATENT BARS
1. Strategic Choice for Innovators:
When an Ayurvedic combination might face high hurdle rejections under Section 3(p) (traditional knowledge bar) or Section 3(e) (admixture without synergy proof), companies often opt for trade secret protection rather than public patent filing.
2. Protection of Manufacturing Know-How:
Proprietary fermentation timing (Asava/Arishta fermentation strains), specific solvent extraction ratios, and temperature parameters can be maintained as trade secrets indefinitely, even if the primary herbs are public knowledge.
3. Remedies:
Injunctions and damages under the Commercial Courts Act, 2015 can be sought against former employees, consultants, or collaborators who wrongfully misappropriate confidential Ayurvedic processes.`,
    },
  ],
};
