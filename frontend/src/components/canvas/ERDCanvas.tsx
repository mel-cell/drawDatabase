'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  BackgroundVariant,
  Panel,
  MarkerType,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useSchemaStore } from '@/store/useSchemaStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import TableNode from './TableNode';
import { RefreshCw, Layout, MousePointer2, StickyNote, Table as TableIcon, Link2, Plus } from 'lucide-react';

const nodeTypes = {
  table: TableNode,
};

export default function ERDCanvas() {
  const { tables, relations, currentDatabase, isTablesLoading } = useSchemaStore();
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    setNodes,
    setEdges,
    setSelectedNode
  } = useCanvasStore();

  const addTable = () => {
    const id = `table_${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'table',
      position: { x: 100, y: 100 },
      data: { 
        name: 'new_table', 
        columns: [{ name: 'id', type: 'INT', is_pk: true }] 
      },
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
  };

  // Sync tables to nodes with a Clean Grid Layout
  useEffect(() => {
    if (!tables.length) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const COLUMNS = 4;
    const SPACING_X = 350;
    const SPACING_Y = 450;

    // Create Nodes in a clean grid
    const initialNodes: Node[] = tables.map((table, index) => ({
      id: table.name,
      type: 'table',
      position: { 
        x: (index % COLUMNS) * SPACING_X, 
        y: Math.floor(index / COLUMNS) * SPACING_Y 
      },
      data: { name: table.name, columns: table.columns },
    }));

    // Create Edges with clear labels ddan SOLID orthogonal (kaku) lines
    const initialEdges: Edge[] = relations.map((rel, index) => ({
      id: `e-${rel.source_table}-${rel.target_table}-${index}`,
      type: 'smoothstep', // INI BIAR KAKU (SIKU-SIKU)
      source: rel.source_table,
      target: rel.target_table,
      sourceHandle: `${rel.source_table}-${rel.source_column}-right`,
      targetHandle: `${rel.target_table}-${rel.target_column}-left`,
      label: `${rel.source_column} → ${rel.target_column}`, 
      labelStyle: { fill: '#64748b', fontWeight: 700, fontSize: 10 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, rx: 4 },
      style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.8 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 15,
        height: 15,
      },
    }));

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [tables, relations, setNodes, setEdges]);

  const onLayout = useCallback(() => {
    const COLUMNS = 4;
    const SPACING_X = 350;
    const SPACING_Y = 450;
    
    setNodes(nodes.map((node, index) => ({
      ...node,
      position: { 
        x: (index % COLUMNS) * SPACING_X, 
        y: Math.floor(index / COLUMNS) * SPACING_Y 
      },
    })));
  }, [nodes, setNodes]);

  return (
    <div className="flex-1 h-full bg-slate-50 relative overflow-hidden">
      {isTablesLoading && (
        <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-slate-600">Loading Schema...</p>
            </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNode(node)}
        onPaneClick={() => setSelectedNode(null)}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
        
        {/* DRAW TOOLS TOOLBAR (LEFT SIDE) */}
        <Panel position="top-left" className="ml-2 mt-4 flex flex-col gap-2">
            <div className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-2xl flex flex-col gap-1.5">
                <button 
                    onClick={addTable}
                    className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 group relative"
                    title="Add New Table"
                >
                    <TableIcon className="w-5 h-5" />
                    <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        ADD TABLE (T)
                    </span>
                </button>
                
                <button className="p-3 bg-white text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-all group relative" title="Add Note">
                    <StickyNote className="w-5 h-5" />
                    <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        ADD NOTE (N)
                    </span>
                </button>

                <div className="h-px bg-slate-100 mx-2 my-1" />

                <button className="p-3 bg-slate-50 text-blue-600 rounded-xl transition-all group relative" title="Select Mode">
                    <MousePointer2 className="w-5 h-5 fill-blue-600/10" />
                </button>
            </div>
        </Panel>
        <Controls showInteractive={false} className="!bg-white !border-slate-200 !shadow-xl !rounded-lg overflow-hidden" />
        <MiniMap 
            className="!bg-white !border-slate-200 !shadow-xl !rounded-xl overflow-hidden" 
            nodeColor="#3b82f6"
            maskColor="rgba(241, 245, 249, 0.7)"
        />
        
        <Panel position="top-right" className="flex gap-2">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-2 rounded-xl shadow-xl flex items-center gap-2">
                <button 
                    onClick={onLayout}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-100 cursor-pointer hover:bg-blue-700 active:scale-95 transition-all"
                >
                    <Layout className="w-3.5 h-3.5" />
                    Reset Layout
                </button>
                <div className="h-4 w-px bg-slate-200 mx-1"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase pr-2">
                    {currentDatabase || 'No Database Selected'}
                </p>
            </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
