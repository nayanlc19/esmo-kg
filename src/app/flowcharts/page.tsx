'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Node data with comprehensive 5W1H information
interface NodeInfo {
  label: string;
  what: string;
  why: string;
  who: string;
  when: string;
  where: string;
  how: string;
  trials?: string[];
  evidence?: string;
  children?: string[];
  category: 'stage' | 'decision' | 'treatment' | 'drug' | 'biomarker' | 'outcome';
}

const nodeData: Record<string, NodeInfo> = {
  'nsclc': {
    label: 'NSCLC Diagnosis',
    what: 'Non-Small Cell Lung Cancer - accounts for ~85% of all lung cancers. Subtypes: adenocarcinoma (40%), squamous cell (25-30%), large cell (10-15%).',
    why: 'Accurate histological diagnosis is essential because treatment strategy differs significantly between NSCLC subtypes and SCLC.',
    who: 'Patients with lung mass/nodule on imaging, suspicious symptoms (cough, hemoptysis, weight loss), or incidental finding.',
    when: 'At initial presentation. Median age at diagnosis: 70 years. Most present with advanced disease.',
    where: 'Diagnosis via bronchoscopy, CT-guided biopsy, or surgical biopsy. Tissue sent to pathology.',
    how: 'Histopathology + IHC (TTF-1, p40, CK5/6). Molecular testing (NGS) mandatory for non-squamous and never-smokers.',
    category: 'stage',
    children: ['stage-i', 'stage-ii', 'stage-iii', 'stage-iv'],
  },
  'stage-i': {
    label: 'Stage I',
    what: 'Tumor ≤4cm confined to lung, no lymph node involvement (N0). IA1: ≤1cm, IA2: >1-2cm, IA3: >2-3cm, IB: >3-4cm.',
    why: 'Early stage with best prognosis. Curative intent treatment possible. 5-year survival: 70-90%.',
    who: 'Patients with small, localized tumors. Often found incidentally on CT or via screening programs.',
    when: 'After complete staging workup: CT chest/abdomen, PET-CT, brain MRI if symptomatic.',
    where: 'Tumor confined to lung parenchyma. No mediastinal or hilar lymph node involvement.',
    how: 'TNM staging (8th edition): T1-T2a, N0, M0. PET-CT for mediastinal staging.',
    category: 'stage',
    children: ['stage-i-operable', 'stage-i-inoperable'],
  },
  'stage-ii': {
    label: 'Stage II',
    what: 'Tumor >4-5cm OR ipsilateral hilar lymph node involvement (N1). IIA: 4-5cm N0, IIB: >5cm N0 or T with N1.',
    why: 'Still potentially curable with surgery but higher recurrence risk. 5-year survival: 50-60%.',
    who: 'Patients with larger tumors or hilar node involvement but still surgically resectable.',
    when: 'After PET-CT and mediastinal staging. Consider EBUS/mediastinoscopy if PET+ mediastinal nodes.',
    where: 'Tumor may involve visceral pleura, main bronchus >2cm from carina. Hilar nodes may be involved.',
    how: 'TNM: T2b-T3 N0 or T1-T2 N1, M0. Adjuvant therapy required post-surgery.',
    category: 'stage',
    children: ['stage-ii-surgery'],
  },
  'stage-iii': {
    label: 'Stage III',
    what: 'Locally advanced NSCLC with mediastinal lymph node involvement (N2/N3) or T4 tumors. IIIA, IIIB, IIIC substages.',
    why: 'Heterogeneous group. Some resectable (IIIA-N2 single station), most unresectable. 5-year survival: 20-35%.',
    who: 'Patients with bulky mediastinal disease, multi-station N2, or N3 involvement.',
    when: 'After invasive mediastinal staging (EBUS, mediastinoscopy). MDT discussion mandatory.',
    where: 'Mediastinal structures involved: nodes, vessels, esophagus, vertebra, carina.',
    how: 'Resectable: trimodality therapy. Unresectable: concurrent CRT + consolidation immunotherapy.',
    category: 'stage',
    children: ['stage-iii-concurrent', 'stage-iii-sequential'],
  },
  'stage-iv': {
    label: 'Stage IV',
    what: 'Metastatic NSCLC - spread to contralateral lung, pleura, pericardium, or distant organs (brain, bone, liver, adrenals).',
    why: 'Incurable but treatable. Goal: prolong survival, maintain quality of life. Targeted therapy revolutionized outcomes.',
    who: '~55% of NSCLC patients present with Stage IV disease at diagnosis.',
    when: 'At diagnosis or progression from earlier stage. Comprehensive molecular testing before treatment.',
    where: 'Common metastatic sites: brain (30-40%), bone (30-40%), liver (20-30%), adrenals (20%).',
    how: 'Treatment based on molecular profile (oncogene-addicted vs wild-type) and PD-L1 expression.',
    category: 'stage',
    children: ['stage-iv-testing'],
  },
  'stage-i-operable': {
    label: 'Medically Operable',
    what: 'Patient assessed as fit for surgical resection based on cardiopulmonary function and performance status.',
    why: 'Surgery offers best chance of cure for Stage I NSCLC. 5-year survival >80% for IA.',
    who: 'ECOG PS 0-1, adequate pulmonary reserve (FEV1 >1.5L or >60% predicted), no severe cardiac disease.',
    when: 'Assessment within 4-6 weeks of diagnosis. Delay >8 weeks associated with worse outcomes.',
    where: 'Thoracic surgery center with high-volume experience. MDT assessment required.',
    how: 'Pulmonary function tests (spirometry, DLCO), cardiac evaluation, exercise testing if borderline.',
    category: 'decision',
    children: ['lobectomy', 'sublobar'],
  },
  'stage-i-inoperable': {
    label: 'Medically Inoperable',
    what: 'Patient unfit for surgery due to comorbidities, poor lung function, or patient preference.',
    why: 'SBRT provides comparable local control to surgery in inoperable patients. Alternative curative option.',
    who: 'Severe COPD (FEV1 <40%), severe cardiac disease, ECOG PS ≥2, elderly/frail, patient refusal.',
    when: 'After thorough assessment by thoracic surgeon and MDT. Second opinion recommended.',
    where: 'Radiation oncology center with SBRT capability.',
    how: 'Multidisciplinary assessment. Consider pulmonary rehabilitation before definitive treatment.',
    category: 'decision',
    children: ['sbrt'],
  },
  'lobectomy': {
    label: 'Lobectomy',
    what: 'Surgical removal of entire lung lobe containing the tumor. Gold standard for Stage I NSCLC.',
    why: 'Provides best oncological outcome with lowest local recurrence rate. Complete tumor removal with margins.',
    who: 'Medically fit patients with adequate pulmonary reserve. FEV1 >1.5L typically required.',
    when: 'Within 6-8 weeks of diagnosis. Neoadjuvant therapy not standard for Stage I.',
    where: 'Performed via VATS (video-assisted) or RATS (robotic) when possible. Open thoracotomy if needed.',
    how: 'Anatomical resection with complete fissure division. Systematic lymph node dissection mandatory.',
    evidence: '[I, A]',
    trials: ['LCSG 821: Lobectomy superior to limited resection - 75% vs 55% 5-year survival'],
    category: 'treatment',
    children: ['lymph-node-dissection'],
  },
  'sublobar': {
    label: 'Sublobar Resection',
    what: 'Limited resection: segmentectomy (anatomical) or wedge resection (non-anatomical). Less lung tissue removed.',
    why: 'Non-inferior to lobectomy for small tumors ≤2cm. Preserves more lung function.',
    who: 'Tumors ≤2cm, peripheral location, >50% ground-glass component on CT, compromised lung function.',
    when: 'After careful patient selection. Not recommended for solid tumors >2cm or central tumors.',
    where: 'High-volume thoracic surgery centers. Requires intraoperative frozen section to confirm margins.',
    how: 'Segmentectomy preferred over wedge. Margin ≥2cm or ≥tumor size required.',
    evidence: '[I, A]',
    trials: ['JCOG0802: Segmentectomy non-inferior to lobectomy for ≤2cm peripheral tumors (5-year OS 94% vs 91%)'],
    category: 'treatment',
    children: ['lymph-node-dissection'],
  },
  'sbrt': {
    label: 'SBRT',
    what: 'Stereotactic Body Radiation Therapy - high-dose, precisely targeted radiation delivered in 3-8 fractions.',
    why: 'Excellent local control (>90%) for medically inoperable Stage I. Non-invasive alternative to surgery.',
    who: 'Medically inoperable patients, patient preference, peripheral tumors ≤5cm.',
    when: 'After simulation CT and 4D-CT for motion management. Treatment over 1-2 weeks.',
    where: 'Radiation oncology center with SBRT expertise. Requires image guidance and motion management.',
    how: 'Typical dose: 54 Gy in 3 fractions (peripheral) or 50 Gy in 5 fractions (central). Daily image guidance.',
    evidence: '[II, A]',
    trials: ['RTOG 0236: 3-year local control 98%, 3-year OS 56%', 'CHISEL: SBRT superior to conventional RT'],
    category: 'treatment',
    children: ['surveillance'],
  },
  'lymph-node-dissection': {
    label: 'Lymph Node Dissection',
    what: 'Systematic removal/sampling of mediastinal and hilar lymph nodes during surgery for accurate staging.',
    why: 'Essential for accurate pathological staging. Upstaging occurs in 15-20% affecting adjuvant therapy decisions.',
    who: 'All patients undergoing surgical resection for NSCLC.',
    when: 'During primary surgery. Minimum stations: 2R, 4R, 7 for right-sided; 5, 6, 7 for left-sided tumors.',
    where: 'Mediastinal stations (levels 2-9) and hilar stations (levels 10-14).',
    how: 'Systematic sampling of ≥3 mediastinal + ≥3 N1 stations. Complete lymphadenectomy preferred.',
    evidence: '[III, A]',
    category: 'treatment',
    children: ['r0-resection', 'r1-resection'],
  },
  'r0-resection': {
    label: 'R0 Resection',
    what: 'Complete resection with microscopically negative margins. No residual tumor at surgical margins.',
    why: 'Best oncological outcome. Foundation for considering adjuvant therapy based on final pathology.',
    who: 'Goal for all surgical patients. Achieved in >90% of properly selected Stage I patients.',
    when: 'Confirmed on final pathology report, typically 5-7 days post-surgery.',
    where: 'All margins negative: bronchial, vascular, parenchymal.',
    how: 'Intraoperative frozen section for bronchial margin. Final pathology confirms R0 status.',
    category: 'outcome',
    children: ['surveillance'],
  },
  'r1-resection': {
    label: 'R1 Resection',
    what: 'Microscopic residual disease at surgical margin. Tumor cells visible at resection edge.',
    why: 'Associated with higher local recurrence. Requires additional treatment (re-resection or PORT).',
    who: 'Occurs in ~5% of resections. More common with central tumors or chest wall invasion.',
    when: 'Identified on final pathology. MDT discussion for management.',
    where: 'Bronchial stump, vascular margin, or parenchymal margin positive.',
    how: 'Options: re-resection if feasible, PORT to surgical bed, close surveillance.',
    category: 'outcome',
    children: ['port'],
  },
  'port': {
    label: 'PORT',
    what: 'Post-Operative Radiation Therapy - external beam radiation to the surgical bed and mediastinum.',
    why: 'May reduce local recurrence in R1 resection. Role controversial in completely resected N2 disease.',
    who: 'R1/R2 resection, positive bronchial margin. Not routine for R0 N2 (Lung ART negative).',
    when: '4-8 weeks post-surgery after adequate healing. Before or concurrent with adjuvant chemotherapy.',
    where: 'Radiation oncology. 3D-conformal or IMRT technique.',
    how: 'Dose: 50-54 Gy in 25-27 fractions to surgical bed. Avoid excessive lung/heart dose.',
    evidence: '[II, B]',
    trials: ['Lung ART: No OS benefit for PORT in completely resected N2 NSCLC'],
    category: 'treatment',
    children: ['surveillance'],
  },
  'surveillance': {
    label: 'Surveillance',
    what: 'Regular follow-up with imaging and clinical assessment to detect recurrence early.',
    why: '30-55% of resected NSCLC recur. Early detection may allow curative re-treatment.',
    who: 'All patients after curative-intent treatment (surgery, SBRT, or CRT).',
    when: 'CT every 6 months for 2-3 years, then annually for 5 years. More frequent if high-risk features.',
    where: 'Outpatient oncology or thoracic surgery clinic.',
    how: 'CT chest ± abdomen, clinical exam. PET-CT or brain MRI if symptoms or suspicious findings.',
    category: 'outcome',
  },
  'stage-ii-surgery': {
    label: 'Surgical Resection',
    what: 'Lobectomy or pneumonectomy with systematic lymph node dissection for Stage II NSCLC.',
    why: 'Surgery remains standard for resectable Stage II. Adjuvant therapy improves survival.',
    who: 'Medically fit patients with Stage II disease. ECOG PS 0-1.',
    when: 'After complete staging. Surgery within 6-8 weeks of diagnosis.',
    where: 'High-volume thoracic surgery center. Consider neoadjuvant therapy for N1 disease.',
    how: 'Anatomical resection (lobectomy preferred) + systematic lymph node dissection.',
    evidence: '[I, A]',
    category: 'treatment',
    children: ['egfr-testing-adj'],
  },
  'egfr-testing-adj': {
    label: 'EGFR Testing',
    what: 'Molecular testing for EGFR mutations (exon 19 deletion, L858R) on surgical specimen.',
    why: 'EGFR+ patients benefit dramatically from adjuvant osimertinib. DFS HR 0.17 in ADAURA trial.',
    who: 'All resected Stage IB-IIIA non-squamous NSCLC. Also consider for squamous in never-smokers.',
    when: 'On surgical pathology specimen. Results within 2 weeks to guide adjuvant therapy.',
    where: 'Molecular pathology lab. NGS or PCR-based testing.',
    how: 'Tissue-based testing preferred. Liquid biopsy if insufficient tissue. Test exons 18-21.',
    category: 'biomarker',
    children: ['osimertinib-adj', 'adj-chemo'],
  },
  'osimertinib-adj': {
    label: 'Osimertinib (Adjuvant)',
    what: '3rd generation EGFR TKI for adjuvant treatment. 80mg oral daily for 3 years.',
    why: 'Unprecedented DFS benefit: 83% vs 28% at 3 years (HR 0.17). First targeted adjuvant therapy approved.',
    who: 'EGFR+ (exon 19 del or L858R) Stage IB-IIIA NSCLC after complete resection.',
    when: 'Start within 10 weeks of surgery. After recovery from surgery (± adjuvant chemotherapy).',
    where: 'Outpatient oncology. Oral medication taken at home.',
    how: '80mg once daily with/without food. Continue for 3 years or until recurrence/toxicity.',
    evidence: '[I, A] MCBS 4',
    trials: ['ADAURA: DFS HR 0.17, 83% vs 28% disease-free at 3 years. CNS recurrence also reduced.'],
    category: 'drug',
  },
  'adj-chemo': {
    label: 'Adjuvant Chemotherapy',
    what: 'Cisplatin-based doublet chemotherapy for 4 cycles after complete resection.',
    why: '5% absolute survival benefit at 5 years (LACE meta-analysis). Standard for Stage II-IIIA.',
    who: 'Stage II-IIIA after R0 resection. Consider for high-risk Stage IB (tumor >4cm).',
    when: 'Start 4-8 weeks post-surgery. Complete within 4 months of surgery.',
    where: 'Outpatient oncology infusion center.',
    how: 'Cisplatin + vinorelbine (most studied) or cisplatin + pemetrexed (non-squamous). 4 cycles.',
    evidence: '[I, A]',
    trials: ['LACE meta-analysis: 5.4% absolute OS benefit at 5 years', 'JBR.10: Cisplatin-vinorelbine improved OS'],
    category: 'treatment',
  },
  'stage-iii-concurrent': {
    label: 'Concurrent CRT',
    what: 'Chemotherapy administered simultaneously with thoracic radiation. Standard for unresectable Stage III.',
    why: 'Superior to sequential CRT - improved OS (17 vs 14.6 months). Synergistic effect.',
    who: 'Good PS (ECOG 0-1), adequate organ function, able to tolerate combined toxicity.',
    when: 'After MDT confirms unresectability. Complete within 6-7 weeks.',
    where: 'Radiation oncology + medical oncology. Daily RT with concurrent chemo.',
    how: 'RT: 60 Gy in 30 fractions. Chemo: cisplatin-etoposide or carboplatin-paclitaxel weekly.',
    evidence: '[I, A]',
    trials: ['RTOG 9410: Concurrent vs sequential - median OS 17 vs 14.6 months'],
    category: 'treatment',
    children: ['consolidation-testing'],
  },
  'stage-iii-sequential': {
    label: 'Sequential CRT',
    what: 'Chemotherapy completed first, followed by thoracic radiation. Alternative for frail patients.',
    why: 'Lower acute toxicity than concurrent. Option when concurrent not tolerable.',
    who: 'ECOG PS 2, elderly, borderline organ function, patient preference.',
    when: 'Chemo x 2-4 cycles, then RT. Total duration 12-16 weeks.',
    where: 'Medical oncology then radiation oncology.',
    how: 'Platinum doublet x 2-4 cycles → 60 Gy thoracic RT.',
    evidence: '[I, A]',
    category: 'treatment',
    children: ['consolidation-testing'],
  },
  'consolidation-testing': {
    label: 'Biomarker Testing',
    what: 'Test EGFR mutation status and PD-L1 expression to guide consolidation therapy selection.',
    why: 'EGFR+ patients benefit from osimertinib (LAURA). EGFR-WT/PD-L1+ benefit from durvalumab (PACIFIC).',
    who: 'All Stage III patients completing CRT without progression.',
    when: 'Testing ideally done before CRT. Results guide consolidation choice.',
    where: 'Molecular pathology. Initial biopsy tissue or re-biopsy if needed.',
    how: 'NGS for EGFR, ALK, ROS1. PD-L1 IHC (22C3 or SP263 antibody).',
    category: 'decision',
    children: ['osimertinib-consol', 'durvalumab-consol'],
  },
  'osimertinib-consol': {
    label: 'Osimertinib (Consolidation)',
    what: '3rd gen EGFR TKI for consolidation after CRT in EGFR+ unresectable Stage III NSCLC.',
    why: 'LAURA trial: PFS 39.1 vs 5.6 months (HR 0.16). Dramatic benefit for EGFR+ patients.',
    who: 'EGFR+ (exon 19 del or L858R) unresectable Stage III without progression after CRT.',
    when: 'Start 1-6 weeks after completing CRT. Continue until progression.',
    where: 'Outpatient oncology. Oral medication.',
    how: '80mg once daily. No fixed duration - continue until progression or intolerable toxicity.',
    evidence: '[I, A] MCBS 4',
    trials: ['LAURA: PFS 39.1 vs 5.6 months, HR 0.16. 74% vs 22% PFS at 12 months.'],
    category: 'drug',
  },
  'durvalumab-consol': {
    label: 'Durvalumab (Consolidation)',
    what: 'PD-L1 antibody (immune checkpoint inhibitor) for consolidation after CRT in EGFR/ALK wild-type.',
    why: 'PACIFIC trial transformed Stage III outcomes. Median OS 47.5 vs 29.1 months.',
    who: 'EGFR/ALK wild-type, no progression after CRT, PD-L1 TC ≥1% (EMA), any PD-L1 (FDA).',
    when: 'Start 1-42 days after completing CRT. Treatment for 12 months.',
    where: 'Outpatient oncology infusion center.',
    how: '10mg/kg IV every 2 weeks for 12 months. Monitor for immune-related adverse events.',
    evidence: '[I, A] MCBS 4',
    trials: ['PACIFIC: OS 47.5 vs 29.1 months (HR 0.68). 4-year OS 49.6% vs 36.3%.'],
    category: 'drug',
  },
  'stage-iv-testing': {
    label: 'Molecular Testing',
    what: 'Comprehensive genomic profiling to identify actionable mutations and PD-L1 expression.',
    why: 'Treatment completely depends on molecular profile. Oncogene-addicted tumors respond dramatically to TKIs.',
    who: 'ALL Stage IV NSCLC patients, especially non-squamous and never-smokers.',
    when: 'BEFORE starting first-line therapy. Results typically 1-2 weeks. Liquid biopsy for rapid results.',
    where: 'Molecular pathology lab. NGS preferred over sequential testing.',
    how: 'NGS panel: EGFR, ALK, ROS1, BRAF, RET, MET ex14, NTRK, KRAS G12C, HER2. PD-L1 IHC.',
    category: 'biomarker',
    children: ['oncogene-addicted', 'non-oncogene'],
  },
  'oncogene-addicted': {
    label: 'Oncogene-Addicted',
    what: 'Tumors driven by specific actionable mutations. ~30% of non-squamous NSCLC harbor targetable drivers.',
    why: 'Targeted therapy provides superior outcomes vs chemo/immunotherapy. Different biology.',
    who: 'EGFR (~15% Caucasian, ~50% Asian), ALK (~5%), ROS1 (~2%), others (~5-10%).',
    when: 'Identified on molecular testing. First-line TKI is standard of care.',
    where: 'Treatment decisions in MDT. Access to appropriate targeted therapy.',
    how: 'Match mutation to approved TKI. Monitor for resistance. Re-biopsy at progression.',
    category: 'decision',
    children: ['egfr-mut', 'alk-fusion', 'other-targets'],
  },
  'non-oncogene': {
    label: 'Non-Oncogene Addicted',
    what: 'No actionable driver mutation. Treatment based on PD-L1 expression and histology.',
    why: 'Immunotherapy ± chemotherapy is standard. PD-L1 level guides monotherapy vs combination.',
    who: '~70% of NSCLC patients. Includes KRAS-mutant (non-G12C) and truly wild-type tumors.',
    when: 'After molecular testing rules out targetable mutations.',
    where: 'Treatment decisions based on PD-L1, histology, and patient factors.',
    how: 'PD-L1 ≥50%: consider pembrolizumab monotherapy. PD-L1 <50%: chemo-immunotherapy.',
    category: 'decision',
    children: ['pdl1-high', 'pdl1-low'],
  },
  'egfr-mut': {
    label: 'EGFR Mutation',
    what: 'Activating mutations in EGFR gene. Exon 19 deletion (~45%) and L858R (~40%) most common.',
    why: 'EGFR TKIs provide dramatic responses (ORR >70%) and prolonged survival.',
    who: '~15% Caucasian, ~50% Asian NSCLC. More common in adenocarcinoma, never-smokers, women.',
    when: 'Detected on initial NGS. Some mutations (T790M) emerge as resistance mechanisms.',
    where: 'Tissue or liquid biopsy. Exons 18-21 should be fully sequenced.',
    how: 'First-line: osimertinib (3rd gen). Alternatives: gefitinib, erlotinib, afatinib.',
    category: 'biomarker',
    children: ['osimertinib-1l'],
  },
  'osimertinib-1l': {
    label: 'Osimertinib (1st-line)',
    what: '3rd generation EGFR TKI. Irreversible inhibitor active against sensitizing mutations and T790M.',
    why: 'Superior OS vs 1st-gen TKIs (38.6 vs 31.8 months). Excellent CNS penetration.',
    who: 'First-line for EGFR exon 19 del or L858R. Consider for uncommon mutations.',
    when: 'Start immediately upon EGFR+ confirmation. Do not wait for all molecular results.',
    where: 'Outpatient oncology. Oral medication taken at home.',
    how: '80mg once daily with/without food. Continue until progression. Monitor for ILD, QTc.',
    evidence: '[I, A] MCBS 5',
    trials: ['FLAURA: OS 38.6 vs 31.8 months (HR 0.80). PFS 18.9 vs 10.2 months (HR 0.46).'],
    category: 'drug',
  },
  'alk-fusion': {
    label: 'ALK Fusion',
    what: 'ALK gene rearrangement creating oncogenic fusion protein. EML4-ALK most common partner.',
    why: 'Highly responsive to ALK TKIs. Multiple lines of effective therapy available.',
    who: '~5% of NSCLC. More common in young, never-smokers, adenocarcinoma.',
    when: 'Detected on NGS, FISH, or IHC. Should be tested in all non-squamous NSCLC.',
    where: 'Tissue testing. Liquid biopsy has lower sensitivity for fusions.',
    how: 'First-line: alectinib, brigatinib, or lorlatinib. Crizotinib no longer preferred.',
    category: 'biomarker',
    children: ['alectinib'],
  },
  'alectinib': {
    label: 'Alectinib',
    what: '2nd generation ALK TKI. Highly selective with excellent CNS penetration.',
    why: 'Superior to crizotinib: 5-year OS 62.5% vs 45.5%. Prevents brain metastases.',
    who: 'First-line treatment for ALK+ NSCLC. Preferred over crizotinib.',
    when: 'Start upon ALK+ confirmation. Continue until progression.',
    where: 'Outpatient oncology. Oral medication.',
    how: '600mg twice daily with food. Monitor LFTs, CPK, bradycardia.',
    evidence: '[I, A]',
    trials: ['ALEX: 5-year OS 62.5% vs 45.5% with crizotinib. PFS HR 0.43.'],
    category: 'drug',
  },
  'other-targets': {
    label: 'Other Targets',
    what: 'Less common but actionable targets: BRAF V600E, RET, MET ex14, NTRK, KRAS G12C, HER2.',
    why: 'Each has approved or emerging targeted therapy. Testing is essential.',
    who: 'BRAF V600E (~2%), RET (~2%), MET ex14 (~3%), NTRK (<1%), KRAS G12C (~13%), HER2 (~3%).',
    when: 'Identified on comprehensive NGS panel.',
    where: 'Specialized molecular pathology. Some require specific assays (MET FISH).',
    how: 'BRAF: dabrafenib+trametinib. RET: selpercatinib/pralsetinib. MET: capmatinib/tepotinib. KRAS G12C: sotorasib/adagrasib.',
    category: 'biomarker',
  },
  'pdl1-high': {
    label: 'PD-L1 ≥50%',
    what: 'High PD-L1 expression on tumor cells (≥50% TPS). Strong predictor of immunotherapy response.',
    why: 'Can receive pembrolizumab monotherapy - avoids chemotherapy toxicity. ORR ~45%.',
    who: '~25-30% of NSCLC patients have PD-L1 ≥50%.',
    when: 'Determined by IHC on biopsy tissue. 22C3 assay for pembrolizumab.',
    where: 'Pathology lab. Testing on adequate tissue sample required.',
    how: 'Options: pembrolizumab monotherapy OR chemo-immunotherapy combination.',
    category: 'biomarker',
    children: ['pembro-mono'],
  },
  'pembro-mono': {
    label: 'Pembrolizumab Mono',
    what: 'PD-1 checkpoint inhibitor monotherapy. 200mg IV every 3 weeks or 400mg every 6 weeks.',
    why: 'Avoids chemotherapy toxicity. OS 30 vs 14.2 months vs chemo alone for PD-L1 ≥50%.',
    who: 'PD-L1 ≥50%, no EGFR/ALK alterations, no contraindications to immunotherapy.',
    when: 'First-line treatment. Continue until progression or 2 years (35 cycles).',
    where: 'Outpatient oncology infusion center.',
    how: '200mg IV q3w or 400mg IV q6w. Monitor for immune-related adverse events (irAEs).',
    evidence: '[I, A] MCBS 5',
    trials: ['KEYNOTE-024: OS 30 vs 14.2 months (HR 0.62). PFS 10.3 vs 6.0 months.'],
    category: 'drug',
  },
  'pdl1-low': {
    label: 'PD-L1 <50%',
    what: 'Low or negative PD-L1 expression (<50% TPS). May still benefit from immunotherapy.',
    why: 'Chemo-immunotherapy combination provides benefit regardless of PD-L1 level.',
    who: '~70-75% of NSCLC patients have PD-L1 <50%.',
    when: 'Determined by IHC. PD-L1 1-49% still benefits from combination; PD-L1 <1% benefit smaller.',
    where: 'Pathology lab.',
    how: 'Standard treatment: platinum-based chemotherapy + immunotherapy combination.',
    category: 'biomarker',
    children: ['chemo-io'],
  },
  'chemo-io': {
    label: 'Chemo-Immunotherapy',
    what: 'Platinum doublet chemotherapy combined with PD-1/PD-L1 inhibitor. Standard for PD-L1 <50%.',
    why: 'Synergistic effect. OS benefit regardless of PD-L1 level. Rapidly controls disease.',
    who: 'EGFR/ALK wild-type Stage IV NSCLC, especially PD-L1 <50%.',
    when: 'First-line treatment. 4 cycles chemo + ICI, then ICI maintenance.',
    where: 'Outpatient oncology infusion center.',
    how: 'Non-squamous: carboplatin-pemetrexed-pembrolizumab. Squamous: carboplatin-paclitaxel-pembrolizumab.',
    evidence: '[I, A]',
    trials: ['KEYNOTE-189: OS 22 vs 10.6 months (HR 0.56). KEYNOTE-407: OS 17.1 vs 11.6 months (HR 0.71).'],
    category: 'treatment',
  },
};

