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
const {
  onNodeClick,
  onPaneClick,
  onNodeContextMenu,
  zoomIn,
  zoomOut,
  setNodes,
  setEdges,
  toObject,
} = useVueFlow();

// History State for Undo/Redo
const history = ref<any[]>([]);
const historyIndex = ref(-1);
const isUndoing = ref(false);

const recordHistory = () => {
  if (isUndoing.value) return;
  const state = toObject();
  // truncated future history if we were back in time
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1);
  }
  history.value.push(JSON.stringify(state));
  historyIndex.value++;
};

// Initial Record
setTimeout(() => recordHistory(), 500);

// TODO: Watch for standard changes to record history automatically, or just on actions.
// For now, record on explicit actions for simplicity.

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

onNodeClick((event: any) => {
  if (currentTool.value === "hand") return;
  emit("node-select", event.node);
  contextMenu.value.visible = false;
});

onPaneClick(() => {
  emit("node-select", null);
  contextMenu.value.visible = false;
});

onNodeContextMenu((event: any) => {
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
    recordHistory();
  }
  contextMenu.value.visible = false;
};

const undo = () => {
  if (historyIndex.value > 0) {
    isUndoing.value = true;
    historyIndex.value--;
    const state = JSON.parse(history.value[historyIndex.value]);
    setNodes(state.nodes);
    setEdges(state.edges);
    setTimeout(() => (isUndoing.value = false), 100);
  }
};

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    isUndoing.value = true;
    historyIndex.value++;
    const state = JSON.parse(history.value[historyIndex.value]);
    setNodes(state.nodes);
    setEdges(state.edges);
    setTimeout(() => (isUndoing.value = false), 100);
  }
};

const handleToolAction = (action: string) => {
  contextMenu.value.visible = false;

  if (action === "zoom-in") {
    zoomIn();
    return;
  }
  if (action === "zoom-out") {
    zoomOut();
    return;
  }
  if (action === "undo") {
    undo();
    return;
  }
  if (action === "redo") {
    redo();
    return;
  }

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
    recordHistory();
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
    recordHistory();
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
    recordHistory();
    currentTool.value = "pointer";
  } else if (action === "group") {
    nodes.value.push({
      id: `group_${Date.now()}`,
      type: "custom-group", // CHANGED from default
      position: pos,
      data: { label: "New Group", color: "rgba(240, 244, 248, 0.5)" },
      style: {
        width: "300px",
        height: "200px",
        backgroundColor: "rgba(240, 244, 248, 0.5)",
        border: "2px dashed #cbd5e1",
        borderRadius: "8px",
        zIndex: -10, // Make sure it is behind
      },
    });
    recordHistory();
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

      <template #node-custom-group="props">
        <GroupNode
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
