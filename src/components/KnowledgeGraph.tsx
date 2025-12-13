'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { GraphData, GraphNode, ENTITY_COLORS } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading 3D Graph...</div>,
});

interface KnowledgeGraphProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
}

export default function KnowledgeGraph({ data, onNodeClick }: KnowledgeGraphProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 400,
        height: window.innerHeight - 100,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = useCallback((node: any) => {
    onNodeClick(node as GraphNode);

    // Focus on node
    const fg = fgRef.current;
    if (fg?.cameraPosition) {
      const distance = 150;
      const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);

      fg.cameraPosition(
        { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
        { x: node.x || 0, y: node.y || 0, z: node.z || 0 },
        1000
      );
    }
  }, [onNodeClick]);

  return (
    <div className="relative">
      <ForceGraph3D
        ref={fgRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel={(node: any) => `<div class="bg-gray-900 text-white p-2 rounded shadow-lg max-w-xs">
          <div class="font-bold">${node.name}</div>
          <div class="text-xs text-gray-300">${node.type}</div>
          <div class="text-sm mt-1">${node.brief}</div>
        </div>`}
        nodeColor={(node: any) => node.color}
        nodeVal={(node: any) => node.val}
        nodeOpacity={0.9}
        linkLabel={(link: any) =>
          `${link.type}${link.condition ? ` (${link.condition})` : ''}`
        }
        linkColor={() => 'rgba(255, 255, 255, 0.3)'}
        linkWidth={1}
        linkOpacity={0.6}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        backgroundColor="#0f172a"
        showNavInfo={false}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 p-4 rounded-lg shadow-lg">
        <h3 className="text-white font-bold mb-2">Legend</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(ENTITY_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-white capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
