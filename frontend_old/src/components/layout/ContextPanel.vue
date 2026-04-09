<script setup lang="ts">
import { ref, watch } from "vue";
import { useDiagram } from "../../composables/useDiagram";
import { useToast } from "../../composables/useToast";
import {
  X,
  Database,
  Table as TableIcon,
  ChevronRight,
  Info,
  Layers,
  Trash2,
} from "lucide-vue-next";

// Modular Editors
import TableEditor from "../editors/TableEditor.vue";
import NoteEditor from "../editors/NoteEditor.vue";
import DatabaseEditor from "../editors/DatabaseEditor.vue";

const props = defineProps<{
  type: "database" | "table" | "table-edit" | "note-edit" | "group-edit" | "none";
  data?: any;
  trigger?: number;
  activeDatabase?: string;
}>();

const { removeNode, nodes } = useDiagram();
const toast = useToast();
const isExpanded = ref(true);
const activeTab = ref<string>("info");

const syncFromProps = () => {
  if (props.data) {
    activeTab.value = "info";
    isExpanded.value = true;
  } else if (props.type === "database") {
    activeTab.value = "database";
    isExpanded.value = true;
  }
};

watch(() => props.trigger, syncFromProps);
watch(() => props.data?.id, syncFromProps);

const handleUpdate = (updatedData: any) => {
  if (props.data) {
    if (props.type === "table-edit" || props.type === "table") {
      Object.assign(props.data.data, updatedData);
    } else if (props.type === "note-edit") {
      Object.assign(props.data.data, updatedData.data);
      if (props.data.style) Object.assign(props.data.style, updatedData.style);
    }
  }
};

const handleDelete = () => {
  const id = props.data?.id;
  if (id) {
    removeNode(id);
    toast.warning("Element Removed");
    isExpanded.value = false;
  }
};
</script>

<template>
  <div class="flex h-full bg-white overflow-hidden">
    <!-- Small Tab Bar -->
    <div class="w-12 bg-gray-50 border-r border-gray-100 flex flex-col items-center py-4 gap-3 shrink-0">
      <button
        @click="activeTab = 'database'; isExpanded = true"
        class="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
        :class="activeTab === 'database' && isExpanded ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-200'"
      >
        <Database class="w-4 h-4" />
      </button>

      <button
        @click="activeTab = 'info'; isExpanded = true"
        class="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
        :class="activeTab === 'info' && isExpanded ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-200'"
        :disabled="type === 'none'"
      >
        <Layers class="w-4 h-4" :class="{ 'opacity-30': type === 'none' }" />
      </button>

      <div class="flex-1"></div>

      <button @click="isExpanded = !isExpanded" class="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200">
        <ChevronRight class="w-4 h-4 transition-transform duration-300" :class="{ 'rotate-180': !isExpanded }" />
      </button>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <header class="h-12 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide truncate">
          {{ activeTab === 'database' ? 'Database' : 'Properties' }}
        </h3>
        <div class="flex items-center gap-1">
          <button v-if="data" @click="handleDelete" class="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
            <Trash2 class="w-3.5 h-3.5" />
          </button>
          <button @click="isExpanded = false" class="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <!-- Editor Content -->
      <div class="flex-1 overflow-y-auto p-5 scrollbar-thin">
        <TableEditor
          v-if="activeTab === 'info' && (type === 'table' || type === 'table-edit')"
          :data="data"
          :nodes="nodes"
          @update="handleUpdate"
        />

        <NoteEditor
          v-if="activeTab === 'info' && type === 'note-edit'"
          :data="data"
          @update="handleUpdate"
          @delete="handleDelete"
        />

        <DatabaseEditor
          v-if="activeTab === 'database' || (activeTab === 'info' && type === 'database')"
          :db-name="activeDatabase || 'No Database'"
          @delete="handleDelete"
        />

        <!-- Empty State -->
        <div v-if="type === 'none' && activeTab === 'info'" class="h-full flex flex-col items-center justify-center text-gray-300 space-y-3">
          <Info class="w-10 h-10 opacity-30" />
          <p class="text-xs font-semibold uppercase tracking-wider">Select an element</p>
        </div>
      </div>
    </div>
  </div>
</template>
