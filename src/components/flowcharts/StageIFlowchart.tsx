'use client';

import { useCallback } from 'react';
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
  // Start
  {
    id: '1',
    position: { x: 400, y: 0 },
    data: { label: 'Stage I NSCLC' },
    style: { background: '#9333ea', color: 'white', border: 'none', fontWeight: 'bold', width: 180 },
  },
  // Assessment
  {
    id: '2',
    position: { x: 400, y: 100 },
    data: { label: 'Preoperative Evaluation\nMDT Assessment' },
    style: { background: '#374151', color: 'white', border: '1px solid #6b7280', width: 180 },
  },
  // Decision
  {
    id: '3',
    position: { x: 400, y: 200 },
    data: { label: 'Medically Operable?' },
    style: { background: '#1e40af', color: 'white', border: 'none', width: 180, borderRadius: '50%', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  },
  // Operable Path
  {
    id: '4',
    position: { x: 150, y: 320 },
    data: { label: 'YES - Surgery' },
    style: { background: '#16a34a', color: 'white', border: 'none', width: 150 },
  },
  {
    id: '5',
    position: { x: 50, y: 420 },
    data: { label: 'Lobectomy\n[I, A]\nPreferred' },
    style: { background: '#22c55e', color: 'white', border: 'none', width: 140 },
  },
  {
    id: '6',
    position: { x: 220, y: 420 },
    data: { label: 'Sublobar Resection\n[I, A]\nTumor ≤2cm, peripheral' },
    style: { background: '#22c55e', color: 'white', border: 'none', width: 160 },
  },
  // Surgical Approach
  {
    id: '7',
    position: { x: 130, y: 530 },
    data: { label: 'VATS/RATS\n[I, A]\nMinimally invasive' },
    style: { background: '#0891b2', color: 'white', border: 'none', width: 150 },
  },
  // Lymph Node
  {
    id: '8',
    position: { x: 130, y: 630 },
    data: { label: 'Lymph Node Dissection\n[III, A]\n≥3 mediastinal + ≥3 hilar stations' },
    style: { background: '#6366f1', color: 'white', border: 'none', width: 200 },
  },
  // Resection outcomes
  {
    id: '9',
    position: { x: 50, y: 750 },
    data: { label: 'R0 Resection\nComplete' },
    style: { background: '#84cc16', color: 'black', border: 'none', width: 120 },
  },
  {
    id: '10',
    position: { x: 200, y: 750 },
    data: { label: 'R1 Resection\nMicroscopic residual' },
    style: { background: '#eab308', color: 'black', border: 'none', width: 140 },
  },
  // Post R0
  {
    id: '11',
    position: { x: 50, y: 860 },
    data: { label: 'Surveillance\nFollow-up imaging' },
    style: { background: '#10b981', color: 'white', border: 'none', width: 130 },
  },
  // Post R1
  {
    id: '12',
    position: { x: 200, y: 860 },
    data: { label: 'PORT\n[II, B]\nRe-resection or RT' },
    style: { background: '#f59e0b', color: 'black', border: 'none', width: 130 },
  },
  // Inoperable Path
  {
    id: '13',
    position: { x: 600, y: 320 },
    data: { label: 'NO - Inoperable' },
    style: { background: '#dc2626', color: 'white', border: 'none', width: 150 },
  },
  {
    id: '14',
    position: { x: 600, y: 420 },
    data: { label: 'SBRT\n[II, A]\nStereotactic Body RT' },
    style: { background: '#ef4444', color: 'white', border: 'none', width: 160 },
  },
  // SBRT indications
  {
    id: '15',
    position: { x: 500, y: 530 },
    data: { label: 'Indications:\n• Severe COPD\n• Elderly/Frail\n• Patient preference' },
    style: { background: '#374151', color: 'white', border: '1px solid #6b7280', width: 160, textAlign: 'left' },
  },
  {
    id: '16',
    position: { x: 700, y: 530 },
    data: { label: 'IPF patients\n[III, B]\nMDT discussion required' },
    style: { background: '#78716c', color: 'white', border: 'none', width: 150 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4', label: 'Yes', style: { stroke: '#22c55e' }, labelStyle: { fill: '#22c55e' } },
  { id: 'e3-13', source: '3', target: '13', label: 'No', style: { stroke: '#ef4444' }, labelStyle: { fill: '#ef4444' } },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e4-6', source: '4', target: '6' },
  { id: 'e5-7', source: '5', target: '7' },
  { id: 'e6-7', source: '6', target: '7' },
  { id: 'e7-8', source: '7', target: '8' },
  { id: 'e8-9', source: '8', target: '9' },
  { id: 'e8-10', source: '8', target: '10' },
  { id: 'e9-11', source: '9', target: '11' },
  { id: 'e10-12', source: '10', target: '12' },
  { id: 'e13-14', source: '13', target: '14' },
  { id: 'e14-15', source: '14', target: '15' },
  { id: 'e14-16', source: '14', target: '16' },
];

export default function StageIFlowchart() {
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
