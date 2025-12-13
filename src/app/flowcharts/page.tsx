'use client';

import { useState, useCallback } from 'react';
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

// Node data with rich information
const nodeData: Record<string, {
  label: string;
  definition: string;
  trials?: string[];
  evidence?: string;
  children?: string[];
  category: 'stage' | 'decision' | 'treatment' | 'drug' | 'biomarker' | 'outcome';
}> = {
  // Root
  'nsclc': {
    label: 'NSCLC Diagnosis',
    definition: 'Non-Small Cell Lung Cancer confirmed by histopathology. Accounts for ~85% of lung cancers. Includes adenocarcinoma, squamous cell carcinoma, and large cell carcinoma.',
    category: 'stage',
    children: ['stage-i', 'stage-ii', 'stage-iii', 'stage-iv'],
  },
  // Stages
  'stage-i': {
    label: 'Stage I',
    definition: 'Tumor ≤4cm, confined to lung, no lymph node involvement (N0). Stage IA: ≤3cm, Stage IB: >3-4cm. 5-year survival: 70-90%.',
    category: 'stage',
    children: ['stage-i-operable', 'stage-i-inoperable'],
  },
  'stage-ii': {
    label: 'Stage II',
    definition: 'Tumor >4-5cm OR involvement of ipsilateral hilar lymph nodes (N1). Stage IIA: 4-5cm N0, Stage IIB: >5cm N0 or any T with N1. 5-year survival: 50-60%.',
    category: 'stage',
    children: ['stage-ii-surgery', 'stage-ii-adjuvant'],
  },
  'stage-iii': {
    label: 'Stage III',
    definition: 'Locally advanced disease with mediastinal lymph node involvement (N2/N3) or invasion of chest wall, diaphragm, mediastinum. Often unresectable. 5-year survival: 20-35%.',
    category: 'stage',
    children: ['stage-iii-concurrent', 'stage-iii-sequential'],
  },
  'stage-iv': {
    label: 'Stage IV',
    definition: 'Metastatic disease - spread to contralateral lung, pleura, or distant organs (brain, bone, liver, adrenals). 5-year survival: <10% without targeted therapy.',
    category: 'stage',
    children: ['stage-iv-testing'],
  },
  // Stage I branches
  'stage-i-operable': {
    label: 'Medically Operable',
    definition: 'Patient fit for surgery based on pulmonary function (FEV1, DLCO), cardiac status, and performance status (ECOG 0-1).',
    category: 'decision',
    children: ['lobectomy', 'sublobar'],
  },
  'stage-i-inoperable': {
    label: 'Medically Inoperable',
    definition: 'Patient unfit for surgery due to severe COPD, cardiac disease, poor performance status, or patient preference. Consider SBRT.',
    category: 'decision',
    children: ['sbrt'],
  },
  'lobectomy': {
    label: 'Lobectomy',
    definition: 'Removal of entire lung lobe. Gold standard for Stage I NSCLC. Performed via VATS/RATS (minimally invasive) when possible.',
    evidence: '[I, A]',
    trials: ['LCSG 821: Lobectomy superior to limited resection for survival'],
    category: 'treatment',
    children: ['lymph-node-dissection'],
  },
  'sublobar': {
    label: 'Sublobar Resection',
    definition: 'Wedge resection or segmentectomy. Acceptable for tumors ≤2cm, peripheral location, ground-glass component.',
    evidence: '[I, A]',
    trials: ['JCOG0802/WJOG4607L: Non-inferior to lobectomy for ≤2cm tumors'],
    category: 'treatment',
    children: ['lymph-node-dissection'],
  },
  'sbrt': {
    label: 'SBRT',
    definition: 'Stereotactic Body Radiation Therapy. High-dose, precisely targeted radiation in 3-5 fractions. 54 Gy in 3 fractions typical.',
    evidence: '[II, A]',
    trials: ['RTOG 0236: 3-year local control 98%', 'CHISEL: SBRT vs conventional RT'],
    category: 'treatment',
    children: ['surveillance'],
  },
  'lymph-node-dissection': {
    label: 'Lymph Node Dissection',
    definition: 'Systematic sampling of ≥3 mediastinal stations + ≥3 N1 stations for accurate staging.',
    evidence: '[III, A]',
    category: 'treatment',
    children: ['r0-resection', 'r1-resection'],
  },
  'r0-resection': {
    label: 'R0 Resection',
    definition: 'Complete resection with negative margins. No residual tumor. Best oncological outcome.',
    category: 'outcome',
    children: ['surveillance'],
  },
  'r1-resection': {
    label: 'R1 Resection',
    definition: 'Microscopic residual disease at surgical margin. Consider re-resection or PORT.',
    category: 'outcome',
    children: ['port'],
  },
  'port': {
    label: 'PORT',
    definition: 'Post-Operative Radiation Therapy. 50-54 Gy to surgical bed. Controversial - may improve local control but not survival.',
    evidence: '[II, B]',
    trials: ['Lung ART: No OS benefit for PORT in N2 disease'],
    category: 'treatment',
    children: ['surveillance'],
  },
  'surveillance': {
    label: 'Surveillance',
    definition: 'Follow-up: CT chest every 6 months for 2 years, then annually. Monitor for recurrence.',
    category: 'outcome',
  },
  // Stage II
  'stage-ii-surgery': {
    label: 'Surgical Resection',
    definition: 'Lobectomy or pneumonectomy with systematic lymph node dissection. Higher morbidity than Stage I.',
    evidence: '[I, A]',
    category: 'treatment',
    children: ['stage-ii-adjuvant'],
  },
  'stage-ii-adjuvant': {
    label: 'Adjuvant Therapy',
    definition: 'Post-operative treatment to reduce recurrence risk. Depends on EGFR status and PD-L1.',
    category: 'decision',
    children: ['egfr-testing-adj'],
  },
  'egfr-testing-adj': {
    label: 'EGFR Testing',
    definition: 'Test for EGFR mutations (exon 19 del, L858R) to guide adjuvant targeted therapy.',
    category: 'biomarker',
    children: ['osimertinib-adj', 'adj-chemo'],
  },
  'osimertinib-adj': {
    label: 'Osimertinib (Adjuvant)',
    definition: '3rd generation EGFR TKI. 80mg daily for 3 years. For EGFR+ Stage IB-IIIA after complete resection.',
    evidence: '[I, A] MCBS 4',
    trials: ['ADAURA: 83% vs 28% 3-year DFS for EGFR+ (HR 0.17)'],
    category: 'drug',
    children: ['surveillance'],
  },
  'adj-chemo': {
    label: 'Adjuvant Chemotherapy',
    definition: 'Cisplatin-based doublet x4 cycles. Vinorelbine, pemetrexed, or docetaxel combinations.',
    evidence: '[I, A]',
    trials: ['LACE meta-analysis: 5% absolute survival benefit at 5 years'],
    category: 'treatment',
    children: ['atezolizumab-adj'],
  },
  'atezolizumab-adj': {
    label: 'Atezolizumab (Adjuvant)',
    definition: 'PD-L1 inhibitor. 1200mg IV q3w for 1 year. For PD-L1 ≥1% after adjuvant chemo.',
    evidence: '[II, B]',
    trials: ['IMpower010: Improved DFS in PD-L1 TC ≥1%'],
    category: 'drug',
    children: ['surveillance'],
  },
  // Stage III
  'stage-iii-concurrent': {
    label: 'Concurrent CRT',
    definition: 'Chemotherapy given simultaneously with radiation. Superior to sequential for fit patients.',
    evidence: '[I, A]',
    trials: ['RTOG 9410: Concurrent superior to sequential (median OS 17 vs 14.6 mo)'],
    category: 'treatment',
    children: ['crt-regimen'],
  },
  'stage-iii-sequential': {
    label: 'Sequential CRT',
    definition: 'Chemotherapy followed by radiation. For patients unfit for concurrent treatment.',
    evidence: '[I, A]',
    category: 'treatment',
    children: ['crt-regimen'],
  },
  'crt-regimen': {
    label: 'CRT Regimen',
    definition: 'RT: 60 Gy in 30 fractions. Chemo: Cisplatin-etoposide or carboplatin-paclitaxel x2-3 cycles.',
    category: 'treatment',
    children: ['consolidation-testing'],
  },
  'consolidation-testing': {
    label: 'Biomarker Testing',
    definition: 'Test EGFR and PD-L1 to guide consolidation therapy after CRT.',
    category: 'decision',
    children: ['osimertinib-consol', 'durvalumab-consol'],
  },
  'osimertinib-consol': {
    label: 'Osimertinib (Consolidation)',
    definition: 'For EGFR+ unresectable Stage III after CRT. Continue until progression.',
    evidence: '[I, A] MCBS 4',
    trials: ['LAURA: PFS 39.1 vs 5.6 months (HR 0.16)'],
    category: 'drug',
    children: ['surveillance'],
  },
  'durvalumab-consol': {
    label: 'Durvalumab (Consolidation)',
    definition: 'PD-L1 inhibitor. 10mg/kg q2w for 12 months. For EGFR/ALK WT, PD-L1 TC ≥1%.',
    evidence: '[I, A] MCBS 4',
    trials: ['PACIFIC: Median OS 47.5 vs 29.1 months (HR 0.68)'],
    category: 'drug',
    children: ['surveillance'],
  },
  // Stage IV
  'stage-iv-testing': {
    label: 'Molecular Testing',
    definition: 'Comprehensive NGS panel: EGFR, ALK, ROS1, BRAF, RET, MET, KRAS, NTRK, HER2. Plus PD-L1 IHC.',
    category: 'biomarker',
    children: ['oncogene-addicted', 'non-oncogene'],
  },
  'oncogene-addicted': {
    label: 'Oncogene-Addicted',
    definition: 'Tumors driven by specific mutations (EGFR, ALK, ROS1, etc.). Targeted therapy preferred over immunotherapy.',
    category: 'decision',
    children: ['egfr-mut', 'alk-fusion', 'ros1-fusion', 'other-targets'],
  },
  'non-oncogene': {
    label: 'Non-Oncogene Addicted',
    definition: 'No actionable driver mutation. Treatment based on PD-L1 expression and histology.',
    category: 'decision',
    children: ['pdl1-high', 'pdl1-low'],
  },
  // Oncogene targets
  'egfr-mut': {
    label: 'EGFR Mutation',
    definition: 'Exon 19 deletion or L858R mutation in ~15% Caucasian, ~50% Asian NSCLC. Predicts response to EGFR TKIs.',
    category: 'biomarker',
    children: ['osimertinib-1l'],
  },
  'osimertinib-1l': {
    label: 'Osimertinib (1st-line)',
    definition: '3rd gen EGFR TKI. 80mg daily. CNS-active. First-line for EGFR exon 19 del or L858R.',
    evidence: '[I, A] MCBS 5',
    trials: ['FLAURA: Median OS 38.6 vs 31.8 months vs 1st gen TKI (HR 0.80)'],
    category: 'drug',
  },
  'alk-fusion': {
    label: 'ALK Fusion',
    definition: 'ALK rearrangement in ~5% NSCLC. More common in younger, never-smokers. Highly responsive to ALK TKIs.',
    category: 'biomarker',
    children: ['alectinib'],
  },
  'alectinib': {
    label: 'Alectinib',
    definition: '2nd gen ALK TKI. 600mg BID. Excellent CNS penetration. First-line preferred.',
    evidence: '[I, A]',
    trials: ['ALEX: 5-year OS 62.5% vs 45.5% with crizotinib'],
    category: 'drug',
  },
  'ros1-fusion': {
    label: 'ROS1 Fusion',
    definition: 'ROS1 rearrangement in ~1-2% NSCLC. Similar to ALK. Responds to crizotinib, entrectinib.',
    category: 'biomarker',
    children: ['entrectinib'],
  },
  'entrectinib': {
    label: 'Entrectinib',
    definition: 'ROS1/NTRK/ALK inhibitor. 600mg daily. CNS-active. Preferred for ROS1+ with brain mets.',
    evidence: '[I, A]',
    trials: ['STARTRK-2: ORR 67%, intracranial ORR 55%'],
    category: 'drug',
  },
  'other-targets': {
    label: 'Other Targets',
    definition: 'BRAF V600E: Dabrafenib+Trametinib. RET: Selpercatinib. MET ex14: Capmatinib. KRAS G12C: Sotorasib.',
    category: 'biomarker',
  },
  // Non-oncogene
  'pdl1-high': {
    label: 'PD-L1 ≥50%',
    definition: 'High PD-L1 expression. Can receive pembrolizumab monotherapy or chemo-immunotherapy.',
    category: 'biomarker',
    children: ['pembro-mono'],
  },
  'pembro-mono': {
    label: 'Pembrolizumab Monotherapy',
    definition: 'PD-1 inhibitor. 200mg q3w. For PD-L1 ≥50%, no contraindications to immunotherapy.',
    evidence: '[I, A] MCBS 5',
    trials: ['KEYNOTE-024: Median OS 30 vs 14.2 months vs chemo (HR 0.62)'],
    category: 'drug',
  },
  'pdl1-low': {
    label: 'PD-L1 <50%',
    definition: 'Low/negative PD-L1. Requires chemo-immunotherapy combination.',
    category: 'biomarker',
    children: ['chemo-io'],
  },
  'chemo-io': {
    label: 'Chemo-Immunotherapy',
    definition: 'Platinum doublet + pembrolizumab. Pemetrexed for non-squamous, paclitaxel for squamous.',
    evidence: '[I, A]',
    trials: ['KEYNOTE-189: Median OS 22 vs 10.6 months (HR 0.56)'],
    category: 'treatment',
  },
};

