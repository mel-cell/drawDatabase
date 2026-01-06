import { ref, watch, onMounted } from "vue";
import { useVueFlow, type Connection } from "@vue-flow/core";
import { useSchema, type TableSchema, type RelationSchema } from "./useSchema";

// GLOBAL STATE (Singleton)
const nodes = ref<any[]>([]);
const edges = ref<any[]>([]);

export function useDiagram() {
  const { onConnect, addEdges } = useVueFlow(); // VueFlow adds logic
  const { tables, relations, fetchSchema } = useSchema();

  // Helper to remove node globally
  const removeNode = (id: string) => {
    const idx = nodes.value.findIndex((n) => n.id === id);
    if (idx > -1) {
      nodes.value.splice(idx, 1);
    }
  };

  // Helper to format type
  const formatType = (col: any) => {
    let t = col.type.toUpperCase();
    if (col.is_pk) t += " PK";
    else if (col.is_fk) t += " FK";
    return t;
  };

  const syncDiagram = () => {
    // Transform Tables to Nodes (Layout logic remains)
    let x = 100;
    let y = 100;
    const GAP_X = 350;
    const GAP_Y = 300;
    const COLS_PER_ROW = 3;

    // Only sync if nodes are empty (initial load) to avoid overwriting drags
    // Or if forced (future feature)
    if (nodes.value.length === 0 && tables.value.length > 0) {
      nodes.value = tables.value.map((table: TableSchema, index: number) => {
        const col = index % COLS_PER_ROW;
        const row = Math.floor(index / COLS_PER_ROW);

        return {
          id: table.name,
          type: "table",
          position: { x: x + col * GAP_X, y: y + row * GAP_Y },
          data: {
            label: table.name,
            columns: table.columns.map((c) => ({
              name: c.name,
              type: formatType(c),
              is_pk: c.is_pk,
              is_fk: c.is_fk,
            })),
          },
        };
      });
    }

    // Transform Relations to Edges
    if (edges.value.length === 0 && relations.value.length > 0) {
      edges.value = relations.value.map(
        (rel: RelationSchema, index: number) => ({
          id: `e-${index}`,
          source: rel.source_table,
          target: rel.target_table,
          sourceHandle: `source-${rel.source_column}`,
          targetHandle: `target-${rel.target_column}`,
          label: "FK",
          animated: true,
          style: { stroke: "#2563eb", strokeWidth: 2 },
          type: "smoothstep",
        })
      );
    }
  };

  // Initial Fetch
  onMounted(async () => {
    await fetchSchema();
  });

  // Watch for schema changes to update diagram
  watch(
    [tables, relations],
    () => {
      syncDiagram();
    },
    { deep: true }
  );

  // Setup Event Handlers
  onConnect((params: Connection) => {
    addEdges([params]);
  });

  return {
    nodes,
    edges,
    removeNode,
  };
}
