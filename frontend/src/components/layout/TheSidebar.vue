<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useSchema } from "../../composables/useSchema";
import TreeNode from "../common/tree/TreeNode.vue";
import ConnectionModal from "../modals/ConnectionModal.vue";
import {
  Database,
  Folder,
  Table,
  Search,
  Activity,
  User,
  Settings,
} from "lucide-vue-next";

defineProps<{}>();

const emit = defineEmits(["select-table", "navigate"]);

const { tables, databases, currentDatabase, fetchDatabases, fetchSchema } =
  useSchema();
const searchQuery = ref("");
const expandedDbs = ref<Record<string, boolean>>({ draw_db: true });
const showConnectionModal = ref(false);

onMounted(() => {
  fetchDatabases();
});

const selectDatabase = async (dbName: string) => {
  currentDatabase.value = dbName;
  await fetchSchema();
};

const toggleDb = (dbName: string) => {
  expandedDbs.value[dbName] = !expandedDbs.value[dbName];
  if (expandedDbs.value[dbName]) {
    selectDatabase(dbName);
  }
};

const handleConnect = (conn: any) => {
  console.log("Connected to", conn.name);
  // Logic to reload schema...
  showConnectionModal.value = false;
};
</script>

<template>
  <aside
    class="w-64 bg-[#f8f9fa] border-r border-gray-200 flex flex-col h-full text-sm"
  >
    <!-- Server Info / Header (CLICKABLE) -->
    <div
      @click="showConnectionModal = true"
      class="px-4 py-3 border-b border-gray-200 flex items-center gap-2 bg-white cursor-pointer hover:bg-gray-50 transition-colors group"
      title="Manage Connections"
    >
      <div
        class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)] group-hover:scale-125 transition-transform"
      ></div>
      <div class="flex-1">
        <div
          class="font-semibold text-gray-700 text-xs uppercase tracking-wider group-hover:text-blue-600 transition-colors"
        >
          Connection
        </div>
        <div class="font-bold text-gray-800 text-sm">localhost:3306</div>
      </div>
      <Settings
        class="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>

    <!-- Toolbar: Search/Refresh -->
    <div
      class="p-2 border-b border-gray-200 bg-white sticky top-0 z-10 flex items-center gap-2"
    >
      <div class="relative flex-1">
        <Search class="w-3 h-3 absolute left-2 top-2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter objects..."
          class="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50"
        />
      </div>
    </div>

    <!-- Tree Content -->
    <div class="flex-1 overflow-y-auto p-2 scrollbar-thin">
      <!-- Database List -->
      <TreeNode
        v-for="db in databases"
        :key="db"
        :label="db"
        :has-children="true"
        :is-open="expandedDbs[db]"
        @toggle="toggleDb(db)"
      >
        <!-- Custom icon via prop if supported or slot -->
        <template #icon>
          <Database class="w-3 h-3 text-yellow-600" />
        </template>

        <template #default>
          <!-- Tables Folder -->
          <TreeNode
            label="Tables"
            :has-children="true"
            :is-open="db === currentDatabase"
          >
            <template #icon><Folder class="w-3 h-3 text-blue-400" /></template>
            <template #default>
              <template v-if="db === currentDatabase">
                <TreeNode
                  v-for="table in tables"
                  :key="table.name"
                  :label="table.name"
                  @click="emit('select-table', table.name)"
                >
                  <template #icon
                    ><Table class="w-3 h-3 text-blue-600"
                  /></template>
                </TreeNode>
              </template>
              <div v-else class="py-1 px-4 text-xs text-gray-400 italic">
                Click to load tables...
              </div>
            </template>
          </TreeNode>

          <!-- Views Folder -->
          <TreeNode label="Views" :has-children="true">
            <template #icon
              ><Folder class="w-3 h-3 text-purple-400"
            /></template>
            <div class="py-1 px-4 text-xs text-gray-400 italic">No views</div>
          </TreeNode>

          <!-- Procedures Folder -->
          <TreeNode label="Procedures" :has-children="true">
            <template #icon
              ><Folder class="w-3 h-3 text-orange-400"
            /></template>
            <div class="py-1 px-4 text-xs text-gray-400 italic">Empty</div>
          </TreeNode>

          <!-- Functions Folder -->
          <TreeNode label="Functions" :has-children="true">
            <template #icon><Folder class="w-3 h-3 text-green-400" /></template>
            <div class="py-1 px-4 text-xs text-gray-400 italic">Empty</div>
          </TreeNode>

          <!-- Triggers Folder -->
          <TreeNode label="Triggers" :has-children="true">
            <template #icon><Folder class="w-3 h-3 text-red-300" /></template>
            <div class="py-1 px-4 text-xs text-gray-400 italic">Empty</div>
          </TreeNode>

          <!-- Events Folder -->
          <TreeNode label="Events" :has-children="true">
            <template #icon
              ><Folder class="w-3 h-3 text-yellow-500"
            /></template>
            <div class="py-1 px-4 text-xs text-gray-400 italic">Empty</div>
          </TreeNode>
        </template>
      </TreeNode>

      <!-- System Admin Section (Outside DB Loop) -->
      <div class="mt-4 pt-4 border-t border-gray-200">
        <div
          class="px-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
        >
          Administration
        </div>
        <TreeNode
          label="Users & Privileges"
          :has-children="false"
          @click="emit('navigate', 'admin-users')"
        >
          <template #icon><User class="w-3 h-3 text-gray-500" /></template>
        </TreeNode>
        <TreeNode
          label="Server Status"
          :has-children="false"
          @click="emit('navigate', 'admin-status')"
        >
          <template #icon><Activity class="w-3 h-3 text-gray-500" /></template>
        </TreeNode>
        <TreeNode
          label="Variables"
          :has-children="false"
          @click="emit('navigate', 'admin-variables')"
        >
          <template #icon><Settings class="w-3 h-3 text-gray-500" /></template>
        </TreeNode>
      </div>
    </div>

    <!-- Modals -->
    <ConnectionModal
      :is-open="showConnectionModal"
      @close="showConnectionModal = false"
      @connect="handleConnect"
    />
  </aside>
</template>

<style scoped>
/* Optional: Custom Scrollbar for side panel */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
</style>
