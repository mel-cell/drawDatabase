<script setup lang="ts">
import { ref } from "vue";
import { useSchema } from "../../composables/useSchema";
import { useDiagram } from "../../composables/useDiagram";
import {
  Save,
  Settings,
  Database as DatabaseIcon,
  Download,
  User,
  Loader2,
  Upload,
  Layers,
  Table as TableIcon,
  Terminal,
} from "lucide-vue-next";

defineProps<{
  currentPage: string;
}>();

const emit = defineEmits(["navigate"]);

const { currentDatabase } = useSchema();
const { saveAll } = useDiagram();
const isSaving = ref(false);

const handleSync = async () => {
  isSaving.value = true;
  try {
    await saveAll();
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <header class="bg-white border-b border-gray-200 z-50 relative select-none">
    <!-- Top System Bar -->
    <div
      class="h-10 px-4 bg-gray-900 flex items-center justify-between text-white/50 text-[11px] font-medium"
    >
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 text-white">
          <div
            class="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center font-black text-[10px]"
          >
            D
          </div>
          <span class="font-bold tracking-tight">DrawDatabase</span>
        </div>
        <div class="flex gap-4">
          <button class="hover:text-white transition-colors">File</button>
          <button class="hover:text-white transition-colors">Edit</button>
          <button class="hover:text-white transition-colors">Database</button>
          <button class="hover:text-white transition-colors">Help</button>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div
          class="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-blue-300 border border-white/5"
        >
          <DatabaseIcon class="w-3 h-3" />
          <span class="font-bold uppercase tracking-widest text-[9px]">{{
            currentDatabase || "No Database"
          }}</span>
        </div>
        <div class="h-3 w-px bg-white/10"></div>
        <div class="flex items-center gap-2 hover:text-white cursor-pointer">
          <User class="w-3.5 h-3.5" />
          <span>root@localhost</span>
        </div>
      </div>
    </div>

    <!-- Toolbar / Navigation -->
    <div class="h-14 px-4 flex items-center justify-between">
      <!-- Left Actions -->
      <div class="flex items-center gap-2">
        <button
          @click="handleSync"
          :disabled="isSaving"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
        >
          <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
          <Save v-else class="w-4 h-4" />
          <span>Sync to DB</span>
        </button>

        <div class="w-px h-6 bg-gray-200 mx-2"></div>

        <button
          class="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
          title="Export Structure"
        >
          <Download class="w-4 h-4" />
        </button>
        <button
          class="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
          title="Import Diagram"
        >
          <Upload class="w-4 h-4" />
        </button>
      </div>

      <!-- Center Navigation (Tabs) -->
      <div class="flex bg-gray-100 p-1 rounded-2xl border border-gray-100">
        <button
          @click="$emit('navigate', 'diagram')"
          :class="
            currentPage === 'diagram'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          "
          class="flex items-center gap-2 px-6 py-1.5 rounded-xl text-xs font-bold transition-all"
        >
          <Layers class="w-3.5 h-3.5" />
          Diagram
        </button>
        <button
          @click="$emit('navigate', 'data')"
          :class="
            currentPage === 'data'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          "
          class="flex items-center gap-2 px-6 py-1.5 rounded-xl text-xs font-bold transition-all"
        >
          <TableIcon class="w-3.5 h-3.5" />
          Data Browser
        </button>
        <button
          @click="$emit('navigate', 'sql')"
          :class="
            currentPage === 'sql'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          "
          class="flex items-center gap-2 px-6 py-1.5 rounded-xl text-xs font-bold transition-all"
        >
          <Terminal class="w-3.5 h-3.5" />
          SQL Console
        </button>
      </div>

      <!-- Right Side -->
      <div class="flex items-center gap-2">
        <button
          class="p-2 text-gray-400 hover:text-gray-900 rounded-xl transition-all"
        >
          <Settings class="w-4 h-4" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
header {
  -webkit-font-smoothing: antialiased;
}
</style>
