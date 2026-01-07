<script setup lang="ts">
import { ref, onMounted } from "vue";
import TreeNode from "../common/tree/TreeNode.vue";
import ConnectionModal from "../modals/ConnectionModal.vue";
import ContextMenu from "../ui/ContextMenu.vue";
import { useSchema } from "../../composables/useSchema";
import {
  Database,
  Folder,
  Table,
  Search,
  Activity,
  User,
  Settings,
  Plus,
  MoreVertical,
  RefreshCw,
  Trash2,
  Eye,
  Edit,
  AlertTriangle,
} from "lucide-vue-next";

const emit = defineEmits(["select-table", "navigate"]);

// State
const isConnectionModalOpen = ref(false);
const {
  databases,
  tables,
  currentDatabase,
  fetchDatabases,
  switchDatabase,
  fetchSchema,
} = useSchema();

// Context Menu State
const contextMenuVisible = ref(false);
const contextMenuPos = ref({ x: 0, y: 0 });
const contextMenuItems = ref<any[]>([]);
const contextTarget = ref<any>(null);

onMounted(() => {
  fetchDatabases();
});

// -- Logic: Left Click --

const handleDatabaseClick = async (dbName: string) => {
  if (currentDatabase.value !== dbName) {
    await switchDatabase(dbName);
  }
};

const handleTableClick = (tableName: string) => {
  emit("select-table", tableName);
};

// -- Logic: Right Click (Context Menu) --

const handleContextMenu = (
  e: MouseEvent,
  type: "database" | "table",
  data: any
) => {
  // TreeNode has already prevented default. e is the native MouseEvent.
  contextTarget.value = { type, data };
  contextMenuPos.value = { x: e.clientX, y: e.clientY };

  if (type === "database") {
    const isCurrent = currentDatabase.value === data;
    contextMenuItems.value = [
      {
        label: "Set as Active",
        action: "use_db",
        icon: Database,
        disabled: isCurrent,
      },
      { label: "New Table...", action: "create_table", icon: Plus },
      { label: "Rename Database", action: "rename_db", icon: Edit },
      { label: "Refresh", action: "refresh_db", icon: RefreshCw },
      { label: "Drop Database", action: "drop_db", danger: true, icon: Trash2 },
    ];
  } else if (type === "table") {
    contextMenuItems.value = [
      { label: "Browse Data", action: "view_data", icon: Eye },
      { label: "Design Structure", action: "design_table", icon: Edit },
      {
        label: "Truncate Table",
        action: "truncate_table",
        icon: AlertTriangle,
      },
      { label: "Drop Table", action: "drop_table", danger: true, icon: Trash2 },
    ];
  }

  contextMenuVisible.value = true;
};

const handleContextSelect = async (action: string) => {
  const target = contextTarget.value;
  console.log("Context Action:", action, target);

  // Database Actions
  if (action === "use_db") {
    await switchDatabase(target.data);
  } else if (action === "refresh_db") {
    if (target.data === currentDatabase.value) await fetchSchema();
    else alert(`To refresh ${target.data}, please switch to it first.`);
  } else if (action === "rename_db") {
    const newName = prompt("Enter new database name:", target.data);
    if (newName && newName !== target.data) {
      // Call rename API
      alert(`Renaming ${target.data} to ${newName} (Backend impl needed)`);
    }
  } else if (action === "drop_db") {
    if (
      confirm(
        `⚠️ WARNING: Drop database '${target.data}'?\nAll tables and data will be lost permanently!`
      )
    ) {
      alert("Delete request sent (Backend impl needed)");
    }
  }

  // Table Actions
  else if (action === "view_data") {
    emit("select-table", target.data);
  } else if (action === "drop_table") {
    if (confirm(`Drop table '${target.data}'?`)) {
      alert("Drop Table request sent (Backend impl needed)");
    }
  }

  contextMenuVisible.value = false;
};
</script>

