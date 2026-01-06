<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import {
  X,
  RefreshCw,
  Plus,
} from "lucide-vue-next";

const props = defineProps<{
  isOpen: boolean;
  tableName?: string;
}>();

const emit = defineEmits(["close"]);

const drawerHeight = ref(24); // Default Height (Collapsed)
const isDragging = ref(false);
const activeTab = ref("stats"); // Default to Statistics

const toggleTab = (tab: string) => {
  activeTab.value = tab;
};

watch(
  () => props.isOpen,
  (newVal: boolean) => {
    if (newVal) {
      drawerHeight.value = 300; // Auto Expand
    } else {
      drawerHeight.value = 24; // Collapse
    }
  }
);

// Mock Data
const columns = ref(["id", "username", "email", "status", "created_at"]);
const rows = ref([
  {
    id: 1,
    username: "admin",
    email: "admin@drawdb.com",
    status: "active",
    created_at: "2024-01-01 10:00:00",
  },
  {
    id: 2,
    username: "john_doe",
    email: "john@gmail.com",
    status: "inactive",
    created_at: "2024-01-02 11:30:00",
  },
  {
    id: 3,
    username: "jane_smith",
    email: "jane@yahoo.com",
    status: "active",
    created_at: "2024-01-03 09:15:00",
  },
  {
    id: 4,
    username: "guest_01",
    email: "guest@temp.com",
    status: "pending",
    created_at: "2024-01-04 14:20:00",
  },
]);

const startDrag = (e: MouseEvent) => {
  isDragging.value = true;
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
  document.body.style.userSelect = "none";
  document.body.style.cursor = "row-resize";
};

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return;
  const newHeight = window.innerHeight - e.clientY;
  // Limit Constraints
  if (newHeight >= 20 && newHeight < window.innerHeight - 100) {
    drawerHeight.value = newHeight;
  }
  // Snap to collapse
  if (newHeight < 100) {
    drawerHeight.value = 24; // Handle height only
  }
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
};

onUnmounted(() => {
  stopDrag();
});
</script>

