'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  NodeChange,
  EdgeChange
} from '@xyflow/react';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  dbContext: string | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node | null) => void;
  setDbContext: (db: string | null) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  clearDraft: () => void;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNode: null,
      dbContext: null,

      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (params: Connection) => {
        const { source, target, sourceHandle, targetHandle } = params;
        
        // Ekstrak nama kolom dari handle ID (format: table-column-side)
        const sourceCol = sourceHandle?.split('-')[1] || '';
        const targetCol = targetHandle?.split('-')[1] || '';

        const newEdge: Edge = {
          id: `e-${source}-${target}-${Date.now()}`,
          source: source!,
          target: target!,
          sourceHandle,
          targetHandle,
          type: 'smoothstep',
          label: `${sourceCol} → ${targetCol}`,
          labelStyle: { fill: '#64748b', fontWeight: 700, fontSize: 10 },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, rx: 4 },
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          data: {
            sourceColumn: sourceCol,
            targetColumn: targetCol,
            relationshipType: 'one-to-many' // Default
          }
        };

        set({
          edges: addEdge(newEdge, get().edges),
        });
      },

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      setSelectedNode: (node: Node | null) => set({ selectedNode: node }),
      setDbContext: (db) => set({ dbContext: db }),

      updateNodeData: (nodeId, data) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === nodeId) {
              return { ...node, data: { ...node.data, ...data } };
            }
            return node;
          }),
        });
      },

      clearDraft: () => set({ nodes: [], edges: [], selectedNode: null, dbContext: null }),
    }),
    {
      name: 'drawdb-canvas-storage',
    }
  )
);
