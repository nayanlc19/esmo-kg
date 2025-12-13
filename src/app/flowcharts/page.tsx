'use client';

import { useState } from 'react';
import Link from 'next/link';
import StageIFlowchart from '@/components/flowcharts/StageIFlowchart';
import StageIIFlowchart from '@/components/flowcharts/StageIIFlowchart';
import StageIIIFlowchart from '@/components/flowcharts/StageIIIFlowchart';
import StageIVOncogeneFlowchart from '@/components/flowcharts/StageIVOncogeneFlowchart';
import StageIVNonOncogeneFlowchart from '@/components/flowcharts/StageIVNonOncogeneFlowchart';

const flowcharts = [
  { id: 'stage-i', title: 'Stage I NSCLC', subtitle: 'Early Stage Management' },
  { id: 'stage-ii', title: 'Stage II NSCLC', subtitle: 'Locally Advanced - Resectable' },
  { id: 'stage-iii', title: 'Stage III NSCLC', subtitle: 'Locally Advanced - Unresectable' },
  { id: 'stage-iv-oncogene', title: 'Stage IV - Oncogene Addicted', subtitle: 'EGFR, ALK, ROS1, BRAF, etc.' },
  { id: 'stage-iv-non-oncogene', title: 'Stage IV - Non-Oncogene Addicted', subtitle: 'PD-L1 Stratified Treatment' },
];

export default function FlowchartsPage() {
  const [activeFlowchart, setActiveFlowchart] = useState('stage-i');

  const renderFlowchart = () => {
    switch (activeFlowchart) {
      case 'stage-i':
        return <StageIFlowchart />;
      case 'stage-ii':
        return <StageIIFlowchart />;
      case 'stage-iii':
        return <StageIIIFlowchart />;
      case 'stage-iv-oncogene':
        return <StageIVOncogeneFlowchart />;
      case 'stage-iv-non-oncogene':
        return <StageIVNonOncogeneFlowchart />;
      default:
        return <StageIFlowchart />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gray-900/95 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">ESMO Living Guidelines - Flowcharts</h1>
            <p className="text-sm text-gray-400">
              Lung Cancer Management Decision Trees
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

      {/* Flowchart Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-2">
        <div className="flex gap-2 overflow-x-auto">
          {flowcharts.map((fc) => (
            <button
              key={fc.id}
              onClick={() => setActiveFlowchart(fc.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeFlowchart === fc.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="font-medium">{fc.title}</div>
              <div className="text-xs opacity-75">{fc.subtitle}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Flowchart Content */}
      <div className="h-[calc(100vh-140px)]">
        {renderFlowchart()}
      </div>

      {/* Legend */}
      <div className="fixed bottom-4 right-4 bg-gray-900/95 p-4 rounded-lg border border-gray-700 text-sm">
        <h3 className="font-bold text-white mb-2">Evidence Levels</h3>
        <div className="space-y-1 text-gray-300">
          <div><span className="text-green-400">[I, A]</span> Strong recommendation</div>
          <div><span className="text-blue-400">[II, B]</span> Moderate recommendation</div>
          <div><span className="text-yellow-400">[III, C]</span> Weak recommendation</div>
        </div>
      </div>
    </div>
  );
}
