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
    data: { label: 'Stage IV NSCLC\nOncogene-Addicted' },
    style: { background: '#9333ea', color: 'white', border: 'none', fontWeight: 'bold', width: 200 },
  },
  {
    id: '2',
    position: { x: 400, y: 100 },
    data: { label: 'Molecular Testing\nNGS Panel Recommended' },
    style: { background: '#374151', color: 'white', border: '1px solid #6b7280', width: 200 },
  },
  // Biomarker branches
  {
    id: '3',
    position: { x: 80, y: 220 },
    data: { label: 'EGFR mutation' },
    style: { background: '#ea580c', color: 'white', border: 'none', width: 130 },
  },
  {
    id: '4',
    position: { x: 230, y: 220 },
    data: { label: 'ALK fusion' },
    style: { background: '#ea580c', color: 'white', border: 'none', width: 110 },
  },
  {
    id: '5',
    position: { x: 360, y: 220 },
    data: { label: 'ROS1 fusion' },
    style: { background: '#ea580c', color: 'white', border: 'none', width: 110 },
  },
  {
    id: '6',
    position: { x: 490, y: 220 },
    data: { label: 'BRAF V600E' },
    style: { background: '#ea580c', color: 'white', border: 'none', width: 110 },
  },
  {
    id: '7',
    position: { x: 620, y: 220 },
    data: { label: 'Other\n(RET, MET, KRAS, NTRK)' },
    style: { background: '#ea580c', color: 'white', border: 'none', width: 140 },
  },
  // EGFR treatments
  {
    id: '8',
    position: { x: 80, y: 340 },
    data: { label: 'First-line:\nOsimertinib\n[I, A] MCBS 5' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 140 },
  },
  {
    id: '9',
    position: { x: 80, y: 460 },
    data: { label: 'Alternatives:\nErlotinib, Gefitinib\nAfatinib [I, A]' },
    style: { background: '#3b82f6', color: 'white', border: 'none', width: 140 },
  },
  {
    id: '10',
    position: { x: 80, y: 580 },
    data: { label: 'After progression:\nNGS for T790M\nResistance mechanisms' },
    style: { background: '#6366f1', color: 'white', border: 'none', width: 150 },
  },
  // ALK treatments
  {
    id: '11',
    position: { x: 230, y: 340 },
    data: { label: 'First-line:\nAlectinib [I, A]\nLorlatinib [I, A]' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 130 },
  },
  {
    id: '12',
    position: { x: 230, y: 460 },
    data: { label: 'Alternative:\nBrigatinib [I, A]' },
    style: { background: '#3b82f6', color: 'white', border: 'none', width: 130 },
  },
  {
    id: '13',
    position: { x: 230, y: 580 },
    data: { label: 'After progression:\nSwitch ALK TKI\nbased on resistance' },
    style: { background: '#6366f1', color: 'white', border: 'none', width: 140 },
  },
  // ROS1 treatments
  {
    id: '14',
    position: { x: 360, y: 340 },
    data: { label: 'First-line:\nEntrectinib [I, A]\n(CNS active)' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 130 },
  },
  {
    id: '15',
    position: { x: 360, y: 460 },
    data: { label: 'Alternative:\nCrizotinib [I, A]' },
    style: { background: '#3b82f6', color: 'white', border: 'none', width: 130 },
  },
  // BRAF treatments
  {
    id: '16',
    position: { x: 490, y: 340 },
    data: { label: 'First-line:\nDabrafenib +\nTrametinib [I, A]' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 130 },
  },
  // Other treatments
  {
    id: '17',
    position: { x: 620, y: 340 },
    data: { label: 'RET:\nSelpercatinib\nPralsetinib [I, A]' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 130 },
  },
  {
    id: '18',
    position: { x: 620, y: 460 },
    data: { label: 'MET ex14:\nCapmatinib\nTepotinib [I, A]' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 130 },
  },
  {
    id: '19',
    position: { x: 620, y: 580 },
    data: { label: 'KRAS G12C:\nSotorasib\nAdagrasib [I, B]' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 130 },
  },
  {
    id: '20',
    position: { x: 620, y: 700 },
    data: { label: 'NTRK:\nLarotrectinib\nEntrectinib [I, A]' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 130 },
  },
  // Common note
  {
    id: '21',
    position: { x: 300, y: 750 },
    data: { label: 'Continue TKI beyond progression\nif clinical benefit [III, A]\nLocal therapy for oligoprogression' },
    style: { background: '#374151', color: 'white', border: '1px solid #6b7280', width: 250 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e2-5', source: '2', target: '5' },
  { id: 'e2-6', source: '2', target: '6' },
  { id: 'e2-7', source: '2', target: '7' },
  { id: 'e3-8', source: '3', target: '8' },
  { id: 'e8-9', source: '8', target: '9' },
  { id: 'e9-10', source: '9', target: '10' },
  { id: 'e4-11', source: '4', target: '11' },
  { id: 'e11-12', source: '11', target: '12' },
  { id: 'e12-13', source: '12', target: '13' },
  { id: 'e5-14', source: '5', target: '14' },
  { id: 'e14-15', source: '14', target: '15' },
  { id: 'e6-16', source: '6', target: '16' },
  { id: 'e7-17', source: '7', target: '17' },
  { id: 'e17-18', source: '17', target: '18' },
  { id: 'e18-19', source: '18', target: '19' },
  { id: 'e19-20', source: '19', target: '20' },
  { id: 'e10-21', source: '10', target: '21', style: { strokeDasharray: '5,5' } },
  { id: 'e13-21', source: '13', target: '21', style: { strokeDasharray: '5,5' } },
];

export default function StageIVOncogeneFlowchart() {
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
