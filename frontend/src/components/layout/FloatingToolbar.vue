<script setup lang="ts">
import { ref } from "vue";
import {
  MousePointer2,
  Table as TableIcon,
  FileText,
  LayoutGrid,
  Save,
  Trash2,
  Code,
} from "lucide-vue-next";

const props = defineProps<{
  activeDatabase?: string;
}>();

const emit = defineEmits([
  "add-table",
  "add-note",
  "add-group",
  "sync",
  "reset",
  "open-settings",
  "toggle-sql",
]);

const activeTool = ref("pointer");

const tools = [
  { id: "pointer", icon: MousePointer2, label: "Select Object", shortcut: "V" },
  {
    id: "table",
    icon: TableIcon,
    label: "New Table",
    shortcut: "T",
    action: () => emit("add-table"),
  },
  {
    id: "note",
    icon: FileText,
    label: "Add Note",
    shortcut: "N",
    action: () => emit("add-note"),
  },
  {
    id: "group",
    icon: LayoutGrid,
    label: "Create Group",
    shortcut: "G",
    action: () => emit("add-group"),
  },
];

const handleToolClick = (tool: any) => {
  activeTool.value = tool.id;
  if (tool.action) tool.action();
};
</script>

<template>
  <div class="flex flex-col gap-4 pointer-events-auto">
    <!-- Main Toolbar -->
    <div
      class="flex flex-col bg-white/90 backdrop-blur-md border border-gray-200 p-1.5 rounded-2xl shadow-xl space-y-1"
    >
      <div v-for="tool in tools" :key="tool.id" class="relative group">
        <button
          @click="handleToolClick(tool)"
          class="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 relative"
          :class="
            activeTool === tool.id
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-gray-500 hover:bg-gray-100'
          "
        >
          <component :is="tool.icon" class="w-5 h-5" />

          <!-- Tooltip -->
          <div
            class="absolute left-14 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-xl"
          >
            {{ tool.label }}
            <span v-if="tool.shortcut" class="ml-2 text-gray-400 font-mono">{{
              tool.shortcut
            }}</span>
            <div
              class="absolute left-[-4px] top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900"
            ></div>
          </div>
        </button>
      </div>

      <div class="h-px bg-gray-100 mx-2 my-1"></div>

      <!-- Action Buttons -->
      <div class="relative group">
        <button
          @click="emit('sync')"
          class="w-10 h-10 flex items-center justify-center rounded-xl text-emerald-600 hover:bg-emerald-100 transition-all"
        >
          <Save class="w-5 h-5" />
          <div
            class="absolute left-14 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-xl"
          >
            Sync to Database
            <div
              class="absolute left-[-4px] top-1/2 -translate-y-1/2 border-8 border-transparent border-r-emerald-600"
            ></div>
          </div>
        </button>
      </div>

      <div class="relative group">
        <button
          @click="emit('toggle-sql')"
          class="w-10 h-10 flex items-center justify-center rounded-xl text-amber-600 hover:bg-amber-100 transition-all"
        >
          <Code class="w-5 h-5" />
          <div
            class="absolute left-14 px-3 py-1.5 bg-amber-600 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-50 shadow-xl"
          >
            View SQL Preview
            <div
              class="absolute left-[-4px] top-1/2 -translate-y-1/2 border-8 border-transparent border-r-amber-600"
            ></div>
          </div>
        </button>
      </div>
    </div>

    <!-- Secondary Toolbar -->
    <div
      class="flex flex-col bg-white/90 backdrop-blur-md border border-gray-200 p-1.5 rounded-2xl shadow-lg"
    >
      <button
        @click="emit('reset')"
        class="w-10 h-10 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-100 transition-all group relative"
      >
        <Trash2 class="w-5 h-5" />
        <div
          class="absolute left-14 px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-xl"
        >
          Clear Canvas
          <div
            class="absolute left-[-4px] top-1/2 -translate-y-1/2 border-8 border-transparent border-r-red-600"
          ></div>
        </div>
      </button>
    </div>
  </div>
</template>
