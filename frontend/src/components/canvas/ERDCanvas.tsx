'use client';

import { useEffect, useMemo, useCallback, useState } from 'react';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import TableNode from './TableNode';
import { generateSQL } from '@/lib/sqlGenerator';
import { 
  Zap,
  RefreshCw, 
  Layout, 
  MousePointer2, 
  StickyNote, 
  Table as TableIcon, 
  Link2, 
  Plus,
  Sparkles,
  BoxSelect,
  Code,
  Wand2,
  Search,
  X
} from 'lucide-react';

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
    setSelectedNode,
    dbContext,
    setDbContext
  } = useCanvasStore();

  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

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

  // Sync tables to nodes ONLY IF database changed or canvas is empty
  useEffect(() => {
    // Jika tidak ada DB yang dipilih, bersihkan canvas
    if (!currentDatabase) {
      setNodes([]);
      setEdges([]);
      setDbContext(null);
      return;
    }

    // Jika DB berubah, kita HARUS sync ulang (overwrite draft lama dari DB berbeda)
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
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 15, height: 15 },
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
    
    setNodes(nodes.map((node, index) => ({
      ...node,
      position: { 
        x: (index % COLUMNS) * SPACING_X, 
        y: Math.floor(index / COLUMNS) * SPACING_Y 
      },
    })));
  }, [nodes, setNodes]);

  const addNote = () => {
    const newNode: Node = {
      id: `note_${Date.now()}`,
      type: 'default',
      position: { x: 200, y: 200 },
      data: { label: 'New Note - Drag ddan edit me' },
      style: { backgroundColor: '#fef9c3', border: '1px solid #facc15', borderRadius: '8px', padding: '10px', fontSize: '10px' }
    };
    setNodes([...nodes, newNode]);
  };

  const addGroup = () => {
    const newNode: Node = {
      id: `group_${Date.now()}`,
      position: { x: 50, y: 50 },
      data: { label: 'New Group' },
      style: { backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '2px dashed #3b82f6', width: 400, height: 400, borderRadius: '16px' }
    };
    setNodes([...nodes, newNode]);
  };

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
        <Panel position="top-left" className="ml-2 mt-4 flex flex-col gap-3">
            {/* Main Tools Group */}
            <div className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-2xl flex flex-col gap-1.5">
                <button 
                    onClick={addTable}
                    className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 group relative"
                    title="Add New Table"
                >
                    <TableIcon className="w-5 h-5" />
                    <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[1001]">
                        ADD TABLE (T)
                    </span>
                </button>
                
                <button 
                  onClick={addNote}
                  className="p-3 bg-white text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-all group relative" 
                  title="Add Note"
                >
                    <StickyNote className="w-5 h-5" />
                    <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[1001]">
                        ADD NOTE (N)
                    </span>
                </button>

                <button 
                  onClick={addGroup}
                  className="p-3 bg-white text-slate-400 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-all group relative" 
                  title="Draw Group Frame"
                >
                    <BoxSelect className="w-5 h-5" />
                    <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[1001]">
                        ADD GROUP (G)
                    </span>
                </button>

                <div className="h-px bg-slate-100 mx-2 my-1" />

                <button className="p-3 bg-slate-50 text-blue-600 rounded-xl transition-all group relative" title="Select Mode">
                    <MousePointer2 className="w-5 h-5 fill-blue-600/10" />
                </button>
            </div>

            {/* AI & Automation Group */}
            <div className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-2xl flex flex-col gap-1.5 animate-in slide-in-from-left duration-500 delay-150">
                <button className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all group relative overflow-hidden" title="AI Architect">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                    <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[1001]">
                        AI ARCHITECT (A)
                    </span>
                </button>

                <button 
                  onClick={() => resetLayout()}
                  className="p-3 bg-white text-slate-500 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all group relative" 
                  title="Auto Layout"
                >
                    <Wand2 className="w-5 h-5" />
                    <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[1001]">
                        AUTO LAYOUT (L)
                    </span>
                </button>
            </div>

            {/* Action Group */}
            <div className="bg-white border border-slate-200 p-1.5 rounded-2xl shadow-2xl flex flex-col gap-1.5 animate-in slide-in-from-left duration-500 delay-300">
                <button 
                  onClick={() => setIsSqlModalOpen(true)}
                  className="p-3 bg-white text-slate-500 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all group relative" 
                  title="Preview SQL"
                >
                    <Code className="w-5 h-5" />
                    <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[1001]">
                         PREVIEW SQL (S)
                    </span>
                </button>

                <div className="h-px bg-slate-100 mx-2" />

                <button 
                  onClick={async () => {
                    const sql = generateSQL(nodes, edges);
                    const id = toast.loading('Pushing changes to database...');
                    
                    // Simple Validation: Cek apakah ada nama tabel duplikat atau kolom duplikat di Canvas
                    const tableNames = nodes.map(n => (n.data as any).name.toLowerCase());
                    const hasDuplicateTables = new Set(tableNames).size !== tableNames.length;

                    if (hasDuplicateTables) {
                      toast.error('Push failed: Duplicate table names detected!', { id });
                      return;
                    }

                    const res = await useSchemaStore.getState().executeQuery(sql);
                    
                    if (res.success) {
                      toast.success('Database updated successfully!', { id });
                      // Ambil schema terbaru biar seger
                      if (currentDatabase) {
                        useSchemaStore.getState().fetchTables(currentDatabase);
                      }
                    } else {
                      toast.error(`Push failed: ${res.error}`, { id });
                    }
                  }}
                  className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all hover:scale-110 active:scale-95 group relative" 
                  title="Push to Database"
                >
                    <Zap className="w-5 h-5 fill-emerald-400 group-hover:animate-pulse" />
                    <span className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[1001]">
                         PUSH TO DB (P)
                    </span>
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
                    onClick={() => {
                        // Paksa sync ulang dari DB
                        useSchemaStore.getState().fetchTables(currentDatabase!);
                        setDbContext(null); // Trigger useEffect sync
                        toast.success('Syncing schema from database...');
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 active:scale-95 transition-all"
                    title="Refresh Schema from DB"
                >
                    <RefreshCw className={cn("w-3.5 h-3.5", isTablesLoading && "animate-spin")} />
                </button>
                <div className="h-4 w-px bg-slate-200 mx-1"></div>
                <button 
                    onClick={resetLayout}
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

      {/* SQL PREVIEW MODAL */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-100 text-white">
                    <Code className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">SQL Preview (MySQL)</h3>
                </div>
                <button 
                  onClick={() => setIsSqlModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-all text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-0 bg-slate-900 font-mono text-sm leading-relaxed p-6 text-emerald-400">
                <pre className="whitespace-pre-wrap selection:bg-emerald-400/20">
                  {generateSQL(nodes, edges)}
                </pre>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                 <button 
                   onClick={() => setIsSqlModalOpen(false)}
                   className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all uppercase tracking-widest"
                 >
                   Close
                 </button>
                 <button 
                   onClick={() => {
                     navigator.clipboard.writeText(generateSQL(nodes, edges));
                     // Could add a toast notification here
                   }}
                   className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-100 transition-all active:scale-95"
                 >
                   COPY TO CLIPBOARD
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
