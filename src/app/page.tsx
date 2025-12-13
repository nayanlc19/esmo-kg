'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import NodePanel from '@/components/NodePanel';
import { GraphData, GraphNode } from '@/lib/types';

export default function Home() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/graph');
        if (!response.ok) throw new Error('Failed to fetch graph data');
        const data = await response.json();
        setGraphData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredData = graphData
    ? {
        nodes: searchTerm
          ? graphData.nodes.filter(
              (node) =>
                node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                node.type.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : graphData.nodes,
        links: searchTerm
          ? graphData.links.filter((link) => {
              const filteredNodeIds = graphData.nodes
                .filter(
                  (node) =>
                    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    node.type.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((node) => node.id);
              return (
                filteredNodeIds.includes(link.source as string) ||
                filteredNodeIds.includes(link.target as string)
              );
            })
          : graphData.links,
      }
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading ESMO Knowledge Graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center text-red-400">
          <p className="text-xl mb-2">Error loading graph</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-gray-900/95 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">ESMO Lung Cancer Knowledge Graph</h1>
          <p className="text-sm text-gray-400">
            Interactive visualization of ESMO Living Guidelines
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-64"
          />
          <div className="text-sm text-gray-400">
            {graphData?.nodes.length} entities | {graphData?.links.length} relations
          </div>
          <Link
            href="/flowcharts"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            View Flowcharts
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex w-full pt-16">
        {/* Graph */}
        <div className="flex-1">
          {filteredData && (
            <KnowledgeGraph
              data={filteredData}
              onNodeClick={setSelectedNode}
            />
          )}
        </div>

        {/* Side panel */}
        <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      </div>
    </div>
  );
}
