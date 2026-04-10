'use client';

import { create } from 'zustand';
import { 
  Connection, 
  Edge, 
  EdgeChange, 
  Node, 
  NodeChange, 
  addEdge, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect, 
  applyNodeChanges, 
  applyEdgeChanges,
  MarkerType
} from '@xyflow/react';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

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
    immer(
      (set, get) => ({
        nodes: [],
        edges: [],
        selectedNode: null,
        dbContext: null,

        onNodesChange: (changes: NodeChange[]) => {
          set((state) => {
            state.nodes = applyNodeChanges(changes, state.nodes);
          });
        },

        onEdgesChange: (changes: EdgeChange[]) => {
          set((state) => {
            state.edges = applyEdgeChanges(changes, state.edges);
          });
        },

        onConnect: (params: Connection) => {
          const { source, target, sourceHandle, targetHandle } = params;
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
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 15, height: 15 },
            data: {
              sourceColumn: sourceCol,
              targetColumn: targetCol,
              relationshipType: 'one-to-many'
            }
          };

          set((state) => {
            state.edges = addEdge(newEdge, state.edges);
          });
        },

        setNodes: (nodes) => set((state) => { state.nodes = nodes }),
        setEdges: (edges) => set((state) => { state.edges = edges }),
        setSelectedNode: (node: Node | null) => set((state) => { state.selectedNode = node }),
        setDbContext: (db) => set((state) => { state.dbContext = db }),

        updateNodeData: (nodeId, data) => {
          set((state) => {
            const node = state.nodes.find((n) => n.id === nodeId);
            if (node) {
              node.data = { ...node.data, ...data };
            }
          });
        },

        clearDraft: () => set((state) => {
          state.nodes = [];
          state.edges = [];
          state.selectedNode = null;
          state.dbContext = null;
        }),
      })
    ),
    {
      name: 'drawdb-canvas-storage',
    }
  )
);
