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
  Activity,
  ChevronDown
} from "lucide-vue-next";

defineProps<{
  currentPage: string;
}>();

const emit = defineEmits(["navigate"]);

const { currentDatabase } = useSchema();
const { saveAll } = useDiagram();
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
</script>

<template>
  <nav class="h-14 w-full bg-white border-b border-gray-200 flex items-center justify-between px-4 select-none">
    <!-- BRAND & MAIN MENU -->
    <div class="flex items-center gap-8">
      <div class="flex items-center gap-2.5 group cursor-pointer">
        <div class="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
          <DatabaseIcon class="w-4 h-4 text-white" />
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-black tracking-tight text-gray-900 leading-none">DRAW<span class="text-blue-600">DB</span></span>
          <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Architect</span>
        </div>
      </div>

      <div class="h-6 w-px bg-gray-100"></div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-1">
        <button @click="$emit('navigate', 'diagram')" 
                :class="currentPage === 'diagram' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'"
                class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
          <Layers class="w-3.5 h-3.5" />
          Editor
        </button>
        <button @click="$emit('navigate', 'data')"
                :class="currentPage === 'data' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'"
                class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
          <TableIcon class="w-3.5 h-3.5" />
          Browser
        </button>
        <button @click="$emit('navigate', 'sql')"
                :class="currentPage === 'sql' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'"
                class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
          <Terminal class="w-3.5 h-3.5" />
          SQL
        </button>
      </div>
    </div>

    <!-- CENTER STATUS -->
    <div class="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
       <button @click="handleSync" 
               :disabled="isSaving"
               class="flex items-center gap-2 px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-[11px] font-bold transition-all shadow-xl active:scale-95 disabled:opacity-50">
          <Loader2 v-if="isSaving" class="w-3.5 h-3.5 animate-spin text-blue-400" />
          <Save v-else class="w-3.5 h-3.5" />
          {{ isSaving ? 'SAVING...' : 'SYNC TO DATABASE' }}
       </button>
    </div>

    <!-- RIGHT TOOLS -->
    <div class="flex items-center gap-4">
      <!-- Database Indicators -->
      <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl cursor-default group">
        <div class="w-1.5 h-1.5 rounded-full" :class="currentDatabase ? 'bg-emerald-500' : 'bg-gray-300'"></div>
        <span class="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{{ currentDatabase || 'No Connection' }}</span>
        <ChevronDown class="w-3 h-3 text-gray-400" />
      </div>

      <div class="h-6 w-px bg-gray-100"></div>

      <div class="flex items-center gap-2">
        <button class="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all relative">
          <Activity class="w-4 h-4" />
          <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white"></span>
        </button>
        <button class="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
          <Download class="w-4 h-4" />
        </button>
        <button class="ml-2 w-8 h-8 rounded-full bg-slate-200 flex-center border-2 border-white shadow-sm cursor-pointer hover:border-blue-100 transition-all">
           <User class="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  </nav>
</template>
