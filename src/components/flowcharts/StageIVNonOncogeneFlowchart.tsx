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
    data: { label: 'Stage IV NSCLC\nNon-Oncogene Addicted' },
    style: { background: '#9333ea', color: 'white', border: 'none', fontWeight: 'bold', width: 220 },
  },
  {
    id: '2',
    position: { x: 400, y: 100 },
    data: { label: 'PD-L1 Testing\n+ Histology Assessment' },
    style: { background: '#374151', color: 'white', border: '1px solid #6b7280', width: 200 },
  },
  // Histology decision
  {
    id: '3',
    position: { x: 200, y: 210 },
    data: { label: 'Non-Squamous' },
    style: { background: '#0891b2', color: 'white', border: 'none', width: 140 },
  },
  {
    id: '4',
    position: { x: 550, y: 210 },
    data: { label: 'Squamous' },
    style: { background: '#0891b2', color: 'white', border: 'none', width: 140 },
  },
  // Non-squamous PD-L1 branches
  {
    id: '5',
    position: { x: 80, y: 320 },
    data: { label: 'PD-L1 ≥50%' },
    style: { background: '#7c3aed', color: 'white', border: 'none', width: 120 },
  },
  {
    id: '6',
    position: { x: 220, y: 320 },
    data: { label: 'PD-L1 1-49%' },
    style: { background: '#7c3aed', color: 'white', border: 'none', width: 120 },
  },
  {
    id: '7',
    position: { x: 360, y: 320 },
    data: { label: 'PD-L1 <1%' },
    style: { background: '#7c3aed', color: 'white', border: 'none', width: 120 },
  },
  // Non-squamous treatments
  {
    id: '8',
    position: { x: 80, y: 430 },
    data: { label: 'Pembrolizumab mono\n[I, A] MCBS 5\nor Chemo-IO' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 150 },
  },
  {
    id: '9',
    position: { x: 220, y: 430 },
    data: { label: 'Chemo-IO\nPemetrexed-Platin\n+ Pembrolizumab [I, A]' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 160 },
  },
  {
    id: '10',
    position: { x: 360, y: 430 },
    data: { label: 'Chemo-IO\nor Chemo alone\nif ICI contraindicated' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 150 },
  },
  // Non-squamous alternatives
  {
    id: '11',
    position: { x: 150, y: 560 },
    data: { label: 'Alternatives:\nAtezolizumab + Bev + Chemo\nNivolumab + Ipilimumab + Chemo' },
    style: { background: '#3b82f6', color: 'white', border: 'none', width: 220 },
  },
  // Squamous PD-L1 branches
  {
    id: '12',
    position: { x: 480, y: 320 },
    data: { label: 'PD-L1 ≥50%' },
    style: { background: '#7c3aed', color: 'white', border: 'none', width: 120 },
  },
  {
    id: '13',
    position: { x: 620, y: 320 },
    data: { label: 'PD-L1 <50%' },
    style: { background: '#7c3aed', color: 'white', border: 'none', width: 120 },
  },
  // Squamous treatments
  {
    id: '14',
    position: { x: 480, y: 430 },
    data: { label: 'Pembrolizumab mono\n[I, A]\nor Chemo-IO' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 150 },
  },
  {
    id: '15',
    position: { x: 620, y: 430 },
    data: { label: 'Chemo-IO\nCarboplatin-Paclitaxel\n+ Pembrolizumab [I, A]' },
    style: { background: '#2563eb', color: 'white', border: 'none', width: 170 },
  },
  {
    id: '16',
    position: { x: 550, y: 560 },
    data: { label: 'Alternative:\nCemiplimab-Platin ChT\n[I, A] if PD-L1 ≥1%' },
    style: { background: '#3b82f6', color: 'white', border: 'none', width: 180 },
  },
  // Second line
  {
    id: '17',
    position: { x: 400, y: 700 },
    data: { label: 'Second-line Treatment' },
    style: { background: '#374151', color: 'white', border: '1px solid #6b7280', width: 180 },
  },
  {
    id: '18',
    position: { x: 250, y: 810 },
    data: { label: 'If no prior ICI:\nPembrolizumab\nor Nivolumab' },
    style: { background: '#6366f1', color: 'white', border: 'none', width: 150 },
  },
  {
    id: '19',
    position: { x: 450, y: 810 },
    data: { label: 'Docetaxel [I, B]\n± Nintedanib (non-sq)\n± Ramucirumab' },
    style: { background: '#6366f1', color: 'white', border: 'none', width: 170 },
  },
  // ICI contraindicated path
  {
    id: '20',
    position: { x: 750, y: 320 },
    data: { label: 'ICI Contraindicated' },
    style: { background: '#dc2626', color: 'white', border: 'none', width: 140 },
  },
  {
    id: '21',
    position: { x: 750, y: 430 },
    data: { label: 'Platinum-doublet ChT\n4-6 cycles\n[I, A]' },
    style: { background: '#ef4444', color: 'white', border: 'none', width: 150 },
  },
  {
    id: '22',
    position: { x: 750, y: 540 },
    data: { label: 'Maintenance:\nPemetrexed (non-sq)\nor Gemcitabine (sq)' },
    style: { background: '#f87171', color: 'white', border: 'none', width: 160 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e2-20', source: '2', target: '20', style: { stroke: '#ef4444' } },
  { id: 'e3-5', source: '3', target: '5' },
  { id: 'e3-6', source: '3', target: '6' },
  { id: 'e3-7', source: '3', target: '7' },
  { id: 'e5-8', source: '5', target: '8' },
  { id: 'e6-9', source: '6', target: '9' },
  { id: 'e7-10', source: '7', target: '10' },
  { id: 'e8-11', source: '8', target: '11', style: { strokeDasharray: '5,5' } },
  { id: 'e9-11', source: '9', target: '11', style: { strokeDasharray: '5,5' } },
  { id: 'e4-12', source: '4', target: '12' },
  { id: 'e4-13', source: '4', target: '13' },
  { id: 'e12-14', source: '12', target: '14' },
  { id: 'e13-15', source: '13', target: '15' },
  { id: 'e14-16', source: '14', target: '16', style: { strokeDasharray: '5,5' } },
  { id: 'e15-16', source: '15', target: '16', style: { strokeDasharray: '5,5' } },
  { id: 'e11-17', source: '11', target: '17' },
  { id: 'e16-17', source: '16', target: '17' },
  { id: 'e17-18', source: '17', target: '18' },
  { id: 'e17-19', source: '17', target: '19' },
  { id: 'e20-21', source: '20', target: '21' },
  { id: 'e21-22', source: '21', target: '22' },
];

export default function StageIVNonOncogeneFlowchart() {
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