const categoryColors: Record<string, string> = {
  stage: '#9333ea',
  decision: '#1e40af',
  treatment: '#16a34a',
  drug: '#2563eb',
  biomarker: '#ea580c',
  outcome: '#10b981',
};

export default function FlowchartsPage() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['nsclc']));
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Build nodes and edges
  const { nodes, edges } = useMemo(() => {
    const resultNodes: Node[] = [];
    const resultEdges: Edge[] = [];

    // BFS to build the tree
    const queue: { id: string; x: number; y: number }[] = [{ id: 'nsclc', x: 400, y: 50 }];
    const visited = new Set<string>();
    const levelNodes: Record<number, string[]> = {};
    const nodePositions: Record<string, { x: number; y: number }> = {};

    // First pass: collect all visible nodes by level
    const tempQueue: { id: string; level: number }[] = [{ id: 'nsclc', level: 0 }];
    while (tempQueue.length > 0) {
      const { id, level } = tempQueue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);

      if (!levelNodes[level]) levelNodes[level] = [];
      levelNodes[level].push(id);

      const data = nodeData[id];
      if (data?.children && expandedNodes.has(id)) {
        data.children.forEach(childId => {
          tempQueue.push({ id: childId, level: level + 1 });
        });
      }
    }

    // Calculate positions
    Object.entries(levelNodes).forEach(([levelStr, ids]) => {
      const level = parseInt(levelStr);
      const totalWidth = 900;
      const spacing = totalWidth / (ids.length + 1);

      ids.forEach((id, idx) => {
        nodePositions[id] = {
          x: spacing * (idx + 1),
          y: 50 + level * 130,
        };
      });
    });

    // Create nodes
    visited.clear();
    const nodeQueue = ['nsclc'];
    while (nodeQueue.length > 0) {
      const id = nodeQueue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);

      const data = nodeData[id];
      if (!data) continue;

      const pos = nodePositions[id] || { x: 400, y: 50 };
      const hasChildren = data.children && data.children.length > 0;
      const isExpanded = expandedNodes.has(id);

      resultNodes.push({
        id,
        position: pos,
        data: {
          label: (
            <div className="text-center">
              <div className="font-semibold text-sm">{data.label}</div>
              {data.evidence && (
                <div className="text-xs opacity-80 mt-1">{data.evidence}</div>
              )}
              {hasChildren && (
                <div className="text-xs opacity-60 mt-1">
                  {isExpanded ? '▼ Click to collapse' : '► Click to expand'}
                </div>
              )}
            </div>
          ),
        },
        style: {
          background: categoryColors[data.category],
          color: 'white',
          border: hoveredNode === id ? '3px solid #fbbf24' : '2px solid rgba(255,255,255,0.2)',
          borderRadius: data.category === 'decision' ? '20px' : '8px',
          padding: '10px 14px',
          minWidth: '120px',
          maxWidth: '160px',
          cursor: hasChildren ? 'pointer' : 'default',
          boxShadow: hoveredNode === id ? '0 0 20px rgba(251, 191, 36, 0.5)' : '0 4px 6px rgba(0,0,0,0.3)',
        },
      });

      // Add children to queue and create edges
      if (data.children && isExpanded) {
        data.children.forEach(childId => {
          nodeQueue.push(childId);
          resultEdges.push({
            id: `${id}-${childId}`,
            source: id,
            target: childId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#6b7280', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
          });
        });
      }
    }

    return { nodes: resultNodes, edges: resultEdges };
  }, [expandedNodes, hoveredNode]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  // Update when nodes/edges change
  useEffect(() => {
    setFlowNodes(nodes);
    setFlowEdges(edges);
  }, [nodes, edges, setFlowNodes, setFlowEdges]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const data = nodeData[node.id];
    if (data?.children) {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
    }
  }, []);

  const handleNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    setHoveredNode(node.id);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  const hoveredData = hoveredNode ? nodeData[hoveredNode] : null;

  return (
    <div className="h-screen bg-slate-900 flex">
      <div className="flex-1 relative">
        <div className="absolute top-0 left-0 right-0 z-10 bg-gray-900/95 border-b border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">ESMO Living Guidelines - Interactive Flowchart</h1>
              <p className="text-sm text-gray-400">Click nodes to expand. Hover for details.</p>
            </div>
            <Link href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              View Knowledge Graph
            </Link>
          </div>
        </div>

        <div className="h-full pt-16">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            onNodeMouseEnter={handleNodeMouseEnter}
            onNodeMouseLeave={handleNodeMouseLeave}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Background color="#374151" gap={20} />
            <Controls />
          </ReactFlow>
        </div>

        <div className="absolute bottom-4 left-4 bg-gray-900/95 p-3 rounded-lg border border-gray-700 text-xs">
          <h3 className="font-bold text-white mb-2">Legend</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(categoryColors).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ background: color }} />
                <span className="text-gray-300 capitalize">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-96 bg-gray-900 border-l border-gray-700 overflow-y-auto">
        {hoveredData ? (
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded" style={{ background: categoryColors[hoveredData.category] }} />
              <span className="text-xs text-gray-400 uppercase tracking-wide">{hoveredData.category}</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{hoveredData.label}</h2>
            {hoveredData.evidence && (
              <div className="mb-4">
                <span className="inline-block bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  {hoveredData.evidence}
                </span>
              </div>
            )}

            {/* 5W1H Sections */}
            <div className="space-y-3">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <span className="text-base">📋</span> WHAT
                </h3>
                <p className="text-sm text-gray-200 leading-relaxed">{hoveredData.what}</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <span className="text-base">🎯</span> WHY
                </h3>
                <p className="text-sm text-gray-200 leading-relaxed">{hoveredData.why}</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <span className="text-base">👥</span> WHO
                </h3>
                <p className="text-sm text-gray-200 leading-relaxed">{hoveredData.who}</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <span className="text-base">⏰</span> WHEN
                </h3>
                <p className="text-sm text-gray-200 leading-relaxed">{hoveredData.when}</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <span className="text-base">📍</span> WHERE
                </h3>
                <p className="text-sm text-gray-200 leading-relaxed">{hoveredData.where}</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <span className="text-base">🔧</span> HOW
                </h3>
                <p className="text-sm text-gray-200 leading-relaxed">{hoveredData.how}</p>
              </div>

              {/* Key Trials */}
              {hoveredData.trials && hoveredData.trials.length > 0 && (
                <div className="bg-indigo-900/30 rounded-lg p-3 border border-indigo-700/50">
                  <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <span className="text-base">🔬</span> KEY TRIALS
                  </h3>
                  <div className="space-y-2">
                    {hoveredData.trials.map((trial, idx) => (
                      <div key={idx} className="bg-indigo-900/40 p-2 rounded text-xs text-indigo-100 leading-relaxed">
                        {trial}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-gray-400 text-sm">
            <h2 className="text-lg font-bold text-white mb-3">ESMO Lung Cancer Guidelines</h2>
            <p className="mb-3">Interactive decision tree for NSCLC management based on ESMO Living Guidelines.</p>

            <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
              <p className="mb-2"><span className="text-blue-400 font-semibold">Hover</span> over any node for complete 5W1H notes:</p>
              <ul className="text-xs space-y-1 ml-2">
                <li><span className="text-blue-400">WHAT</span> - Definition & details</li>
                <li><span className="text-green-400">WHY</span> - Clinical rationale</li>
                <li><span className="text-purple-400">WHO</span> - Patient selection</li>
                <li><span className="text-yellow-400">WHEN</span> - Timing & sequencing</li>
                <li><span className="text-orange-400">WHERE</span> - Location/setting</li>
                <li><span className="text-cyan-400">HOW</span> - Methodology</li>
              </ul>
            </div>

            <p className="mb-4"><span className="text-green-400 font-semibold">Click</span> nodes to expand treatment pathways</p>

            <div className="border-t border-gray-700 pt-3">
              <h3 className="text-xs font-semibold text-gray-300 mb-2">Evidence Levels</h3>
              <div className="text-xs space-y-1">
                <p><span className="text-green-400 font-semibold">[I, A]</span> Meta-analysis/RCTs + Strong</p>
                <p><span className="text-blue-400 font-semibold">[II, B]</span> Single RCT + Moderate</p>
                <p><span className="text-purple-400 font-semibold">MCBS 4-5</span> High clinical benefit</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
