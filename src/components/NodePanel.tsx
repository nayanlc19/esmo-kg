'use client';

import { GraphNode, ENTITY_COLORS } from '@/lib/types';

interface NodePanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

export default function NodePanel({ node, onClose }: NodePanelProps) {
  if (!node) {
    return (
      <div className="w-96 bg-gray-900 p-6 border-l border-gray-700 h-full overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">ESMO Lung Cancer Knowledge Graph</h2>
        <p className="text-gray-400 mb-4">
          Click on any node to see detailed information about treatments, drugs, biomarkers, and their relationships.
        </p>
        <div className="text-sm text-gray-500">
          <p className="mb-2">Based on ESMO Living Guidelines:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Early and Locally Advanced NSCLC (v1.0)</li>
            <li>Oncogene-Addicted Metastatic NSCLC (v1.2)</li>
            <li>Non-Oncogene-Addicted Metastatic NSCLC (v1.2)</li>
          </ul>
        </div>
      </div>
    );
  }

  const { entity } = node;

  return (
    <div className="w-96 bg-gray-900 p-6 border-l border-gray-700 h-full overflow-y-auto">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: ENTITY_COLORS[entity.entity_type] }}
          />
          <span className="text-sm text-gray-400 capitalize">{entity.entity_type}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl"
        >
          &times;
        </button>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">{entity.name}</h2>

      {entity.brief && (
        <p className="text-gray-300 mb-4">{entity.brief}</p>
      )}

      {entity.definition && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-1">Definition</h3>
          <p className="text-white">{entity.definition}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        {entity.evidence_level && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">Evidence Level</h3>
            <span className="inline-block bg-purple-600 text-white px-2 py-1 rounded text-sm">
              [{entity.evidence_level}]
            </span>
          </div>
        )}

        {entity.mcbs_score && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">MCBS Score</h3>
            <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-sm">
              {entity.mcbs_score}
            </span>
          </div>
        )}

        {entity.escat_level && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">ESCAT Level</h3>
            <span className="inline-block bg-orange-600 text-white px-2 py-1 rounded text-sm">
              {entity.escat_level}
            </span>
          </div>
        )}
      </div>

      {entity.metadata && Object.keys(entity.metadata).length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Additional Information</h3>
          <div className="bg-gray-800 rounded p-3 text-sm">
            {Object.entries(entity.metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between py-1 border-b border-gray-700 last:border-0">
                <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-white">
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entity.esmo_url && (
        <a
          href={entity.esmo_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
        >
          View ESMO Guideline
        </a>
      )}

      <div className="mt-6 pt-4 border-t border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Evidence Levels Guide</h3>
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>I:</strong> Meta-analysis/multiple RCTs</p>
          <p><strong>II:</strong> Single RCT/large study</p>
          <p><strong>III:</strong> Prospective/case-control</p>
          <p><strong>A:</strong> Strong evidence</p>
          <p><strong>B:</strong> Moderate evidence</p>
          <p><strong>C:</strong> Weak evidence</p>
        </div>
      </div>
    </div>
  );
}
