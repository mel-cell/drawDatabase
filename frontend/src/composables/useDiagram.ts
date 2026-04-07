import { ref } from "vue";
import { useVueFlow, type Connection, type Edge, type Node } from "@vue-flow/core";
import { useSchema } from "./useSchema";

// GLOBAL STATE (Singleton)
const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);

export function useDiagram() {
  const { onConnect } = useVueFlow();
  const { tables, relations, syncBatch } = useSchema();

  // Helper to remove node globally
  const removeNode = (id: string) => {
    nodes.value = nodes.value.filter((n: any) => n.id !== id);
    // Also remove connected edges
    edges.value = edges.value.filter((e: any) => e.source !== id && e.target !== id);
  };

  const syncDiagram = async (forceReset = false) => {
    if (forceReset) {
      nodes.value = [];
      edges.value = [];
    }

    if (nodes.value.length === 0 && tables.value.length > 0) {
      // Fetch Layout (Optional)
      let savedLayouts: any = {};
      try {
        const res = await fetch("http://localhost:3000/api/layout");
        if (res.ok) savedLayouts = await res.json();
      } catch (e) {
        console.warn("Layout server not available");
      }

      nodes.value = tables.value.map((table, index) => {
        const posX = savedLayouts[table.name]?.x ?? (100 + (index % 3) * 350);
        const posY = savedLayouts[table.name]?.y ?? (100 + Math.floor(index / 3) * 300);

        return {
          id: table.name,
          type: "table",
          position: { x: posX, y: posY },
          data: {
            name: table.name,
            headerColor: "#ffffff", // Default
            columns: table.columns.map(c => ({
              name: c.name,
              type: c.type,
              is_pk: c.is_pk,
              is_nn: true,
              is_fk: c.is_fk,
            })),
          },
        };
      });
    }

    if (edges.value.length === 0 && relations.value.length > 0) {
      edges.value = relations.value.map((rel, index) => ({
        id: `e-${index}-${Date.now()}`,
        source: rel.source_table,
        target: rel.target_table,
        sourceHandle: `source-${rel.source_column}`,
        targetHandle: `target-${rel.target_column}`,
        label: "FK",
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2 },
        type: "smoothstep",
      }));
    }
  };

  // Setup Connection Handler
  onConnect((params: Connection) => {
    const newEdge = {
        ...params,
        id: `e-${Date.now()}`,
        animated: true,
        label: "FK",
        style: { stroke: "#3b82f6", strokeWidth: 2 },
        type: "smoothstep",
    };
    edges.value.push(newEdge as Edge);
  });

  const saveAll = async () => {
    const tableRequests = nodes.value
      .filter(n => n.type === "table")
      .map(n => {
        const d = n.data;
        // Find edges where this table is the source (has FK pointing out)
        const fks = edges.value
          .filter(e => e.source === n.id)
          .map(e => ({
            column_name: e.sourceHandle?.replace("source-", "") || "",
            ref_table_name: e.target,
            ref_column_name: e.targetHandle?.replace("target-", "") || "id",
          }))
          .filter(f => f.column_name);

        return {
          name: d.name,
          columns: d.columns.map((c: any) => ({
            name: c.name,
            type: c.type,
            is_pk: c.is_pk,
            is_nn: c.is_nn ?? true,
            is_ai: c.is_ai ?? false,
          })),
          foreign_keys: fks,
        };
      });

    const success = await syncBatch(tableRequests);
    if (success) {
      // Save Layout Positions
      const positions: Record<string, {x: number, y: number}> = {};
      nodes.value.forEach(n => {
          positions[n.id] = { x: Math.round(n.position.x), y: Math.round(n.position.y) };
      });
      
      await fetch("http://localhost:3000/api/layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(positions)
      });
      
      alert("Changes synced to database successfully!");
    }
  };

  return {
    nodes,
    edges,
    removeNode,
    saveAll,
    syncDiagram
  };
}
