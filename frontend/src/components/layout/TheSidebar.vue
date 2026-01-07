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

const emit = defineEmits(["select-table", "navigate", "select-database"]);

// State
const isConnectionModalOpen = ref(false);
const activeFilter = ref("all");
const favorites = ref<Set<string>>(new Set());
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

// Load Favorites
onMounted(() => {
  fetchDatabases();
  const saved = localStorage.getItem("drawdb_favorites");
  if (saved) {
    try {
      favorites.value = new Set(JSON.parse(saved));
    } catch (e) {}
  }
});

const toggleFavorite = (dbName: string) => {
  if (favorites.value.has(dbName)) favorites.value.delete(dbName);
  else favorites.value.add(dbName);
  localStorage.setItem(
    "drawdb_favorites",
    JSON.stringify([...favorites.value])
  );
};

// ... (Left Click Logic)

const handleDatabaseClick = async (dbName: string) => {
  if (currentDatabase.value !== dbName) {
    await switchDatabase(dbName);
  }
  emit("select-database", dbName);
};

const handleTableClick = (tableName: string) => {
  emit("select-table", tableName);
};

// ... (Right Click Logic)

const handleContextMenu = (
  e: MouseEvent,
  type: "database" | "table" | "folder-table",
  data: any
) => {
  contextTarget.value = { type, data };
  contextMenuPos.value = { x: e.clientX, y: e.clientY };

  if (type === "database") {
    const isCurrent = currentDatabase.value === data;
    const isFav = favorites.value.has(data);

    contextMenuItems.value = [
      {
        label: "Set as Active",
        action: "use_db",
        icon: Database,
        disabled: isCurrent,
      },
      {
        label: isFav ? "Remove from Favorites" : "Add to Favorites",
        action: "toggle_fav",
        icon: isFav ? Trash2 : Folder, // Or Star icon if imported
      },
      { type: "divider" },
      {
        label: "New Table...",
        action: "create_table",
        icon: Plus,
        disabled: !isCurrent,
      },
      { label: "Rename Database", action: "rename_db", icon: Edit },
      { label: "Refresh", action: "refresh_db", icon: RefreshCw },
      { type: "divider" },
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
  } else if (type === "folder-table") {
    contextMenuItems.value = [
      { label: "Create New Table", action: "create_table", icon: Plus },
      { label: "Refresh Tables", action: "refresh_db", icon: RefreshCw },
    ];
  }

  contextMenuVisible.value = true;
};

const handleContextSelect = async (action: string) => {
  const target = contextTarget.value;

  if (action === "toggle_fav") {
    toggleFavorite(target.data);
  }
  // Common Actions
  else if (action === "create_table") {
    alert(
      "To create a table, please click the 'New Table' tool in the floating toolbar on the diagram."
    );
  }
  // Database Actions
  else if (action === "use_db") {
    await switchDatabase(target.data);
  } else if (action === "refresh_db") {
    await fetchSchema();
  } else if (action === "rename_db") {
    const newName = prompt("Enter new database name:", target.data);
    if (newName && newName !== target.data) {
      try {
        const res = await fetch("http://localhost:3000/api/databases/rename", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ old_name: target.data, new_name: newName }),
        });
        if (res.ok) {
          // Update favorites if renamed
          if (favorites.value.has(target.data)) {
            favorites.value.delete(target.data);
            favorites.value.add(newName);
            localStorage.setItem(
              "drawdb_favorites",
              JSON.stringify([...favorites.value])
            );
          }
          alert("Database renamed!");
          location.reload();
        } else {
          const err = await res.json();
          alert("Error: " + err.error);
        }
      } catch (e) {
        console.error(e);
      }
    }
  } else if (action === "drop_db") {
    if (
      confirm(
        `⚠️ WARNING: Drop database '${target.data}'?\nAll tables and data will be lost permanently!`
      )
    ) {
      await fetch(`http://localhost:3000/api/databases?name=${target.data}`, {
        method: "DELETE",
      });
      // Remove from favs
      if (favorites.value.has(target.data)) {
        favorites.value.delete(target.data);
        localStorage.setItem(
          "drawdb_favorites",
          JSON.stringify([...favorites.value])
        );
      }
      alert("Database dropped");
      location.reload();
    }
  }
  // ... rest of actions
  else if (action === "view_data") {
    emit("select-table", target.data); // Navigate to browse
    emit("navigate", "data");
  } else if (action === "drop_table") {
    if (confirm(`Drop table '${target.data}'?`)) {
      await fetch(`http://localhost:3000/api/tables?name=${target.data}`, {
        method: "DELETE",
      });
      await fetchSchema();
    }
  } else if (action === "truncate_table") {
    if (confirm(`Truncate table '${target.data}'? All rows will be deleted.`)) {
      await fetch("http://localhost:3000/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `TRUNCATE TABLE \`${target.data}\`` }),
      });
      alert("Table truncated.");
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
          @click="activeFilter = 'all'"
          class="text-[10px] px-2 py-0.5 rounded border transition-colors"
          :class="
            activeFilter === 'all'
              ? 'bg-blue-50 border-blue-100 text-blue-600 font-bold'
              : 'bg-transparent border-transparent text-gray-500 hover:text-gray-700'
          "
        >
          All
        </button>
        <button
          @click="activeFilter = 'fav'"
          class="text-[10px] px-2 py-0.5 rounded border transition-colors"
          :class="
            activeFilter === 'fav'
              ? 'bg-blue-50 border-blue-100 text-blue-600 font-bold'
              : 'bg-transparent border-transparent text-gray-500 hover:text-gray-700'
          "
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
          v-if="activeFilter === 'all' || favorites.has(db)"
          :label="db"
          :has-children="true"
          :is-open="db === currentDatabase"
          @contextmenu="(e: MouseEvent) => handleContextMenu(e, 'database', db)"
          @click="handleDatabaseClick(db)"
        >
          <template #icon>
            <div class="relative">
              <Database
                class="w-3.5 h-3.5 text-yellow-600"
                :class="{ 'fill-yellow-100': db === currentDatabase }"
              />
              <!-- Fav Star -->
              <div
                v-if="favorites.has(db)"
                class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white flex items-center justify-center"
              >
                <div class="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
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
              :is-open="true"
              @contextmenu.stop="(e: MouseEvent) => handleContextMenu(e, 'folder-table', null)"
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
