<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useDiagram } from "../../composables/useDiagram";
import {
  Settings,
  X,
  Plus,
  Trash2,
  Palette,
  Database,
  Table as TableIcon,
  LayoutGrid,
  FileText,
  MousePointer2,
  AlignLeft,
  Type,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Info,
} from "lucide-vue-next";

// Define Props
const props = defineProps<{
  type:
    | "server"
    | "database"
    | "table"
    | "table-edit"
    | "note-edit"
    | "group-edit"
    | "none";
  data?: any;
  trigger?: number; // Force reopen trigger
  activeDatabase?: string;
}>();

// ...
const groupLabel = ref("");
const groupColor = ref("#rgba(240, 244, 248, 0.5)");

const { removeNode, edges, nodes } = useDiagram();

// Panel State
const activeTab = ref<string>("info");
const isExpanded = ref(false);
const panelWidth = ref(320);

// ... (Resize State)
const isResizing = ref(false);
const minWidth = 300;
const maxWidth = 800;

// ... (Local Edit State)
const tablename = ref("");
const tableColor = ref("#ffffff");
const columns = ref<any[]>([]);
const noteLabel = ref("");
const noteStyle = ref({
  fontSize: 14,
  color: "#000000",
  backgroundColor: "#ffffff",
  fontWeight: "normal",
});

// Logic to Sync Local State from Props
const syncFromProps = () => {
  // If we have a selection, prefer showing Info (Inspector)
  if (props.data) {
    if (props.type !== "none") {
      activeTab.value = "info";
      isExpanded.value = true;
    }
  } else if (
    props.type === "database" ||
    (props.activeDatabase && props.trigger)
  ) {
    // If triggered specifically for DB without selection, or type is explicitly database
    activeTab.value = "database";
    isExpanded.value = true;
  }
  // ... existing sync logic ...
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
    } else if (props.type === "group-edit") {
      const groupData = newData.data;
      groupLabel.value = groupData.label || "Group";
      groupColor.value = groupData.color || "rgba(240, 244, 248, 0.5)";
    }
  }
};

const handleDeleteGroup = () => {
  if (confirm("Delete this group?")) {
    removeNode(props.data.id);
    isExpanded.value = false;
  }
};

// Watchers
watch(
  () => props.trigger,
  () => {
    syncFromProps();
    if (!props.data && props.activeDatabase) {
      activeTab.value = "database";
      isExpanded.value = true;
    }
  }
);