<template>
  <div
    class="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-40 flex flex-col transition-none"
    :style="{ height: drawerHeight + 'px' }"
  >
    <!-- DRAG HANDLE (Always Visible) -->
    <div
      @mousedown="startDrag"
      class="w-full h-4 bg-gray-100 hover:bg-blue-50 border-t border-gray-300 cursor-row-resize flex justify-center items-center group shrink-0"
    >
      <div
        class="w-16 h-1 rounded-full bg-gray-400 group-hover:bg-blue-500"
      ></div>
    </div>

    <!-- MAIN CONTENT (Hidden when collapsed) -->
    <div
      v-show="drawerHeight > 40"
      class="flex-1 flex flex-col overflow-hidden"
    >
      <!-- Toolbar & Tabs -->
      <div
        class="flex items-center justify-between px-4 py-1 border-b border-gray-200 bg-gray-50 shrink-0"
      >
        <div class="flex items-center gap-4">
          <!-- Tabs Switcher -->
          <div
            class="flex bg-gray-200 p-0.5 rounded-lg text-[10px] font-medium"
          >
            <button
              @click="toggleTab('stats')"
              class="px-3 py-1 rounded shadow-sm transition-all"
              :class="
                activeTab === 'stats'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              "
            >
              Statistics
            </button>
            <button
              @click="toggleTab('grid')"
              class="px-3 py-1 rounded shadow-sm transition-all"
              :class="
                activeTab === 'grid'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              "
            >
              Data Grid
            </button>
          </div>

          <div class="w-px h-4 bg-gray-300 mx-2"></div>

          <h3 class="font-bold text-gray-800 flex items-center gap-2 text-xs">
            <span class="text-blue-600">Table:</span>
            {{ tableName || "Select a Table" }}
          </h3>
        </div>

        <!-- Tools -->
        <div class="flex items-center gap-1">
          <button class="p-1 hover:bg-gray-200 rounded">
            <RefreshCw class="w-3.5 h-3.5 text-gray-600" />
          </button>
          <button class="p-1 hover:bg-gray-200 rounded">
            <Plus class="w-3.5 h-3.5 text-gray-600" />
          </button>
          <button
            @click="$emit('close')"
            class="ml-2 hover:bg-red-100 p-1 rounded text-red-500"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- CONTENT: STATISTICS VIEW (Developer Command Center) -->
      <div
        v-if="activeTab === 'stats'"
        class="flex-1 overflow-auto bg-gray-50 p-4"
      >
        <div class="max-w-7xl mx-auto space-y-4">
          <!-- ROW 1: KPI CARDS (Critical Metrics) -->
          <div class="grid grid-cols-4 gap-4">
            <div
              class="bg-white p-3 rounded border border-gray-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <div
                  class="text-[10px] text-gray-500 uppercase font-bold tracking-wider"
                >
                  Active Connections
                </div>
                <div class="text-2xl font-bold text-gray-800 mt-1">42</div>
              </div>
              <div
                class="h-8 w-16 bg-blue-50 rounded flex items-center justify-center text-blue-600 font-bold text-xs"
              >
                <div
                  class="w-2 h-2 rounded-full bg-blue-500 mr-1 animate-pulse"
                ></div>
                Live
              </div>
            </div>
            <div
              class="bg-white p-3 rounded border border-gray-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <div
                  class="text-[10px] text-gray-500 uppercase font-bold tracking-wider"
                >
                  Queries / Sec
                </div>
                <div class="text-2xl font-bold text-gray-800 mt-1">1,204</div>
              </div>
              <div
                class="text-xs text-green-600 font-medium flex flex-col items-end"
              >
                <span>▲ 12%</span>
                <span class="text-[9px] text-gray-400">vs avg</span>
              </div>
            </div>
            <div
              class="bg-white p-3 rounded border border-gray-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <div
                  class="text-[10px] text-gray-500 uppercase font-bold tracking-wider"
                >
                  Slow Queries
                </div>
                <div class="text-2xl font-bold text-orange-600 mt-1">3</div>
              </div>
              <div
                class="text-[9px] text-orange-500 bg-orange-50 px-2 py-1 rounded border border-orange-100"
              >
                > 500ms
              </div>
            </div>
            <div
              class="bg-white p-3 rounded border border-gray-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <div
                  class="text-[10px] text-gray-500 uppercase font-bold tracking-wider"
                >
                  Cache Hit Ratio
                </div>
                <div class="text-2xl font-bold text-gray-800 mt-1">
                  94.5<span class="text-sm text-gray-400">%</span>
                </div>
              </div>
              <!-- Mini Pie -->
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                class="transform -rotate-90"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="#f3f4f6"
                  stroke-width="4"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="#10b981"
                  stroke-width="4"
                  stroke-dasharray="88 100"
                />
              </svg>
            </div>
          </div>

          <!-- ROW 2: Performance Charts -->
          <div class="grid grid-cols-3 gap-4 h-64">
            <!-- Column 1: Query Latency Distribution (Main Chart) -->
            <div
              class="col-span-2 bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h4
                    class="font-bold text-gray-700 text-xs uppercase tracking-wider"
                  >
                    Server Latency (Last 1h)
                  </h4>
                  <p class="text-[10px] text-gray-400 mt-0.5">
                    Average response time per query type
                  </p>
                </div>
                <div class="flex gap-2">
                  <span class="flex items-center text-[9px] text-gray-500"
                    ><div class="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                    SELECT</span
                  >
                  <span class="flex items-center text-[9px] text-gray-500"
                    ><div class="w-2 h-2 rounded-full bg-purple-500 mr-1"></div>
                    INSERT</span
                  >
                  <span class="flex items-center text-[9px] text-gray-500"
                    ><div class="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>
                    UPDATE</span
                  >
                </div>
              </div>
              <!-- Stacked Area Chart Simulation -->
              <div class="flex-1 relative overflow-hidden flex items-end gap-1">
                <div
                  v-for="i in 40"
                  :key="i"
                  class="flex-1 flex flex-col gap-[1px] h-full justify-end opacity-80 hover:opacity-100 transition-opacity cursor-crosshair group"
                >
                  <div
                    class="bg-orange-400 rounded-sm w-full transition-all duration-300 group-hover:bg-orange-500"
                    :style="{ height: Math.random() * 20 + '%' }"
                  ></div>
                  <div
                    class="bg-purple-400 rounded-sm w-full transition-all duration-300 group-hover:bg-purple-500"
                    :style="{ height: Math.random() * 30 + '%' }"
                  ></div>
                  <div
                    class="bg-blue-400 rounded-sm w-full transition-all duration-300 group-hover:bg-blue-500"
                    :style="{ height: Math.random() * 40 + 20 + '%' }"
                  ></div>
                </div>
                <!-- Grid Lines -->
                <div
                  class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20"
                >
                  <div class="w-full h-px bg-gray-500"></div>
                  <div class="w-full h-px bg-gray-500"></div>
                  <div class="w-full h-px bg-gray-500"></div>
                  <div class="w-full h-px bg-gray-500"></div>
                </div>
              </div>
            </div>

            <!-- Column 2: Storage Anatomy -->
            <div
              class="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col"
            >
              <h4
                class="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2"
              >
                Internal Structure
              </h4>
              <div class="flex-1 flex flex-col justify-center items-center">
                <!-- Visual: Data vs Index -->
                <div class="w-32 h-32 relative">
                  <div
                    class="absolute inset-0 rounded-full border-8 border-indigo-100"
                  ></div>
                  <div
                    class="absolute inset-0 rounded-full border-8 border-indigo-500 border-t-transparent -rotate-45"
                    style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                  ></div>
                  <div
                    class="absolute inset-0 flex items-center justify-center flex-col"
                  >
                    <span class="text-2xl font-bold text-gray-700"
                      >1.4<span class="text-xs">GB</span></span
                    >
                    <span class="text-[9px] text-gray-400">Total Size</span>
                  </div>
                </div>
                <div class="w-full mt-4 space-y-2">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-500 flex items-center"
                      ><div class="w-2 h-2 bg-indigo-500 rounded-sm mr-2"></div>
                      Table Data</span
                    >
                    <span class="font-bold text-gray-700">850 MB</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-500 flex items-center"
                      ><div class="w-2 h-2 bg-indigo-200 rounded-sm mr-2"></div>
                      Index Data</span
                    >
                    <span class="font-bold text-gray-700">550 MB</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-500 flex items-center"
                      ><div class="w-2 h-2 bg-gray-200 rounded-sm mr-2"></div>
                      Overhead</span
                    >
                    <span class="font-bold text-gray-700">24 MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ROW 3: DETAILED TABLES -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Panel Left: Recent Slow Queries -->
            <div class="bg-white p-4 rounded border border-gray-200 shadow-sm">
              <h4
                class="font-bold text-gray-700 text-xs uppercase tracking-wider mb-3 flex justify-between"
              >
                Recent Slow Queries
                <button class="text-blue-600 hover:text-blue-800 text-[10px]">
                  View Logs
                </button>
              </h4>
              <div
                class="overflow-hidden bg-gray-50 rounded border border-gray-100"
              >
                <table class="w-full text-left text-[10px]">
                  <thead
                    class="bg-gray-100 text-gray-500 font-semibold border-b border-gray-200"
                  >
                    <tr>
                      <th class="px-2 py-1.5">Duration</th>
                      <th class="px-2 py-1.5">Query Snippet</th>
                      <th class="px-2 py-1.5">Time</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr class="hover:bg-white transition-colors cursor-pointer">
                      <td class="px-2 py-1.5 text-red-600 font-bold">1.2s</td>
                      <td
                        class="px-2 py-1.5 font-mono text-gray-600 truncate max-w-[150px]"
                      >
                        SELECT * FROM orders WHERE...
                      </td>
                      <td class="px-2 py-1.5 text-gray-400">10:42:01</td>
                    </tr>
                    <tr class="hover:bg-white transition-colors cursor-pointer">
                      <td class="px-2 py-1.5 text-orange-500 font-bold">
                        0.8s
                      </td>
                      <td
                        class="px-2 py-1.5 font-mono text-gray-600 truncate max-w-[150px]"
                      >
                        UPDATE users SET status...
                      </td>
                      <td class="px-2 py-1.5 text-gray-400">10:41:55</td>
                    </tr>
                    <tr class="hover:bg-white transition-colors cursor-pointer">
                      <td class="px-2 py-1.5 text-orange-500 font-bold">
                        0.6s
                      </td>
                      <td
                        class="px-2 py-1.5 font-mono text-gray-600 truncate max-w-[150px]"
                      >
                        SELECT count(*) FROM logs...
                      </td>
                      <td class="px-2 py-1.5 text-gray-400">10:38:12</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Panel Right: Table Density -->
            <div class="bg-white p-4 rounded border border-gray-200 shadow-sm">
              <h4
                class="font-bold text-gray-700 text-xs uppercase tracking-wider mb-3"
              >
                Top Tables by Density (Row/Size)
              </h4>
              <div class="space-y-3">
                <div
                  v-for="(t, i) in [
                    { n: 'orders', p: 95 },
                    { n: 'audit_logs', p: 70 },
                    { n: 'users', p: 40 },
                  ]"
                  :key="i"
                >
                  <div class="flex justify-between text-[10px] mb-1">
                    <span class="font-medium text-gray-700">{{ t.n }}</span>
                    <span class="text-gray-500">{{ t.p }}% full</span>
                  </div>
                  <div
                    class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                      :style="{ width: t.p + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CONTENT: GRID VIEW -->
      <div
        v-if="activeTab === 'grid'"
        class="flex-1 overflow-auto bg-white relative"
      >
        <table class="w-full text-sm text-left border-collapse">
          <thead
            class="bg-gray-50 text-gray-600 font-semibold sticky top-0 z-10 shadow-sm"
          >
            <tr>
              <th class="w-10 px-4 py-2 border-b border-gray-200 text-center">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-0"
                />
              </th>
              <th
                v-for="col in columns"
                :key="col"
                class="px-4 py-2 border-b border-r border-gray-100 whitespace-nowrap group cursor-pointer hover:bg-gray-100"
              >
                <div class="flex items-center justify-between gap-2">
                  <span>{{ col }}</span>
                  <span
                    class="text-[10px] bg-gray-200 text-gray-500 px-1 rounded"
                    >VARCHAR</span
                  >
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="row in rows"
              :key="row.id"
              class="hover:bg-blue-50 transition-colors"
            >
              <td class="px-4 py-2 text-center bg-gray-50/50">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-0"
                />
              </td>
              <td
                v-for="col in columns"
                :key="col"
                class="px-4 py-1.5 border-r border-gray-50 whitespace-nowrap font-mono text-gray-700"
              >
                {{ (row as any)[col] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div
        class="px-4 py-1 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-[10px] text-gray-600 shrink-0"
      >
        <div>1,204 rows • 15ms query</div>
        <div>Page 1 of 50</div>
      </div>
    </div>
  </div>
</template>
