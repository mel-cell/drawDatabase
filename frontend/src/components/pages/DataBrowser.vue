<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import {
  Search,
  Plus,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-vue-next";

const props = defineProps<{
  tableName?: string;
}>();

const loading = ref(false);
const error = ref("");
const columns = ref<string[]>([]);
const rows = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const limit = ref(50);

const fetchData = async () => {
  if (!props.tableName) return;

  loading.value = true;
  error.value = "";
  try {
    const res = await fetch(
      `http://localhost:3000/api/data?table=${props.tableName}&page=${page.value}&limit=${limit.value}`
    );
    if (!res.ok) throw new Error("Failed to fetch data");

    const data = await res.json();
    columns.value = data.columns || [];
    rows.value = data.rows || [];
    total.value = data.total || 0;
  } catch (e: any) {
    console.error(e);
    error.value = e.message;
    rows.value = [];
  } finally {
    loading.value = false;
  }
};

// Fetch when tableName changes or pagination changes
watch(
  () => props.tableName,
  () => {
    page.value = 1; // Reset to page 1
    fetchData();
  },
  { immediate: true }
);

watch(page, fetchData);
</script>

<template>
  <div class="flex flex-col h-full bg-white animate-in fade-in duration-300">
    <!-- Toolbar -->
    <div
      class="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50/50"
    >
      <div class="flex items-center gap-4">
        <div class="flex flex-col">
          <h2 class="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Database class="w-4 h-4 text-blue-600" />
            {{ props.tableName || "Select a Table" }}
          </h2>
          <span class="text-[10px] text-gray-500" v-if="total > 0"
            >{{ total }} rows found</span
          >
        </div>

        <div class="h-6 w-px bg-gray-300 mx-2"></div>

        <div class="relative">
          <Search
            class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search data..."
            class="pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none w-64 shadow-sm"
          />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="fetchData"
          class="p-1.5 text-gray-500 hover:text-blue-600 bg-white border border-gray-200 rounded shadow-sm hover:shadow active:scale-95 transition-all"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
        <button
          class="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium shadow-sm active:scale-95 transition-all"
        >
          <Plus class="w-3.5 h-3.5" /> Insert Row
        </button>
        <button
          class="p-1.5 text-gray-500 hover:text-gray-800 rounded hover:bg-gray-100"
        >
          <Filter class="w-4 h-4" />
        </button>
        <button
          class="p-1.5 text-gray-500 hover:text-gray-800 rounded hover:bg-gray-100"
        >
          <Download class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Data Grid -->
    <div class="flex-1 overflow-auto relative bg-white" v-if="props.tableName">
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-white/50 z-10"
      >
        <div class="flex flex-col items-center gap-2">
          <RefreshCw class="w-8 h-8 text-blue-500 animate-spin" />
          <span class="text-xs text-gray-500 font-medium">Loading data...</span>
        </div>
      </div>

      <div v-if="error" class="p-8 text-center">
        <div class="text-red-500 font-bold mb-2">Error Loading Data</div>
        <div class="text-gray-600 text-sm">{{ error }}</div>
      </div>

      <table
        v-if="!loading && !error && columns.length > 0"
        class="w-full text-left text-xs border-collapse"
      >
        <thead class="bg-gray-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th class="px-2 py-2 border-b border-gray-200 w-10 text-center">
              <input
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col"
              class="px-4 py-2 border-b border-gray-200 font-semibold text-gray-600 whitespace-nowrap border-r border-gray-100 last:border-r-0"
            >
              {{ col }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="(row, idx) in rows"
            :key="idx"
            class="hover:bg-blue-50/50 transition-colors group"
          >
            <td
              class="px-2 py-2 text-center border-r border-gray-100 bg-gray-50/30 group-hover:bg-blue-50/50"
            >
              <input
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td
              v-for="col in columns"
              :key="col"
              class="px-4 py-2 text-gray-700 whitespace-nowrap border-r border-gray-100 last:border-r-0 max-w-xs truncate overflow-hidden"
            >
              {{ row[col] }}
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td
              :colspan="columns.length + 1"
              class="p-8 text-center text-gray-400 italic"
            >
              No data available in this table.
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-else-if="!loading && !error && !props.tableName"
        class="h-full flex flex-col items-center justify-center text-gray-400"
      >
        <Database class="w-16 h-16 mb-4 opacity-20" />
        <p>Select a table from the sidebar to view its data.</p>
      </div>
    </div>

    <!-- Pagination Footer -->
    <div
      class="h-10 border-t border-gray-200 bg-gray-50 flex items-center justify-between px-4 shrink-0 text-xs text-gray-600"
    >
      <div>
        Showing {{ (page - 1) * limit + 1 }} -
        {{ Math.min(page * limit, total) }} of {{ total }} rows
      </div>
      <div class="flex items-center gap-2">
        <button
          :disabled="page === 1"
          @click="page--"
          class="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <span
          class="font-medium bg-white px-2 py-0.5 rounded border border-gray-300"
          >{{ page }}</span
        >
        <button
          :disabled="page * limit >= total"
          @click="page++"
          class="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
