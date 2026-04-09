<script setup lang="ts">
import { ref } from "vue";
import { Play, Eraser, Download, Copy, Check, Loader2 } from "lucide-vue-next";

const query = ref("SELECT * FROM users LIMIT 10;");

const results = ref<any[]>([]);
const isLoading = ref(false);
const executionTime = ref(0);
const error = ref("");

const executeQuery = async () => {
  isLoading.value = true;
  error.value = "";
  results.value = [];
  const start = performance.now();

  try {
    const res = await fetch("http://localhost:3000/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query.value }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Query failed");
    }

    const data = await res.json();
    // Normalize data: data could be array of objects or status message
    if (Array.isArray(data)) {
      results.value = data;
    } else {
      // Handle non-select result provided as single object or specific structure
      results.value = [data];
    }
  } catch (e: any) {
    error.value = e.message;
  } finally {
    executionTime.value = Math.round(performance.now() - start);
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Toolbar -->
    <div
      class="px-4 py-2 border-b border-gray-200 bg-white flex items-center gap-2"
    >
      <button
        @click="executeQuery"
        :disabled="isLoading"
        class="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded shadow-sm hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
      >
        <Loader2 v-if="isLoading" class="w-3.5 h-3.5 animate-spin" />
        <Play v-else class="w-3.5 h-3.5 fill-current" />
        RUN
      </button>
      <button
        @click="query = ''"
        class="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
        title="Clear"
      >
        <Eraser class="w-4 h-4" />
      </button>
      <div class="w-px h-5 bg-gray-200 mx-2"></div>
      <span class="text-xs text-gray-500 font-mono"
        >Target: localhost:3306</span
      >
    </div>

    <!-- Editor & Results Split -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Code Editor Area -->
      <div
        class="flex-1 bg-[#1e1e1e] text-gray-300 font-mono text-sm relative overflow-hidden flex"
      >
        <!-- Line Numbers -->
        <div
          class="w-10 bg-[#252526] text-gray-500 text-right pr-3 pt-4 select-none leading-6 border-r border-[#333]"
        >
          <div v-for="i in 10" :key="i">{{ i }}</div>
        </div>
        <!-- Text Area -->
        <textarea
          v-model="query"
          class="flex-1 bg-transparent border-none outline-none resize-none p-4 leading-6 text-[#d4d4d4]"
          spellcheck="false"
          placeholder="Enter SQL Query here..."
        ></textarea>

        <!-- Floating status -->
        <div
          class="absolute bottom-2 right-4 text-[10px] text-gray-500 bg-[#252526] px-2 py-1 rounded border border-[#333]"
        >
          Ln 1, Col 1
        </div>
      </div>

      <!-- Result Panel -->
      <div
        class="h-1/2 flex flex-col bg-white border-t border-gray-300 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10"
      >
        <div
          class="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center"
        >
          <h3
            class="font-bold text-gray-700 text-xs uppercase flex items-center gap-2"
          >
            Query Result
            <span
              v-if="results.length"
              class="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[10px]"
            >
              {{ results.length }} rows
            </span>
          </h3>
          <div
            v-if="!isLoading && executionTime > 0"
            class="text-[10px] text-gray-500 font-medium"
          >
            <span :class="error ? 'text-red-600' : 'text-green-600'">
              {{ error ? "Failed" : "Success" }}
            </span>
            in {{ executionTime }}ms
          </div>
        </div>

        <div class="flex-1 overflow-auto relative bg-white">
          <!-- Error State -->
          <div
            v-if="error"
            class="p-4 text-red-600 font-mono text-xs bg-red-50 h-full"
          >
            ERROR: {{ error }}
          </div>

          <!-- Table Results -->
          <table
            v-else-if="results.length"
            class="w-full text-left text-xs border-collapse font-mono"
          >
            <thead
              class="bg-gray-100 sticky top-0 border-b border-gray-200 shadow-sm"
            >
              <tr>
                <th
                  class="px-4 py-2 text-gray-600 font-semibold w-12 text-center bg-gray-100"
                >
                  #
                </th>
                <th
                  v-for="(val, key) in results[0]"
                  :key="key"
                  class="px-4 py-2 text-gray-600 font-semibold border-r border-gray-200 last:border-0 bg-gray-100"
                >
                  {{ key }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(row, idx) in results"
                :key="idx"
                class="hover:bg-blue-50"
              >
                <td class="px-4 py-1.5 text-gray-400 text-center bg-gray-50/50">
                  {{ idx + 1 }}
                </td>
                <td
                  v-for="(val, key) in row"
                  :key="key"
                  class="px-4 py-1.5 text-gray-700 border-r border-gray-200 last:border-0 whitespace-pre-wrap truncate max-w-xs"
                >
                  {{ val }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div
            v-else-if="!isLoading"
            class="flex flex-col items-center justify-center h-full text-gray-400"
          >
            <Play class="w-8 h-8 mb-2 opacity-50" />
            <p class="text-sm">Run a query to see results</p>
          </div>

          <!-- Loading State -->
          <div
            v-if="isLoading"
            class="absolute inset-0 flex items-center justify-center bg-white/80 z-20"
          >
            <div class="flex flex-col items-center gap-2">
              <Loader2 class="w-8 h-8 text-blue-500 animate-spin" />
              <span class="text-xs font-semibold text-gray-500"
                >Executing Query...</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
