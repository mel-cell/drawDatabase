<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import ConnectionModal from "../modals/ConnectionModal.vue";
import ContextMenu from "../ui/ContextMenu.vue";
import { useSchema } from "../../composables/useSchema";
import { useConnection } from "../../composables/useConnection";
import { useToast } from "../../composables/useToast";
import {
  Database,
  Table as TableIcon,
  Search,
  Activity,
  User,
  Settings,
  Plus,
  RefreshCw,
  Trash2,
  ChevronRight,
  DatabaseZap,
  Check,
  X,
} from "lucide-vue-next";

const emit = defineEmits(["select-table", "navigate", "select-database"]);

// --- COMPOSABLES ---
const {
  databases,
  tables,
  currentDatabase,
  fetchDatabases,
  switchDatabase,
  createDatabase,
  deleteDatabase,
} = useSchema();
const { activeConnection, fetchConnections } = useConnection();
const toast = useToast();

// --- STATE ---
const isConnectionModalOpen = ref(false);
const searchQuery = ref("");

// Context Menu
const contextMenuVisible = ref(false);
const contextMenuPos = ref({ x: 0, y: 0 });
const contextMenuItems = ref<any[]>([]);
const contextTarget = ref<any>(null);

// Create DB inline
const isCreatingDb = ref(false);
const newDbName = ref("");

