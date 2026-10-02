import { DeveloperDocument } from '../types';

export const ayushAsuRegulations: DeveloperDocument = {
  id: 'doc-ayush-asu-rules',
  name: 'Drugs_and_Cosmetics_Act_ASU_Rules.pdf',
  category: 'ayush',
  metadata: {
    title: 'Drugs and Cosmetics Act, 1940: Provisions Relating to Ayurvedic, Siddha and Unani (ASU) Drugs',
    authority: 'Ministry of Ayush, Government of India',
    category: 'ayush',
    jurisdiction: 'India (National)',
    documentType: 'Regulation',
    publicationDate: '2021-06-01',
    lastUpdatedDate: '2023-04-12',
    officialSourceUrl: 'https://ayush.gov.in',
    notes: 'Regulatory standards, Schedule E(1) poisonous botanical substances, GMP requirements, and clinical evidence.',
  },
  pages: [
    {
      pageNumber: 1,
      text: `DRUGS AND COSMETICS ACT, 1940 - AYURVEDIC, SIDDHA & UNANI (ASU) PROVISIONS
MINISTRY OF AYUSH REGULATORY FRAMEWORK

1. DEFINITION OF AYURVEDIC DRUG (SECTION 3(a)):
An Ayurvedic, Siddha or Unani drug includes all medicines intended for internal or external use for or in the diagnosis, treatment, mitigation or prevention of disease in human beings or animals, manufactured exclusively in accordance with the formulae described in the authoritative books of Ayurvedic, Siddha and Unani systems specified in the First Schedule.

2. GOOD MANUFACTURING PRACTICES (SCHEDULE T):
Every manufacturing unit producing Ayurvedic medicines must obtain a GMP Certificate under Schedule T. This entails:
(a) Verification of raw herbs authenticity through botanical and pharmacognostical testing;
(b) Heavy metal screening (Lead, Cadmium, Mercury, Arsenic) within safe limits;
(c) Pesticide residue and microbial contamination limits complying with the Ayurvedic Pharmacopoeia of India (API).`,
    },
    {
      pageNumber: 2,
      text: `PROPRIETARY AYURVEDIC MEDICINES & IP OVERLAP
1. Classical vs. Proprietary ASU Medicines:
- Classical formulations (e.g. Triphala Churna, Chyawanprash, Sitopaladi): Manufactured exactly as per classical texts; not patentable due to Section 3(p) prior art.
- Proprietary Ayurvedic formulations: Novel combinations or delivery methods (capsules, syrups, nano-suspensions). These require safety and efficacy proof under Rule 158B before manufacturing licenses are granted, and require proven synergy under Section 3(e) if patent protection is pursued.
2. Misleading Advertisements & Magic Remedies:
Under the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954, claiming guaranteed cure for designated disorders (such as diabetes, cancer, arthritis) is strictly prohibited.`,
    },
  ],
};
