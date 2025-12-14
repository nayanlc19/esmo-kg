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

// Node data with comprehensive educational notes
interface NodeInfo {
  label: string;
  notes: string; // Rich educational content
  history?: string; // Historical context, discovery, evolution
  mechanism?: string; // Biology, how it works
  clinicalPearl?: string; // Practical tips
  otherContexts?: string; // Use in other cancers/stages
  trials?: string[];
  evidence?: string;
  children?: string[];
  category: 'stage' | 'decision' | 'treatment' | 'drug' | 'biomarker' | 'outcome';
}

const nodeData: Record<string, NodeInfo> = {
  'nsclc': {
    label: 'NSCLC Diagnosis',
    notes: `Non-Small Cell Lung Cancer (NSCLC) represents about 85% of all lung cancers, with the remaining 15% being Small Cell Lung Cancer (SCLC). This distinction matters enormously because SCLC behaves completely differently - it's neuroendocrine, rapidly dividing, and treated primarily with chemotherapy.

NSCLC has three main subtypes:
• **Adenocarcinoma (40%)**: Most common, arises from glandular cells. More common in never-smokers and women. This is where most targetable mutations (EGFR, ALK, ROS1) are found.
• **Squamous Cell (25-30%)**: Arises from bronchial epithelium. Strongly linked to smoking. Central location. Rarely has EGFR/ALK mutations but can have FGFR, PIK3CA alterations.
• **Large Cell (10-15%)**: Diagnosis of exclusion - poorly differentiated, lacks features of adeno or squamous.

The distinction matters for treatment: adenocarcinoma responds to pemetrexed and has targetable mutations; squamous doesn't respond to pemetrexed (lacks thymidylate synthase) and bevacizumab is contraindicated (bleeding risk).`,
    history: `Lung cancer wasn't always so common. In the early 1900s, it was rare enough that medical students would be called to see a case. The tobacco epidemic of the 20th century changed everything. By the 1950s, landmark studies (Doll & Hill, 1950) established the smoking-lung cancer link.

The NSCLC vs SCLC distinction became clinically important in the 1970s when it was recognized that SCLC responds dramatically to chemotherapy while NSCLC does not. The molecular era began in 2004 with the discovery of EGFR mutations, transforming how we think about lung cancer from a histology-based to a molecular-based disease.`,
    mechanism: `Lung cancer develops through accumulation of genetic mutations, typically over decades. Tobacco smoke contains >60 carcinogens that cause DNA damage. The sequence usually involves:

1. Normal epithelium → Hyperplasia → Dysplasia → Carcinoma in situ → Invasive cancer

Key driver mutations differ by subtype:
• Adenocarcinoma: KRAS (25%), EGFR (15% Caucasian, 50% Asian), ALK (5%), others
• Squamous: TP53 (>80%), PIK3CA, FGFR1 amplification
• Never-smoker adenocarcinoma: Much higher rate of targetable drivers (EGFR, ALK, ROS1, RET)`,
    clinicalPearl: `Always get enough tissue! A small biopsy may be sufficient for diagnosis but inadequate for molecular testing. Request "reflex" molecular testing upfront for all non-squamous NSCLC - don't wait for the oncologist to order it. Time is tumor.`,
    category: 'stage',
    children: ['stage-i', 'stage-ii', 'stage-iii', 'stage-iv'],
  },
  'stage-i': {
    label: 'Stage I',
    notes: `Stage I is the earliest form of invasive lung cancer - the tumor is small (≤4cm) and confined entirely to the lung with no spread to lymph nodes. This is the "best case scenario" for lung cancer.

**Substaging matters for prognosis:**
• IA1 (≤1cm): 5-year survival 92%
• IA2 (>1-2cm): 5-year survival 83%
• IA3 (>2-3cm): 5-year survival 77%
• IB (>3-4cm): 5-year survival 68%

**Why is Stage I often missed?** Lung cancer causes no symptoms until advanced. Stage I is usually found:
• Incidentally on CT for other reasons
• Through lung cancer screening (LDCT) in high-risk individuals
• The US Preventive Services Task Force recommends annual LDCT for adults 50-80 years with ≥20 pack-year smoking history

**The N0 designation is critical** - it means no lymph node involvement. If even microscopic cancer is found in hilar nodes, it becomes Stage II. This is why systematic lymph node sampling during surgery is mandatory.`,
    history: `The TNM staging system was developed by Pierre Denoix in the 1940s-50s and has been refined through 8 editions. The current 8th edition (2017) subdivided Stage IA into three groups (IA1, IA2, IA3) because survival data showed significant differences even among small tumors.

The NLST trial (2011) was landmark - it showed 20% reduction in lung cancer mortality with low-dose CT screening vs chest X-ray, leading to widespread screening recommendations.`,
    mechanism: `At Stage I, the cancer has invaded through the basement membrane (making it invasive rather than in-situ) but hasn't yet developed the ability to spread to lymphatics or blood vessels in a clinically significant way.

Tumor size correlates with metastatic potential because larger tumors have had more time to accumulate mutations enabling spread, and have greater heterogeneity increasing the chance of aggressive subclones.`,
    clinicalPearl: `Don't skip the PET-CT! Even in apparent Stage I, PET-CT upstages 10-15% of patients by detecting unsuspected mediastinal nodes or distant metastases. A negative PET-CT is reassuring but not perfect - some slow-growing adenocarcinomas (especially ground-glass) may be PET-negative.`,
    category: 'stage',
    children: ['stage-i-operable', 'stage-i-inoperable'],
  },
  'stage-ii': {
    label: 'Stage II',
    notes: `Stage II represents locally advanced but still surgically resectable disease. The cancer has either grown larger (>4cm) or spread to nearby hilar/intrapulmonary lymph nodes (N1), but NOT to mediastinal nodes.

**What defines Stage II:**
• IIA: Tumor 4-5cm, no nodes (T2b N0)
• IIB: Tumor >5cm no nodes (T3 N0) OR smaller tumor with hilar nodes (T1-2 N1)

**The key difference from Stage I:** Higher recurrence risk means adjuvant therapy is standard, not optional. Without adjuvant treatment, ~50% recur.

**N1 nodes are "near" nodes:** These are nodes within the lung itself or at the hilum (where bronchus and vessels enter the lung). They're removed during standard lobectomy. N2 nodes (mediastinal) are a different story - they're outside the lung and their involvement dramatically worsens prognosis.`,
    history: `The benefit of adjuvant chemotherapy was established through multiple trials in the early 2000s. The LACE meta-analysis (2008) pooled 5 trials with 4,584 patients and showed 5.4% absolute improvement in 5-year survival with cisplatin-based adjuvant chemotherapy.

More recently, ADAURA (2020) revolutionized adjuvant therapy for EGFR+ patients, showing osimertinib reduces recurrence risk by 83%. This was the first targeted adjuvant therapy approved in lung cancer.`,
    mechanism: `N1 involvement means cancer cells have entered the lymphatic system and established growth in regional nodes. This is a critical step in metastasis - lymphatic spread often precedes hematogenous (blood) spread.

The lymphatic drainage of the lung follows the bronchi - tumor cells track along lymphatics to bronchopulmonary (N1) nodes, then to hilar and mediastinal (N2) nodes.`,
    clinicalPearl: `If PET shows hot mediastinal nodes, DON'T assume it's N2 disease - prove it! Inflammatory nodes can be PET-positive. EBUS-TBNA or mediastinoscopy should confirm N2 before declaring someone unresectable. Conversely, microscopic N2 disease can be PET-negative.`,
    category: 'stage',
    children: ['stage-ii-surgery'],
  },
  'stage-iii': {
    label: 'Stage III',
    notes: `Stage III is the most heterogeneous and challenging stage - it spans from potentially resectable disease to clearly unresectable locally advanced cancer. The defining feature is spread to mediastinal lymph nodes (N2/N3) or invasion of critical structures.

**The critical question: Resectable or not?**
• Resectable IIIA: Single-station N2, non-bulky, good response to induction therapy
• Unresectable IIIA/IIIB/IIIC: Bulky multi-station N2, N3 (contralateral or supraclavicular nodes), T4 invading heart/great vessels/esophagus/vertebra

**Why N2 matters so much:** The mediastinum is the central compartment of the chest containing the heart, great vessels, trachea, and esophagus. N2 nodes are in this space. Their involvement means cancer has spread beyond the lung into the body's central highway.

**5-year survival:** 20-35% overall, but highly variable. Single-station, microscopic N2 treated with surgery + adjuvant therapy can reach 40%. Bulky multi-station N2 is closer to 15%.`,
    history: `The role of surgery in Stage III N2 disease has been debated for decades. The Intergroup 0139 trial (2009) compared surgery vs definitive chemoradiation for resectable IIIA-N2 - no overall survival difference, but pneumonectomy had high mortality. This led to preference for lobectomy over pneumonectomy in this setting.

The PACIFIC trial (2017) transformed unresectable Stage III outcomes by adding durvalumab consolidation after chemoradiation, improving median survival from 29 to 47 months.`,
    mechanism: `N2/N3 involvement represents more extensive lymphatic spread. The mediastinal lymph node stations are numbered:
• Upper mediastinal (1-4): Highest paratracheal, upper/lower paratracheal, prevascular
• Aortopulmonary (5-6): Near aortic arch
• Subcarinal (7): Below carina - very important station
• Lower mediastinal (8-9): Near esophagus and pulmonary ligament

N3 means contralateral mediastinal or supraclavicular nodes - crossing the midline indicates more systemic disease.`,
    clinicalPearl: `Every Stage III patient needs MDT discussion. The resectable vs unresectable decision requires expertise. Don't just look at scans - consider the patient's fitness, lung function, and whether an R0 resection is achievable. A non-curative surgery is worse than definitive chemoradiation.`,
    category: 'stage',
    children: ['stage-iii-concurrent', 'stage-iii-sequential'],
  },
  'stage-iv': {
    label: 'Stage IV',
    notes: `Stage IV is metastatic lung cancer - the cancer has spread beyond the chest to distant sites. This is incurable with current treatments, but "incurable" no longer means "rapidly fatal." With the right treatment, many patients live years.

**Common metastatic sites and why:**
• **Brain (30-40%)**: Lung cancer has tropism for brain. The blood-brain barrier doesn't protect well against circulating tumor cells
• **Bone (30-40%)**: Vertebrae, ribs, pelvis. Often painful, can cause fractures
• **Liver (20-30%)**: Large blood flow filters tumor cells
• **Adrenals (20%)**: Small organs but highly vascular, common site

**The molecular revolution:** Before 2004, median survival was 8-10 months with chemotherapy. Now:
• EGFR+ with osimertinib: median OS ~39 months
• ALK+ with alectinib: median OS >5 years
• PD-L1 high with pembrolizumab: median OS ~30 months

**Stage IV is not one disease** - it's dozens of molecular subtypes each requiring different treatment.`,
    history: `The transformation of Stage IV lung cancer is one of oncology's greatest success stories:

• 2004: EGFR mutations discovered (Lynch, Paez, Pao - three simultaneous publications)
• 2007: ALK fusions discovered
• 2010: First EGFR TKIs approved
• 2015: First checkpoint inhibitor (nivolumab) approved
• 2016: Pembrolizumab for PD-L1 ≥50%
• 2018: First-line pembrolizumab + chemo becomes standard
• 2020: Osimertinib becomes first-line EGFR standard (FLAURA)

We went from one treatment (platinum doublet) to precision medicine matching treatment to tumor biology.`,
    mechanism: `Metastasis requires cancer cells to complete multiple steps:
1. Local invasion through basement membrane
2. Intravasation into blood/lymph vessels
3. Survival in circulation
4. Extravasation at distant site
5. Colonization and growth in new microenvironment

Different organs provide different "soil" for the cancer "seed." Brain metastases are common in lung cancer partly because the brain microenvironment supports their growth.`,
    clinicalPearl: `NEVER start treatment without molecular testing results in non-squamous NSCLC. Yes, patients are anxious to start. But giving chemo-IO to an EGFR+ patient is harmful - it reduces efficacy of subsequent TKI and adds toxicity. Liquid biopsy can give results in 3-5 days if tissue testing is delayed.`,
    otherContexts: `Oligometastatic disease (limited metastases, typically ≤3-5 sites) is a special situation. Local ablative therapy (SBRT, surgery) to all sites may provide long-term control in select patients. The SABR-COMET trial showed improved survival with ablation of oligometastases.`,
    category: 'stage',
    children: ['stage-iv-testing'],
  },
  'stage-i-operable': {
    label: 'Medically Operable',
    notes: `"Medically operable" means the patient can safely undergo lung surgery and is expected to survive the operation with acceptable quality of life. This assessment is as important as the cancer staging itself.

**Key assessments:**
• **Performance Status (ECOG 0-1)**: Can the patient care for themselves? Walk around? Active lifestyle?
• **Pulmonary Function**: FEV1 and DLCO are critical. Post-operative predicted values must be adequate
• **Cardiac Status**: Heart disease is common in lung cancer patients (shared risk factor: smoking)
• **Nutritional Status**: Severe malnutrition increases surgical risk

**The "3-legged stool" of operability:**
1. Oncologically resectable (can achieve R0)
2. Medically fit (can survive surgery)
3. Functionally adequate (will have acceptable lung function after)

**Why surgery over radiation?** For fit patients, surgery provides the best long-term outcomes. It removes the tumor completely (not just "controls" it), provides complete pathological staging (finding occult N1/N2 disease), and has lower long-term recurrence rates than SBRT.`,
    mechanism: `Pulmonary function testing predicts post-operative function:
• **FEV1** (Forced Expiratory Volume in 1 second): Measures airflow. Need predicted post-op FEV1 >40% or >800mL
• **DLCO** (Diffusing Capacity): Measures gas exchange. Often reduced in emphysema
• **VO2max**: Cardiopulmonary exercise testing for borderline cases

The lung has reserve capacity - you can lose a lobe and still function normally if your baseline is good.`,
    clinicalPearl: `Age alone is not a contraindication! An 80-year-old with excellent lung function and no comorbidities may be a better surgical candidate than a 60-year-old with severe COPD. Physiological age matters more than chronological age.`,
    category: 'decision',
    children: ['lobectomy', 'sublobar'],
  },
  'stage-i-inoperable': {
    label: 'Medically Inoperable',
    notes: `"Medically inoperable" doesn't mean untreatable - it means the patient cannot safely undergo surgery. SBRT (Stereotactic Body Radiation Therapy) offers an excellent alternative with comparable local control rates.

**Common reasons for inoperability:**
• **Severe COPD**: FEV1 <40% predicted, oxygen-dependent
• **Cardiac Disease**: Recent MI, unstable angina, severe heart failure
• **Poor Performance Status**: ECOG ≥2, unable to perform activities of daily living
• **Patient Preference**: Some patients refuse surgery

**Important distinction:** Medically inoperable is different from technically unresectable. A tumor can be technically resectable but the patient can't tolerate surgery. Conversely, a fit patient might have a technically unresectable tumor (e.g., involving the carina).

**SBRT outcomes:** Local control >90%, comparable to surgery for small tumors. The ROSEL and STARS trials (combined analysis) suggested no difference between surgery and SBRT for Stage I, though these were small studies.`,
    history: `Before SBRT, medically inoperable patients had limited options - conventional radiation therapy had poor local control rates (~50%). SBRT developed from cranial radiosurgery (Gamma Knife) in the 1990s, extended to body tumors in the early 2000s.

The term "stereotactic" refers to precise 3D localization - the same technology used in brain surgery. "Body" distinguishes it from cranial radiosurgery.`,
    clinicalPearl: `Always get a thoracic surgery evaluation before declaring someone inoperable. Sometimes surgical risk can be reduced with preoperative optimization (pulmonary rehab, cardiac optimization, nutrition). A borderline patient might become operable with preparation.`,
    category: 'decision',
    children: ['sbrt'],
  },
  'lobectomy': {
    label: 'Lobectomy',
    notes: `Lobectomy - removal of an entire lung lobe - has been the gold standard for operable lung cancer since the 1960s. The lung has 5 lobes (3 right, 2 left), and removing one lobe provides wide margins around the tumor while preserving enough lung function for normal life.

**Why lobectomy over smaller resection?**
The LCSG 821 trial (1995) established lobectomy's superiority over limited resection, showing higher local recurrence (17% vs 6%) and worse survival with wedge resection. This was dogma for decades.

**But the paradigm is shifting:** Recent trials (JCOG0802, CALGB 140503) showed that for small (≤2cm), peripheral tumors, segmentectomy is non-inferior. The key is patient selection.

**Surgical approaches:**
• **VATS (Video-Assisted Thoracoscopic Surgery)**: Small incisions, camera-guided. Less pain, faster recovery
• **RATS (Robotic-Assisted)**: Robot-controlled instruments. Enhanced precision, 3D visualization
• **Open Thoracotomy**: Traditional large incision. Still needed for complex cases

VATS/RATS have equivalent oncological outcomes to open surgery with less morbidity.`,
    history: `The first successful pneumonectomy for lung cancer was performed by Evarts Graham in 1933. His patient, a physician named James Gilmore, survived 30 years and outlived his surgeon! Ironically, Graham died of lung cancer in 1957 - he was a smoker.

Lobectomy gradually replaced pneumonectomy as the preferred operation because it preserves more lung function with equivalent oncological outcomes for appropriately staged tumors.`,
    mechanism: `Each lobe is a functionally independent unit with its own bronchus, artery, and veins. Division of these structures (bronchus with stapler, vessels with stapler or ligation) allows complete removal of the lobe.

The fissures between lobes are natural planes of separation. Complete fissures make surgery easier; incomplete fissures require careful dissection.`,
    evidence: '[I, A]',
    trials: ['LCSG 821: Lobectomy superior to limited resection for tumors >2cm - local recurrence 6% vs 17%'],
    clinicalPearl: `Minimally invasive approach (VATS/RATS) should be the default when technically feasible. Conversion to open is not a failure - patient safety comes first. High-volume centers have better outcomes regardless of approach.`,
    category: 'treatment',
    children: ['lymph-node-dissection'],
  },
  'sublobar': {
    label: 'Sublobar Resection',
    notes: `Sublobar resection removes less than a full lobe - either a segment (segmentectomy) or a wedge of lung tissue. Once considered inferior to lobectomy, it's now accepted for select patients with small tumors.

**Two types:**
• **Segmentectomy (Anatomical)**: Follows the broncho-vascular anatomy of a lung segment. More technically demanding but provides better margins. Preferred for cancer.
• **Wedge Resection (Non-anatomical)**: Simply cuts out a wedge of lung around the tumor. Faster, easier, but margins may be closer. Better for diagnosis or very peripheral tumors.

**When is sublobar appropriate?**
• Tumor ≤2cm (especially ≤1cm)
• Peripheral location (outer third of lung)
• Ground-glass component (indicates less aggressive biology)
• Compromised lung function (preserve lung tissue)

**The margin rule:** Margin should be ≥2cm OR ≥ tumor size, whichever is larger. A 1.5cm tumor needs 1.5cm margin; a 0.5cm tumor still needs 0.5cm margin.`,
    history: `The rehabilitation of sublobar resection is a recent story. For 25 years after LCSG 821 (1995), lobectomy was dogma. Then two landmark trials changed thinking:

• **JCOG0802 (Japan, 2022)**: Segmentectomy non-inferior to lobectomy for ≤2cm peripheral tumors. 5-year OS 94% vs 91%.
• **CALGB 140503 (US, 2023)**: Sublobar resection (wedge or segment) non-inferior to lobectomy for ≤2cm tumors. DFS hazard ratio 1.01.

Why the different results from 1995? Patient selection improved (CT screening finds smaller tumors), and we can now identify indolent tumors (ground-glass opacity) that don't need aggressive surgery.`,
    mechanism: `The lung has 10 segments on the right (3 upper, 2 middle, 5 lower) and 8-10 on the left. Each segment has its own bronchus and vessels, making anatomical segmentectomy possible.

Ground-glass opacity (GGO) on CT represents lepidic growth pattern - tumor cells growing along alveolar walls without invasion. Pure GGO is essentially carcinoma in situ, with near-zero metastatic potential. These can be treated with sublobar resection regardless of size.`,
    evidence: '[I, A]',
    trials: ['JCOG0802: Segmentectomy vs lobectomy for ≤2cm - 5-year OS 94.3% vs 91.1% (non-inferior)', 'CALGB 140503: Sublobar non-inferior to lobectomy for ≤2cm'],
    clinicalPearl: `Look at the CT carefully! A 2cm tumor that's 50% ground-glass is biologically different from a 2cm solid tumor. GGO component predicts indolent behavior and lower risk of nodal involvement. Pure GGO tumors almost never metastasize regardless of size.`,
    category: 'treatment',
    children: ['lymph-node-dissection'],
  },
  'sbrt': {
    label: 'SBRT',
    notes: `SBRT (Stereotactic Body Radiation Therapy) delivers very high doses of radiation in just 3-8 treatments, compared to 30+ treatments with conventional radiation. The precision is millimeter-level, allowing tumor-killing doses while sparing surrounding lung.

**The physics of SBRT:**
• Multiple beams converge on the tumor from different angles
• Each individual beam is low-dose (doesn't damage what it passes through)
• Where beams converge, dose is very high (ablative)
• Steep dose fall-off protects adjacent structures

**Typical doses:**
• Peripheral tumors: 54 Gy in 3 fractions (18 Gy per fraction)
• Central tumors: 50 Gy in 5 fractions or 60 Gy in 8 fractions (safer for airways/vessels)

**Results rival surgery:** Local control >90-95% at 3 years. The question isn't whether SBRT controls the tumor - it's whether patients would have done better with surgery (which also provides staging information).`,
    history: `Stereotactic radiosurgery began in the brain (Lars Leksell, Gamma Knife, 1968). Extending it to the body required solving the motion problem - lungs move with breathing!

Solutions came in the early 2000s:
• **4D-CT**: Images the tumor throughout the breathing cycle
• **Motion management**: Breath-hold, gating (beam on only during certain phases), or tracking
• **Image guidance**: Daily imaging to verify position before treatment

RTOG 0236 (2010) established SBRT as standard for inoperable Stage I, with 3-year local control of 98%.`,
    mechanism: `SBRT causes DNA double-strand breaks that overwhelm repair mechanisms. At conventional doses (2 Gy/fraction), cells can repair between fractions. At SBRT doses (>8 Gy/fraction), repair is impossible.

There's also a vascular effect - high single doses damage tumor blood vessels, causing secondary cell death from ischemia. This "ablative" effect is why SBRT works differently than conventional radiation.`,
    evidence: '[II, A]',
    trials: ['RTOG 0236: 3-year local control 98%, primary tumor control 97.6%', 'CHISEL: SBRT vs conventional RT - 2-year local control 89% vs 65%', 'STARS/ROSEL pooled: No survival difference between SBRT and surgery in operable patients (controversial)'],
    clinicalPearl: `Central tumors (within 2cm of proximal bronchial tree) need more fractions to be safe. The original RTOG 0236 dose (54 Gy in 3 fractions) to central tumors caused fatal bleeding and airway necrosis. Current "central" and "ultra-central" protocols use 8-15 fractions.`,
    otherContexts: `SBRT is used far beyond lung cancer: liver metastases, spine metastases, oligometastatic disease, prostate cancer, pancreatic cancer. The lung experience established the technique that's now applied throughout oncology.`,
    category: 'treatment',
    children: ['surveillance'],
  },
  'lymph-node-dissection': {
    label: 'Lymph Node Dissection',
    notes: `Lymph node assessment during lung cancer surgery isn't just about removing nodes - it's about accurate staging. What looks like Stage I on scans becomes Stage II or III in 15-20% of patients when nodes are properly examined.

**Why it matters:** Stage determines prognosis AND whether you need adjuvant therapy. A patient with N2 disease (mediastinal nodes) found at surgery has worse prognosis and needs adjuvant treatment. Missing this changes everything.

**Two approaches:**
• **Systematic Sampling**: Remove nodes from specific stations without taking everything
• **Complete Lymphadenectomy**: Remove all lymph node tissue from each station

**Required stations (minimum):**
• Right-sided tumors: 2R, 4R, 7, 8, 9 + N1 nodes (10-14)
• Left-sided tumors: 5, 6, 7, 8, 9 + N1 nodes (10-14)
• Station 7 (subcarinal) is always required - key drainage point

**The lymph node map:** Nodes are numbered 1-14, with 1-9 being N2 (mediastinal) and 10-14 being N1 (hilar/intrapulmonary). This numbering system was standardized by the IASLC in 2009.`,
    history: `The importance of lymph node staging was recognized in the 1980s, but standardization was lacking. Surgeons used different maps, making comparison impossible. The IASLC lymph node map (2009) unified definitions internationally, enabling better research and consistent staging.

The debate between sampling vs complete lymphadenectomy continues. ACOSOG Z0030 (2011) showed no survival difference in early-stage disease, but selection bias exists - more nodes examined = more chance of finding positive nodes.`,
    mechanism: `Lymphatic drainage follows predictable patterns:
• Upper lobe tumors → Upper mediastinal nodes (stations 2, 4)
• Lower lobe tumors → Subcarinal (7) and lower mediastinal nodes (8, 9)
• Skip metastases occur (directly to N2, bypassing N1) in 20-30%

The number of positive nodes and stations involved correlates with prognosis. Single-station N2 is better than multi-station N2.`,
    evidence: '[III, A]',
    clinicalPearl: `Count your nodes! The IASLC recommends examining at least 10-16 lymph nodes total for adequate staging. Fewer nodes examined correlates with understaging and worse apparent outcomes (because truly higher-stage patients are miscategorized).`,
    category: 'treatment',
    children: ['r0-resection', 'r1-resection'],
  },
  'r0-resection': {
    label: 'R0 Resection',
    notes: `R0 means "no residual tumor" - the surgical margins are clear of cancer under the microscope. This is the goal of every cancer surgery and the foundation for good outcomes.

**The R classification:**
• **R0**: No residual tumor. Margins microscopically negative. This is what we want.
• **R1**: Microscopic residual. Margins have tumor cells visible under microscope.
• **R2**: Macroscopic residual. Tumor was visibly left behind.

**What margins are assessed?**
• **Bronchial margin**: Where the airway was divided
• **Vascular margins**: Where arteries and veins were cut
• **Parenchymal margin**: Edge of lung tissue (especially in sublobar resection)
• **Chest wall margin**: If chest wall resected

**Frozen section:** During surgery, the bronchial margin is often sent for immediate ("frozen section") pathology. This allows the surgeon to resect more if the margin is positive. Final pathology takes 5-7 days.`,
    mechanism: `Cancer at a margin means tumor cells remain in the patient. These cells can regrow (local recurrence) or have already spread (systemic recurrence). An R0 resection doesn't guarantee cure - microscopic cells may have spread before surgery - but it removes the visible disease.

The width of margins matters for parenchymal margins (rule of thumb: ≥2cm or ≥tumor diameter). For bronchial margins, any negative margin is acceptable - there's no minimum distance.`,
    clinicalPearl: `R0 is necessary but not sufficient for cure. A patient with R0 resection and occult micrometastases will recur despite perfect surgery. This is why adjuvant therapy exists - to treat potential distant disease. Think of surgery as "local control" and systemic therapy as "distant control."`,
    category: 'outcome',
    children: ['surveillance'],
  },
  'r1-resection': {
    label: 'R1 Resection',
    notes: `R1 means microscopic residual disease - the pathologist sees tumor cells at the margin. This isn't a surgical failure in all cases; sometimes achieving R0 would require unacceptable morbidity (like pneumonectomy in a patient who can't tolerate it).

**What to do with R1:**
• **Re-resection**: If feasible and patient can tolerate it
• **PORT (Post-Operative Radiation Therapy)**: If re-resection not possible
• **Close surveillance**: Sometimes an option, especially if margin was close but not frankly involved

**Where R1 occurs:**
• Bronchial margin: Central tumors growing toward carina
• Parenchymal margin: Tumors larger than anticipated, sublobar resection
• Chest wall margin: Tumors invading chest wall

**Prognosis:** R1 worsens local control but may not dramatically affect survival if the margin is truly microscopic and the patient receives adjuvant radiation. The biology of the tumor (nodal status, molecular features) often matters more than a close margin.`,
    history: `The importance of complete resection was recognized early in thoracic surgery. Historical series showed dramatically worse outcomes with incomplete resection. Modern data is more nuanced - an R1 resection with PORT may be acceptable if the alternative is pneumonectomy with high operative mortality.`,
    clinicalPearl: `Don't panic about R1. Discuss in MDT. A truly microscopic positive margin (a few cells) has better prognosis than gross residual disease. Consider: Can you re-resect safely? Will radiation cover the area? What's the patient's overall prognosis (nodal status matters more)?`,
    category: 'outcome',
    children: ['port'],
  },
  'port': {
    label: 'PORT',
    notes: `PORT (Post-Operative Radiation Therapy) has a controversial history in lung cancer. Once widely used, it fell out of favor after a meta-analysis showed it was harmful in early-stage disease. Now it's reserved for specific situations.

**When PORT makes sense:**
• R1 resection (positive margin)
• R2 resection (gross residual disease)
• Possibly selected N2 disease (controversial)

**When PORT is harmful:**
• N0-N1 disease with R0 resection - the 1998 PORT Meta-Analysis showed increased mortality
• Low-risk N2 disease with R0 resection - Lung ART trial (2020) showed no benefit, possible harm

**The Lung ART trial:** This practice-changing trial randomized patients with completely resected N2 NSCLC to PORT vs no PORT. Results: No overall survival benefit, increased death from other causes (likely cardiac/pulmonary from radiation). PORT for R0 N2 is no longer standard.

**Technical aspects:** Modern PORT uses IMRT or VMAT to minimize heart and lung dose. Typical prescription: 50-54 Gy in 25-27 fractions.`,
    history: `PORT was standard practice for decades until challenged by data. The PORT Meta-Analysis (1998) pooled old trials with outdated techniques and showed worse survival with PORT, particularly in N0-N1. This led to abandonment of PORT for early stage.

For N2 disease, the debate continued until Lung ART (2020) finally provided high-quality evidence. The trial was negative - PORT didn't improve survival and may have caused harm through cardiac/pulmonary toxicity.`,
    mechanism: `Radiation works by damaging DNA, preventing cell division. Cancer cells are more susceptible than normal cells because they divide faster and have defective repair mechanisms.

The risk of PORT is damage to surrounding structures:
• Heart: Can cause pericarditis, coronary artery disease, cardiomyopathy
• Lungs: Radiation pneumonitis, fibrosis
• Esophagus: Esophagitis during treatment

Modern techniques (IMRT) minimize these risks but don't eliminate them.`,
    evidence: '[II, B]',
    trials: ['Lung ART (2020): PORT vs no PORT for R0 N2 - no OS benefit, increased non-cancer deaths', 'PORT Meta-Analysis (1998): Detrimental effect of PORT on N0-N1 patients'],
    clinicalPearl: `If considering PORT, ask: What am I trying to achieve? For R1/R2 margins, local control benefit likely outweighs risks. For R0 N2, the Lung ART data suggests PORT doesn't help survival and may cause harm. Individual risk assessment is key.`,
    category: 'treatment',
    children: ['surveillance'],
  },
  'surveillance': {
    label: 'Surveillance',
    notes: `After curative-intent treatment, patients enter surveillance - regular follow-up to detect recurrence early. But "surveillance" isn't just waiting for cancer to return; it's about comprehensive survivorship care.

**Why surveillance matters:**
• 30-55% of patients recur after surgery (higher stages = higher risk)
• Early detection of recurrence may allow curative retreatment (especially oligometastases)
• Second primary lung cancers occur at 1-2% per year
• Managing treatment side effects and survivorship issues

**Standard schedule:**
• Years 1-2: CT chest every 6 months
• Years 3-5: CT chest annually
• After 5 years: Annual CT (second primary risk persists)

**What are we looking for?**
• Local recurrence: At surgical staple line, in remaining lung
• Regional recurrence: In mediastinal lymph nodes
• Distant metastases: Brain, bone, liver, adrenals
• Second primary lung cancer: New, separate cancer

**PET-CT is NOT routine** - it's used when CT shows something concerning. Routine PET causes unnecessary biopsies of benign findings.`,
    history: `Surveillance protocols have evolved as we learned what's useful. Early studies used chest X-ray; now CT is standard because it detects smaller nodules. Multiple trials have tried more intensive surveillance, but no survival benefit has been proven for more frequent imaging beyond current standards.`,
    clinicalPearl: `Surveillance is not just scans. Address smoking cessation (if applicable), vaccination, symptom management, psychological support. Many survivors have anxiety about recurrence, depression, and persistent side effects. A pulmonary nodule clinic can help manage incidental findings without over-investigation.`,
    otherContexts: `Survivorship issues are increasingly recognized: fatigue, dyspnea, neuropathy from chemotherapy, cognitive changes, cardiovascular risk from radiation. Long-term survivors need multidisciplinary care, not just oncology follow-up.`,
    category: 'outcome',
  },
  'stage-ii-surgery': {
    label: 'Surgical Resection',
    notes: `Stage II surgery follows the same principles as Stage I - lobectomy with systematic lymph node dissection - but with one critical difference: adjuvant therapy is standard, not optional.

**Why adjuvant therapy is mandatory in Stage II:**
Without adjuvant treatment, ~50% of Stage II patients recur. The LACE meta-analysis showed that cisplatin-based adjuvant chemotherapy provides a 5% absolute improvement in 5-year survival. This translates to saving 1 in 20 patients - a meaningful benefit.

**The adjuvant therapy decision tree:**
1. EGFR testing on surgical specimen
2. If EGFR+ → Osimertinib for 3 years (game-changer: ADAURA trial)
3. If EGFR- → Cisplatin-based chemotherapy x 4 cycles
4. Consider atezolizumab (IMpower010) for PD-L1+ after chemo

**Surgical principles remain the same:**
• Lobectomy preferred over pneumonectomy (better tolerance for adjuvant therapy)
• VATS/RATS when feasible
• Systematic lymph node dissection mandatory
• Goal is R0 resection`,
    history: `The benefit of adjuvant chemotherapy was uncertain until the early 2000s when multiple trials reported. The IALT (2004), JBR.10 (2005), and ANITA (2006) trials all showed survival benefit. The LACE meta-analysis (2008) combined these data, establishing adjuvant chemo as standard of care.

The adjuvant immunotherapy era began with IMpower010 (2021), showing atezolizumab benefit after chemotherapy for PD-L1+ tumors. Then ADAURA (2020) revolutionized EGFR+ disease.`,
    clinicalPearl: `Timing matters! Adjuvant chemotherapy should start within 8 weeks of surgery. Longer delays are associated with worse outcomes. Don't wait for complete surgical wound healing - patients can start chemo once they're eating normally and mobile.`,
    evidence: '[I, A]',
    category: 'treatment',
    children: ['egfr-testing-adj'],
  },
  'egfr-testing-adj': {
    label: 'EGFR Testing',
    notes: `EGFR (Epidermal Growth Factor Receptor) testing is the most important molecular test in lung cancer. Finding an EGFR mutation changes EVERYTHING about treatment - from adjuvant therapy to metastatic management.

**What is EGFR?**
EGFR is a receptor on the cell surface that, when activated, tells the cell to grow and divide. Normal cells regulate this carefully. In EGFR-mutant lung cancer, the receptor is constantly "on" - like a stuck accelerator pedal - driving uncontrolled cell division.

**The key mutations:**
• **Exon 19 deletion (~45% of EGFR mutations)**: A chunk of genetic code is missing. These respond BEST to TKIs.
• **L858R (~40%)**: A single amino acid change in exon 21. Responds well to TKIs but slightly less than exon 19 del.
• **Exon 20 insertions (~10%)**: Historically didn't respond to standard TKIs. Now have specific drugs (amivantamab, mobocertinib).
• **Rare mutations**: G719X, S768I, L861Q - can respond to afatinib or osimertinib.

**Why test in early stage?**
ADAURA changed practice. Before 2020, we only tested Stage IV patients. Now, knowing EGFR status determines whether your adjuvant therapy is osimertinib (3 years) or chemotherapy (4 cycles). The difference in outcomes is dramatic.`,
    history: `EGFR's story is a landmark in precision oncology:

• **2003**: Gefitinib approved based on response rates (later found to be in EGFR-mutant patients)
• **2004**: Three papers (Lynch, Paez, Pao) simultaneously discovered EGFR mutations explain gefitinib sensitivity
• **2009**: IPASS trial proved EGFR testing should guide therapy (EGFR-mutant patients do better with TKI; wild-type do better with chemo)
• **2010**: EGFR testing becomes standard for metastatic NSCLC
• **2020**: ADAURA proves osimertinib benefit in adjuvant setting
• **2021**: FDA approves adjuvant osimertinib, mandating EGFR testing for all resected NSCLC`,
    mechanism: `The EGFR pathway in normal cells:
1. EGF (growth factor) binds to EGFR receptor
2. Receptor dimerizes (two receptors pair up)
3. Intracellular tyrosine kinase domain activates
4. Downstream signaling (RAS-RAF-MEK-ERK, PI3K-AKT) promotes survival and proliferation
5. Signal turns off when growth factor is removed

In EGFR-mutant cancer:
The mutation makes the kinase constitutively active - it signals even WITHOUT the growth factor. The cell thinks it's constantly receiving "grow" signals.

**Why TKIs work:** They block the ATP-binding pocket of the kinase, preventing it from signaling. Because EGFR-mutant cells are "addicted" to this pathway, blocking it causes rapid cell death (apoptosis).`,
    clinicalPearl: `Order molecular testing on ALL non-squamous NSCLC and on squamous cell in never-smokers. Don't wait for the oncologist to order it - set up reflex testing in pathology. Time from surgery to adjuvant therapy decision shouldn't be delayed by molecular testing turnaround.`,
    otherContexts: `EGFR testing is also important in:
• **Colorectal cancer**: Wild-type EGFR (not mutant!) is required for cetuximab/panitumumab to work
• **Head & neck cancer**: EGFR overexpression predicts cetuximab benefit
• **Glioblastoma**: EGFR amplification common but EGFR inhibitors haven't worked well

The lung cancer EGFR story is unique - it's about specific *mutations* driving the cancer, not just overexpression.`,
    category: 'biomarker',
    children: ['osimertinib-adj', 'adj-chemo'],
  },
  'osimertinib-adj': {
    label: 'Osimertinib (Adjuvant)',
    notes: `Osimertinib (Tagrisso) in the adjuvant setting is one of the most impressive results in lung cancer history. The ADAURA trial showed an 83% reduction in recurrence risk - a result so striking that the trial was unblinded early.

**The ADAURA data:**
• Stage IB-IIIA, EGFR+ (exon 19 del or L858R), after complete resection
• 3-year DFS: 83% vs 28% (HR 0.17)
• This means the risk of recurrence was reduced by 83%
• CNS recurrence specifically reduced (brain is a common failure site)
• Overall survival data now mature: significant benefit confirmed

**Why is osimertinib so effective?**
1. It's a 3rd-generation TKI - more potent than older drugs
2. Excellent CNS penetration - crosses blood-brain barrier
3. EGFR-mutant cancers are "addicted" to EGFR signaling
4. Micrometastatic disease (invisible tumor cells left after surgery) is killed before it grows

**Practical aspects:**
• 80mg once daily, oral, with or without food
• Duration: 3 years (per ADAURA protocol)
• Side effects: Diarrhea, rash, paronychia (nail changes), interstitial lung disease (rare but serious)
• Monitor: QTc prolongation, LFTs`,
    history: `Osimertinib's journey:
• Developed specifically for T790M resistance mutation (which causes resistance to first-gen TKIs)
• AURA trials proved efficacy in T790M+ resistant disease (approved 2015)
• FLAURA (2018) showed superiority over gefitinib/erlotinib as first-line in metastatic NSCLC
• ADAURA (2020) extended to adjuvant setting with remarkable results
• Now approved globally for adjuvant treatment of EGFR+ Stage IB-IIIA NSCLC`,
    mechanism: `Osimertinib structure:
• Irreversibly binds to EGFR (covalent bond to C797 residue)
• Selective for mutant EGFR over wild-type (less skin rash than 1st gen)
• Also inhibits T790M mutation (the main resistance mechanism to 1st gen TKIs)

Why CNS penetration matters:
The brain is a "sanctuary site" - the blood-brain barrier excludes many drugs. EGFR-mutant NSCLC has high rates of brain metastases. Older TKIs (gefitinib, erlotinib) have poor CNS penetration. Osimertinib achieves therapeutic levels in CSF, preventing/treating CNS disease.`,
    evidence: '[I, A] MCBS 4',
    trials: ['ADAURA: DFS HR 0.17 (83% vs 28% at 3 years). OS HR 0.49 at 5 years. CNS DFS HR 0.24.'],
    clinicalPearl: `Interstitial Lung Disease (ILD) is rare (~3%) but potentially fatal. Any new respiratory symptoms require immediate workup. Hold osimertinib, get CT chest. If ILD confirmed, permanently discontinue. Most other side effects (diarrhea, rash) are manageable.`,
    otherContexts: `Osimertinib is also first-line for metastatic EGFR+ NSCLC (FLAURA trial) and is used for T790M-resistant disease. The adjuvant approval extended its use to earlier stages. The question now: can we use it even earlier - as neoadjuvant therapy? Trials are ongoing.`,
    category: 'drug',
  },
  'adj-chemo': {
    label: 'Adjuvant Chemotherapy',
    notes: `Adjuvant chemotherapy for lung cancer was controversial for decades. Unlike breast or colon cancer, early trials showed no benefit. It took until the 2000s to prove that carefully selected patients do benefit - but the benefit is modest (5% absolute improvement).

**The evidence:**
• LACE meta-analysis (2008): 5 trials, 4,584 patients
• 5.4% absolute improvement in 5-year survival (from ~49% to ~54%)
• Benefit seen primarily in Stage II-III; minimal in Stage IB
• Cisplatin-based doublets only - carboplatin substitution unproven

**The regimens:**
• **Cisplatin + Vinorelbine**: Most studied, standard comparator
• **Cisplatin + Pemetrexed**: For non-squamous only (pemetrexed ineffective in squamous)
• **Cisplatin + Docetaxel or Gemcitabine**: Alternatives

**Who benefits most?**
• Stage II and IIIA: Clear benefit
• Stage IB: Uncertain. Consider for tumors >4cm or high-risk features
• Stage IA: No benefit - don't give adjuvant chemo

**Why not carboplatin?** The adjuvant trials used cisplatin. Carboplatin is often substituted in metastatic disease for tolerability, but in adjuvant setting where goal is cure, we stick with cisplatin.`,
    history: `The adjuvant chemotherapy story:
• 1990s: Multiple trials failed to show benefit
• 2003: IALT first positive trial (cisplatin-based chemo vs observation)
• 2004: CALGB 9633 positive for Stage IB (later not confirmed)
• 2005: JBR.10 and ANITA both positive
• 2008: LACE meta-analysis establishes standard of care
• 2021: Adjuvant immunotherapy (IMpower010) adds new option for PD-L1+ after chemo`,
    mechanism: `How does killing cancer cells after surgery help?

Even with "complete" (R0) resection, microscopic disease may exist:
• Circulating tumor cells
• Micrometastases in distant organs
• Cancer cells in lymphatics

Adjuvant chemotherapy aims to kill these invisible cells before they grow into visible metastases. The 5% survival benefit means we prevent recurrence in 1 of 20 patients - worthwhile at the population level, but we can't predict which individual patient benefits.`,
    evidence: '[I, A]',
    trials: ['LACE meta-analysis: 5.4% absolute OS benefit at 5 years (HR 0.89)', 'JBR.10: Cisplatin-vinorelbine improved 5-year OS from 54% to 69% in Stage II', 'IMpower010: Atezolizumab after chemo benefits PD-L1+ Stage II-IIIA'],
    clinicalPearl: `Cisplatin toxicities: Nausea (aggressive antiemetics needed), nephrotoxicity (hydration essential), neuropathy (may limit cumulative dose), ototoxicity. If patient can't tolerate cisplatin, carboplatin is reasonable - some chemotherapy is better than none.`,
    category: 'treatment',
  },
  'stage-iii-concurrent': {
    label: 'Concurrent CRT',
    notes: `Concurrent chemoradiotherapy (CRT) delivers chemotherapy and radiation simultaneously - the standard curative treatment for unresectable Stage III NSCLC. This aggressive approach offers the best chance of cure but requires patients fit enough to tolerate combined toxicities.

**The regimen:**
• **Radiation**: 60 Gy in 30 fractions (2 Gy/day, 5 days/week, 6 weeks)
• **Chemotherapy**: Cisplatin-etoposide or weekly carboplatin-paclitaxel

**Why superior to sequential?** Radiation sensitization - chemotherapy makes cancer cells more vulnerable to radiation damage. The RTOG 9410 trial proved this: concurrent achieved median OS 17 vs 14.6 months for sequential.

**The toxicity trade-off:** Higher acute toxicity (esophagitis, pneumonitis) but better outcomes. ~15% grade 3+ esophagitis - patients may need feeding tube temporarily. Pneumonitis risk ~5-10%.`,
    history: `Concurrent CRT evolved from recognizing that timing matters:
• 1980s: Sequential approach - chemo first, then radiation
• 1990s: RTOG trials showed simultaneous delivery improved outcomes
• 2000s: Platinum-based doublets became standard partners
• 2017: PACIFIC revolutionized by adding immunotherapy consolidation after CRT`,
    mechanism: `The synergy between chemo and radiation:

**Radiation sensitization**: Platinum drugs intercalate DNA, blocking repair of radiation damage. Cells that would normally recover from radiation die instead.

**Temporal advantage**: Simultaneous treatment prevents tumor regrowth between therapies - in sequential approach, tumor can repopulate during the gap.

**60 Gy rationale**: This dose balances tumor control with lung toxicity. Higher doses haven't improved outcomes and increase pneumonitis.`,
    clinicalPearl: `Esophagitis management is crucial. Prophylactic proton pump inhibitor, lidocaine-containing mouthwash, and early nutritional support. If patient can't maintain hydration/nutrition, consider G-tube placement early rather than late.`,
    evidence: '[I, A]',
    trials: ['RTOG 9410: Concurrent vs sequential - median OS 17 vs 14.6 months'],
    category: 'treatment',
    children: ['consolidation-testing'],
  },
  'stage-iii-sequential': {
    label: 'Sequential CRT',
    notes: `Sequential CRT completes all chemotherapy first, followed by radiation - an alternative for patients who cannot tolerate concurrent treatment. While outcomes are slightly inferior, it's a valid option offering meaningful survival benefit with less acute toxicity.

**The approach:**
• **Phase 1**: 2-4 cycles of platinum-based chemotherapy
• **Phase 2**: 60 Gy thoracic radiation after chemo completion
• **Total duration**: 12-16 weeks (vs 6-7 weeks concurrent)

**Who benefits most?**
• ECOG PS 2 (concurrent generally requires PS 0-1)
• Elderly patients with comorbidities
• Borderline pulmonary or cardiac function
• Large radiation fields risking severe esophagitis`,
    history: `Sequential CRT was actually the original approach before concurrent was proven superior:
• 1980s: Standard practice - seemed logical to treat one modality at a time
• 1990s: Concurrent shown superior but sequential remained option for frail patients
• Today: Still valid for ~20-30% of Stage III patients who can't tolerate concurrent`,
    mechanism: `Sequential works through additive rather than synergistic effects:

**Chemotherapy phase**: Reduces tumor bulk, treats micrometastases, allows response assessment before RT planning

**Radiation phase**: Treats remaining locoregional disease with potentially smaller fields (due to tumor shrinkage)

**Why inferior to concurrent?** Tumor repopulation during the gap. Cancer cells can double every ~3-5 days - a 4-week gap allows significant regrowth.`,
    clinicalPearl: `Response assessment between chemo and RT is valuable. If tumor progresses on chemotherapy, patient may not benefit from curative-intent radiation - consider palliative approach or clinical trial instead.`,
    evidence: '[I, A]',
    category: 'treatment',
    children: ['consolidation-testing'],
  },
  'consolidation-testing': {
    label: 'Biomarker Testing',
    notes: `After completing CRT without progression, biomarker testing determines the optimal consolidation therapy. This is a critical decision point - EGFR+ and EGFR-wild-type patients follow completely different paths.

**Testing required:**
• **EGFR mutation**: Guides osimertinib (LAURA trial) vs durvalumab (PACIFIC trial)
• **ALK/ROS1**: If positive, avoid durvalumab - no data in this population
• **PD-L1 expression**: EMA restricts durvalumab to PD-L1 ≥1% (FDA: any PD-L1)

**Timing matters:** Ideally test BEFORE starting CRT so results are ready when consolidation decisions need to be made. Using original biopsy tissue is preferred.`,
    history: `The consolidation paradigm evolved rapidly:
• Pre-2017: No proven consolidation therapy - observation after CRT
• 2017: PACIFIC trial - durvalumab revolutionizes EGFR-WT Stage III
• 2024: LAURA trial - osimertinib fills the gap for EGFR+ patients

Before PACIFIC, median OS for Stage III was ~24 months. Now it's approaching 4 years with optimal consolidation.`,
    mechanism: `Why consolidation works post-CRT:

**CRT priming**: Radiation causes immunogenic cell death, releasing tumor antigens. This creates an "inflamed" tumor microenvironment primed for immune attack.

**Minimal residual disease**: After CRT achieves maximal cytoreduction, consolidation therapy targets the microscopic disease that would otherwise cause recurrence.`,
    clinicalPearl: `Start consolidation within 42 days of completing radiation (PACIFIC eligibility). Don't delay unnecessarily - longer intervals may reduce benefit as tumor repopulation begins.`,
    category: 'decision',
    children: ['osimertinib-consol', 'durvalumab-consol'],
  },
  'osimertinib-consol': {
    label: 'Osimertinib (Consolidation)',
    notes: `Osimertinib consolidation after CRT represents a breakthrough for EGFR+ unresectable Stage III NSCLC. The LAURA trial showed dramatic benefit: PFS 39.1 vs 5.6 months - a hazard ratio of 0.16 (84% risk reduction!).

**Dosing**: 80mg oral once daily
**Duration**: Continue until progression or intolerable toxicity (no fixed endpoint)
**Eligibility**: EGFR exon 19 deletion or L858R, completed CRT without progression

**Why so effective?** EGFR+ tumors don't respond well to chemotherapy or immunotherapy. Before LAURA, these patients got durvalumab despite lack of data. Now they have a targeted option that aligns with their tumor biology.`,
    history: `EGFR+ Stage III patients were an underserved population:
• 2017: PACIFIC trial excluded few EGFR+ patients; subgroup showed no benefit
• 2018-2023: EGFR+ patients received durvalumab despite uncertainty
• 2024: LAURA trial specifically for EGFR+ Stage III - FDA approved osimertinib

LAURA filled a critical evidence gap - these patients finally have a therapy matched to their biology.`,
    mechanism: `Osimertinib in consolidation leverages its unique properties:

**3rd-generation TKI**: Irreversibly binds EGFR, including T790M resistance mutation (though less relevant in consolidation)

**CNS penetration**: Excellent brain barrier crossing - crucial because brain is common relapse site

**Selectivity**: More selective for mutant EGFR than wild-type, reducing skin/GI toxicity vs earlier TKIs`,
    otherContexts: `Osimertinib is also standard first-line for metastatic EGFR+ NSCLC (FLAURA trial) and adjuvant after surgery for Stage IB-IIIA (ADAURA trial). It's essentially the preferred EGFR TKI across all settings.`,
    clinicalPearl: `Monitor for interstitial lung disease (ILD) - can be fatal if not recognized early. Any new dyspnea or cough warrants urgent CT. Occurs in ~3-4% of patients.`,
    evidence: '[I, A] MCBS 4',
    trials: ['LAURA: PFS 39.1 vs 5.6 months, HR 0.16. 74% vs 22% PFS at 12 months.'],
    category: 'drug',
  },
  'durvalumab-consol': {
    label: 'Durvalumab (Consolidation)',
    notes: `Durvalumab consolidation after CRT is one of oncology's greatest success stories. The PACIFIC trial transformed Stage III NSCLC from a disease with ~24-month median survival to one where nearly half of patients are alive at 5 years.

**Dosing**: 10mg/kg IV every 2 weeks (or 1500mg every 4 weeks)
**Duration**: 12 months maximum
**Eligibility**: EGFR/ALK wild-type, no progression after CRT, start within 1-42 days of RT completion

**The numbers:**
• Median OS: 47.5 vs 29.1 months (HR 0.68)
• 5-year OS: 42.9% vs 33.4%
• PFS: 16.8 vs 5.6 months`,
    history: `PACIFIC changed the treatment paradigm:
• 2017: Initial PACIFIC results presented - practice-changing immediately
• 2018: FDA approval based on PFS benefit
• 2020: 4-year OS data cemented durvalumab as standard of care
• 2024: 5-year data shows durable benefit

**The "PACIFIC gap"**: In PACIFIC, patients had to start within 1-42 days of RT completion. This created urgency to finish CRT and start durvalumab quickly.`,
    mechanism: `Why durvalumab works after CRT:

**Radiation-induced immunogenicity**: CRT causes "immunogenic cell death" - tumor cells release antigens and danger signals that activate the immune system.

**PD-L1 upregulation**: Radiation increases PD-L1 expression on tumor cells, making them more susceptible to checkpoint blockade.

**Immune priming**: CRT essentially "vaccinates" the patient against their own tumor. Durvalumab removes the brake (PD-1/PD-L1) and unleashes this primed immune response.`,
    otherContexts: `Durvalumab is also approved for:
• Extensive-stage SCLC (with chemo - CASPIAN trial)
• Biliary tract cancer (TOPAZ-1 trial)
• Hepatocellular carcinoma (HIMALAYA - with tremelimumab)`,
    clinicalPearl: `Pneumonitis after CRT + durvalumab can be tricky - is it radiation pneumonitis or immune-mediated? Management is similar (steroids) but immune pneumonitis may require durvalumab discontinuation. CT pattern can help differentiate.`,
    evidence: '[I, A] MCBS 4',
    trials: ['PACIFIC: OS 47.5 vs 29.1 months (HR 0.68). 4-year OS 49.6% vs 36.3%.'],
    category: 'drug',
  },
  'stage-iv-testing': {
    label: 'Molecular Testing',
    notes: `Molecular profiling is the single most important step in Stage IV NSCLC - treatment is completely determined by genomic findings. ~30% of patients harbor targetable mutations where TKIs dramatically outperform chemo-immunotherapy.

**Required testing:**
• **NGS panel**: EGFR, ALK, ROS1, BRAF V600E, RET, MET ex14, NTRK, KRAS G12C, HER2
• **PD-L1 IHC**: Guides immunotherapy decisions in non-oncogene-addicted tumors

**Testing modalities:**
• **Tissue NGS**: Gold standard, comprehensive, 1-2 weeks turnaround
• **Liquid biopsy (ctDNA)**: Faster (3-5 days), useful when tissue insufficient, but lower sensitivity for fusions (ALK, ROS1)

**Critical rule**: Do NOT start chemotherapy or immunotherapy before knowing EGFR/ALK status. These patients respond poorly to chemo-IO and lose TKI efficacy if given immunotherapy first.`,
    history: `Molecular testing evolution in NSCLC:
• 2004: EGFR mutations discovered - gefitinib responses explained
• 2007: ALK fusions identified - crizotinib development began
• 2013: First-gen single-gene testing standard
• 2018: NGS panels become preferred - simultaneous multi-gene testing
• 2024: 9+ actionable targets, comprehensive NGS essential

The discovery of driver mutations transformed NSCLC from a single disease into multiple distinct entities, each requiring specific treatment.`,
    mechanism: `Why molecular testing matters:

**Oncogene addiction**: When a single mutation drives cancer, blocking that specific pathway causes dramatic tumor death. Like removing the keystone from an arch.

**Mutual exclusivity**: Driver mutations rarely co-occur. A tumor is usually EGFR+ OR ALK+ OR ROS1+ - not multiple. This makes targeted therapy highly effective.

**Predictive vs prognostic**: These markers predict response to specific drugs (predictive), not just outcome in general (prognostic).`,
    clinicalPearl: `Never start immunotherapy before knowing EGFR/ALK status. Immunotherapy can cause severe pneumonitis when later combined with osimertinib, and may reduce TKI efficacy. If results delayed, single-agent platinum is safer than chemo-IO.`,
    category: 'biomarker',
    children: ['oncogene-addicted', 'non-oncogene'],
  },
  'oncogene-addicted': {
    label: 'Oncogene-Addicted',
    notes: `"Oncogene-addicted" tumors are driven by a single dominant mutation - they're "addicted" to that one pathway for survival. Block it with a targeted TKI, and the cancer collapses. These patients have dramatically better outcomes than historically expected for Stage IV disease.

**The main drivers:**
• **EGFR**: ~15% Caucasian, ~50% Asian
• **ALK**: ~5% - typically young never-smokers
• **ROS1**: ~2% - similar to ALK profile
• **Others**: BRAF, RET, MET, NTRK, KRAS G12C (~15% combined)

**Why TKIs beat chemo-IO here?**
These tumors are "cold" immunologically - few mutations, low PD-L1, immunotherapy doesn't work well. But they're exquisitely sensitive to their matched TKI.`,
    history: `The oncogene-addicted paradigm:
• 2004: EGFR mutations explained why some patients responded dramatically to gefitinib
• 2007: ALK identified by Soda et al - crizotinib development
• 2010s: One targetable mutation discovered every 1-2 years
• Today: >50% of non-squamous NSCLC may have actionable target

This shifted NSCLC from nihilism ("all Stage IV is fatal") to optimism ("some can live years on oral pills").`,
    mechanism: `Why "addiction"?

**Single-driver dependency**: Unlike most cancers with complex mutation landscapes, these tumors rely on ONE activated pathway. Every cell in the tumor depends on it.

**Synthetic lethality**: Block the driver, and the tumor can't compensate - no backup pathways activated yet. This is why responses are so dramatic (>70% ORR).

**Resistance eventually develops**: Cancer adapts through secondary mutations, bypass pathways, or histologic transformation. But sequential TKIs often work.`,
    clinicalPearl: `At progression, ALWAYS rebiopsy (tissue or liquid). Resistance mechanisms guide next therapy. For example, T790M after 1st-gen EGFR TKI → osimertinib; C797S after osimertinib → different approach.`,
    category: 'decision',
    children: ['egfr-mut', 'alk-fusion', 'other-targets'],
  },
  'non-oncogene': {
    label: 'Non-Oncogene Addicted',
    notes: `~70% of NSCLC lacks a targetable driver mutation. These "non-oncogene-addicted" tumors are treated with immunotherapy (checkpoint inhibitors) ± chemotherapy. Treatment selection depends on PD-L1 expression level.

**Treatment stratification:**
• **PD-L1 ≥50%**: Pembrolizumab monotherapy OR chemo-IO (patient preference)
• **PD-L1 1-49%**: Chemo-IO combination preferred
• **PD-L1 <1%**: Chemo-IO (immunotherapy alone not very effective)

**Why does immunotherapy work here?**
These tumors typically have higher mutation burden, more neoantigens, and aren't "addicted" to a single pathway - they're more immunogenic.`,
    history: `Immunotherapy revolution in NSCLC:
• 2015: CheckMate-017/057 - nivolumab 2nd-line approval
• 2016: KEYNOTE-024 - pembrolizumab monotherapy for PD-L1 ≥50%
• 2018: KEYNOTE-189/407 - chemo-IO becomes standard
• Today: Multiple IO + chemo combinations approved

Before immunotherapy, median OS for Stage IV without driver was ~10-12 months. Now it's 18-24 months, with long-term survivors.`,
    mechanism: `Immunotherapy in NSCLC:

**Checkpoint blockade**: PD-1/PD-L1 inhibitors release the "brakes" on T cells. Tumor cells use PD-L1 to hide from immune attack - blocking this exposes them.

**Higher TMB = better response**: Non-oncogene-addicted tumors often have smoking-related mutations (high tumor mutational burden), creating many neoantigens for immune recognition.

**Chemo synergy**: Chemotherapy causes immunogenic cell death, releasing antigens that enhance anti-tumor immunity when combined with checkpoint inhibition.`,
    clinicalPearl: `Check for autoimmune conditions before immunotherapy - history of IBD, lupus, RA on immunosuppression, or organ transplant are relative contraindications. These patients may still benefit but need careful monitoring.`,
    category: 'decision',
    children: ['pdl1-high', 'pdl1-low'],
  },
  'egfr-mut': {
    label: 'EGFR Mutation',
    notes: `EGFR (Epidermal Growth Factor Receptor) mutations are the most common targetable driver in NSCLC globally. These mutations cause constitutive receptor activation - the "on switch" is stuck. TKIs block this with dramatic responses (>70% ORR).

**Common mutations:**
• **Exon 19 deletion** (~45%): Best prognosis, best TKI response
• **L858R** (~40%): Point mutation in exon 21
• **Uncommon mutations** (~15%): G719X, L861Q, S768I - still TKI-sensitive
• **Exon 20 insertions** (~5%): Different biology, require specific agents (amivantamab, mobocertinib)

**Epidemiology:**
• ~15% Caucasian NSCLC, ~50% Asian NSCLC
• More common: adenocarcinoma, never-smokers, women`,
    history: `EGFR story - a paradigm shift:
• 2003: Gefitinib approved based on response rates (before understanding mutations)
• 2004: EGFR mutations discovered - explained responders vs non-responders
• 2005-2010: EGFR testing becomes standard; 1st-gen TKIs (gefitinib, erlotinib)
• 2013-2016: 2nd-gen TKIs (afatinib, dacomitinib)
• 2018: Osimertinib (3rd-gen) becomes preferred first-line
• 2020: ADAURA - osimertinib in adjuvant setting

EGFR was the first driver mutation - it started the precision oncology revolution in lung cancer.`,
    mechanism: `EGFR biology:

**Normal function**: EGFR signals cell growth when growth factors bind. Tightly regulated.

**Mutant EGFR**: Mutations in the kinase domain (exons 18-21) cause constitutive activation without ligand. Constant "grow" signal.

**TKI mechanism**: Small molecules block ATP binding in the kinase pocket, shutting down signaling. Mutant EGFR is more sensitive to TKIs than wild-type, providing therapeutic window.`,
    otherContexts: `EGFR mutations also matter in:
• Head & neck squamous cell carcinoma (cetuximab targets EGFR)
• Colorectal cancer (EGFR antibodies, but mutations cause resistance)
• Glioblastoma (EGFR amplification common, but TKIs don't penetrate well)`,
    clinicalPearl: `Exon 19 deletion has better outcomes than L858R - longer PFS, OS on TKIs. Don't treat them identically in prognostic discussions.`,
    category: 'biomarker',
    children: ['osimertinib-1l'],
  },
  'osimertinib-1l': {
    label: 'Osimertinib (1st-line)',
    notes: `Osimertinib is the preferred first-line treatment for EGFR-mutant metastatic NSCLC. The FLAURA trial established its superiority over 1st-gen TKIs with a 7-month OS improvement and unprecedented CNS activity.

**Dosing**: 80mg oral once daily (with or without food)
**Duration**: Until progression or intolerable toxicity

**FLAURA results:**
• OS: 38.6 vs 31.8 months (HR 0.80)
• PFS: 18.9 vs 10.2 months (HR 0.46)
• CNS PFS: 52% vs 74% progression at brain

**Why superior?** Better CNS penetration prevents brain metastases (common failure site), plus covers T790M resistance that develops on 1st/2nd-gen TKIs.`,
    history: `Osimertinib's development:
• Originally designed for T790M resistance (developed in ~60% on 1st-gen TKIs)
• 2015: FDA breakthrough therapy for T790M+
• 2017: Accelerated approval for 2nd-line after T790M
• 2018: FLAURA → 1st-line approval
• Now: Standard of care in metastatic AND adjuvant settings

The shift to first-line osimertinib was controversial - why use your "best" drug first? FLAURA answered: because it saves lives.`,
    mechanism: `Osimertinib's advantages:

**3rd-gen design**: Irreversibly binds EGFR via covalent bond to C797. Active against sensitizing mutations AND T790M.

**CNS penetration**: ~6x better brain penetration than gefitinib. Crucial because brain is #1 sanctuary site for EGFR+ NSCLC.

**Selectivity**: Much more selective for mutant vs wild-type EGFR than 1st-gen TKIs, reducing skin rash, diarrhea.`,
    otherContexts: `Osimertinib across settings:
• **Metastatic 1st-line**: FLAURA
• **Adjuvant Stage IB-IIIA**: ADAURA (83% DFS improvement)
• **Consolidation Stage III**: LAURA
• **T790M+ after prior TKI**: AURA3`,
    clinicalPearl: `QTc monitoring is important - osimertinib can prolong QT. Get baseline EKG, avoid drugs that prolong QT (fluoroquinolones, ondansetron), and check if patient has cardiac history.`,
    evidence: '[I, A] MCBS 5',
    trials: ['FLAURA: OS 38.6 vs 31.8 months (HR 0.80). PFS 18.9 vs 10.2 months (HR 0.46).'],
    category: 'drug',
  },
  'alk-fusion': {
    label: 'ALK Fusion',
    notes: `ALK (Anaplastic Lymphoma Kinase) fusions occur when the ALK gene rearranges with another gene (usually EML4), creating a fusion protein with constitutive kinase activity. These patients often have the best prognosis of any Stage IV NSCLC - many live 5+ years on sequential TKIs.

**Epidemiology:**
• ~5% of NSCLC
• Classic patient: young (<50), never-smoker, adenocarcinoma
• Often presents with advanced disease but responds well

**Detection methods:**
• **NGS**: Preferred - detects any fusion partner
• **FISH**: Gold standard, but only for specific breakpoints
• **IHC**: Screening tool - positives need confirmation`,
    history: `ALK in lung cancer:
• 2007: Soda et al discover EML4-ALK fusion in NSCLC
• 2011: Crizotinib approved - first ALK TKI
• 2014: Ceritinib approved (2nd-gen)
• 2015-2017: Alectinib, brigatinib (2nd-gen) show superiority to crizotinib
• 2018: Lorlatinib (3rd-gen) approved for resistant disease
• 2021: Lorlatinib approved first-line (CROWN trial)

The rapid development of successive-generation TKIs made ALK+ NSCLC the most treatable advanced lung cancer.`,
    mechanism: `ALK fusion biology:

**The fusion**: Chromosome inversion joins ALK kinase domain to EML4 promoter. The fusion protein is always "on" - dimerized and auto-phosphorylated.

**Why targetable?**: ALK is not normally expressed in lung tissue - the fusion creates a tumor-specific dependency.

**Resistance patterns**: ALK resistance mutations (G1202R, etc.) can guide sequential TKI selection. Re-biopsy at progression is crucial.`,
    otherContexts: `ALK in other cancers:
• **Anaplastic Large Cell Lymphoma (ALCL)**: Where ALK was first discovered
• **Neuroblastoma**: ALK point mutations, not fusions
• **Inflammatory Myofibroblastic Tumor**: ALK fusions responsive to crizotinib`,
    clinicalPearl: `ALK+ patients often have pericardial and pleural effusions at diagnosis - don't mistake this for poor prognosis. They often respond dramatically to TKIs despite looking sick initially.`,
    category: 'biomarker',
    children: ['alectinib'],
  },
  'alectinib': {
    label: 'Alectinib',
    notes: `Alectinib is a highly selective 2nd-generation ALK TKI with exceptional CNS penetration - a critical advantage since brain metastases are the Achilles heel of ALK+ NSCLC. The ALEX trial established it as first-line standard over crizotinib.

**Dosing**: 600mg twice daily WITH FOOD (improves absorption)
**Duration**: Until progression

**ALEX trial results (5-year update):**
• OS: 62.5% vs 45.5% (HR 0.67)
• PFS: 34.8 vs 10.9 months (HR 0.43)
• CNS progression: 12% vs 45%

**Key toxicities**: Elevated LFTs, CPK elevation (myalgias), bradycardia, photosensitivity`,
    history: `Alectinib development:
• Originally developed in Japan (Chugai) for crizotinib-resistant disease
• 2015: US approval for 2nd-line
• 2017: ALEX trial results - practice-changing
• 2017: First-line approval
• Now: Global standard of care for ALK+ NSCLC

Alectinib exemplifies how 2nd-gen TKIs should be used FIRST-line, not saved for resistance.`,
    mechanism: `Why alectinib excels:

**High selectivity**: Much more specific for ALK than crizotinib (which also hits MET, ROS1). Less off-target toxicity.

**CNS penetration**: Unlike crizotinib (substrate of P-glycoprotein efflux pump), alectinib achieves excellent brain concentrations. This prevents CNS-only progressions.

**Resistance coverage**: Active against many ALK resistance mutations that develop on crizotinib.`,
    otherContexts: `Alectinib competitors:
• **Brigatinib**: Similar efficacy, different toxicity profile (early pulmonary events)
• **Lorlatinib**: 3rd-gen, even better CNS activity, but more CNS side effects
• Choice between these for 1st-line is evolving`,
    clinicalPearl: `Emphasize taking with food - absorption increases ~3x. Patients who take alectinib fasting have lower drug levels and worse outcomes.`,
    evidence: '[I, A]',
    trials: ['ALEX: 5-year OS 62.5% vs 45.5% with crizotinib. PFS HR 0.43.'],
    category: 'drug',
  },
  'other-targets': {
    label: 'Other Targets',
    notes: `Beyond EGFR and ALK, several other targetable drivers exist in NSCLC. Though each is individually rare, together they represent ~15-20% of patients - always test comprehensively!

**The targetable landscape:**
• **KRAS G12C** (~13%): Sotorasib, adagrasib - first "undruggable" target conquered
• **RET fusions** (~2%): Selpercatinib, pralsetinib - highly effective
• **MET ex14 skipping** (~3%): Capmatinib, tepotinib - older patients, poor prognosis
• **BRAF V600E** (~2%): Dabrafenib + trametinib - as in melanoma
• **NTRK fusions** (<1%): Larotrectinib, entrectinib - tumor-agnostic
• **HER2** (~3%): Trastuzumab deruxtecan (T-DXd) - recent approval`,
    history: `The expanding targetable landscape:
• 2011: BRAF identified as target (dabrafenib+trametinib)
• 2016: RET fusions recognized as distinct entity
• 2017: MET ex14 skipping mutations - new driver
• 2018: NTRK inhibitors - first tumor-agnostic approvals
• 2021: KRAS G12C - "undruggable" finally drugged
• 2022: HER2-targeted ADC (T-DXd) approved

Each year brings new actionable targets - comprehensive NGS is essential.`,
    mechanism: `Each target has unique biology:

**KRAS G12C**: Locked in GTP-bound "on" state. Sotorasib/adagrasib trap it in GDP-bound "off" state.

**RET**: Receptor tyrosine kinase, similar mechanism to EGFR. Fusions cause constitutive activation.

**MET ex14**: Skipping mutation removes regulatory domain, causing degradation resistance and hyperactivation.

**NTRK**: Neurotrophin receptor fusions - rare but highly druggable across all cancer types.`,
    clinicalPearl: `MET ex14 patients are typically older (median ~70) with poor prognosis despite targeted therapy. TKIs help but less dramatically than in EGFR/ALK - manage expectations.`,
    category: 'biomarker',
  },
  'pdl1-high': {
    label: 'PD-L1 ≥50%',
    notes: `PD-L1 ≥50% (high expressors) represent ~25-30% of NSCLC and have the best immunotherapy outcomes. These patients can receive pembrolizumab monotherapy - avoiding chemotherapy toxicity while achieving excellent results.

**Treatment options:**
• **Pembrolizumab monotherapy**: KEYNOTE-024 - OS 30 vs 14.2 months
• **Chemo-immunotherapy**: KEYNOTE-189/407 - may be more effective but more toxic

**The choice is nuanced:**
Monotherapy avoids chemo toxicity (cytopenias, nausea, fatigue) but may have slightly inferior outcomes in some analyses. Discuss with patient.`,
    history: `PD-L1 as a biomarker:
• 2015: Nivolumab 2nd-line approval - PD-L1 not required
• 2016: Pembrolizumab 1st-line for PD-L1 ≥50% (KEYNOTE-024)
• 2018: Chemo-IO combinations work across PD-L1 levels
• Debate continues: Is PD-L1 a good enough biomarker?

PD-L1 is imperfect - some PD-L1-negative tumors respond, some high expressors don't. But it's the best validated biomarker we have for immunotherapy selection.`,
    mechanism: `PD-L1 biology:

**Normal function**: PD-L1 on normal tissues prevents autoimmunity by binding PD-1 on T cells, delivering "stop" signal.

**Tumor hijacking**: Cancers upregulate PD-L1 to escape immune attack. High expression suggests active immune evasion - and likely response when the brake is removed.

**Limitations**: PD-L1 expression is heterogeneous, affected by prior therapies, and varies between primary and metastases.`,
    clinicalPearl: `PD-L1 testing requires adequate tissue and specific antibodies (22C3 for pembrolizumab). Results from cytology or small biopsies may underestimate true expression. Consider repeat biopsy if discordant with clinical picture.`,
    category: 'biomarker',
    children: ['pembro-mono'],
  },
  'pembro-mono': {
    label: 'Pembrolizumab Mono',
    notes: `Pembrolizumab monotherapy for PD-L1 ≥50% offers the prospect of chemotherapy-free treatment with durable responses. KEYNOTE-024 showed OS 30 vs 14.2 months - more than doubling survival compared to chemotherapy alone.

**Dosing**: 200mg IV q3 weeks OR 400mg IV q6 weeks
**Duration**: Until progression, intolerable toxicity, or 2 years (35 cycles)

**The appeal**: No chemotherapy toxicity - no cytopenias, nausea is minimal, hair loss absent. Quality of life typically preserved or improved.

**2-year stopping rule**: Patients completing 2 years without progression can stop. Many remain in remission - suggesting durable immune memory.`,
    history: `Pembrolizumab first-line journey:
• 2016: KEYNOTE-024 - pembrolizumab monotherapy for PD-L1 ≥50%
• This was revolutionary: first time immunotherapy ALONE beat chemotherapy
• 2020: 5-year data showed 31.9% alive with pembrolizumab vs 16.3% chemo
• Established that some patients achieve long-term disease control

The 5-year survival ~32% for metastatic NSCLC was unprecedented before immunotherapy.`,
    mechanism: `Pembrolizumab mechanism:

**PD-1 blockade**: Humanized antibody binds PD-1 receptor on T cells, preventing interaction with PD-L1/PD-L2 on tumor cells.

**T cell reactivation**: Removes the "off" signal, allowing pre-existing tumor-reactive T cells to resume killing cancer cells.

**Immune memory**: Unlike chemo (which requires ongoing treatment), immunotherapy can establish memory - some patients stay in remission for years after stopping.`,
    otherContexts: `Pembrolizumab across cancers:
Approved in 15+ tumor types including melanoma, head & neck, bladder, MSI-high cancers, Hodgkin lymphoma. Truly a foundational drug in oncology.`,
    clinicalPearl: `Immune-related adverse events (irAEs) can occur anytime - even months after stopping. Educate patients to report new symptoms indefinitely. Most common: thyroiditis, colitis, pneumonitis, hepatitis.`,
    evidence: '[I, A] MCBS 5',
    trials: ['KEYNOTE-024: OS 30 vs 14.2 months (HR 0.62). PFS 10.3 vs 6.0 months.'],
    category: 'drug',
  },
  'pdl1-low': {
    label: 'PD-L1 <50%',
    notes: `PD-L1 <50% includes both low expressors (1-49%) and negative (<1%) - together representing ~70% of NSCLC patients. These patients benefit from chemo-immunotherapy combinations rather than immunotherapy alone.

**PD-L1 1-49%**: Clear benefit from chemo-IO. Immunotherapy alone less effective.
**PD-L1 <1%**: Smaller but real benefit from chemo-IO. Chemotherapy contributes substantially.

**Standard treatment**: Platinum-based chemo + pembrolizumab (or other checkpoint inhibitor)

**Why combination beats monotherapy here?** Lower PD-L1 suggests less pre-existing anti-tumor immunity. Chemotherapy creates immunogenic cell death, priming the immune response that checkpoint inhibitors then unleash.`,
    history: `Chemo-IO for all PD-L1 levels:
• 2018: KEYNOTE-189 (non-squamous) and KEYNOTE-407 (squamous)
• Showed chemo-IO benefits ALL PD-L1 subgroups
• Established chemo-IO as default for PD-L1 <50%
• Debate remains for PD-L1 ≥50%: mono vs combo?

Before these trials, PD-L1-low patients faced a difficult choice. Now they have a clear standard of care.`,
    mechanism: `Why chemo enhances immunotherapy:

**Immunogenic cell death**: Platinum and taxanes kill tumor cells in ways that release antigens and danger signals, activating dendritic cells.

**Treg depletion**: Chemotherapy preferentially kills immunosuppressive regulatory T cells in the tumor microenvironment.

**PD-L1 upregulation**: Chemotherapy can increase PD-L1 expression, potentially enhancing checkpoint inhibitor efficacy.`,
    clinicalPearl: `For PD-L1 <1%, ensure patient understands the benefit from immunotherapy is smaller. Some oncologists discuss chemo alone as an option for truly PD-L1-negative tumors, especially if immunotherapy contraindications exist.`,
    category: 'biomarker',
    children: ['chemo-io'],
  },
  'chemo-io': {
    label: 'Chemo-Immunotherapy',
    notes: `Chemotherapy plus immunotherapy (chemo-IO) is the standard first-line treatment for most metastatic NSCLC without targetable mutations. The combination transformed outcomes - median survival improved from ~10 months to ~22 months.

**The landmark trials:**
• **KEYNOTE-189 (non-squamous)**: OS 22 vs 10.6 months (HR 0.56)
• **KEYNOTE-407 (squamous)**: OS 17.1 vs 11.6 months (HR 0.71)

**The regimens:**
• **Non-squamous**: Carboplatin + Pemetrexed + Pembrolizumab → Pembro + Pemetrexed maintenance
• **Squamous**: Carboplatin + Paclitaxel + Pembrolizumab → Pembro maintenance

**Why pemetrexed only for non-squamous?** Squamous cancers have high thymidylate synthase and are resistant to pemetrexed.

**Treatment course:**
• Induction: 4 cycles of chemo + pembrolizumab
• Maintenance: Pembrolizumab (± pemetrexed) until progression or 2 years`,
    history: `The evolution of first-line NSCLC:
• 1990s: Platinum doublet chemotherapy (median OS ~8-10 months)
• 2016: First-line pembrolizumab for PD-L1 ≥50%
• 2018: KEYNOTE-189/407 establish chemo-IO for all PD-L1 levels

The improvement from 10→22 months represents one of the biggest advances in solid tumor oncology.`,
    mechanism: `The chemo-IO synergy:

**Chemotherapy contributions:**
• Rapid tumor killing → symptom relief
• Immunogenic cell death → antigen release
• Treg depletion → reduced immunosuppression

**Immunotherapy contributions:**
• Removes PD-1/PD-L1 brake
• Creates immune memory
• Potential for durable responses`,
    evidence: '[I, A]',
    trials: ['KEYNOTE-189: OS 22 vs 10.6 months (HR 0.56)', 'KEYNOTE-407: OS 17.1 vs 11.6 months (HR 0.71)'],
    clinicalPearl: `Watch for immune-related adverse events (irAEs). Most dangerous is pneumonitis - any new dyspnea warrants urgent CT. Teach patients to report symptoms early; most irAEs are manageable if caught early.`,
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

      <div className="w-[450px] bg-gray-900 border-l border-gray-700 overflow-y-auto">
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

            {/* Educational Content */}
            <div className="space-y-4">
              {/* Main Notes */}
              {hoveredData.notes && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                    📚 Overview
                  </h3>
                  <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line prose prose-invert prose-sm max-w-none">
                    {hoveredData.notes.split('**').map((part, i) =>
                      i % 2 === 0 ? part : <strong key={i} className="text-white">{part}</strong>
                    )}
                  </div>
                </div>
              )}

              {/* History */}
              {hoveredData.history && (
                <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-700/30">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                    📜 History & Discovery
                  </h3>
                  <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                    {hoveredData.history.split('**').map((part, i) =>
                      i % 2 === 0 ? part : <strong key={i} className="text-amber-200">{part}</strong>
                    )}
                  </div>
                </div>
              )}

              {/* Mechanism */}
              {hoveredData.mechanism && (
                <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
                  <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                    🧬 Biology & Mechanism
                  </h3>
                  <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                    {hoveredData.mechanism.split('**').map((part, i) =>
                      i % 2 === 0 ? part : <strong key={i} className="text-purple-200">{part}</strong>
                    )}
                  </div>
                </div>
              )}

              {/* Clinical Pearl */}
              {hoveredData.clinicalPearl && (
                <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/30">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                    💡 Clinical Pearl
                  </h3>
                  <p className="text-sm text-gray-200 leading-relaxed">{hoveredData.clinicalPearl}</p>
                </div>
              )}

              {/* Other Contexts */}
              {hoveredData.otherContexts && (
                <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-700/30">
                  <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                    🔗 Beyond Lung Cancer
                  </h3>
                  <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                    {hoveredData.otherContexts.split('**').map((part, i) =>
                      i % 2 === 0 ? part : <strong key={i} className="text-cyan-200">{part}</strong>
                    )}
                  </div>
                </div>
              )}

              {/* Key Trials */}
              {hoveredData.trials && hoveredData.trials.length > 0 && (
                <div className="bg-indigo-900/30 rounded-lg p-4 border border-indigo-700/50">
                  <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wide mb-2 flex items-center gap-2">
                    🔬 Key Trials
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
              <p className="mb-2"><span className="text-blue-400 font-semibold">Hover</span> over any node for comprehensive notes:</p>
              <ul className="text-xs space-y-1 ml-2">
                <li><span className="text-blue-400">📚 Overview</span> - Complete explanation</li>
                <li><span className="text-amber-400">📜 History</span> - Discovery & evolution</li>
                <li><span className="text-purple-400">🧬 Mechanism</span> - Biology & how it works</li>
                <li><span className="text-emerald-400">💡 Clinical Pearl</span> - Practical tips</li>
                <li><span className="text-cyan-400">🔗 Other Contexts</span> - Use in other cancers</li>
                <li><span className="text-indigo-400">🔬 Key Trials</span> - Evidence base</li>
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