watch(
  () => (props.data ? props.data.id || props.data.data?.name : null),
  (newId, oldId) => {
    if (newId !== oldId) {
      syncFromProps();
    }
  },
  { immediate: true }
);

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
        target.columns = columns.value.map((col: any) => ({
          ...col,
          fk_ref_table: col.is_fk ? col.fk_ref_table : undefined,
          fk_ref_col: col.is_fk ? col.fk_ref_col : undefined,
          fk_on_delete: col.is_fk ? col.fk_on_delete : undefined,
        }));
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
      <!-- TAB 1: DATABASE INFO (Info Icon) -->
      <button
        @click="
          activeTab = 'database';
          isExpanded = true;
        "
        class="p-2 rounded-lg transition-colors relative group"
        :class="
          activeTab === 'database' && isExpanded
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-400 hover:bg-gray-100'
        "
        title="Database Info"
      >
        <Info class="w-5 h-5" />
      </button>

      <!-- TAB 2: INSPECTOR (Table Icon) -->
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
        :disabled="type === 'none' || type === 'server'"
        :title="type === 'none' ? 'No selection' : 'Properties'"
      >
        <TableIcon class="w-5 h-5" :class="{ 'opacity-50': type === 'none' }" />
      </button>

      <!-- TAB 3: SQL PREVIEW (Code Icon) -->
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
        title="SQL Preview"
      >
        <FileCode class="w-5 h-5" />
      </button>

      <!-- TAB 4: GROUP PROPERTIES (Layout Icon) -->
      <button
        v-if="type === 'group-edit'"
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
        title="Group Properties"
      >
        <LayoutGrid class="w-5 h-5" />
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
                : props.type === "group-edit"
                ? "Group Properties"
                : props.type === "database"
                ? "Database Info"
                : "Table Inspector"
            }}
          </h3>
          <button
            @click="isExpanded = false"
            class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors"
            title="Close Panel"
          >
            <X class="w-4 h-4" />
          </button>
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
                class="w-full text-sm font-bold border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none text-gray-900"
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

          <!-- Relationships (Read Only) -->
          <div class="mb-6">
            <label
              class="block text-[10px] uppercase font-bold text-gray-400 mb-2"
              >Relationships</label
            >
            <div
              v-if="
                edges.filter(
                  (e) =>
                    e.source === (props.data.id || props.data.data.name) ||
                    e.target === (props.data.id || props.data.data.name)
                ).length === 0
              "
              class="text-xs text-gray-400 italic"
            >
              No connections
            </div>
            <div class="space-y-1">
              <div
                v-for="edge in edges.filter(
                  (e) => e.source === (props.data.id || props.data.data.name)
                )"
                :key="edge.id"
                class="text-xs bg-gray-50 border border-gray-200 p-2 rounded flex items-center gap-2"
              >
                <span class="text-blue-600 font-bold">OUT</span>
                <span class="text-gray-600">to {{ edge.target }}</span>
              </div>
              <div
                v-for="edge in edges.filter(
                  (e) => e.target === (props.data.id || props.data.data.name)
                )"
                :key="edge.id"
                class="text-xs bg-gray-50 border border-gray-200 p-2 rounded flex items-center gap-2"
              >
                <span class="text-green-600 font-bold">IN</span>
                <span class="text-gray-600">from {{ edge.source }}</span>
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
                  class="flex-1 min-w-0 bg-white border border-gray-200 rounded px-1.5 py-1 text-xs font-medium focus:border-blue-400 outline-none text-gray-700"
                  placeholder="name"
                />
                <select
                  v-model="col.type"
                  class="w-20 bg-white border border-gray-200 rounded px-1 py-1 text-[10px] font-mono focus:border-blue-400 outline-none text-gray-700"
                >
                  <optgroup label="Numeric">
                    <option>INT</option>
                    <option>BIGINT</option>
                    <option>FLOAT</option>
                    <option>DOUBLE</option>
                    <option>DECIMAL(10,2)</option>
                  </optgroup>
                  <optgroup label="String">
                    <option>VARCHAR(255)</option>
                    <option>TEXT</option>
                    <option>LONGTEXT</option>
                    <option>CHAR(1)</option>
                  </optgroup>
                  <optgroup label="Date & Time">
                    <option>TIMESTAMP</option>
                    <option>DATETIME</option>
                    <option>DATE</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option>BOOL</option>
                    <option>JSON</option>
                    <option>BLOB</option>
                  </optgroup>
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
                    class="w-full text-xs border border-gray-200 rounded px-1 py-0.5 bg-white outline-none focus:border-blue-400 text-gray-700"
                    placeholder="NULL"
                  />
                </div>

                <!-- Foreign Key Config -->
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      :checked="col.is_fk"
                      @change="(e) => { col.is_fk = (e.target as HTMLInputElement).checked; if(!col.is_fk) { col.fk_ref_table = ''; col.fk_ref_col = ''; } }"
                      class="rounded text-blue-600 focus:ring-0"
                    />
                    <label class="text-[10px] font-bold text-gray-600"
                      >Is Foreign Key?</label
                    >
                  </div>

                  <div
                    v-if="col.is_fk"
                    class="grid grid-cols-2 gap-2 p-2 bg-blue-50/50 rounded border border-blue-100"
                  >
                    <div>
                      <label
                        class="text-[9px] text-blue-500 block mb-0.5 uppercase font-bold"
                        >Ref Table</label
                      >
                      <select
                        v-model="col.fk_ref_table"
                        class="w-full text-[10px] border border-blue-200 rounded px-1 py-1 bg-white outline-none"
                      >
                        <option value="">Select...</option>
                        <option
                          v-for="node in nodes.filter(
                            (n) =>
                              n.type === 'table' && n.data.name !== tablename
                          )"
                          :key="node.id"
                          :value="node.data.name"
                        >
                          {{ node.data.name }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label
                        class="text-[9px] text-blue-500 block mb-0.5 uppercase font-bold"
                        >Ref Column</label
                      >
                      <select
                        v-model="col.fk_ref_col"
                        :disabled="!col.fk_ref_table"
                        class="w-full text-[10px] border border-blue-200 rounded px-1 py-1 bg-white outline-none disabled:bg-gray-100"
                      >
                        <option value="">Select...</option>
                        <template v-if="col.fk_ref_table">
                          <option
                            v-for="c in nodes.find(
                              (n) => n.data.name === col.fk_ref_table
                            )?.data.columns || []"
                            :key="c.name"
                            :value="c.name"
                          >
                            {{ c.name }}
                          </option>
                        </template>
                      </select>
                    </div>
                    <div>
                      <label
                        class="text-[9px] text-blue-500 block mb-0.5 uppercase font-bold"
                        >On Delete</label
                      >
                      <select
                        v-model="col.fk_on_delete"
                        class="w-full text-[10px] border border-blue-200 rounded px-1 py-1 bg-white outline-none"
                      >
                        <option value="">RESTRICT</option>
                        <option value="CASCADE">CASCADE</option>
                        <option value="SET NULL">SET NULL</option>
                      </select>
                    </div>
                  </div>
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
              class="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none resize-y min-h-[100px] text-gray-900"
              placeholder="Enter note text..."
            ></textarea>
          </div>
          <div class="mb-2">
            <label
              class="text-[10px] uppercase font-bold text-gray-400 mb-2 flex items-center gap-2"
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

        <!-- GROUP EDITOR -->
        <div
          v-else-if="activeTab === 'info' && props.type === 'group-edit'"
          class="flex-1 overflow-y-auto p-4 scrollbar-thin"
        >
          <div class="mb-6">
            <label
              class="block text-[10px] uppercase font-bold text-gray-400 mb-1"
              >Group Label</label
            >
            <input
              v-model="groupLabel"
              type="text"
              class="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none text-gray-900"
              placeholder="e.g. Auth Module"
            />
          </div>

          <div class="mb-6">
            <label
              class="block text-[10px] uppercase font-bold text-gray-400 mb-1"
              >Background Color</label
            >
            <div class="flex items-center gap-2">
              <input
                v-model="groupColor"
                type="color"
                class="w-8 h-8 p-0 border border-gray-300 rounded overflow-hidden cursor-pointer"
              />
              <input
                v-model="groupColor"
                type="text"
                class="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 bg-gray-50 font-mono text-gray-700"
              />
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-gray-100">
            <button
              @click="handleDeleteGroup"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-semibold"
            >
              <Trash2 class="w-4 h-4" /> Delete Group
            </button>
          </div>
        </div>

        <!-- DATABASE EDITOR -->
        <div
          v-else-if="activeTab === 'database'"
          class="flex-1 overflow-y-auto p-4 scrollbar-thin"
        >
          <!-- Empty State if no DB selected -->
          <div
            v-if="!props.activeDatabase"
            class="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400"
          >
            <div
              class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300"
            >
              <Database class="w-8 h-8" />
            </div>
            <p class="font-medium text-gray-500 mb-1">No Database Selected</p>
            <p class="text-xs">
              Select a database from the left sidebar to view its details.
            </p>
          </div>

          <!-- DB Info -->
          <div v-else class="mb-6 space-y-3">
            <div
              class="p-4 bg-yellow-50 rounded border border-yellow-100 flex flex-col items-center text-center"
            >
              <div
                class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-3 text-yellow-600"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0 2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  ></path>
                </svg>
              </div>
              <h3 class="font-bold text-gray-800">
                {{ props.activeDatabase }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">Active MySQL Database</p>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-4">
              <div class="bg-gray-50 p-2 rounded border border-gray-200">
                <span class="block text-[10px] text-gray-400 uppercase"
                  >Charset</span
                >
                <span class="text-xs font-mono text-gray-700">utf8mb4</span>
              </div>
              <div class="bg-gray-50 p-2 rounded border border-gray-200">
                <span class="block text-[10px] text-gray-400 uppercase"
                  >Collation</span
                >
                <span class="text-xs font-mono text-gray-700"
                  >utf8mb4_unicode_ci</span
                >
              </div>
            </div>

            <!-- Database Actions -->
            <div class="mt-8 space-y-2">
              <p class="text-[10px] font-bold text-gray-400 uppercase">
                Quick Actions
              </p>
              <button
                class="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-xs text-gray-700 transition"
              >
                <Plus class="w-3.5 h-3.5" /> Create New Table
              </button>
              <button
                class="w-full flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-xs text-gray-700 transition"
              >
                <FileCode class="w-3.5 h-3.5" /> Execute Query
              </button>
            </div>
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
