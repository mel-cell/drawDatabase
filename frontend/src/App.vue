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
import ToastContainer from "./components/ui/ToastContainer.vue";
import { useSchema } from "./composables/useSchema";

const { currentDatabase } = useSchema();
const isDataDrawerOpen = ref(false);
const selectedTableForData = ref("");
const selectedNodeData = ref<any>(null);
const selectedDatabase = ref<string>("");
const selectionTimestamp = ref(0);
const activePage = ref("diagram");

const handleTableSelect = (tableName: string) => {
  selectedTableForData.value = tableName;
  selectedDatabase.value = "";
  selectedNodeData.value = null;

  if (activePage.value === "diagram") {
    isDataDrawerOpen.value = true;
  } else {
    activePage.value = "data";
  }
};

const handleDatabaseSelect = (dbName: string) => {
  selectedDatabase.value = dbName;
  currentDatabase.value = dbName;
  selectedTableForData.value = "";
  selectedNodeData.value = null;
  selectionTimestamp.value = Date.now();
};

const handleNodeSelect = (node: any) => {
  if (!node) {
    selectedNodeData.value = null;
    return;
  }
  selectedNodeData.value = node;
  selectionTimestamp.value = Date.now();
};

const handleNavigation = (page: string) => {
  activePage.value = page;
};

// Compute context panel type
const panelType = (): string => {
  if (selectedNodeData.value) {
    const t = selectedNodeData.value.type;
    if (t === "note") return "note-edit";
    if (t === "group") return "group-edit";
    return "table-edit";
  }
  if (selectedDatabase.value) return "database";
  return "none";
};
</script>

<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden bg-gray-50">
    <TheNavbar :current-page="activePage" @navigate="handleNavigation" />

    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <TheSidebar
        @select-table="handleTableSelect"
        @select-database="handleDatabaseSelect"
        @navigate="handleNavigation"
      />

      <!-- PAGE: DIAGRAM -->
      <main
        v-if="activePage === 'diagram'"
        class="flex-1 relative flex flex-col overflow-hidden"
      >
        <ERDCanvas
          :active-database="currentDatabase"
          @node-select="handleNodeSelect"
        />
        <DataDrawer
          :is-open="isDataDrawerOpen"
          :table-name="selectedTableForData"
          @close="isDataDrawerOpen = false"
        />
      </main>

      <!-- PAGE: SQL EDITOR -->
      <main
        v-else-if="activePage === 'sql'"
        class="flex-1 relative flex flex-col overflow-hidden"
      >
        <SQLEditor />
      </main>

      <!-- PAGE: BROWSE DATA -->
      <main
        v-else-if="activePage === 'data'"
        class="flex-1 relative flex flex-col overflow-hidden"
      >
        <DataBrowser :table-name="selectedTableForData" />
      </main>

      <!-- PAGE: ADMIN - USERS -->
      <main
        v-else-if="activePage === 'admin-users'"
        class="flex-1 relative flex flex-col overflow-hidden"
      >
        <UserManagement />
      </main>

      <!-- PAGE: ADMIN - STATUS -->
      <main
        v-else-if="activePage === 'admin-status'"
        class="flex-1 flex items-center justify-center bg-gray-50 text-gray-400"
      >
        <div class="text-center">
          <p class="text-lg font-semibold">Server Status Dashboard</p>
          <p class="text-sm">Realtime monitoring (Coming Soon)</p>
        </div>
      </main>

      <!-- PAGE: ADMIN - VARIABLES -->
      <main
        v-else-if="activePage === 'admin-variables'"
        class="flex-1 flex items-center justify-center bg-gray-50 text-gray-400"
      >
        <div class="text-center">
          <p class="text-lg font-semibold">Server Variables</p>
          <p class="text-sm">Config editor (Coming Soon)</p>
        </div>
      </main>

      <!-- Right Sidebar (Diagram mode only) -->
      <ContextPanel
        v-if="activePage === 'diagram'"
        class="shrink-0"
        :trigger="selectionTimestamp"
        :active-database="selectedDatabase"
        :type="panelType() as any"
        :data="selectedNodeData"
      />
    </div>

    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>
