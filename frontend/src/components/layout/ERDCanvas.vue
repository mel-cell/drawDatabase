<script setup lang="ts">
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import TableNode from "../TableNode.vue";
import NoteNode from "../nodes/NoteNode.vue";
import FloatingToolbar from "./FloatingToolbar.vue";
import ContextMenu from "../ui/ContextMenu.vue";
import { useDiagram } from "../../composables/useDiagram";
import { ref } from "vue";

const emit = defineEmits(["tool-action", "node-select"]);

// Init Diagram Logic
const { nodes, edges, removeNode } = useDiagram();
const { onNodeClick, onPaneClick, onNodeContextMenu } = useVueFlow();

// Tool State
const currentTool = ref<string>("pointer");

// Context Menu State
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  targetNodeId: null as string | null,
});

const menuItems = ref([{ label: "Delete", action: "delete", danger: true }]);

onNodeClick((event) => {
  if (currentTool.value === "hand") return; // Hand tool shouldn't select nodes? Or standard behavior
  emit("node-select", event.node);
  contextMenu.value.visible = false;
});

onPaneClick(() => {
  emit("node-select", null);
  contextMenu.value.visible = false;
});

onNodeContextMenu((event) => {
  event.event.preventDefault();
  const e = event.event as MouseEvent;
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    targetNodeId: event.node.id,
  };
});

const handleContextSelect = (action: string) => {
  if (action === "delete" && contextMenu.value.targetNodeId) {
    removeNode(contextMenu.value.targetNodeId);
    emit("node-select", null);
  }
  contextMenu.value.visible = false;
};

const handleToolAction = (action: string) => {
  contextMenu.value.visible = false;

  if (action === "pointer" || action === "hand") {
    currentTool.value = action;
    return;
  }

  const pos = { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 };

  if (action === "add-table") {
    nodes.value.push({
      id: `table_${Date.now()}`,
      type: "table",
      position: pos,
      data: {
        name: "new_table",
        columns: [{ name: "id", type: "INT", is_pk: true, is_nn: true }],
      },
    });
    currentTool.value = "pointer";
  } else if (action === "note") {
    nodes.value.push({
      id: `note_${Date.now()}`,
      type: "custom-note",
      position: pos,
      data: { label: "New Note", style: { fontSize: 14, color: "#000000" } },
      style: {
        backgroundColor: "#fef3c7",
        borderColor: "#f59e0b",
        borderWidth: "1px",
        width: "180px",
        height: "100px",
        resize: "both",
        overflow: "hidden",
        borderRadius: "2px",
        boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
      },
    });
    currentTool.value = "pointer";
  } else if (action === "text") {
    nodes.value.push({
      id: `text_${Date.now()}`,
      type: "custom-note",
      position: pos,
      data: {
        label: "Text Label",
        isText: true,
        style: { fontSize: 24, fontWeight: "bold" },
      },
      style: {
        backgroundColor: "transparent",
        width: "200px",
        height: "50px",
        resize: "both",
        overflow: "hidden",
        border: "1px dashed transparent", // Hidden unless selected usually
      },
      class: "hover:border-blue-300", // Tailwind class for hover effect
    });
    currentTool.value = "pointer";
  } else if (action === "group") {
    nodes.value.push({
      id: `group_${Date.now()}`,
      type: "default",
      position: pos,
      data: { label: "New Group" },
      style: {
        width: "300px",
        height: "200px",
        backgroundColor: "rgba(240, 244, 248, 0.5)",
        border: "2px dashed #cbd5e1",
        borderRadius: "8px",
        zIndex: -1,
        resize: "both",
        overflow: "hidden",
      },
    });
    currentTool.value = "pointer";
  }
};
</script>

<template>
  <div class="h-full w-full bg-gray-50 relative" @contextmenu.prevent>
    <FloatingToolbar @tool-action="handleToolAction" />

    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :delete-key-code="'Backspace'"
      :pan-on-drag="currentTool === 'hand'"
      :selection-on-drag="currentTool === 'pointer'"
      :nodes-draggable="currentTool === 'pointer'"
      :nodes-connectable="currentTool === 'pointer'"
      :elements-selectable="currentTool === 'pointer'"
      :class="{
        'cursor-grab': currentTool === 'hand',
        'cursor-default': currentTool === 'pointer',
      }"
    >
      <template #node-table="props">
        <TableNode
          :id="props.id"
          :data="props.data"
          :selected="props.selected"
        />
      </template>

      <template #node-custom-note="props">
        <NoteNode
          :id="props.id"
          :data="props.data"
          :selected="props.selected"
        />
      </template>

      <Background pattern-color="#94a3b8" :gap="20" />
    </VueFlow>

    <ContextMenu
      v-if="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :items="menuItems"
      @select="handleContextSelect"
      @close="contextMenu.visible = false"
    />
  </div>
</template>

<style>
.vue-flow__edge-path {
  stroke: #94a3b8;
  stroke-width: 2;
}
/* Force grab cursor overrides */
.cursor-grab .vue-flow__pane {
  cursor: grab !important;
}
.cursor-grab .vue-flow__node {
  pointer-events: none; /* Make nodes unclickable in hand mode */
}
</style>
