'use client';

import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 400, y: 0 },
    data: { label: 'Stage II NSCLC' },
    style: { background: '#9333ea', color: 'white', border: 'none', fontWeight: 'bold', width: 180 },
  },
  {
    id: '2',
    position: { x: 400, y: 100 },
    data: { label: 'MDT Assessment\nStaging workup complete' },
    style: { background: '#374151', color: 'white', border: '1px solid #6b7280', width: 200 },
  },
  {
    id: '3',
    position: { x: 400, y: 200 },
    data: { label: 'Resectable?' },
    style: { background: '#1e40af', color: 'white', border: 'none', width: 150, borderRadius: '50%', height: 70 },
  },
  // Resectable
  {
    id: '4',
    position: { x: 200, y: 300 },
    data: { label: 'YES - Surgery\n[I, A]' },
    style: { background: '#16a34a', color: 'white', border: 'none', width: 150 },
  },
  {
    id: '5',
    position: { x: 200, y: 400 },
    data: { label: 'Anatomical Resection\nLobectomy or Pneumonectomy' },
    style: { background: '#22c55e', color: 'white', border: 'none', width: 200 },
  },
  {
    id: '6',
    position: { x: 200, y: 510 },
    data: { label: 'Systematic Nodal Dissection\n[III, A]' },
    style: { background: '#6366f1', color: 'white', border: 'none', width: 200 },
  },
  // Adjuvant decision
  {
    id: '7',
    position: { x: 200, y: 620 },
    data: { label: 'Adjuvant Therapy Assessment' },
    style: { background: '#374151', color: 'white', border: '1px solid #6b7280', width: 200 },
  },
  {
    id: '8',
    position: { x: 50, y: 730 },
    data: { label: 'EGFR mutation+?\nTest after surgery' },
    style: { background: '#ea580c', color: 'white', border: 'none', width: 150 },
  },
  {
    id: '9',
    position: { x: 250, y: 730 },
    data: { label: 'EGFR negative\nor unknown' },
    style: { background: '#78716c', color: 'white', border: 'none', width: 150 },
  },
  // EGFR+ path
  {
    id: '10',
    position: { x: 50, y: 840 },
    data: { label: 'Osimertinib\n[I, A] MCBS 4\n3 years adjuvant' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 150 },
  },
  // EGFR- path
  {
    id: '11',
    position: { x: 250, y: 840 },
    data: { label: 'Platinum-doublet ChT\n[I, A]\n4 cycles' },
    style: { background: '#0891b2', color: 'white', border: 'none', width: 160 },
  },
  {
    id: '12',
    position: { x: 250, y: 950 },
    data: { label: 'Consider Atezolizumab\n[II, B]\nif PD-L1 ≥1%' },
    style: { background: '#7c3aed', color: 'white', border: 'none', width: 170 },
  },
  // Unresectable
  {
    id: '13',
    position: { x: 550, y: 300 },
    data: { label: 'NO - Unresectable' },
    style: { background: '#dc2626', color: 'white', border: 'none', width: 160 },
  },
  {
    id: '14',
    position: { x: 550, y: 400 },
    data: { label: 'Treat as Stage III\nConcurrent CRT' },
    style: { background: '#ef4444', color: 'white', border: 'none', width: 160 },
  },
  // Surveillance
  {
    id: '15',
    position: { x: 150, y: 1060 },
    data: { label: 'Surveillance\nCT every 6 months x2y\nthen annually' },
    style: { background: '#10b981', color: 'white', border: 'none', width: 180 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4', label: 'Yes', style: { stroke: '#22c55e' }, labelStyle: { fill: '#22c55e' } },
  { id: 'e3-13', source: '3', target: '13', label: 'No', style: { stroke: '#ef4444' }, labelStyle: { fill: '#ef4444' } },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e5-6', source: '5', target: '6' },
  { id: 'e6-7', source: '6', target: '7' },
  { id: 'e7-8', source: '7', target: '8' },
  { id: 'e7-9', source: '7', target: '9' },
  { id: 'e8-10', source: '8', target: '10', label: 'EGFR+', style: { stroke: '#ea580c' }, labelStyle: { fill: '#ea580c' } },
  { id: 'e9-11', source: '9', target: '11' },
  { id: 'e11-12', source: '11', target: '12' },
  { id: 'e10-15', source: '10', target: '15' },
  { id: 'e12-15', source: '12', target: '15' },
  { id: 'e13-14', source: '13', target: '14' },
];

export default function StageIIFlowchart() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#374151" gap={20} />
        <Controls className="bg-gray-800 border-gray-700" />
        <MiniMap
          nodeColor={(node) => node.style?.background as string || '#6b7280'}
          className="bg-gray-800 border-gray-700"
        />
      </ReactFlow>
    </div>
  );
}
