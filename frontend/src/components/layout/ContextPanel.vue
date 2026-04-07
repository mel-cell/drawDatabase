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
  Settings,
  Trash2,
} from "lucide-vue-next";

// Import Modular Editors
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
const panelWidth = ref(360);
const isResizing = ref(false);

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

const startResize = (e: MouseEvent) => {
  isResizing.value = true;
  const startX = e.clientX;
  const startWidth = panelWidth.value;

  const onMouseMove = (ev: MouseEvent) => {
    const delta = startX - ev.clientX;
    const newWidth = Math.max(300, Math.min(800, startWidth + delta));
    panelWidth.value = newWidth;
  };

  const onMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};

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
    toast.warning("Element Removed", "Diagram has been updated");
  }
};
</script>

<template>
  <div class="flex h-full bg-white border-l border-gray-200 overflow-hidden relative shadow-2xl">
    
    <!-- SLIM TOOLBAR TAB - Fixed Width -->
    <div class="w-14 bg-gray-50 border-r border-gray-100 h-full flex flex-col items-center py-6 gap-4 z-10 flex-shrink-0">
      <button 
        @click="activeTab = 'database'; isExpanded = true"
        class="w-10 h-10 flex-center rounded-xl transition-all relative group"
        :class="activeTab === 'database' && isExpanded ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:bg-white hover:text-gray-900 border border-transparent'"
      >
        <Database class="w-4.5 h-4.5" />
        <div class="absolute left-16 px-2 py-1 bg-gray-900 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-all">Database Info</div>
      </button>

      <button 
        @click="activeTab = 'info'; isExpanded = true"
        class="w-10 h-10 flex-center rounded-xl transition-all relative group"
        :class="activeTab === 'info' && isExpanded ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:bg-white hover:text-gray-900 border border-transparent'"
        :disabled="type === 'none'"
      >
        <Layers class="w-4.5 h-4.5" :class="{ 'opacity-30': type === 'none' }" />
        <div class="absolute left-16 px-2 py-1 bg-gray-900 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-all">Properties</div>
      </button>

      <div class="flex-1"></div>

      <button @click="isExpanded = !isExpanded" class="w-10 h-10 flex-center rounded-xl text-gray-400 hover:bg-white transition-all">
        <ChevronRight class="w-4.5 h-4.5 transition-transform duration-500" :class="{ 'rotate-180': !isExpanded }" />
      </button>
    </div>

    <!-- MAIN CONTENT AREA -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 translate-x-4"
      enter-to-class="opacity-100 translate-x-0"
    >
      <div 
        v-if="isExpanded"
        class="flex flex-col h-full bg-white relative"
        :style="{ width: panelWidth + 'px' }"
      >
        <!-- Resize Handle (Invisibly wide, visibily thin) -->
        <div 
          @mousedown.prevent="startResize"
          class="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-50 group"
        >
           <div class="h-full w-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <!-- Panel Header -->
        <header class="h-14 flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
          <div class="flex flex-col">
            <h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                {{ activeTab === 'database' ? 'Connection' : 'Active Element' }}
            </h2>
            <span class="text-xs font-bold text-gray-400 truncate max-w-[200px]">
               {{ type === 'none' ? 'Workspace Explorer' : (data?.data?.name || data?.data?.label || type) }}
            </span>
          </div>
          
          <div class="flex items-center gap-2">
             <button v-if="type !== 'none'" @click="handleDelete" class="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Object">
               <Trash2 class="w-4 h-4" />
             </button>
             <button @click="isExpanded = false" class="p-2 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-lg transition-all">
               <X class="w-4 h-4" />
             </button>
          </div>
        </header>

        <!-- Editor Content -->
        <div class="flex-1 overflow-y-auto p-6 scrollbar-thin">
           <!-- Render appropriate editor -->
           <div v-if="type !== 'none' || activeTab === 'database'">
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
                :db-name="activeDatabase || 'No Active Session'"
                @delete="handleDelete"
              />
           </div>

           <!-- Empty State -->
           <div v-else class="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
              <div class="w-16 h-16 bg-gray-100 rounded-2xl flex-center mb-4">
                 <Settings class="w-8 h-8 text-gray-400" />
              </div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-500">Selector Node</p>
              <p class="text-[11px] font-medium text-gray-400 mt-1 max-w-[150px]">Click a table or note on the canvas to edit properties</p>
           </div>
        </div>

        <!-- Footer / Stats (Optional) -->
        <footer class="h-10 px-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/50">
           <span class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Properties Inspector</span>
           <div class="flex items-center gap-3">
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 anim-pulse"></div>
              <span class="text-[9px] font-bold text-gray-500">Live Sync</span>
           </div>
        </footer>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.anim-pulse {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}
</style>