// --- COMPUTED ---
const filteredDatabases = computed(() => {
  if (!searchQuery.value) return databases.value;
  return databases.value.filter((db: string) =>
    db.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

// --- LIFECYCLE ---
onMounted(() => {
  fetchConnections();
  fetchDatabases();
});

// --- ACTIONS ---
const handleCreateDb = async () => {
  if (isCreatingDb.value) {
    if (newDbName.value.trim()) {
      const success = await createDatabase(newDbName.value.trim());
      if (success) {
        toast.success("Database Created", `'${newDbName.value}' is ready`);
        newDbName.value = "";
        isCreatingDb.value = false;
      } else {
        toast.error("Failed to create database");
      }
    }
  } else {
    isCreatingDb.value = true;
  }
};

const cancelCreateDb = () => {
  isCreatingDb.value = false;
  newDbName.value = "";
};

const handleDatabaseClick = async (dbName: string) => {
  if (currentDatabase.value !== dbName) {
    await switchDatabase(dbName);
  }
  emit("select-database", dbName);
};

const handleContextAction = async (action: string) => {
  const target = contextTarget.value;
  if (action === "drop_db") {
    const success = await deleteDatabase(target.data);
    if (success) {
      toast.warning("Database Dropped", `'${target.data}' has been removed`);
    }
  } else if (action === "refresh") {
    await fetchDatabases();
    toast.info("Refreshed", "Database list updated");
  }
  contextMenuVisible.value = false;
};

const openContextMenu = (e: MouseEvent, type: string, data: any) => {
  contextTarget.value = { type, data };
  contextMenuPos.value = { x: e.clientX, y: e.clientY };

  if (type === "database") {
    contextMenuItems.value = [
      { label: "Refresh Data", action: "refresh", icon: RefreshCw },
      { type: "divider" },
      { label: "Drop Database", action: "drop_db", danger: true, icon: Trash2 },
    ];
  }
  contextMenuVisible.value = true;
};
</script>

<template>
  <aside
    class="w-72 bg-white border-r border-gray-200 flex flex-col h-full select-none z-10 relative shadow-sm"
  >
    <!-- Connection Header -->
    <div
      class="h-14 flex items-center justify-between px-5 bg-gray-50/50 border-b border-gray-200"
    >
      <div
        @click="isConnectionModalOpen = true"
        class="flex items-center gap-3 cursor-pointer group"
      >
        <div
          class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"
        ></div>
        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Connection</span>
          <span class="text-xs font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
            {{ activeConnection?.name || 'Local MySQL' }}
          </span>
        </div>
      </div>
      <button
        @click="handleCreateDb"
        class="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
        title="New Database"
      >
        <Plus class="w-4 h-4" />
      </button>
    </div>

    <!-- Create DB Inline -->
    <div v-if="isCreatingDb" class="px-4 pt-3 pb-2">
      <div class="flex items-center gap-2">
        <input
          v-model="newDbName"
          type="text"
          placeholder="database_name"
          class="flex-1 px-3 py-2 text-xs bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none"
          @keydown.enter="handleCreateDb"
          @keydown.escape="cancelCreateDb"
          autofocus
        />
        <button @click="handleCreateDb" class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
          <Check class="w-4 h-4" />
        </button>
        <button @click="cancelCreateDb" class="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Search Box -->
    <div class="p-4">
      <div class="relative group">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter databases..."
          class="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
        />
      </div>
    </div>

    <!-- DB Explorer -->
    <div class="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin">
      <div v-for="db in filteredDatabases" :key="db" class="group/db">
        <div
          @click="handleDatabaseClick(db)"
          @contextmenu.prevent="openContextMenu($event, 'database', db)"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border border-transparent"
          :class="
            db === currentDatabase
              ? 'bg-blue-50 border-blue-100'
              : 'hover:bg-gray-50'
          "
        >
          <div
            class="p-1.5 rounded-lg"
            :class="
              db === currentDatabase
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-400 group-hover/db:bg-gray-200'
            "
          >
            <Database class="w-4 h-4" />
          </div>
          <div class="flex-1 flex flex-col min-w-0">
            <span
              class="text-xs font-bold truncate"
              :class="
                db === currentDatabase ? 'text-blue-700' : 'text-gray-700'
              "
              >{{ db }}</span
            >
            <span
              v-if="db === currentDatabase"
              class="text-[9px] text-blue-400 font-bold uppercase tracking-widest"
              >Active</span
            >
          </div>
          <ChevronRight
            class="w-3.5 h-3.5 text-gray-300 transition-transform"
            :class="{ 'rotate-90 text-blue-400': db === currentDatabase }"
          />
        </div>

        <!-- Tables List (Active DB Only) -->
        <transition name="slide-down">
          <div
            v-if="db === currentDatabase"
            class="ml-9 mt-1 mb-2 space-y-0.5 border-l-2 border-blue-100 pl-3"
          >
            <div
              v-for="tbl in tables"
              :key="tbl.name"
              @click.stop="$emit('select-table', tbl.name)"
              class="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 text-[11px] text-gray-600 cursor-pointer group/tbl"
            >
              <TableIcon
                class="w-3.5 h-3.5 text-gray-400 group-hover/tbl:text-blue-500"
              />
              <span
                class="truncate group-hover/tbl:text-blue-700 transition-colors"
                >{{ tbl.name }}</span
              >
            </div>
            <div
              v-if="tables.length === 0"
              class="py-2 text-[10px] text-gray-400 italic"
            >
              No tables found
            </div>
          </div>
        </transition>
      </div>

      <!-- No Results -->
      <div
        v-if="filteredDatabases.length === 0"
        class="py-12 flex flex-col items-center justify-center opacity-40 grayscale"
      >
        <DatabaseZap class="w-12 h-12 mb-3" />
        <p class="text-xs font-bold uppercase tracking-widest text-gray-500 text-center">
          No Databases Found
        </p>
      </div>
    </div>

    <!-- Admin Tools Bottom -->
    <div class="p-4 border-t border-gray-100 bg-gray-50/30">
      <div class="flex items-center gap-4 px-2 py-1">
        <button
          @click="$emit('navigate', 'admin-users')"
          class="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm"
        >
          <User class="w-4 h-4" />
        </button>
        <button
          @click="$emit('navigate', 'admin-status')"
          class="p-2 text-gray-400 hover:text-amber-600 hover:bg-white rounded-xl transition-all shadow-sm"
        >
          <Activity class="w-4 h-4" />
        </button>
        <button
          @click="$emit('navigate', 'admin-variables')"
          class="p-2 text-gray-400 hover:text-purple-600 hover:bg-white rounded-xl transition-all shadow-sm"
        >
          <Settings class="w-4 h-4" />
        </button>
        <div class="flex-1"></div>
        <button
          @click="fetchDatabases"
          class="p-2 text-gray-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-all shadow-sm"
        >
          <RefreshCw class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Modals -->
    <ConnectionModal
      :is-open="isConnectionModalOpen"
      @close="isConnectionModalOpen = false"
    />
    <ContextMenu
      v-if="contextMenuVisible"
      :x="contextMenuPos.x"
      :y="contextMenuPos.y"
      :items="contextMenuItems"
      @close="contextMenuVisible = false"
      @select="handleContextAction"
    />
  </aside>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
