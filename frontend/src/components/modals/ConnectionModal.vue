<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useConnection } from "../../composables/useConnection";
import { useToast } from "../../composables/useToast";
import {
  X,
  Plus,
  Server,
  Database,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Loader2,
} from "lucide-vue-next";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(["close", "connect"]);

const { connections, fetchConnections, saveConnection, testConnection, deleteConnection } = useConnection();
const toast = useToast();

const selectedIndex = ref(0);
const isTesting = ref(false);
const isSaving = ref(false);
const testStatus = ref<"none" | "success" | "error">("none");

// Form state (editable copy)
const form = ref({
  name: "Local MySQL",
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "",
  database: "",
});

// Load connections when modal opens
watch(() => props.isOpen, async (open) => {
  if (open) {
    await fetchConnections();
    if (connections.value.length > 0) {
      selectConn(0);
    }
  }
});

const selectConn = (idx: number) => {
  selectedIndex.value = idx;
  const conn = connections.value[idx];
  if (conn) {
    form.value = {
      name: conn.name || "",
      host: conn.host || "127.0.0.1",
      port: conn.port || 3306,
      user: conn.user || "root",
      password: "",
      database: conn.database || "",
    };
  }
  testStatus.value = "none";
};

const createNew = () => {
  selectedIndex.value = -1;
  form.value = {
    name: "New Connection",
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "",
  };
  testStatus.value = "none";
};

const handleTest = async () => {
  isTesting.value = true;
  testStatus.value = "none";
  const ok = await testConnection(form.value as any);
  isTesting.value = false;
  testStatus.value = ok ? "success" : "error";
};

const handleSave = async () => {
  isSaving.value = true;
  const ok = await saveConnection(form.value as any);
  isSaving.value = false;
  if (ok) {
    await fetchConnections();
    // Select the saved one
    const idx = connections.value.findIndex((c: any) => c.name === form.value.name);
    if (idx >= 0) selectedIndex.value = idx;
  }
};

const handleDelete = async (name: string) => {
  await deleteConnection(name);
  await fetchConnections();
  if (connections.value.length > 0) {
    selectConn(0);
  } else {
    createNew();
  }
};

const handleConnect = async () => {
  // Save first, then close
  await handleSave();
  emit("connect", form.value);
  emit("close");
  toast.success("Connected", `Using ${form.value.name}`);
};

const connColors = ["bg-blue-500", "bg-orange-500", "bg-red-500", "bg-emerald-500", "bg-purple-500", "bg-cyan-500"];
const getColor = (idx: number) => connColors[idx % connColors.length];
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden border border-gray-200"
    >
      <!-- SIDEBAR: Connection List -->
      <div class="w-64 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Saved Connections
          </h3>
          <button
            @click="createNew"
            class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="New Connection"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <div
            v-for="(conn, idx) in connections"
            :key="conn.name"
            @click="selectConn(idx)"
            class="px-3 py-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 border border-transparent group"
            :class="
              selectedIndex === idx
                ? 'bg-white border-gray-200 shadow-sm'
                : 'hover:bg-gray-100'
            "
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shrink-0"
              :class="getColor(idx)"
            >
              MY
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-gray-800 truncate">
                {{ conn.name }}
              </div>
              <div class="text-[10px] text-gray-500 truncate">
                {{ conn.user }}@{{ conn.host }}
              </div>
            </div>
            <button
              @click.stop="handleDelete(conn.name)"
              class="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- New connection placeholder -->
          <div
            v-if="selectedIndex === -1"
            class="px-3 py-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3"
          >
            <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500">
              <Plus class="w-4 h-4" />
            </div>
            <div class="text-sm font-semibold text-blue-700">New Connection</div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-200">
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
        <div class="h-16 border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 class="text-xl font-bold text-gray-800">
              {{ form.name }}
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
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Connection Name</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
              />
            </div>

            <div class="col-span-2">
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-2">Database Type</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 p-3 border border-blue-500 bg-blue-50 rounded-lg cursor-pointer shadow-sm">
                  <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                    <Database class="w-4 h-4" />
                  </div>
                  <span class="font-medium text-blue-900 text-sm">MySQL</span>
                </label>
                <label class="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-not-allowed opacity-40">
                  <div class="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs">PG</div>
                  <span class="font-medium text-gray-700 text-sm">PostgreSQL</span>
                </label>
                <label class="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-not-allowed opacity-40">
                  <div class="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-xs">SQ</div>
                  <span class="font-medium text-gray-700 text-sm">SQLite</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Host</label>
              <input
                v-model="form.host"
                type="text"
                placeholder="127.0.0.1"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Port</label>
              <input
                v-model="form.port"
                type="number"
                placeholder="3306"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono text-sm"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Username</label>
              <input
                v-model="form.user"
                type="text"
                placeholder="root"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Password</label>
              <input
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
              />
            </div>

            <div class="col-span-2">
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Default Database (optional)</label>
              <input
                v-model="form.database"
                type="text"
                placeholder="draw_db"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <!-- TEST RESULT -->
          <div
            v-if="testStatus !== 'none' || isTesting"
            class="mt-6 p-3 rounded-lg border flex items-center gap-3 transition-all max-w-2xl"
            :class="
              testStatus === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : isTesting
                ? 'bg-gray-50 border-gray-200 text-gray-600'
                : 'bg-red-50 border-red-200 text-red-700'
            "
          >
            <Loader2 v-if="isTesting" class="w-4 h-4 animate-spin" />
            <CheckCircle2 v-else-if="testStatus === 'success'" class="w-5 h-5" />
            <AlertCircle v-else class="w-5 h-5" />
            <span class="text-sm font-medium">
              {{ isTesting ? "Testing connection..." : testStatus === "success" ? "Connection successful!" : "Connection failed" }}
            </span>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-8 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
          <div class="flex gap-2">
            <button
              @click="handleTest"
              :disabled="isTesting"
              class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-white hover:border-gray-400 transition-all shadow-sm disabled:opacity-50"
            >
              {{ isTesting ? "Testing..." : "Test Connection" }}
            </button>
            <button
              @click="handleSave"
              :disabled="isSaving"
              class="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50"
            >
              {{ isSaving ? "Saving..." : "Save" }}
            </button>
          </div>
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
