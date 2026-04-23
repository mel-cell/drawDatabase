'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  NodeChange,
  EdgeChange,
  Panel,
  MarkerType,
  MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useSchemaStore } from '@/store/useSchemaStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import TableNode from './TableNode';
import { generateSQL } from '@/lib/sqlGenerator';
import { 
  RefreshCw, 
  Layout, 
  Plus,
  Zap,
  Code,
  Copy,
  Download,
  X
} from 'lucide-react';

const nodeTypes = {
  table: TableNode,
};

export default function ERDCanvas() {
  const { currentDatabase, tables, relations, isTablesLoading } = useSchemaStore();
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    setNodes, 
    setEdges,
    setSelectedNode,
    dbContext,
    setDbContext
  } = useCanvasStore();

  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  // Sync tables to nodes ONLY IF database changed or canvas is empty
  useEffect(() => {
    if (!currentDatabase) {
      setNodes([]);
      setEdges([]);
      setDbContext(null);
      return;
    }

    if (currentDatabase !== dbContext || nodes.length === 0) {
      if (!tables.length && !isTablesLoading) {
        setNodes([]);
        setEdges([]);
        setDbContext(currentDatabase);
        return;
      }

      if (tables.length > 0) {
        const COLUMNS = 4;
        const SPACING_X = 350;
        const SPACING_Y = 450;

        const initialNodes: Node[] = tables.map((table, index) => ({
          id: table.name,
          type: 'table',
          position: { 
            x: (index % COLUMNS) * SPACING_X, 
            y: Math.floor(index / COLUMNS) * SPACING_Y 
          },
          data: { name: table.name, columns: table.columns },
        }));

        const initialEdges: Edge[] = relations.map((rel, index) => ({
          id: `e-${rel.source_table}-${rel.target_table}-${index}`,
          type: 'smoothstep',
          source: rel.source_table,
          target: rel.target_table,
          sourceHandle: `${rel.source_table}-${rel.source_column}-right`,
          targetHandle: `${rel.target_table}-${rel.target_column}-left`,
          label: `${rel.source_column} → ${rel.target_column}`,
          labelStyle: { fill: '#64748b', fontWeight: 700, fontSize: 10 },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, rx: 4 },
          style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8', width: 15, height: 15 },
          data: { sourceColumn: rel.source_column, targetColumn: rel.target_column }
        }));

        setNodes(initialNodes);
        setEdges(initialEdges);
        setDbContext(currentDatabase);
      }
    }
  }, [tables, relations, currentDatabase, dbContext, setNodes, setEdges, setDbContext, isTablesLoading]);

  const resetLayout = useCallback(() => {
    const COLUMNS = 4;
    const SPACING_X = 350;
    const SPACING_Y = 450;
    const updatedNodes = nodes.map((node, index) => ({
      ...node,
      position: { 
        x: (index % COLUMNS) * SPACING_X, 
        y: Math.floor(index / COLUMNS) * SPACING_Y 
      },
    }));
    setNodes(updatedNodes);
  }, [nodes, setNodes]);

  const addTable = () => {
    const newNode: Node = {
      id: `table_${Date.now()}`,
      type: 'table',
      position: { x: 100, y: 100 },
      data: { name: 'new_table', columns: [{ name: 'id', type: 'INT', is_pk: true }] },
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
  };

  const generatedSQL = useMemo(() => generateSQL(nodes, edges), [nodes, edges]);

  return (
    <div className="flex-1 h-full relative bg-slate-50/30">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-dot-pattern"
      >
        <Background color="#e2e8f0" gap={20} />
        
        {/* Toolbar Kiri - Vibrant & High Quality */}
        <Panel position="top-left" className="ml-6">
            <div className="bg-white border border-slate-200/60 p-2 rounded-2xl shadow-2xl shadow-slate-900/10 flex flex-col gap-2">
                <button 
                  onClick={addTable}
                  className="p-3 text-slate-500 hover:bg-blue-50 hover:text-[#1A73E8] rounded-xl transition-all active:scale-95 group relative" 
                  title="Add Table"
                >
                    <Plus className="w-5 h-5" />
                </button>
                
                <div className="h-px bg-slate-100 mx-2" />

                <button 
                  onClick={() => setIsSqlModalOpen(true)}
                  className="p-3 text-slate-500 hover:bg-blue-50 hover:text-[#1A73E8] rounded-xl transition-all active:scale-95 group relative" 
                  title="View SQL"
                >
                    <Code className="w-5 h-5" />
                </button>

                <div className="h-px bg-slate-100 mx-2" />

                <button 
                  onClick={async () => {
                    const id = toast.loading('Synchronizing with Database...');
                    const tableNames = nodes.map(n => (n.data as any).name.toLowerCase());
                    if (new Set(tableNames).size !== tableNames.length) {
                      toast.error('Validation Error: Duplicate table names!', { id });
                      return;
                    }

                    const res = await useSchemaStore.getState().executeQuery(generatedSQL);
                    if (res.success) {
                      toast.success('Sync Successful!', { id });
                      if (currentDatabase) useSchemaStore.getState().fetchTables(currentDatabase);
                    } else {
                      toast.error(`Sync Failed: ${res.error}`, { id });
                    }
                  }}
                  className="p-3 bg-[#1A73E8] text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-90 group relative" 
                  title="Push to Database"
                >
                    <Zap className="w-5 h-5 fill-white/20" />
                </button>
            </div>
        </Panel>

        {/* Panel Atas - Polished Context */}
        <Panel position="top-right" className="mr-6">
            <div className="bg-white border border-slate-200/60 p-1.5 rounded-xl shadow-xl shadow-slate-900/5 flex items-center gap-1.5">
                <button 
                    onClick={() => {
                        if (currentDatabase) useSchemaStore.getState().fetchTables(currentDatabase);
                        setDbContext(null);
                        toast.success('Schema Refreshed');
                    }}
                    className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-all"
                    title="Refresh Schema"
                >
                    <RefreshCw className={cn("w-4 h-4", isTablesLoading && "animate-spin")} />
                </button>
                <div className="w-px h-4 bg-slate-100 mx-1" />
                <button 
                    onClick={resetLayout}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                    <Layout className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">Reset Layout</span>
                </button>
            </div>
        </Panel>

        <Controls showInteractive={false} className="!bg-white !border-slate-200 !shadow-sm !rounded-md overflow-hidden" />
        <MiniMap 
            className="!bg-white !border-slate-200 !shadow-sm !rounded-md overflow-hidden" 
            nodeColor="#cbd5e1"
            maskColor="rgba(241, 245, 249, 0.3)"
        />
      </ReactFlow>

      {/* SQL Modal Minimalis */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-[2px]">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-100 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-50">
               <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">SQL Preview</h3>
               <button onClick={() => setIsSqlModalOpen(false)} className="p-1 hover:bg-slate-50 rounded text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-50/50">
               <pre className="text-[11px] font-mono text-slate-600 leading-relaxed">{generatedSQL}</pre>
            </div>
            <div className="p-3 border-t border-slate-50 flex justify-end gap-2">
               <button onClick={() => { navigator.clipboard.writeText(generatedSQL); toast.success('Copied!'); }} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded-md text-[10px] font-bold hover:bg-slate-900 transition-all"><Copy className="w-3 h-3" /> COPY</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
