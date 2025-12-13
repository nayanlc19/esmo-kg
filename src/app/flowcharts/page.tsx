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

// Node data with rich information
const nodeData: Record<string, {
  label: string;
  definition: string;
  trials?: string[];
  evidence?: string;
  children?: string[];
  category: 'stage' | 'decision' | 'treatment' | 'drug' | 'biomarker' | 'outcome';
}> = {
  'nsclc': {
    label: 'NSCLC Diagnosis',
    definition: 'Non-Small Cell Lung Cancer confirmed by histopathology. Accounts for ~85% of lung cancers. Includes adenocarcinoma, squamous cell carcinoma, and large cell carcinoma.',
    category: 'stage',
    children: ['stage-i', 'stage-ii', 'stage-iii', 'stage-iv'],
  },
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
    children: ['stage-ii-surgery'],
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
  'stage-i-operable': {
    label: 'Medically Operable',
    definition: 'Patient fit for surgery based on pulmonary function (FEV1, DLCO), cardiac status, and performance status (ECOG 0-1).',
    category: 'decision',
    children: ['lobectomy', 'sublobar'],
  },
  'stage-i-inoperable': {
    label: 'Medically Inoperable',
    definition: 'Patient unfit for surgery due to severe COPD, cardiac disease, poor performance status, or patient preference.',
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
    definition: 'Post-Operative Radiation Therapy. 50-54 Gy to surgical bed.',
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
  'stage-ii-surgery': {
    label: 'Surgical Resection',
    definition: 'Lobectomy or pneumonectomy with systematic lymph node dissection.',
    evidence: '[I, A]',
    category: 'treatment',
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
  },
  'adj-chemo': {
    label: 'Adjuvant Chemotherapy',
    definition: 'Cisplatin-based doublet x4 cycles. Vinorelbine, pemetrexed, or docetaxel combinations.',
    evidence: '[I, A]',
    trials: ['LACE meta-analysis: 5% absolute survival benefit at 5 years'],
    category: 'treatment',
  },
  'stage-iii-concurrent': {
    label: 'Concurrent CRT',
    definition: 'Chemotherapy given simultaneously with radiation. Superior to sequential for fit patients.',
    evidence: '[I, A]',
    trials: ['RTOG 9410: Concurrent superior to sequential (median OS 17 vs 14.6 mo)'],
    category: 'treatment',
    children: ['consolidation-testing'],
  },
  'stage-iii-sequential': {
    label: 'Sequential CRT',
    definition: 'Chemotherapy followed by radiation. For patients unfit for concurrent treatment.',
    evidence: '[I, A]',
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
  },
  'durvalumab-consol': {
    label: 'Durvalumab (Consolidation)',
    definition: 'PD-L1 inhibitor. 10mg/kg q2w for 12 months. For EGFR/ALK WT, PD-L1 TC ≥1%.',
    evidence: '[I, A] MCBS 4',
    trials: ['PACIFIC: Median OS 47.5 vs 29.1 months (HR 0.68)'],
    category: 'drug',
  },
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
    children: ['egfr-mut', 'alk-fusion', 'other-targets'],
  },
  'non-oncogene': {
    label: 'Non-Oncogene Addicted',
    definition: 'No actionable driver mutation. Treatment based on PD-L1 expression and histology.',
    category: 'decision',
    children: ['pdl1-high', 'pdl1-low'],
  },
  'egfr-mut': {
    label: 'EGFR Mutation',
    definition: 'Exon 19 deletion or L858R mutation in ~15% Caucasian, ~50% Asian NSCLC.',
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
    definition: 'ALK rearrangement in ~5% NSCLC. More common in younger, never-smokers.',
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
  'other-targets': {
    label: 'Other Targets',
    definition: 'BRAF V600E: Dabrafenib+Trametinib. RET: Selpercatinib. MET ex14: Capmatinib. KRAS G12C: Sotorasib.',
    category: 'biomarker',
  },
  'pdl1-high': {
    label: 'PD-L1 ≥50%',
    definition: 'High PD-L1 expression. Can receive pembrolizumab monotherapy or chemo-immunotherapy.',
    category: 'biomarker',
    children: ['pembro-mono'],
  },
  'pembro-mono': {
    label: 'Pembrolizumab Mono',
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

      <div className="w-80 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
        {hoveredData ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded" style={{ background: categoryColors[hoveredData.category] }} />
              <span className="text-xs text-gray-400 capitalize">{hoveredData.category}</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-3">{hoveredData.label}</h2>
            {hoveredData.evidence && (
              <div className="mb-3">
                <span className="inline-block bg-green-600 text-white px-2 py-1 rounded text-xs">
                  {hoveredData.evidence}
                </span>
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 mb-1">Definition</h3>
              <p className="text-sm text-white leading-relaxed">{hoveredData.definition}</p>
            </div>
            {hoveredData.trials && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-1">Key Trials</h3>
                {hoveredData.trials.map((trial, idx) => (
                  <div key={idx} className="bg-gray-800 p-2 rounded text-xs text-white mb-1">
                    {trial}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-400 text-sm">
            <h2 className="text-lg font-bold text-white mb-3">ESMO Lung Cancer Guidelines</h2>
            <p className="mb-3">Interactive decision tree for NSCLC management.</p>
            <p className="mb-2"><span className="text-blue-400">Hover</span> for definitions & trials</p>
            <p><span className="text-green-400">Click</span> to expand pathways</p>
            <div className="mt-4 pt-3 border-t border-gray-700 text-xs">
              <p className="mb-1"><span className="text-green-400">[I, A]</span> Strong evidence</p>
              <p className="mb-1"><span className="text-blue-400">[II, B]</span> Moderate evidence</p>
              <p><span className="text-purple-400">MCBS 4-5</span> High clinical benefit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
