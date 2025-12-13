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
    data: { label: 'Unresectable Stage III NSCLC\n(IIIA-C)' },
    style: { background: '#9333ea', color: 'white', border: 'none', fontWeight: 'bold', width: 220 },
  },
  {
    id: '2',
    position: { x: 400, y: 100 },
    data: { label: 'MDT Assessment\nPS, comorbidities, tumor burden' },
    style: { background: '#374151', color: 'white', border: '1px solid #6b7280', width: 220 },
  },
  {
    id: '3',
    position: { x: 400, y: 200 },
    data: { label: 'Fit for concurrent CRT?' },
    style: { background: '#1e40af', color: 'white', border: 'none', width: 180, borderRadius: '50%', height: 80 },
  },
  // Fit for concurrent
  {
    id: '4',
    position: { x: 200, y: 320 },
    data: { label: 'YES - Concurrent CRT\n[I, A]' },
    style: { background: '#16a34a', color: 'white', border: 'none', width: 180 },
  },
  {
    id: '5',
    position: { x: 200, y: 420 },
    data: { label: 'RT: 60 Gy\nOnce daily fractions\n[I, A]' },
    style: { background: '#0891b2', color: 'white', border: 'none', width: 160 },
  },
  {
    id: '6',
    position: { x: 200, y: 530 },
    data: { label: 'Platinum-based doublet\n2-3 cycles concurrent\n[I, A]' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 180 },
  },
  // Biomarker testing
  {
    id: '7',
    position: { x: 200, y: 650 },
    data: { label: 'Biomarker Testing\nEGFR, PD-L1' },
    style: { background: '#ea580c', color: 'white', border: 'none', width: 160 },
  },
  // EGFR decision
  {
    id: '8',
    position: { x: 100, y: 760 },
    data: { label: 'EGFR mutation+' },
    style: { background: '#f97316', color: 'white', border: 'none', width: 130 },
  },
  {
    id: '9',
    position: { x: 280, y: 760 },
    data: { label: 'EGFR wild-type' },
    style: { background: '#78716c', color: 'white', border: 'none', width: 130 },
  },
  // EGFR+ consolidation
  {
    id: '10',
    position: { x: 100, y: 870 },
    data: { label: 'Osimertinib\nConsolidation\n[I, A] MCBS 4' },
    style: { background: '#22c55e', color: 'white', border: 'none', width: 150 },
  },
  // EGFR WT consolidation - PD-L1 decision
  {
    id: '11',
    position: { x: 280, y: 870 },
    data: { label: 'PD-L1 ≥1%?' },
    style: { background: '#7c3aed', color: 'white', border: 'none', width: 120 },
  },
  {
    id: '12',
    position: { x: 280, y: 980 },
    data: { label: 'Durvalumab\n1 year consolidation\n[I, A] MCBS 4' },
    style: { background: '#a855f7', color: 'white', border: 'none', width: 170 },
  },
  // Not fit for concurrent
  {
    id: '13',
    position: { x: 550, y: 320 },
    data: { label: 'NO - Sequential CRT\n[I, A]' },
    style: { background: '#dc2626', color: 'white', border: 'none', width: 170 },
  },
  {
    id: '14',
    position: { x: 550, y: 420 },
    data: { label: 'Chemotherapy first\n2-4 cycles' },
    style: { background: '#ef4444', color: 'white', border: 'none', width: 160 },
  },
  {
    id: '15',
    position: { x: 550, y: 530 },
    data: { label: 'Then RT\n60 Gy' },
    style: { background: '#f87171', color: 'white', border: 'none', width: 140 },
  },
  {
    id: '16',
    position: { x: 550, y: 640 },
    data: { label: 'Durvalumab\n[III, B]\nif PD-L1 TC ≥1%' },
    style: { background: '#a855f7', color: 'white', border: 'none', width: 150 },
  },
  // Surveillance
  {
    id: '17',
    position: { x: 350, y: 1100 },
    data: { label: 'Surveillance\nCT chest every 3-6 months' },
    style: { background: '#10b981', color: 'white', border: 'none', width: 200 },
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
  { id: 'e8-10', source: '8', target: '10' },
  { id: 'e9-11', source: '9', target: '11' },
  { id: 'e11-12', source: '11', target: '12', label: 'Yes', style: { stroke: '#a855f7' }, labelStyle: { fill: '#a855f7' } },
  { id: 'e10-17', source: '10', target: '17' },
  { id: 'e12-17', source: '12', target: '17' },
  { id: 'e13-14', source: '13', target: '14' },
  { id: 'e14-15', source: '14', target: '15' },
  { id: 'e15-16', source: '15', target: '16' },
  { id: 'e16-17', source: '16', target: '17' },
];

export default function StageIIIFlowchart() {
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