<template>
  <aside
    class="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full select-none z-10 relative"
  >
    <!-- Header: Connection Manager -->
    <div
      class="h-12 flex items-center justify-between px-4 border-b border-gray-200 bg-white"
    >
      <div
        class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        @click="isConnectionModalOpen = true"
      >
        <div
          class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]"
        ></div>
        <span class="text-xs font-bold text-gray-700">localhost:3306</span>
      </div>
      <button
        class="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
      >
        <MoreVertical class="w-4 h-4" />
      </button>
    </div>

    <!-- Search / Filter -->
    <div class="px-3 py-2 border-b border-gray-200 bg-gray-50/50">
      <div class="relative">
        <Search
          class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search objects..."
          class="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded text-gray-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none transition-all"
        />
      </div>
      <div class="flex gap-2 mt-2 px-1">
        <button
          class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
        >
          All
        </button>
        <button
          class="text-[10px] font-medium text-gray-500 hover:text-gray-700 px-2 py-0.5"
        >
          Favorites
        </button>
      </div>
    </div>

    <!-- Object Explorer Tree -->
    <div class="flex-1 overflow-y-auto py-2">
      <!-- Database List -->
      <div v-for="db in databases" :key="db">
        <TreeNode
          :label="db"
          :has-children="true"
          :start-expanded="db === currentDatabase"
          @contextmenu="(e: MouseEvent) => handleContextMenu(e, 'database', db)"
          @click="handleDatabaseClick(db)"
        >
          <template #icon>
            <Database
              class="w-3.5 h-3.5 text-yellow-600"
              :class="{ 'fill-yellow-100': db === currentDatabase }"
            />
          </template>

          <!-- Tables inside active DB -->
          <div
            v-if="db === currentDatabase"
            class="ml-1 border-l border-gray-200/50"
          >
            <!-- Folder: Tables -->
            <TreeNode
              label="Tables"
              :has-children="true"
              :start-expanded="true"
            >
              <template #icon
                ><Folder class="w-3.5 h-3.5 text-blue-400 fill-blue-50"
              /></template>

              <TreeNode
                v-for="tbl in tables"
                :key="tbl.name"
                :label="tbl.name"
                @click.stop="handleTableClick(tbl.name)"
                @contextmenu.stop="(e: MouseEvent) => handleContextMenu(e, 'table', tbl.name)"
              >
                <template #icon
                  ><Table class="w-3.5 h-3.5 text-blue-500"
                /></template>
              </TreeNode>

              <div
                v-if="tables.length === 0"
                class="pl-9 py-1 text-[10px] text-gray-400 italic"
              >
                (Empty)
              </div>
            </TreeNode>

            <!-- Folder: Views (Placeholder) -->
            <TreeNode label="Views" :has-children="false">
              <template #icon
                ><Eye class="w-3.5 h-3.5 text-purple-400"
              /></template>
            </TreeNode>
          </div>
        </TreeNode>
      </div>

      <!-- If no databases found -->
      <div v-if="databases.length === 0" class="px-6 py-4 text-center">
        <p class="text-xs text-gray-400 mb-2">No connection</p>
        <button
          @click="fetchDatabases"
          class="px-3 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 shadow-sm hover:text-blue-600"
        >
          <RefreshCw class="w-3 h-3 inline mr-1" /> Retry
        </button>
      </div>
    </div>

    <!-- System Admin Section (Fixed Bottom) -->
    <div class="mt-auto border-t mb-10 border-gray-200 bg-white">
      <div
        class="px-3 py-2 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
      >
        Administration
      </div>

      <div class="p-1 space-y-0.5">
        <button
          @click="$emit('navigate', 'admin-users')"
          class="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors group"
        >
          <User
            class="w-4 h-4 text-gray-400 group-hover:text-blue-500 relative z-10"
          />
          Users & Privileges
        </button>
        <button
          @click="$emit('navigate', 'admin-status')"
          class="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors group"
        >
          <Activity class="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
          Server Status
        </button>
        <button
          @click="$emit('navigate', 'admin-variables')"
          class="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors group"
        >
          <Settings class="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
          Variables
        </button>
      </div>
    </div>

    <!-- Modals & Menus -->
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
      @select="handleContextSelect"
    />
  </aside>
</template>
