<script setup lang="ts">
import { ref, watch } from "vue";
import { useDiagram } from "../../composables/useDiagram";
import {
  Info,
  FileCode,
  ChevronRight,
  Plus,
  Trash2,
  Palette,
} from "lucide-vue-next";

const props = defineProps<{
  type: "server" | "database" | "table" | "table-edit" | "note-edit" | "none";
  data?: any;
  trigger?: number; // Force reopen trigger
}>();

const { removeNode } = useDiagram();

// Panel State
const activeTab = ref<string>("info");
const isExpanded = ref(false);

// Resize State
const isResizing = ref(false);
const panelWidth = ref(320);
const minWidth = 300;
const maxWidth = 800;

// Local Edit State (Table)
const tablename = ref("");
const tableColor = ref("#ffffff");
const columns = ref<any[]>([]);

// Local Edit State (Note)
const noteLabel = ref("");
const noteStyle = ref({
  fontSize: 14,
  color: "#000000",
  backgroundColor: "#ffffff",
  fontWeight: "normal",
});

// Logic to Sync Local State from Props
const syncFromProps = () => {
  const newData = props.data;
  if (newData) {
    if (props.type === "table-edit" || props.type === "table") {
      const tableData = newData.data || newData;
      tablename.value = tableData.name || tableData.label || "Untitled";
      tableColor.value = tableData.headerColor || "#ffffff";
      columns.value = (tableData.columns || []).map((c: any) => ({
        ...c,
        expanded: false,
      }));

      activeTab.value = "info";
      isExpanded.value = true;
    } else if (props.type === "note-edit") {
      const noteData = newData.data;
      noteLabel.value = noteData.label || "";
      const styles = noteData.style || {};
      const rootStyles = newData.style || {};

      noteStyle.value = {
        fontSize: styles.fontSize || 14,
        color: styles.color || "#000000",
        fontWeight: styles.fontWeight || "normal",
        backgroundColor: rootStyles.backgroundColor || "#fef3c7",
      };

      activeTab.value = "info";
      isExpanded.value = true;
    } else {
      if (props.type === "server") isExpanded.value = false;
    }
  } else {
    isExpanded.value = false;
  }
};

// Watchers
watch(() => props.trigger, syncFromProps);
watch(() => props.data, syncFromProps, { deep: true, immediate: true });

// Resize Logic
const startResize = (e: MouseEvent) => {
  isResizing.value = true;
  const startX = e.clientX;
  const startWidth = panelWidth.value;

  const onMouseMove = (ev: MouseEvent) => {
    const delta = startX - ev.clientX; // Left drag increases width
    const newWidth = startWidth + delta;
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      panelWidth.value = newWidth;
    }
  };

  const onMouseUp = () => {
    isResizing.value = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "";
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
  document.body.style.cursor = "ew-resize";
};

// Update Source Node directly on local change
watch(
  [tablename, tableColor, columns, noteLabel, noteStyle],
  () => {
    if (props.data) {
      if (props.type === "table-edit" || props.type === "table") {
        const target = props.data.data ? props.data.data : props.data;
        target.name = tablename.value;
        target.label = tablename.value;
        target.headerColor = tableColor.value;
        target.columns = columns.value;
      } else if (props.type === "note-edit") {
        const targetData = props.data.data;
        targetData.label = noteLabel.value;
        targetData.style = {
          ...targetData.style,
          fontSize: Number(noteStyle.value.fontSize),
          color: noteStyle.value.color,
          fontWeight: noteStyle.value.fontWeight,
        };
        if (props.data.style) {
          props.data.style.backgroundColor = noteStyle.value.backgroundColor;
        }
      }
    }
  },
  { deep: true }
);

const addColumn = () => {
  columns.value.push({
    name: "new_col",
    type: "VARCHAR",
    is_pk: false,
    is_nn: false,
    is_uq: false,
    is_ai: false,
    default: "",
    expanded: true,
  });
};

const removeColumn = (idx: number) => {
  columns.value.splice(idx, 1);
};

const handleDeleteTable = () => {
  if (confirm("Are you sure you want to remove this item?")) {
    const id = props.data.id || props.data.data?.name;
    if (id) {
      removeNode(id);
      isExpanded.value = false;
    }
  }
};
</script>

