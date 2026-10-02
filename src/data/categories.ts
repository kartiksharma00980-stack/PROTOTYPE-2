import { DocumentCategory } from '../types';

export interface CategoryInfo {
  id: DocumentCategory;
  name: string;
  nameHi: string;
  folder: string;
  icon: string;
  description: string;
  defaultAuthority: string;
}

export const KNOWLEDGE_BASE_CATEGORIES: CategoryInfo[] = [
  {
    id: 'patents',
    name: 'Patents',
    nameHi: 'पेटेंट',
    folder: 'knowledge_base/patents/',
    icon: '📜',
    description: 'Indian Patents Act 1970, Patent Rules, Section 3(p)/3(e)/3(d) Examination Guidelines',
    defaultAuthority: 'CGPDTM / Ministry of Commerce & Industry, India',
  },
  {
    id: 'ayush',
    name: 'Ayush Regulatory',
    nameHi: 'आयुष विनियामक',
    folder: 'knowledge_base/ayush/',
    icon: '🌿',
    description: 'Ministry of Ayush Guidelines, ASU Drug Rules & Pharmacopoeial Standards',
    defaultAuthority: 'Ministry of Ayush, Government of India',
  },
  {
    id: 'traditional_knowledge',
    name: 'Traditional Knowledge (TKDL)',
    nameHi: 'पारंपरिक ज्ञान (टीकेडीएल)',
    folder: 'knowledge_base/traditional_knowledge/',
    icon: '🏛️',
    description: 'TKDL Framework, Traditional Knowledge Resource Classification (TKRC), Prior Art Defense',
    defaultAuthority: 'CSIR & Ministry of Ayush',
  },
  {
    id: 'biodiversity_abs',
    name: 'Biodiversity & ABS',
    nameHi: 'जैव विविधता एवं एबीएस',
    folder: 'knowledge_base/biodiversity_abs/',
    icon: '🌱',
    description: 'Biological Diversity Act 2002, Section 6 NBA Approvals, Access & Benefit Sharing',
    defaultAuthority: 'National Biodiversity Authority (NBA)',
  },
  {
    id: 'wipo',
    name: 'WIPO Treaties',
    nameHi: 'डब्ल्यूआईपीओ संधियां',
    folder: 'knowledge_base/wipo/',
    icon: '🌐',
    description: 'WIPO GRATK Treaty (2024), Mandatory Disclosure Requirements, Nagoya Protocol',
    defaultAuthority: 'World Intellectual Property Organization (WIPO)',
  },
  {
    id: 'geographical_indications',
    name: 'Geographical Indications (GI)',
    nameHi: 'भौगोलिक उपदर्शन (जीआई)',
    folder: 'knowledge_base/geographical_indications/',
    icon: '🏷️',
    description: 'Geographical Indications of Goods Act 1999, Traditional Agro-Herbal GIs',
    defaultAuthority: 'Geographical Indications Registry, India',
  },
  {
    id: 'trademarks',
    name: 'Trademarks',
    nameHi: 'ट्रेडमार्क',
    folder: 'knowledge_base/trademarks/',
    icon: '™️',
    description: 'Trade Marks Act 1999, Traditional brand protection & deceptive similarity standards',
    defaultAuthority: 'Trade Marks Registry, India',
  },
  {
    id: 'copyright',
    name: 'Copyright',
    nameHi: 'कॉपीराइट',
    folder: 'knowledge_base/copyright/',
    icon: '©️',
    description: 'Copyright Act 1957, Classical texts digitisation rights, ancient compilations',
    defaultAuthority: 'Copyright Office, India',
  },
  {
    id: 'designs',
    name: 'Industrial Designs',
    nameHi: 'औद्योगिक डिज़ाइन',
    folder: 'knowledge_base/designs/',
    icon: '📐',
    description: 'Designs Act 2000, Traditional medicinal implements, packaging & shapes',
    defaultAuthority: 'Patent Office Design Wing, India',
  },
  {
    id: 'trade_secrets',
    name: 'Trade Secrets',
    nameHi: 'व्यापार रहस्य (Trade Secrets)',
    folder: 'knowledge_base/trade_secrets/',
    icon: '🔒',
    description: 'Confidential formulations, Vaidya trade secrets, non-disclosure & know-how protection',
    defaultAuthority: 'Indian Common Law / Contractual & Commercial Courts',
  },
  {
    id: 'plant_variety',
    name: 'Plant Variety & Farmers Rights',
    nameHi: 'पादप किस्म एवं कृषक अधिकार',
    folder: 'knowledge_base/plant_variety/',
    icon: '🌾',
    description: 'Protection of Plant Varieties and Farmers Rights (PPV&FR) Act 2001',
    defaultAuthority: 'PPV&FR Authority, India',
  },
  {
    id: 'other',
    name: 'Other Regulatory',
    nameHi: 'अन्य विनियामक',
    folder: 'knowledge_base/other/',
    icon: '📁',
    description: 'High Court / Supreme Court Rulings, Custom Circulars, Gazette Notifications',
    defaultAuthority: 'Judicial / Regulatory Body',
  },
];

export const AUTHORITIES_LIST = [
  'Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM)',
  'Ministry of Ayush, Government of India',
  'Council of Scientific and Industrial Research (CSIR) - TKDL',
  'National Biodiversity Authority (NBA)',
  'World Intellectual Property Organization (WIPO)',
  'Supreme Court of India / High Courts',
  'Geographical Indications Registry, India',
  'Protection of Plant Varieties and Farmers Rights (PPV&FR) Authority',
  'European Patent Office (EPO)',
  'United States Patent and Trademark Office (USPTO)',
  'State Biodiversity Board (SBB)',
  'Other / Custom Authority',
];

export const JURISDICTIONS_LIST = [
  'India (National)',
  'International / Multilateral (WIPO)',
  'United States (USPTO)',
  'European Union (EPO)',
  'Japan (JPO)',
  'Global / Regional',
];

export const DOCUMENT_TYPES: ('Act' | 'Guideline' | 'Treaty' | 'Circular' | 'Case Law' | 'Manual' | 'Regulation')[] = [
  'Guideline',
  'Act',
  'Treaty',
  'Circular',
  'Case Law',
  'Manual',
  'Regulation',
];
