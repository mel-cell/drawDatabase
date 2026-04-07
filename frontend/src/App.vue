<script setup lang="ts">
import { ref, computed } from "vue";
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
const panelType = computed(() => {
  if (selectedNodeData.value) {
    const t = selectedNodeData.value.type;
    if (t === "note") return "note-edit";
    if (t === "group") return "group-edit";
    return "table-edit";
  }
  if (selectedDatabase.value) return "database";
  return "none";
});

const showRightPanel = computed(() => activePage.value === 'diagram' && (selectedNodeData.value || selectedDatabase.value));
</script>

<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden bg-white">
    <!-- Navbar (Fixed Top) -->
    <TheNavbar :current-page="activePage" @navigate="handleNavigation" class="shrink-0 z-50 border-b border-gray-200" />

    <div class="flex-1 flex overflow-hidden relative">
      <!-- 1. LEFT SIDEBAR (Explorer) -->
      <aside class="w-[280px] shrink-0 border-r border-gray-200 flex flex-col bg-[#f8fafc] z-20">
        <TheSidebar
          @select-table="handleTableSelect"
          @select-database="handleDatabaseSelect"
          @navigate="handleNavigation"
          class="flex-1 overflow-y-auto scrollbar-thin"
        />
      </aside>

      <!-- 2. MAIN CENTER AREA (Editor + Bottom Panel) -->
      <main class="flex-1 flex flex-col overflow-hidden relative bg-slate-100 z-10">
        <!-- TOP EDITOR REGION -->
        <div class="flex-1 relative overflow-hidden flex flex-col">
            <Transition name="page" mode="out-in">
                <!-- CANVAS PAGE -->
                <div v-if="activePage === 'diagram'" class="h-full w-full flex flex-col relative">
                    <ERDCanvas
                        :active-database="currentDatabase"
                        @node-select="handleNodeSelect"
                        class="flex-1"
                    />
                </div>

                <!-- OTHER PAGES -->
                <div v-else-if="activePage === 'sql'" class="h-full w-full bg-white p-6 overflow-auto">
                    <SQLEditor />
                </div>
                <div v-else-if="activePage === 'data'" class="h-full w-full bg-white p-4 overflow-auto">
                    <DataBrowser :table-name="selectedTableForData" />
                </div>
                <div v-else-if="activePage === 'admin-users'" class="h-full w-full bg-white overflow-auto">
                    <UserManagement />
                </div>
                <div v-else class="h-full flex items-center justify-center text-gray-400">
                    <p class="text-sm font-bold uppercase tracking-widest opacity-30">Module Preparation</p>
                </div>
            </Transition>
        </div>

        <!-- BOTTOM PANEL (Data Drawer) - SELEVEL DENGAN SIDEBAR DALAM MAIN COLUMN -->
        <DataDrawer
            v-if="activePage === 'diagram' && isDataDrawerOpen"
            :is-open="isDataDrawerOpen"
            :table-name="selectedTableForData"
            @close="isDataDrawerOpen = false"
            class="shrink-0"
        />
      </main>

      <!-- 3. RIGHT SIDEBAR (Properties) -->
      <aside 
        v-if="showRightPanel"
        class="w-[340px] shrink-0 border-l border-gray-200 bg-white z-20 flex flex-col overflow-hidden"
      >
        <ContextPanel
          :trigger="selectionTimestamp"
          :active-database="selectedDatabase"
          :type="panelType as any"
          :data="selectedNodeData"
          class="flex-1"
        />
      </aside>
    </div>

    <!-- Modals & Toasts -->
    <ToastContainer />
  </div>
</template>

<style>
/* Smooth transitions */
.page-enter-active, .page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>
