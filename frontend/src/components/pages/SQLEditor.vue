<script setup lang="ts">
import { ref } from "vue";
import { Play, Eraser, Download, Copy, Check } from "lucide-vue-next";

const query = ref(`SELECT u.id, u.username, COUNT(o.id) as order_count 
FROM users u 
LEFT JOIN orders o ON u.id = o.user_id 
GROUP BY u.id 
HAVING order_count > 5;`);

const results = ref<any[]>([]);
const isLoading = ref(false);
const executionTime = ref(0);

// Mock Execution
const executeQuery = () => {
  isLoading.value = true;
  const start = performance.now();

  setTimeout(() => {
    results.value = [
      { id: 101, username: "dev_mellow", order_count: 12 },
      { id: 145, username: "super_admin", order_count: 45 },
      { id: 202, username: "test_user_01", order_count: 8 },
    ];
    executionTime.value = Math.round(performance.now() - start);
    isLoading.value = false;
  }, 600);
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
        class="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded shadow-sm hover:bg-green-700 active:scale-95 transition-all"
      >
        <Play class="w-3.5 h-3.5 fill-current" /> RUN
      </button>
      <button
        class="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
        title="Clear"
      >
        <Eraser class="w-4 h-4" />
      </button>
      <div class="w-px h-5 bg-gray-200 mx-2"></div>
      <span class="text-xs text-gray-500 font-mono"
        >Target: localhost:3306 / draw_db</span
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
              >{{ results.length }} rows</span
            >
          </h3>
          <div
            v-if="!isLoading && results.length"
            class="text-[10px] text-green-600 font-medium"
          >
            Success in {{ executionTime }}ms
          </div>
        </div>

        <div class="flex-1 overflow-auto relative">
          <div
            v-if="isLoading"
            class="absolute inset-0 flex items-center justify-center bg-white/80 z-20"
          >
            <div
              class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
            ></div>
          </div>

          <table
            v-if="results.length"
            class="w-full text-left text-xs border-collapse font-mono"
          >
            <thead class="bg-gray-100 sticky top-0 border-b border-gray-200">
              <tr>
                <th
                  class="px-4 py-2 text-gray-600 font-semibold w-12 text-center"
                >
                  #
                </th>
                <th
                  v-for="(val, key) in results[0]"
                  :key="key"
                  class="px-4 py-2 text-gray-600 font-semibold border-r border-gray-200 last:border-0"
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
                  class="px-4 py-1.5 text-gray-700 border-r border-gray-200 last:border-0"
                >
                  {{ val }}
                </td>
              </tr>
            </tbody>
          </table>

          <div
            v-else-if="!isLoading"
            class="flex flex-col items-center justify-center h-full text-gray-400"
          >
            <Play class="w-8 h-8 mb-2 opacity-50" />
            <p class="text-sm">Run a query to see results</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
