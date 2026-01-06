<script setup lang="ts">
import { ref } from "vue";
import {
  X,
  Plus,
  Server,
  Database,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Wifi,
} from "lucide-vue-next";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(["close", "connect"]);

// Mock Saved Connections
const connections = ref([
  {
    id: 1,
    name: "Local MySQL",
    host: "localhost",
    port: 3306,
    user: "root",
    type: "mysql",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Staging DB",
    host: "192.168.1.50",
    port: 3306,
    user: "admin",
    type: "mysql",
    color: "bg-orange-500",
  },
  {
    id: 3,
    name: "Production Read-Only",
    host: "aws-rds-001",
    port: 3306,
    user: "readonly",
    type: "mysql",
    color: "bg-red-500",
  },
]);

const selectedId = ref(1);
const isTesting = ref(false);
const testStatus = ref<"none" | "success" | "error">("none");

const activeConnection = ref({
  name: "Local MySQL",
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "draw_db",
});

const selectConn = (conn: any) => {
  selectedId.value = conn.id;
  activeConnection.value = { ...conn, password: "" }; // Don't store mock passwords
  testStatus.value = "none";
};

const createNew = () => {
  selectedId.value = -1;
  activeConnection.value = {
    name: "New Connection",
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "",
  };
  testStatus.value = "none";
};

const handleTest = () => {
  isTesting.value = true;
  testStatus.value = "none";
  setTimeout(() => {
    isTesting.value = false;
    testStatus.value = "success";
  }, 1200);
};

const handleConnect = () => {
  emit("connect", activeConnection.value);
  emit("close");
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-200"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden border border-gray-200 ring-1 ring-black/5 animate-in zoom-in-95 duration-200"
    >
      <!-- SIDEBAR: Connection List -->
      <div
        class="w-64 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0 text-white"
      >
        <div
          class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-100/50"
        >
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Saved Connections
          </h3>
          <button
            @click="createNew"
            class="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="New Connection"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <div
            v-for="conn in connections"
            :key="conn.id"
            @click="selectConn(conn)"
            class="px-3 py-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 border border-transparent"
            :class="
              selectedId === conn.id
                ? 'bg-white border-gray-200 shadow-sm'
                : 'hover:bg-gray-100 text-gray-600'
            "
          >
            <div
              class="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
              :class="conn.color"
            >
              {{ conn.type.substring(0, 2).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <div class="text-sm font-semibold text-gray-800 truncate">
                {{ conn.name }}
              </div>
              <div class="text-[10px] text-gray-500 truncate">
                {{ conn.user }}@{{ conn.host }}
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 mt-auto border-t border-gray-200 bg-gray-100/50">
          <button
            class="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 w-full justify-center"
          >
            <Server class="w-3.5 h-3.5" /> Manage Drivers
          </button>
        </div>
      </div>

      <!-- MAIN AREA: Form -->
      <div class="flex-1 flex flex-col bg-white">
        <!-- Header -->
        <div
          class="h-16 border-b border-gray-100 flex items-center justify-between px-8 shrink-0"
        >
          <div>
            <h2 class="text-xl font-bold text-gray-800">
              {{ activeConnection.name }}
            </h2>
            <p class="text-xs text-gray-400">Configure connection parameters</p>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Form Scroll -->
        <div class="flex-1 overflow-y-auto p-8">
          <div class="grid grid-cols-2 gap-6 max-w-2xl">
            <div class="col-span-2">
              <label
                class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                >Connection Name</label
              >
              <input
                v-model="activeConnection.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div class="col-span-2">
              <label
                class="block text-xs font-semibold text-gray-500 uppercase mb-2"
                >Database Type</label
              >
              <div class="flex gap-4">
                <label
                  class="flex items-center gap-2 p-3 border border-blue-500 bg-blue-50 rounded-lg cursor-pointer shadow-sm relative overflow-hidden"
                >
                  <div
                    class="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"
                  ></div>
                  <div
                    class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs"
                  >
                    MY
                  </div>
                  <span class="font-medium text-blue-900">MySQL</span>
                </label>
                <label
                  class="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 opacity-60"
                >
                  <div
                    class="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs"
                  >
                    PG
                  </div>
                  <span class="font-medium text-gray-700">PostgreSQL</span>
                </label>
                <label
                  class="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 opacity-60"
                >
                  <div
                    class="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-xs"
                  >
                    SQ
                  </div>
                  <span class="font-medium text-gray-700">SQLite</span>
                </label>
              </div>
            </div>

            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                >Host</label
              >
              <input
                v-model="activeConnection.host"
                type="text"
                placeholder="localhost"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono text-sm"
              />
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                >Port</label
              >
              <input
                v-model="activeConnection.port"
                type="number"
                placeholder="3306"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono text-sm"
              />
            </div>

            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                >Username</label
              >
              <input
                v-model="activeConnection.user"
                type="text"
                placeholder="root"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                >Password</label
              >
              <input
                v-model="activeConnection.password"
                type="password"
                placeholder="••••••••"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div class="col-span-2">
              <label
                class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                >Default Database</label
              >
              <input
                v-model="activeConnection.database"
                type="text"
                placeholder="draw_db"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          <!-- TEST RESULT -->
          <div
            v-if="testStatus !== 'none' || isTesting"
            class="mt-6 p-3 rounded-lg border flex items-center gap-3 transition-all"
            :class="
              testStatus === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : isTesting
                ? 'bg-gray-50 border-gray-200 text-gray-600'
                : 'bg-red-50 border-red-200 text-red-700'
            "
          >
            <div
              v-if="isTesting"
              class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            ></div>
            <CheckCircle2
              v-else-if="testStatus === 'success'"
              class="w-5 h-5"
            />
            <AlertCircle v-else class="w-5 h-5" />

            <span class="text-sm font-medium">
              {{
                isTesting
                  ? "Testing connection..."
                  : testStatus === "success"
                  ? "Detailed connection successful! Latency: 4ms"
                  : "Connection failed: Access denied for user"
              }}
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0"
        >
          <button
            @click="handleTest"
            class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-white hover:border-gray-400 transition-all shadow-sm"
          >
            Test Connection
          </button>
          <div class="flex gap-3">
            <button
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleConnect"
              class="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              <Wifi class="w-4 h-4" /> Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
