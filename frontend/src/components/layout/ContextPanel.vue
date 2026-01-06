<script setup lang="ts">
import { ref, watch } from "vue";
import { useDiagram } from "../../composables/useDiagram";
import { Info, FileCode, ChevronRight, Plus, Trash2 } from "lucide-vue-next";

const props = defineProps<{
  type: "server" | "database" | "table" | "table-edit" | "none"; // 'table-edit' for visual mode
  data?: any;
}>();

// Global Logic for Deletion
const { removeNode } = useDiagram();

// Panel State
const activeTab = ref<string>("info");
const isExpanded = ref(false);

// Local Edit State (bound to node data)
const tablename = ref("");
const columns = ref<any[]>([]);

// Sync prop data to local refs
watch(
  () => props.data,
  (newData) => {
    if (newData && (props.type === "table-edit" || props.type === "table")) {
      // If it's a VueFlow Node, data is inside `.data`. If from sidebar, it might be direct.
      const tableData = newData.data || newData;
      tablename.value = tableData.name || tableData.label || "Untitled";
      columns.value = tableData.columns || [];

      activeTab.value = "info";
      isExpanded.value = true;
    } else {
      // If clicking background/server
      isExpanded.value = false;
    }
  },
  { deep: true, immediate: true }
);

// Watch for changes and update the source object directly (Reactive Node)
watch(
  [tablename, columns],
  () => {
    if (props.data && (props.type === "table-edit" || props.type === "table")) {
      // Direct mutation if allowed (VueFlow nodes are reactive objects)
      const target = props.data.data ? props.data.data : props.data;
      target.name = tablename.value;
      target.label = tablename.value; // For Node Label
      target.columns = columns.value;
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
  });
};

const removeColumn = (idx: number) => {
  columns.value.splice(idx, 1);
};

const handleDeleteTable = () => {
  if (confirm("Are you sure you want to remove this table from the draft?")) {
    // Try getting ID
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
    <!-- Slim Icons Bar -->
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

      <!-- Close Panel -->
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

    <!-- Expanded Content -->
    <transition name="slide-right">
      <aside
        v-if="isExpanded"
        class="w-80 bg-white border-l border-gray-200 h-full flex flex-col"
      >
        <!-- Header -->
        <div
          class="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50/50"
        >
          <h3 class="font-bold text-gray-700 uppercase text-xs tracking-wider">
            {{ props.type === "server" ? "Server Info" : "Table Inspector" }}
          </h3>
        </div>

        <!-- content: Table Editor -->
        <div
          v-if="
            activeTab === 'info' &&
            (props.type === 'table-edit' || props.type === 'table')
          "
          class="flex-1 overflow-y-auto p-4 scrollbar-thin"
        >
          <!-- Table Name -->
          <div class="mb-6">
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

          <!-- Columns Header -->
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

          <!-- Columns List -->
          <div class="space-y-2">
            <div
              v-for="(col, idx) in columns"
              :key="idx"
              class="p-2 rounded border border-gray-200 bg-gray-50/50 group hover:border-blue-300 transition-all"
            >
              <div class="flex gap-2 mb-1">
                <input
                  v-model="col.name"
                  class="flex-1 min-w-0 bg-white border border-gray-200 rounded px-1.5 py-1 text-xs font-medium focus:border-blue-400 outline-none"
                  placeholder="col_name"
                />
                <select
                  v-model="col.type"
                  class="w-20 bg-white border border-gray-200 rounded px-1 py-1 text-[10px] font-mono focus:border-blue-400 outline-none"
                >
                  <option>INT</option>
                  <option>VARCHAR</option>
                  <option>TEXT</option>
                  <option>BOOLEAN</option>
                  <option>TIMESTAMP</option>
                </select>
              </div>

              <!-- Flags -->
              <div class="flex items-center justify-between px-1">
                <div class="flex gap-3">
                  <label
                    class="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer hover:text-blue-600"
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
                  >
                    <input
                      type="checkbox"
                      v-model="col.is_nn"
                      class="rounded-sm w-3 h-3 text-blue-600"
                    />
                    NN
                  </label>
                </div>

                <button
                  @click="removeColumn(idx)"
                  class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Danger Zone: Delete Table -->
          <div class="mt-8 pt-6 border-t border-gray-100">
            <button
              @click="handleDeleteTable"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-semibold"
            >
              <Trash2 class="w-4 h-4" />
              Delete Table
            </button>
          </div>
        </div>

        <!-- content: Server Info -->
        <div
          v-else-if="activeTab === 'info' && props.type === 'server'"
          class="p-6 text-center text-gray-500"
        >
          <Info class="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p class="text-sm">Server: localhost:3306</p>
          <p class="text-xs mt-1">Version: 8.0.30</p>
        </div>

        <!-- content: SQL Preview -->
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