<template>
  <div class="flex h-full z-30 shadow-xl bg-white">
    <!-- Slim Bar -->
    <div
      class="w-12 bg-white border-l border-gray-200 h-full flex flex-col items-center py-4 gap-4 z-40 relative"
    >
      <button
        @click="
          activeTab = 'info';
          isExpanded = true;
        "
        class="p-2 rounded-lg transition-colors relative group"
        :class="
          activeTab === 'info' && isExpanded
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-400 hover:bg-gray-100'
        "
      >
        <Info class="w-5 h-5" />
      </button>

      <button
        v-if="type === 'table' || type === 'table-edit'"
        @click="
          activeTab = 'sql';
          isExpanded = true;
        "
        class="p-2 rounded-lg transition-colors relative group"
        :class="
          activeTab === 'sql' && isExpanded
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-400 hover:bg-gray-100'
        "
      >
        <FileCode class="w-5 h-5" />
      </button>

      <div class="flex-1"></div>

      <button
        @click="isExpanded = !isExpanded"
        class="p-2 mb-5 rounded-lg text-gray-400 hover:bg-gray-100"
      >
        <ChevronRight
          class="w-5 h-5 transition-transform"
          :class="{ 'rotate-180': !isExpanded }"
        />
      </button>
    </div>

    <!-- Expanded Panel -->
    <transition name="slide-right">
      <aside
        v-if="isExpanded"
        class="bg-white border-l border-gray-200 h-full flex flex-col relative"
        :style="{ width: panelWidth + 'px' }"
      >
        <!-- Drag Handle -->
        <div
          @mousedown.prevent="startResize"
          class="absolute top-0 bottom-0 left-0 w-1 bg-transparent hover:bg-blue-400 cursor-ew-resize z-50 transition-colors"
          :class="{ 'bg-blue-400': isResizing }"
          title="Drag to resize"
        ></div>

        <!-- Header -->
        <div
          class="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50/50"
        >
          <h3 class="font-bold text-gray-700 uppercase text-xs tracking-wider">
            {{
              props.type === "server"
                ? "Server Info"
                : props.type === "note-edit"
                ? "Note Properties"
                : "Table Inspector"
            }}
          </h3>
        </div>

        <!-- TABLE EDITOR -->
        <div
          v-if="
            activeTab === 'info' &&
            (props.type === 'table-edit' || props.type === 'table')
          "
          class="flex-1 overflow-y-auto p-4 scrollbar-thin"
        >
          <!-- Table Name & Color -->
          <div class="mb-6 space-y-3">
            <div>
              <label
                class="block text-[10px] uppercase font-bold text-gray-400 mb-1"
                >Table Name</label
              >
              <input
                v-model="tablename"
                class="w-full text-sm font-bold border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                placeholder="e.g. users"
              />
            </div>
            <!-- Color Picker -->
            <div>
              <label
                class="block text-[10px] uppercase font-bold text-gray-400 mb-1"
                >Header Color</label
              >
              <div class="flex items-center gap-2">
                <template
                  v-for="color in [
                    '#ffffff',
                    '#f8fafc',
                    '#f0f9ff',
                    '#f0fdf4',
                    '#fef2f2',
                    '#fffbeb',
                  ]"
                  :key="color"
                >
                  <button
                    @click="tableColor = color"
                    class="w-6 h-6 rounded border transition-transform hover:scale-110 focus:outline-none shadow-sm"
                    :class="
                      tableColor === color
                        ? 'border-blue-500 ring-2 ring-blue-100'
                        : 'border-gray-200'
                    "
                    :style="{ backgroundColor: color }"
                  ></button>
                </template>
              </div>
            </div>
          </div>

          <!-- Columns -->
          <div class="flex items-center justify-between mb-2">
            <label class="block text-[10px] uppercase font-bold text-gray-400"
              >Columns ({{ columns.length }})</label
            >
            <button
              @click="addColumn"
              class="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <Plus class="w-3 h-3" /> Add
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(col, idx) in columns"
              :key="idx"
              class="p-2 rounded border border-gray-200 bg-gray-50/50 group hover:border-blue-300 transition-all"
            >
              <div class="flex gap-2 mb-2 items-center">
                <button
                  @click="col.expanded = !col.expanded"
                  class="text-gray-400 hover:text-blue-600 focus:outline-none"
                >
                  <ChevronRight
                    class="w-3 h-3 transition-transform"
                    :class="{ 'rotate-90': col.expanded }"
                  />
                </button>
                <input
                  v-model="col.name"
                  class="flex-1 min-w-0 bg-white border border-gray-200 rounded px-1.5 py-1 text-xs font-medium focus:border-blue-400 outline-none"
                  placeholder="name"
                />
                <select
                  v-model="col.type"
                  class="w-16 bg-white border border-gray-200 rounded px-1 py-1 text-[10px] font-mono focus:border-blue-400 outline-none"
                >
                  <option>INT</option>
                  <option>VARCHAR</option>
                  <option>TEXT</option>
                  <option>BOOL</option>
                  <option>TIMESTAMP</option>
                  <option>FLOAT</option>
                </select>
                <button
                  @click="removeColumn(idx)"
                  class="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>

              <div class="flex items-center gap-3 px-1 mb-1 justify-start">
                <label
                  class="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer hover:text-blue-600"
                  title="Primary Key"
                >
                  <input
                    type="checkbox"
                    v-model="col.is_pk"
                    class="rounded-sm w-3 h-3 text-blue-600"
                  />
                  PK
                </label>
                <label
                  class="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer hover:text-blue-600"
                  title="Not Null"
                >
                  <input
                    type="checkbox"
                    v-model="col.is_nn"
                    class="rounded-sm w-3 h-3 text-blue-600"
                  />
                  NN
                </label>
                <label
                  class="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer hover:text-blue-600"
                  title="Unique"
                >
                  <input
                    type="checkbox"
                    v-model="col.is_uq"
                    class="rounded-sm w-3 h-3 text-blue-600"
                  />
                  UQ
                </label>
                <label
                  class="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer hover:text-blue-600"
                  title="Auto Increment"
                >
                  <input
                    type="checkbox"
                    v-model="col.is_ai"
                    class="rounded-sm w-3 h-3 text-blue-600"
                  />
                  AI
                </label>
              </div>

              <div
                v-if="col.expanded"
                class="mt-2 pt-2 border-t border-gray-200 grid grid-cols-1 gap-2"
              >
                <div>
                  <label class="text-[10px] text-gray-400 block mb-0.5"
                    >Default Value</label
                  >
                  <input
                    v-model="col.default"
                    class="w-full text-xs border border-gray-200 rounded px-1 py-0.5 bg-white outline-none focus:border-blue-400"
                    placeholder="NULL"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-gray-100">
            <button
              @click="handleDeleteTable"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-semibold"
            >
              <Trash2 class="w-4 h-4" /> Delete Table
            </button>
          </div>
        </div>

        <!-- NOTE EDITOR -->
        <div
          v-else-if="activeTab === 'info' && props.type === 'note-edit'"
          class="flex-1 overflow-y-auto p-4 scrollbar-thin"
        >
          <div class="mb-6">
            <label
              class="block text-[10px] uppercase font-bold text-gray-400 mb-1"
              >Content</label
            >
            <textarea
              v-model="noteLabel"
              class="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none resize-y min-h-[100px]"
              placeholder="Enter note text..."
            ></textarea>
          </div>
          <div class="mb-2">
            <label
              class="block text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2"
              ><Palette class="w-3 h-3" /> Appearance</label
            >
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] text-gray-500 block mb-1"
                  >Font Size</label
                >
                <input
                  type="number"
                  v-model="noteStyle.fontSize"
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label class="text-[10px] text-gray-500 block mb-1"
                  >Weight</label
                >
                <select
                  v-model="noteStyle.fontWeight"
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div>
                <label class="text-[10px] text-gray-500 block mb-1"
                  >Text Color</label
                >
                <div class="flex items-center gap-2">
                  <input
                    type="color"
                    v-model="noteStyle.color"
                    class="w-6 h-6 rounded border border-gray-300 cursor-pointer overflow-hidden p-0"
                  />
                  <span class="text-xs text-gray-600 font-mono">{{
                    noteStyle.color
                  }}</span>
                </div>
              </div>
              <div>
                <label class="text-[10px] text-gray-500 block mb-1"
                  >Background</label
                >
                <div class="flex items-center gap-2">
                  <input
                    type="color"
                    v-model="noteStyle.backgroundColor"
                    class="w-6 h-6 rounded border border-gray-300 cursor-pointer overflow-hidden p-0"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="mt-8 pt-6 border-t border-gray-100">
            <button
              @click="handleDeleteTable"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-semibold"
            >
              <Trash2 class="w-4 h-4" /> Delete Node
            </button>
          </div>
        </div>

        <!-- SERVER INFO -->
        <div
          v-else-if="activeTab === 'info' && props.type === 'server'"
          class="p-6 text-center text-gray-500"
        >
          <Info class="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p class="text-sm">Server: localhost:3306</p>
        </div>

        <!-- SQL PREVIEW -->
        <div
          v-else-if="activeTab === 'sql'"
          class="flex-1 p-0 bg-[#1e1e1e] overflow-auto"
        >
          <pre class="p-4 text-xs font-mono text-green-400 leading-relaxed">
-- Generated SQL
CREATE TABLE `{{ tablename }}` (
<template v-for="(col, i) in columns" :key="i">  `{{ col.name }}` {{ col.type }}{{ col.is_pk ? ' PRIMARY KEY' : '' }}{{ i < columns.length-1 ? ',' : '' }}
</template>);
             </pre>
        </div>
      </aside>
    </transition>
  </div>
</template>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
  overflow: hidden;
}
.slide-right-enter-from,
.slide-right-leave-to {
  width: 0;
  opacity: 0;
}
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
</style>
