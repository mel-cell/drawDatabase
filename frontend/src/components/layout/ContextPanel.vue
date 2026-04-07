<script setup lang="ts">
import { ref, watch } from "vue";
import { useDiagram } from "../../composables/useDiagram";
import {
  X,
  Database,
  Table as TableIcon,
  ChevronRight,
  Info,
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
const isExpanded = ref(false);
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
  if (confirm("Are you sure you want to remove this item?")) {
    const id = props.data.id;
    if (id) {
      removeNode(id);
      isExpanded.value = false;
    }
  }
};
</script>

<template>
  <div class="flex h-full z-30 shadow-2xl bg-white border-l border-gray-200 overflow-hidden">
    <!-- Slim Sidebar Bar (TABS) -->
    <div class="w-12 bg-white h-full flex flex-col items-center py-6 gap-6 z-40 relative border-r border-gray-100 flex-shrink-0">
      <button 
        @click="activeTab = 'database'; isExpanded = true"
        class="p-2.5 rounded-xl transition-all relative group"
        :class="activeTab === 'database' && isExpanded ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'"
      >
        <Database class="w-5 h-5" />
      </button>

      <button 
        @click="activeTab = 'info'; isExpanded = true"
        class="p-2.5 rounded-xl transition-all relative group"
        :class="activeTab === 'info' && isExpanded ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'"
        :disabled="type === 'none'"
      >
        <TableIcon class="w-5 h-5" :class="{ 'opacity-50': type === 'none' }" />
      </button>

      <div class="flex-1"></div>

      <button @click="isExpanded = !isExpanded" class="p-2 mb-4 rounded-lg text-gray-400 hover:bg-gray-100">
        <ChevronRight class="w-5 h-5 transition-transform duration-300" :class="{ 'rotate-180': !isExpanded }" />
      </button>
    </div>

    <!-- Expanded Content Area -->
    <transition name="panel-slide">
      <aside 
        v-if="isExpanded"
        class="bg-white h-full flex flex-col relative"
        :style="{ width: panelWidth + 'px' }"
      >
        <!-- Resize Handle -->
        <div 
          @mousedown.prevent="startResize"
          class="absolute top-0 bottom-0 left-0 w-1.5 bg-transparent hover:bg-blue-400 cursor-ew-resize z-50 transition-all opacity-0 hover:opacity-100"
          :class="{ 'bg-blue-400 opacity-100': isResizing }"
        ></div>

        <!-- Header -->
        <header class="h-14 flex items-center justify-between px-5 bg-gray-50/50 border-b border-gray-100 flex-shrink-0">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-[10px] uppercase tracking-[0.1em] text-gray-400">
                {{ type === 'database' ? 'Database Detail' : 'Properties' }}
            </h3>
          </div>
          <button @click="isExpanded = false" class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
            <X class="w-4 h-4" />
          </button>
        </header>

        <!-- Dynamic Content -->
        <div class="flex-1 overflow-y-auto p-6 bg-white scrollbar-thin">
          <!-- TABLE EDITOR -->
          <TableEditor 
            v-if="activeTab === 'info' && (type === 'table' || type === 'table-edit')" 
            :data="data" 
            :nodes="nodes"
            @update="handleUpdate"
          />

          <!-- NOTE EDITOR -->
          <NoteEditor 
            v-if="activeTab === 'info' && type === 'note-edit'" 
            :data="data" 
            @update="handleUpdate"
            @delete="handleDelete"
          />

          <!-- DATABASE INFO -->
          <DatabaseEditor 
            v-if="activeTab === 'database' || (activeTab === 'info' && type === 'database')" 
            :db-name="activeDatabase || 'No Database Selected'"
            @delete="handleDelete"
          />

          <!-- PLACEHOLDER FOR OTHERS -->
          <div v-if="type === 'none' && activeTab === 'info'" class="h-full flex flex-col items-center justify-center text-gray-300 space-y-4">
             <Info class="w-12 h-12 opacity-20" />
             <p class="text-xs font-semibold uppercase tracking-wider">Select an element to inspect</p>
          </div>
        </div>
      </aside>
    </transition>
  </div>
</template>

<style scoped>
.panel-slide-enter-active, .panel-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.panel-slide-enter-from, .panel-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
