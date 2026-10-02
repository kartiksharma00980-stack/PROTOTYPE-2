import { DocumentSource, KnowledgeChunk } from '../types';
import { chunkDocumentPages, PageContent } from '../utils/chunker';

export interface PreloadedDocument {
  source: DocumentSource;
  pages: PageContent[];
}

export const PRELOADED_DOCUMENTS: PreloadedDocument[] = [
  {
    source: {
      id: 'doc-ayush-guidelines',
      name: 'CGPDTM_Ayush_Patent_Guidelines_2019.pdf',
      size: 428000,
      type: 'pdf',
      pageCount: 5,
      uploadedAt: Date.now() - 86400000 * 2,
      chunkCount: 0,
      status: 'indexed',
      isActiveForRag: true,
      lastIndexedAt: Date.now() - 86400000 * 2,
      description: 'Guidelines for Examination of Patent Applications in the field of Traditional Knowledge and Biological Material.',
      metadata: {
        title: 'Guidelines for Examination of Patent Applications in the Field of Traditional Knowledge and Biological Material',
        authority: 'Office of the Controller General of Patents, Designs and Trade Marks (CGPDTM)',
        category: 'patents',
        jurisdiction: 'India (National)',
        documentType: 'Guideline',
        publicationDate: '2019-10',
        lastUpdatedDate: '2019-10-31',
        officialSourceUrl: 'https://ipindia.gov.in',
        notes: 'Statutory examination standards covering Section 3(p), Section 3(e), and NBA clearance under Section 6 of Biological Diversity Act.',
      },
    },
    pages: [
      {
        pageNumber: 1,
        text: `OFFICE OF THE CONTROLLER GENERAL OF PATENTS, DESIGNS AND TRADE MARKS (CGPDTM), INDIA
GUIDELINES FOR EXAMINATION OF PATENT APPLICATIONS IN THE FIELD OF TRADITIONAL KNOWLEDGE AND BIOLOGICAL MATERIAL

1. INTRODUCTION AND STATUTORY MANDATE
These guidelines establish rigorous examination standards for patent applications involving traditional Ayurvedic, Siddha, and Unani formulations, folk knowledge, and biological resources originating from India. 

The primary objective is to safeguard traditional medicinal heritage against biopiracy and ensure that frivolous or obvious combinations of classical remedies are refused under the Indian Patents Act, 1970.

Key Statutory Provisions Governing Ayush Patentability:
- Section 3(p): Inventions which in effect are traditional knowledge are not patentable.
- Section 3(e): Mere admixtures exhibiting only aggregated properties without synergistic effect are not patentable.
- Section 3(d): Mere discovery of a new form of a known substance without enhanced therapeutic efficacy is excluded.
- Section 10(4)(ii)(D): Mandatory disclosure of the source and geographical origin of biological materials used in the invention.
- Biological Diversity Act, 2002 (Section 6): Mandatory approval of the National Biodiversity Authority (NBA) before patent grant.`,
      },
      {
        pageNumber: 2,
        text: `EXAMINATION GUIDELINES: SECTION 3(p) - TRADITIONAL KNOWLEDGE BAR
Under Section 3(p) of the Patents Act, 1970:
"An invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not an invention within the meaning of this Act."

Application to Ayurveda:
1. If an ingredient or herb (e.g. Curcuma longa/Haridra, Withania somnifera/Ashwagandha, Ocimum sanctum/Tulsi, Zingiber officinale/Sunthi) is recorded in ancient classical treatises (such as Charaka Samhita, Sushruta Samhita, Astanga Hridaya, Bhavaprakasha, or the Ayurvedic Pharmacopoeia of India) for a particular therapeutic condition (e.g., inflammation, anti-pyretic, wound healing, digestive disorders), a patent claim for using that plant or its direct aqueous/alcoholic extract for that known condition is directly barred under Section 3(p).
2. Combining two or more well-known traditional medicinal herbs without unexpected non-obvious synergy is barred under Section 3(p) as a mere aggregation or duplication of known properties.
3. Hindi translation / हिंदी अनुवाद:
भारतीय पेटेंट अधिनियम, 1970 की धारा 3(p) स्पष्ट करती है कि ऐसा कोई भी आविष्कार जो वस्तुतः पारंपरिक ज्ञान है या पारंपरिक रूप से ज्ञात घटकों के ज्ञात गुणों का केवल समुच्चय या दोहराव है, पेटेंट योग्य नहीं है। यदि किसी जड़ी-बूटी का उपयोग चरक संहिता या भावप्रकाश जैसे आयुर्वेदिक ग्रंथों में पहले से वर्णित है, तो उस पारंपरिक उपयोग पर पेटेंट नहीं दिया जा सकता।`,
      },
      {
        pageNumber: 3,
        text: `EXAMINATION GUIDELINES: SECTION 3(e) - MERE ADMIXTURE AND SYNERGY REQUIREMENTS
Under Section 3(e) of the Patents Act, 1970:
"A substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance is not patentable."

How an Ayurvedic Formulation Can Overcome Section 3(e):
1. Proof of Synergistic Effect: A formulation comprising known Ayurvedic herbs is patentable only if the combination produces a synergistic effect—meaning the therapeutic effect of the combination is significantly greater than the sum of the individual effects of the ingredients.
2. Comparative Experimental Data: The applicant must submit rigorous comparative in-vitro or in-vivo experimental data comparing:
   (a) The combination formulation;
   (b) Each individual active ingredient tested alone at corresponding concentrations.
Without explicit mathematical or biological evidence of synergy (e.g. Combination Index < 1.0 or statistically significant enhanced potency), the claim is rejected as a mere admixture under Section 3(e).
3. Hindi translation / हिंदी अनुवाद:
धारा 3(e) के अनुसार, केवल ज्ञात घटकों का मिश्रण (Mere Admixture) पेटेंट योग्य नहीं है। आयुर्वेदिक फॉर्मूलेशन के पेटेंट के लिए यह अनिवार्य शर्त है कि आवेदक 'सिनर्जिस्टिक प्रभाव' (Synergistic Effect) सिद्ध करे, यानी मिश्रण का प्रभाव प्रत्येक घटक के व्यक्तिगत प्रभाव के जोड़ से अत्यधिक और अप्रत्याशित रूप से अधिक होना चाहिए। इसके लिए तुलनात्मक प्रयोगात्मक डेटा प्रस्तुत करना अनिवार्य है।`,
      },
      {
        pageNumber: 4,
        text: `EXAMINATION GUIDELINES: SECTION 3(d) - NEW FORMS AND THERAPEUTIC EFFICACY
Under Section 3(d) of the Patents Act, 1970:
"The mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance... is not patentable."

Key Requirements for Herbal Extracts & Phytochemicals:
1. In the Supreme Court of India landmark judgment Novartis AG v. Union of India (2013), efficacy under Section 3(d) was ruled strictly to mean "therapeutic efficacy"—the curative or curative-enhancing capacity in curing disease, not mere physical, chemical, or pharmacokinetic changes (such as improved solubility, stability, or shelf-life).
2. If an applicant isolates a known molecule from an Ayurvedic plant (e.g. Curcumin from Turmeric) and modifies it into a nano-carrier, salt, ester, or polymorphic form, the application must demonstrate statistically significant superiority in therapeutic clinical/pharmacological efficacy over the known parent substance.
3. Minor formulation variations like converting a classical Churna into a capsule or tablet without novel therapeutic advantage fail Section 3(d).`,
      },
      {
        pageNumber: 5,
        text: `REGULATORY PREREQUISITE: NATIONAL BIODIVERSITY AUTHORITY (NBA) APPROVAL
Under Section 6(1) of the Biological Diversity Act, 2002:
"No person shall apply for any intellectual property right, by whatever name called, in or outside India for any invention based on any research or information on a biological resource obtained from India without obtaining the previous approval of the National Biodiversity Authority."

Crucial Compliance Checklist:
1. When Biological Resources of India are Used: Patent examiners in India issue a statutory formal objection under Section 6 of the Biological Diversity Act, 2002 if biological materials (herbs, roots, microbes, traditional plants) sourced in India are claimed.
2. The patent will NOT be granted until an official NBA Approval Certificate or Form III permission is submitted.
3. Benefit Sharing: The NBA may impose Fair and Equitable Benefit Sharing (ABS) agreements on commercial profits derived from the patented invention to benefit local communities and traditional knowledge holders.
4. Section 10(4)(ii)(D) of Patents Act: The patent specification must mandatorily disclose the country and specific geographical source where the biological resource was collected.`,
      },
    ],
  },
  {
    source: {
      id: 'doc-tkdl-framework',
      name: 'TKDL_CSIR_Traditional_Knowledge_Digital_Library.pdf',
      size: 385000,
      type: 'pdf',
      pageCount: 4,
      uploadedAt: Date.now() - 86400000 * 3,
      chunkCount: 0,
      status: 'indexed',
      isActiveForRag: true,
      lastIndexedAt: Date.now() - 86400000 * 3,
      description: 'Traditional Knowledge Digital Library (TKDL) - Council of Scientific and Industrial Research (CSIR) & Ministry of Ayush.',
      metadata: {
        title: 'Traditional Knowledge Digital Library (TKDL) Framework & Prior Art Access Agreements',
        authority: 'Council of Scientific and Industrial Research (CSIR) - TKDL',
        category: 'traditional_knowledge',
        jurisdiction: 'India / Global',
        documentType: 'Manual',
        publicationDate: '2022-03',
        lastUpdatedDate: '2023-01-15',
        officialSourceUrl: 'https://tkdl.res.in',
        notes: 'Covers TKRC classification, pre-grant opposition observations, and landmark turmeric and neem revocations.',
      },
    },
    pages: [
      {
        pageNumber: 1,
        text: `TRADITIONAL KNOWLEDGE DIGITAL LIBRARY (TKDL) - MISSION & REGULATORY FRAMEWORK
A Joint Initiative of the Council of Scientific and Industrial Research (CSIR) and Ministry of Ayush, Government of India.

1. BACKGROUND AND GENESIS
The Traditional Knowledge Digital Library (TKDL) was established in 2001 in response to widespread incidents of biopiracy and wrongful granting of patents on traditional Indian medicine in foreign patent offices.
Before TKDL, foreign patent examiners at the United States Patent and Trademark Office (USPTO) or European Patent Office (EPO) granted patents on traditional remedies because the prior art was documented in ancient languages (Sanskrit, Urdu, Arabic, Persian, Tamil) and was inaccessible to international patent examiners.

2. SCALE OF THE DATABASE
TKDL has transcribed, classified, and digitized over 34 million pages of classical Ayush texts covering Ayurveda, Unani, Siddha, and Sowa-Rigpa into 450,000+ therapeutic formulations.
TKDL systematically breaks language barriers by converting ancient shlokas into patent-structured formats in five international languages: English, German, French, Japanese, and Spanish.`,
      },
      {
        pageNumber: 2,
        text: `TRADITIONAL KNOWLEDGE RESOURCE CLASSIFICATION (TKRC) & ACCESS AGREEMENTS
1. The TKRC Innovation:
India created the Traditional Knowledge Resource Classification (TKRC), an advanced categorization system linked directly to the International Patent Classification (IPC). This allows patent examiners worldwide to search traditional formulations using standard international patent codes.

2. Access Agreements with International Patent Offices:
TKDL has signed non-disclosure Access Agreements with leading global patent offices, including:
- European Patent Office (EPO)
- United States Patent and Trademark Office (USPTO)
- Japan Patent Office (JPO)
- United Kingdom Intellectual Property Office (UKIPO)
- Canadian Intellectual Property Office (CIPO)
- IP Australia, German Patent and Trade Mark Office (DPMA), and Rospatent.

Examiners search the TKDL database under secure conditions during patent prosecution to verify whether a claimed herbal formulation is already known in Indian traditional medicine prior art.`,
      },
      {
        pageNumber: 3,
        text: `HOW TKDL PREVENTS WRONGFUL PATENTS AND BIOPIRACY
1. Pre-Grant Scrutiny and Third-Party Observations:
The TKDL team regularly monitors published international patent applications across WIPO, EPO, and USPTO. When an application attempts to claim a formulation or therapeutic use already documented in Ayush texts, TKDL submits formal "Third-Party Prior Art Observations" supported by verified citations from classical texts with exact verse and page numbers.

2. Immediate Revocation or Cancellation:
Based on TKDL evidence, international patent offices either reject the claims during examination, or applicants voluntarily withdraw or drastically amend their claims. This pre-grant mechanism saves millions of dollars and years of costly litigation compared to post-grant revocation proceedings.

3. Hindi Summary / हिंदी सारांश:
टीकेडीएल (TKDL) का मुख्य कार्य अंतरराष्ट्रीय स्तर पर भारतीय पारंपरिक ज्ञान के गलत पेटेंट (Biopiracy) को रोकना है। टीकेडीएल प्राचीन आयुर्वेदिक व यूनानी ग्रंथों के सूत्रों को 5 अंतरराष्ट्रीय भाषाओं (अंग्रेजी, जर्मन, फ्रेंच, जापानी, स्पैनिश) में अनुवादित कर अंतरराष्ट्रीय पेटेंट कार्यालयों (जैसे USPTO, EPO) को पूर्व-कला (Prior Art) के रूप में सुलभ कराता है। जब कोई कंपनी पारंपरिक उपचार पर पेटेंट के लिए आवेदन करती है, तो टीकेडीएल साक्ष्य प्रस्तुत कर आवेदन रद्द करवा देता है।`,
      },
      {
        pageNumber: 4,
        text: `LANDMARK CASE STUDIES IN PREVENTING BIOPIRACY
1. Turmeric Patent Revocation (US Patent 5,401,504):
The University of Mississippi Medical Center was granted a US patent in 1995 claiming the use of turmeric (Curcuma longa) for wound healing. CSIR challenged the patent, producing Sanskrit classical texts and a 1953 paper in the Indian Journal of Medical Research proving that turmeric wound healing is age-old prior art in India. The USPTO fully revoked all claims in 1997.

2. Neem Fungicidal Property Revocation (European Patent 436257):
W.R. Grace and the US Department of Agriculture obtained an EPO patent on the fungicidal effect of neem tree seeds (Azadirachta indica). Following opposition led by Indian scientists and civil society demonstrating that neem's insecticidal and antifungal properties have been documented for centuries in India, the EPO Opposition Division completely revoked the patent.

3. Other Prevented Claims:
TKDL has successfully foiled or forced the withdrawal of hundreds of wrongful patent filings concerning Ashwagandha (Withania somnifera), Karela/Bitter gourd for diabetes, Jamun, and Sarpagandha across the EPO, USPTO, and Canadian Patent Office.`,
      },
    ],
  },
  {
    source: {
      id: 'doc-wipo-gratk',
      name: 'WIPO_GRATK_Treaty_Geneva_2024.pdf',
      size: 310000,
      type: 'pdf',
      pageCount: 3,
      uploadedAt: Date.now() - 86400000 * 1,
      chunkCount: 0,
      status: 'indexed',
      isActiveForRag: true,
      lastIndexedAt: Date.now() - 86400000 * 1,
      description: 'WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge (Adopted at Geneva, May 24, 2024).',
      metadata: {
        title: 'WIPO Treaty on Intellectual Property, Genetic Resources and Associated Traditional Knowledge (GRATK)',
        authority: 'World Intellectual Property Organization (WIPO)',
        category: 'wipo',
        jurisdiction: 'International / Multilateral (WIPO)',
        documentType: 'Treaty',
        publicationDate: '2024-05-24',
        lastUpdatedDate: '2024-05-24',
        officialSourceUrl: 'https://www.wipo.int/diplomatic-conferences/en/genetic-resources/',
        notes: 'Article 3 mandatory disclosure rules for patent applicants regarding country of origin of genetic resources.',
      },
    },
    pages: [
      {
        pageNumber: 1,
        text: `WIPO TREATY ON INTELLECTUAL PROPERTY, GENETIC RESOURCES AND ASSOCIATED TRADITIONAL KNOWLEDGE (GRATK)
Adopted by the Diplomatic Conference at the World Intellectual Property Organization (WIPO), Geneva, on May 24, 2024.

1. HISTORIC SIGNIFICANCE
The GRATK Treaty represents a historic, landmark international treaty negotiated after more than two decades of deliberations within WIPO's Intergovernmental Committee on Intellectual Property and Genetic Resources, Traditional Knowledge and Folklore (IGC).
It is the first WIPO treaty to explicitly address the nexus between patents, genetic resources, and traditional knowledge held by Indigenous Peoples and local communities.

2. OBJECTIVES OF THE TREATY
(a) To enhance the efficacy, transparency, and quality of the patent system regarding genetic resources and associated traditional knowledge.
(b) To prevent patents from being granted erroneously for inventions that are not novel or do not involve an inventive step with respect to genetic resources and traditional knowledge.
(c) To support international cooperation and fair benefit sharing mechanisms.`,
      },
      {
        pageNumber: 2,
        text: `ARTICLE 3: MANDATORY DISCLOSURE REQUIREMENT
Under Article 3 of the WIPO GRATK Treaty:
1. Patent applications based on Genetic Resources:
Each Contracting Party shall require patent applicants to disclose:
(a) The country of origin of the genetic resources; or
(b) If the country of origin is not known to the applicant, the source of the genetic resources from which the applicant obtained them.

2. Patent applications based on Associated Traditional Knowledge:
Where the claimed invention in a patent application is based on traditional knowledge associated with genetic resources, the applicant must disclose:
(a) The Indigenous Peoples or local community that provided the traditional knowledge; or
(b) If that community is not known, the specific source from which the applicant directly obtained the traditional knowledge.

3. Opportunity to Rectify:
Contracting Parties must provide applicants with reasonable opportunities to rectify any failure to provide the required disclosure before refusing a patent application.`,
      },
      {
        pageNumber: 3,
        text: `ARTICLE 6: INFORMATION SYSTEMS, DIGITAL LIBRARIES & REMEDIES
1. Establishment of Information Systems:
Article 6 encourages Contracting Parties to establish digital libraries and databases of genetic resources and traditional knowledge (such as India's TKDL) in consultation with Indigenous Peoples and traditional custodians. These databases assist patent offices in conducting comprehensive prior art searches.

2. Prevention of Erroneous Patents:
By making traditional knowledge verifiable in patent examination workflows, the treaty prevents corporations from obtaining monopoly rights over ancestral indigenous knowledge without consent or benefit sharing.

3. Sanctions and Remedies:
Article 5 specifies that Contracting Parties shall put in place administrative or legal measures to address intentional failures to disclose. However, a granted patent cannot be revoked solely on grounds of non-disclosure unless fraudulent intent is proven in court.`,
      },
    ],
  },
];

/**
 * Initializes and returns all preloaded documents with their indexed chunks.
 */
export function getInitialPreloadedKnowledge(): {
  documents: DocumentSource[];
  chunks: KnowledgeChunk[];
} {
  const documents: DocumentSource[] = [];
  const chunks: KnowledgeChunk[] = [];

  for (const item of PRELOADED_DOCUMENTS) {
    const docChunks = chunkDocumentPages(item.source.id, item.source.name, item.pages, {
      authority: item.source.metadata.authority,
      category: item.source.metadata.category,
      jurisdiction: item.source.metadata.jurisdiction,
      officialSourceUrl: item.source.metadata.officialSourceUrl,
    });
    const updatedSource: DocumentSource = {
      ...item.source,
      chunkCount: docChunks.length,
      status: 'indexed',
      isActiveForRag: true,
      lastIndexedAt: Date.now(),
    };
    documents.push(updatedSource);
    chunks.push(...docChunks);
  }

  return { documents, chunks };
}