// Color mapping
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

  // Build visible nodes and edges based on expanded state
  const buildGraph = useCallback(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const positions: Record<string, { x: number; y: number }> = {};

    // Calculate positions using BFS
    const queue: { id: string; level: number; index: number; parentX: number }[] = [
      { id: 'nsclc', level: 0, index: 0, parentX: 500 }
    ];
    const levelCounts: Record<number, number> = { 0: 1 };
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { id, level, parentX } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);

      const data = nodeData[id];
      if (!data) continue;

      const levelWidth = 900;
      const siblings = levelCounts[level] || 1;
      const xOffset = (visited.size % siblings) * (levelWidth / siblings);

      positions[id] = {
        x: parentX + (Math.random() - 0.5) * 100,
        y: level * 150,
      };

      nodes.push({
        id,
        position: positions[id],
        data: {
          label: (
            <div
              className="text-center cursor-pointer"
              onMouseEnter={() => setHoveredNode(id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className="font-semibold">{data.label}</div>
              {data.evidence && (
                <div className="text-xs mt-1 opacity-80">{data.evidence}</div>
              )}
              {data.children && expandedNodes.has(id) && (
                <div className="text-xs mt-1 opacity-60">Click to collapse</div>
              )}
              {data.children && !expandedNodes.has(id) && (
                <div className="text-xs mt-1 opacity-60">Click to expand →</div>
              )}
            </div>
          ),
        },
        style: {
          background: categoryColors[data.category],
          color: 'white',
          border: hoveredNode === id ? '3px solid #fbbf24' : 'none',
          borderRadius: data.category === 'decision' ? '50%' : '8px',
          padding: '12px 16px',
          minWidth: data.category === 'decision' ? '120px' : '140px',
          boxShadow: hoveredNode === id ? '0 0 20px rgba(251, 191, 36, 0.5)' : 'none',
        },
      });

      // Add children if expanded
      if (data.children && expandedNodes.has(id)) {
        const childCount = data.children.length;
        data.children.forEach((childId, idx) => {
          if (!levelCounts[level + 1]) levelCounts[level + 1] = 0;
          levelCounts[level + 1]++;

          const spread = childCount > 1 ? 200 : 0;
          const childX = positions[id].x + (idx - (childCount - 1) / 2) * spread;

          queue.push({
            id: childId,
            level: level + 1,
            index: idx,
            parentX: childX
          });

          edges.push({
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

    return { nodes, edges };
  }, [expandedNodes, hoveredNode]);

  const { nodes: initialNodes, edges: initialEdges } = buildGraph();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when expanded state changes
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const id = node.id;
    const data = nodeData[id];

    if (data?.children) {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          // Collapse: remove this node and all descendants
          const toRemove = new Set<string>();
          const queue = [id];
          while (queue.length > 0) {
            const current = queue.shift()!;
            toRemove.add(current);
            const children = nodeData[current]?.children || [];
            queue.push(...children);
          }
          toRemove.forEach(n => next.delete(n));
          next.add(id); // Keep the clicked node but collapsed
          next.delete(id); // Actually collapse it
        } else {
          next.add(id);
        }
        return next;
      });
    }
  }, []);

  // Rebuild graph when expandedNodes changes
  const { nodes: newNodes, edges: newEdges } = buildGraph();

  const hoveredData = hoveredNode ? nodeData[hoveredNode] : null;

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Main flowchart area */}
      <div className="flex-1 relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gray-900/95 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">ESMO Living Guidelines - Interactive Flowchart</h1>
              <p className="text-sm text-gray-400">
                Click nodes to expand pathways. Hover for detailed information.
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              View Knowledge Graph
            </Link>
          </div>
        </div>

        {/* Flowchart */}
        <div className="h-screen pt-20">
          <ReactFlow
            nodes={newNodes}
            edges={newEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#374151" gap={20} />
            <Controls className="bg-gray-800 border-gray-700" />
          </ReactFlow>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-900/95 p-4 rounded-lg border border-gray-700 text-sm">
          <h3 className="font-bold text-white mb-2">Legend</h3>
          <div className="space-y-1">
            {Object.entries(categoryColors).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: color }} />
                <span className="text-gray-300 capitalize">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="w-96 bg-gray-900 border-l border-gray-700 p-6 overflow-y-auto">
        {hoveredData ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-4 h-4 rounded"
                style={{ background: categoryColors[hoveredData.category] }}
              />
              <span className="text-sm text-gray-400 capitalize">{hoveredData.category}</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">{hoveredData.label}</h2>

            {hoveredData.evidence && (
              <div className="mb-4">
                <span className="inline-block bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">
                  Evidence: {hoveredData.evidence}
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Definition</h3>
              <p className="text-white leading-relaxed">{hoveredData.definition}</p>
            </div>

            {hoveredData.trials && hoveredData.trials.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Key Trials</h3>
                <div className="space-y-2">
                  {hoveredData.trials.map((trial, idx) => (
                    <div key={idx} className="bg-gray-800 p-3 rounded text-sm text-white">
                      {trial}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hoveredData.children && (
              <div className="text-sm text-gray-400">
                <span className="text-blue-400">Click</span> to see {hoveredData.children.length} next step(s)
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-400">
            <h2 className="text-xl font-bold text-white mb-4">ESMO Lung Cancer Guidelines</h2>
            <p className="mb-4">
              Interactive decision tree for NSCLC management based on ESMO Living Guidelines.
            </p>
            <p className="mb-4">
              <span className="text-blue-400">Hover</span> over any node to see detailed information including definitions, evidence levels, and key clinical trials.
            </p>
            <p>
              <span className="text-green-400">Click</span> on nodes to expand and explore treatment pathways.
            </p>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <h3 className="font-semibold text-white mb-2">Evidence Levels</h3>
              <div className="text-xs space-y-1">
                <p><span className="text-green-400">[I, A]</span> Meta-analysis/RCTs, strong recommendation</p>
                <p><span className="text-blue-400">[II, B]</span> Single RCT, moderate recommendation</p>
                <p><span className="text-yellow-400">[III, C]</span> Prospective studies, weak recommendation</p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-white mb-2">MCBS Score</h3>
              <div className="text-xs space-y-1">
                <p><span className="text-purple-400">MCBS 5</span> Highest clinical benefit</p>
                <p><span className="text-purple-400">MCBS 4</span> Substantial clinical benefit</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
