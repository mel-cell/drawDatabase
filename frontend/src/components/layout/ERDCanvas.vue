<script setup lang="ts">
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import TableNode from "../TableNode.vue";
import FloatingToolbar from "./FloatingToolbar.vue";
import { useDiagram } from "../../composables/useDiagram";

const emit = defineEmits(["tool-action", "node-select"]);

// Init Diagram Logic
const { nodes, edges } = useDiagram();
const { onNodeClick, onPaneClick } = useVueFlow();

onNodeClick((event) => {
  // When a node is clicked, tell the parent (App.vue) to show details in Right Sidebar
  emit("node-select", event.node);
});

onPaneClick(() => {
  // Clear selection when clicking empty space
  emit("node-select", null);
});

const handleToolAction = (action: string) => {
  if (action === "add-table") {
    const id = `new_table_${Date.now()}`;
    nodes.value.push({
      id,
      type: "table",
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        name: "New Table",
        columns: [{ name: "id", type: "INT", is_pk: true, is_nn: true }],
      },
    });
  }
};
</script>

<template>
  <div class="h-full w-full bg-gray-50 relative">
    <FloatingToolbar @tool-action="handleToolAction" />

    <VueFlow v-model:nodes="nodes" v-model:edges="edges">
      <template #node-table="props">
        <TableNode
          :id="props.id"
          :data="props.data"
          :selected="props.selected"
        />
      </template>

      <Background pattern-color="#94a3b8" :gap="20" />
      <!-- Controls removed as per previous request/redundancy -->
    </VueFlow>
  </div>
</template>

<style>
/* Override default edge styles globally or scoped if preferred */
.vue-flow__edge-path {
  stroke: #94a3b8;
  stroke-width: 2;
}
</style>
