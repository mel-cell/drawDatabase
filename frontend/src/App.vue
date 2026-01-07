<script setup lang="ts">
import { ref } from "vue";
import TheNavbar from "./components/layout/TheNavbar.vue";
import TheSidebar from "./components/layout/TheSidebar.vue";
import ERDCanvas from "./components/layout/ERDCanvas.vue";
import SQLEditor from "./components/pages/SQLEditor.vue";
import DataBrowser from "./components/pages/DataBrowser.vue";
import UserManagement from "./components/pages/admin/UserManagement.vue";
import DataDrawer from "./components/layout/DataDrawer.vue";
import ContextPanel from "./components/layout/ContextPanel.vue";
import { useSchema } from "./composables/useSchema";

const { currentDatabase } = useSchema();
const isDataDrawerOpen = ref(false);
const selectedTableForData = ref("");
const selectedNodeData = ref<any>(null); // For Right Sidebar Property Editor
const selectedDatabase = ref<string>("");
const selectionTimestamp = ref(0); // Trigger to force reopen panel
const activePage = ref("diagram");

const handleTableSelect = (tableName: string) => {
  selectedTableForData.value = tableName;
  selectedDatabase.value = "";
  selectedNodeData.value = null;

  if (activePage.value === "diagram") {
    // In Diagram mode, open bottom drawer
    isDataDrawerOpen.value = true;
  } else {
    // In other modes, switch to Data Browser Page to view full
    activePage.value = "data";
  }
};

const handleDatabaseSelect = (dbName: string) => {
  selectedDatabase.value = dbName;
  currentDatabase.value = dbName; // Sync global state
  selectedTableForData.value = "";
  selectedNodeData.value = null;
  selectionTimestamp.value = Date.now();
};

const handleNodeSelect = (node: any) => {
  // Canvas Node Click -> Open Context Panel (Right)
  if (!node) {
    selectedNodeData.value = null;
    return;
  }
  selectedNodeData.value = node;
  // Don't clear selectedDatabase if it's just a node click,
  // but usually nodes belong to the DB.
  // For now, let's keep selectedDatabase active so context panel knows context.
  selectionTimestamp.value = Date.now(); // Force update trigger
};

const handleNavigation = (page: string) => {
  activePage.value = page;
};
</script>

<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden bg-gray-50">
    <TheNavbar :current-page="activePage" @navigate="handleNavigation" />

    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar always visible for object explorer -->
      <TheSidebar
        @select-table="handleTableSelect"
        @select-database="handleDatabaseSelect"
        @navigate="handleNavigation"
      />

      <!-- PAGE: DIAGRAM -->
      <main
        v-if="activePage === 'diagram'"
        class="flex-1 relative flex flex-col overflow-hidden animate-in fade-in duration-300"
      >
        <ERDCanvas @node-select="handleNodeSelect" />
        <DataDrawer
          :is-open="isDataDrawerOpen"
          :table-name="selectedTableForData"
          @close="isDataDrawerOpen = false"
        />
      </main>

      <!-- PAGE: SQL EDITOR -->
      <main
        v-else-if="activePage === 'sql'"
        class="flex-1 relative flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        <SQLEditor />
      </main>

      <!-- PAGE: BROWSE DATA -->
      <main
        v-else-if="activePage === 'data'"
        class="flex-1 relative flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        <DataBrowser :table-name="selectedTableForData" />
      </main>

      <!-- PAGE: ADMIN - USERS -->
      <main
        v-else-if="activePage === 'admin-users'"
        class="flex-1 relative flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        <UserManagement />
      </main>

      <!-- PAGE: ADMIN - STATUS (Placeholder) -->
      <main
        v-else-if="activePage === 'admin-status'"
        class="flex-1 flex items-center justify-center bg-gray-50 text-gray-400"
      >
        <div class="text-center">
          <p class="text-lg font-semibold">Server Status Dashboard</p>
          <p class="text-sm">
            Realtime process list & monitoring (Coming Soon)
          </p>
        </div>
      </main>

      <!-- PAGE: ADMIN - VARIABLES (Placeholder) -->
      <main
        v-else-if="activePage === 'admin-variables'"
        class="flex-1 flex items-center justify-center bg-gray-50 text-gray-400"
      >
        <div class="text-center">
          <p class="text-lg font-semibold">Server Variables</p>
          <p class="text-sm">Config editor (Coming Soon)</p>
        </div>
      </main>

      <!-- Right Sidebar (Only visible in Diagram mode) -->
      <ContextPanel
        v-if="activePage === 'diagram'"
        class="shrink-0"
        :trigger="selectionTimestamp"
        :active-database="selectedDatabase"
        :type="
          selectedNodeData
            ? selectedNodeData.type === 'custom-note'
              ? 'note-edit'
              : selectedNodeData.type === 'custom-group'
              ? 'group-edit'
              : 'table-edit'
            : selectedDatabase
            ? 'database'
            : 'none'
        "
        :data="selectedNodeData"
      />
    </div>
  </div>
</template>
