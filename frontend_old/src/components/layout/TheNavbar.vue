<script setup lang="ts">
import { ref } from "vue";
import { useSchema } from "../../composables/useSchema";
import { useDiagram } from "../../composables/useDiagram";
import { useConnection } from "../../composables/useConnection";
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
  Wifi,
  WifiOff,
} from "lucide-vue-next";

defineProps<{
  currentPage: string;
}>();

const emit = defineEmits(["navigate"]);

const { currentDatabase } = useSchema();
const { saveAll } = useDiagram();
const { activeConnection } = useConnection();
const isSaving = ref(false);

const handleSync = async () => {
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    await saveAll();
  } finally {
    isSaving.value = false;
  }
};

const isConnected = ref(true); // Will be dynamic later
</script>

<template>
  <nav class="h-14 w-full bg-white flex items-center justify-between px-4 select-none">
    <!-- LEFT: Brand + Tabs -->
    <div class="flex items-center gap-6">
      <!-- Brand -->
      <div class="flex items-center gap-2.5 cursor-default">
        <div class="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <DatabaseIcon class="w-3.5 h-3.5 text-white" />
        </div>
        <span class="text-sm font-black tracking-tight text-gray-900">Draw<span class="text-blue-600">DB</span></span>
      </div>

      <div class="h-5 w-px bg-gray-200"></div>

      <!-- Tabs -->
      <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
        <button @click="$emit('navigate', 'diagram')"
                :class="currentPage === 'diagram' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                class="px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5">
          <Layers class="w-3.5 h-3.5" />
          Diagram
        </button>
        <button @click="$emit('navigate', 'data')"
                :class="currentPage === 'data' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                class="px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5">
          <TableIcon class="w-3.5 h-3.5" />
          Browser
        </button>
        <button @click="$emit('navigate', 'sql')"
                :class="currentPage === 'sql' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                class="px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5">
          <Terminal class="w-3.5 h-3.5" />
          SQL Console
        </button>
      </div>
    </div>

    <!-- CENTER: Sync Button -->
    <div class="absolute left-1/2 -translate-x-1/2">
      <button @click="handleSync"
              :disabled="isSaving"
              class="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50">
        <Loader2 v-if="isSaving" class="w-3.5 h-3.5 animate-spin" />
        <Save v-else class="w-3.5 h-3.5" />
        {{ isSaving ? 'Syncing...' : 'Sync to DB' }}
      </button>
    </div>

    <!-- RIGHT: Status + Tools -->
    <div class="flex items-center gap-3">
      <!-- Connection Status -->
      <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs">
        <div class="flex items-center gap-1.5">
          <Wifi v-if="isConnected" class="w-3 h-3 text-emerald-500" />
          <WifiOff v-else class="w-3 h-3 text-red-400" />
          <span class="font-semibold text-gray-700">{{ activeConnection?.name || 'Local MySQL' }}</span>
        </div>
        <span class="text-gray-300">|</span>
        <span class="font-mono text-gray-500">{{ currentDatabase || '—' }}</span>
      </div>

      <div class="h-5 w-px bg-gray-200"></div>

      <!-- Action buttons -->
      <button class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all" title="Export">
        <Download class="w-4 h-4" />
      </button>
      <button class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all" title="Import">
        <Upload class="w-4 h-4" />
      </button>
      <button class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all" title="Settings">
        <Settings class="w-4 h-4" />
      </button>

      <div class="h-5 w-px bg-gray-200"></div>

      <!-- User avatar -->
      <div class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all">
        <User class="w-3.5 h-3.5 text-gray-500" />
      </div>
    </div>
  </nav>
</template>
