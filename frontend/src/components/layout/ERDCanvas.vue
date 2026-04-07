<script setup lang="ts">
import { ref } from "vue";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { useDiagram } from "../../composables/useDiagram";

// Components
import TableNode from "../TableNode.vue";
import NoteNode from "../nodes/NoteNode.vue";
import FloatingToolbar from "./FloatingToolbar.vue";
import ContextPanel from "./ContextPanel.vue";
import ContextMenu from "../ui/ContextMenu.vue";

const props = defineProps<{
  activeDatabase?: string;
}>();

const emit = defineEmits(["node-select"]);

// --- CORE LOGIC ---
const { nodes, edges, removeNode, saveAll } = useDiagram();
const {
  onNodeClick,
  onPaneClick,
  onNodeContextMenu,
} = useVueFlow();

// --- STATE ---
const currentTool = ref("pointer");
const selectedNode = ref<any>(null);
const panelTrigger = ref(0);
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  targetId: null as string | null,
});

// --- NODE ACTIONS ---
const addTable = () => {
  const id = `table_${Date.now()}`;
  nodes.value.push({
    id,
    type: "table",
    position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
    data: {
      name: "new_table",
      headerColor: "#ffffff",
      columns: [{ name: "id", type: "INT", is_pk: true, is_nn: true }],
    },
  });
};

const addNote = () => {
  const id = `note_${Date.now()}`;
  nodes.value.push({
    id,
    type: "note",
    position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
    data: {
      label: "Write something...",
      style: { fontSize: 14, color: "#000000", fontWeight: "normal" },
    },
    style: { backgroundColor: "#fef3c7", width: "180px", height: "120px" },
  });
};

const addGroup = () => {
  const id = `group_${Date.now()}`;
  nodes.value.push({
    id,
    type: "group",
    position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
    data: { label: "Project Module" },
    style: {
      width: "400px",
      height: "300px",
      backgroundColor: "rgba(240, 244, 248, 0.5)",
      border: "2px dashed #cbd5e1",
      borderRadius: "8px",
    },
  });
};

const handleToolAction = (action: string) => {
  switch (action) {
    case "add-table":
      addTable();
      break;
    case "add-note":
      addNote();
      break;
    case "add-group":
      addGroup();
      break;
    case "sync":
      saveAll();
      break;
    case "reset":
      if (confirm("Clear canvas?")) {
        nodes.value = [];
        edges.value = [];
      }
      break;
    case "pointer":
    case "hand":
      currentTool.value = action;
      break;
  }
};

// --- EVENTS ---
onNodeClick((e) => {
  selectedNode.value = e.node;
  panelTrigger.value++;
  emit("node-select", e.node);
});

onPaneClick(() => {
  selectedNode.value = null;
  emit("node-select", null);
});

onNodeContextMenu((e) => {
  e.event.preventDefault();
  const ev = e.event as MouseEvent;
  contextMenu.value = {
    visible: true,
    x: ev.clientX,
    y: ev.clientY,
    targetId: e.node.id,
  };
});

const handleDeleteNode = () => {
  if (contextMenu.value.targetId) {
    removeNode(contextMenu.value.targetId);
    selectedNode.value = null;
  }
  contextMenu.value.visible = false;
};
</script>

<template>
  <div
    class="h-full w-full bg-[#f8fafc] relative overflow-hidden flex"
    @contextmenu.prevent
  >
    <!-- Canvas Area -->
    <div class="flex-1 relative">
      <!-- Floating Toolbar -->
      <div class="absolute top-6 left-6 z-20">
        <FloatingToolbar
          :active-database="activeDatabase"
          @add-table="addTable"
          @add-note="addNote"
          @add-group="addGroup"
          @sync="saveAll"
          @reset="handleToolAction('reset')"
        />
      </div>

      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :delete-key-code="'Backspace'"
        :pan-on-drag="currentTool === 'hand'"
        :selection-on-drag="currentTool === 'pointer'"
        :nodes-draggable="currentTool === 'pointer'"
        :nodes-connectable="true"
        fit-view-on-init
        class="erd-canvas"
      >
        <!-- Node Types Registry -->
        <template #node-table="nodeProps">
          <TableNode
            :id="nodeProps.id"
            :data="nodeProps.data"
            :selected="nodeProps.selected"
          />
        </template>

        <template #node-note="nodeProps">
          <NoteNode
            :id="nodeProps.id"
            :data="nodeProps.data"
            :selected="nodeProps.selected"
          />
        </template>

        <!-- Plugins -->
        <Background pattern-color="#e2e8f0" :gap="20" />
      </VueFlow>
    </div>

    <!-- Right Properties Panel -->
    <ContextPanel
      :type="selectedNode ? (selectedNode.type + '-edit' as any) : 'none'"
      :data="selectedNode"
      :trigger="panelTrigger"
      :active-database="activeDatabase"
      class="flex-shrink-0"
    />

    <!-- Context Menu -->
    <ContextMenu
      v-if="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :items="[{ label: 'Delete Item', action: 'delete', danger: true }]"
      @select="handleDeleteNode"
      @close="contextMenu.visible = false"
    />
  </div>
</template>

<style>
.erd-canvas .vue-flow__edge-path {
  stroke: #94a3b8;
  stroke-width: 2;
  transition: stroke 0.2s;
}

.erd-canvas .vue-flow__edge.selected .vue-flow__edge-path {
  stroke: #3b82f6;
  stroke-width: 3;
}

.vue-flow__handle {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border: 2px solid white;
}

.vue-flow__node.selected {
  outline: 2px solid #3b82f6;
  outline-offset: 4px;
  border-radius: 4px;
}
</style>
