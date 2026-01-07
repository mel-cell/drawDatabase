<script setup lang="ts">
import { ref } from "vue";
import AddTableModal from "../modals/AddTableModal.vue";
import CreateDatabaseModal from "../modals/CreateDatabaseModal.vue";
import ImportModal from "../modals/ImportModal.vue";
import ExportModal from "../modals/ExportModal.vue";
import ConfirmModal from "../modals/ConfirmModal.vue";
import { useSchema } from "../../composables/useSchema";
import { useDiagram } from "../../composables/useDiagram";
import {
  Save,
  Play,
  Settings,
  Database as DatabaseIcon,
  Download,
  User,
  Loader2,
  Upload,
} from "lucide-vue-next";

defineProps<{
  currentPage: string;
}>();

defineEmits(["navigate"]);

const { createTable, fetchSchema, currentDatabase, tables } = useSchema(); // Global Active Database
const { nodes, edges } = useDiagram();

const showAddTableModal = ref(false);
const isSaving = ref(false);

const showCreateDBModal = ref(false);
const showImportModal = ref(false);
const showExportModal = ref(false);
const showConfirmModal = ref(false);

const confirmConfig = ref({
  title: "",
  message: "",
  isDanger: false,
  confirmLabel: "Confirm",
  onConfirm: () => {},
});

const executeConfirmAction = () => {
  confirmConfig.value.onConfirm();
  showConfirmModal.value = false;
};

// --- HANDLERS ---

const handleCreateDatabase = () => {
  showCreateDBModal.value = true;
};

const executeCreateDatabase = async (name: string) => {
  try {
    const res = await fetch("http://localhost:3000/api/databases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      // alert(`Database '${name}' created!`);
      // Close modal implicitly by success
      showCreateDBModal.value = false;
      await fetchSchema(); // Refresh sidebar list
    } else {
      const err = await res.json();
      alert(`Failed: ${err.error}`); // Keep alert for error or use toast later
    }
  } catch (e) {
    console.error(e);
    alert("Network error");
  }
};

const handleImport = () => {
  showImportModal.value = true;
};

const executeImport = (file: File) => {
  console.log("Importing:", file);
  alert(`Mock Import: ${file?.name} uploaded.`);
  showImportModal.value = false;
};

const handleExport = () => {
  showExportModal.value = true;
};

const executeExport = (format: string) => {
  console.log("Exporting as:", format);
  alert(`Mock Export: Downloading as ${format.toUpperCase()}...`);
  showExportModal.value = false;
};

// Logic: Mengubah Gambar Canvas -> Tabel Nyata di Database
const handleSave = () => {
  const draftTables = nodes.value.filter((n) => n.type === "table");

  confirmConfig.value = {
    title: "Save Schema Synchronization",
    message: `This will SYNC the canvas to database '${currentDatabase.value}'.\n\n• Existing tables will be updated (Columns added)\n• Missing tables will be DELETED\n• New tables will be CREATED`,
    isDanger: true,
    confirmLabel: "Sync Database",
    onConfirm: async () => {
      isSaving.value = true;
      await performSave(draftTables);
    },
  };
  showConfirmModal.value = true;
};

const performSave = async (draftTables: any[]) => {
  // Existing Save Logic (Moved here)
  let successCount = 0;
  let deleteCount = 0;

  try {
    // 1. Get current server state
    await fetchSchema();
    const serverTableNames = new Set(tables.value.map((t) => t.name));
    const draftTableNames = new Set();

    // 2. Sync (Upsert) Draft Tables
    for (const node of draftTables) {
      const tableData = node.data || {};
      const tableName = tableData.name || tableData.label || "untitled";
      draftTableNames.add(tableName);

      // 3. Find Relations
      // A) Visual Edges (where this table is SOURCE)
      const visualFKs = edges.value
        .filter((e: any) => e.source === tableName)
        .map((edge: any) => {
          const sourceCol = edge.sourceHandle
            ? edge.sourceHandle.replace("source-", "")
            : "";
          const targetCol = edge.targetHandle
            ? edge.targetHandle.replace("target-", "")
            : "";
          return {
            column_name: sourceCol,
            ref_table_name: edge.target,
            ref_column_name: targetCol,
            on_delete: "CASCADE",
          };
        })
        .filter((fk: any) => fk.column_name && fk.ref_column_name);

      // B) Manual Column FKs (from ContextPanel)
      const manualFKs = (tableData.columns || [])
        .filter((c: any) => c.is_fk && c.fk_ref_table && c.fk_ref_col)
        .map((c: any) => ({
          column_name: c.name,
          ref_table_name: c.fk_ref_table,
          ref_column_name: c.fk_ref_col,
          on_delete: c.fk_on_delete || "RESTRICT",
        }));

      // Merge (Unique by column name)
      const allFKs = [...visualFKs, ...manualFKs];
      // Dedupe by column_name
      const foreignKeys = Array.from(
        new Map(allFKs.map((item) => [item.column_name, item])).values()
      );

      const payload = {
        name: tableName,
        columns: (tableData.columns || []).map((col: any) => ({
          name: col.name,
          type: col.type,
          is_pk: col.is_pk || false,
          is_nn: col.is_nn || false,
          is_ai: col.is_ai || false,
        })),
        foreign_keys: foreignKeys,
      };

      const res = await fetch("http://localhost:3000/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) successCount++;
    }

    // 3. Delete Removed Tables
    for (const serverName of serverTableNames) {
      if (!draftTableNames.has(serverName)) {
        const res = await fetch(
          `http://localhost:3000/api/tables?name=${serverName}`,
          {
            method: "DELETE",
          }
        );
        if (res.ok) deleteCount++;
      }
    }

    // 4. Save Layout
    const layouts: any = {};
    nodes.value.forEach((node) => {
      if (node.type === "table") {
        layouts[node.data.name || node.data.label] = {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
        };
      }
    });

    await fetch("http://localhost:3000/api/layout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(layouts),
    });

    await fetchSchema(); // Refresh Sidebar & State
    alert(
      `Sync Complete!\n\nSynced/Created: ${successCount}\nDeleted: ${deleteCount}`
    );
  } catch (e) {
    console.error(e);
    alert("Error saving schema. Check backend.");
  } finally {
    isSaving.value = false;
  }
};

const handleCreateTable = async (data: any) => {
  const success = await createTable(data);
  if (success) {
    showAddTableModal.value = false;
  }
};
</script>

<template>
  <header
    class="bg-gray-800 text-white shadow-sm flex flex-col z-20 relative animate-in fade-in transition-all"
  >
    <!-- Top Level: Menu Bar (App-like feel) -->
    <div
      class="flex items-center justify-between px-3 py-1.5 border-b border-gray-700 text-xs select-none"
    >
      <div class="flex items-center gap-4">
        <!-- Logo -->
        <div class="flex items-center gap-2 mr-2">
          <div
            class="w-5 h-5 bg-blue-500 rounded flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          >
            D
          </div>
          <span class="font-bold tracking-wide text-gray-200">DrawDB</span>

          <!-- Database Indicator -->
          <span
            class="px-2 py-0.5 bg-gray-700 rounded text-[10px] text-blue-200 flex items-center gap-1 border border-gray-600 transition-all hover:bg-gray-600 cursor-help"
            title="Active Database Context"
          >
            <DatabaseIcon class="w-2.5 h-2.5" />
            <span class="opacity-80">Active:</span>
            <span class="font-bold">{{ currentDatabase || "None" }}</span>
          </span>
        </div>

        <!-- Classic Menus -->
        <div class="flex gap-4 text-gray-400">
          <button class="hover:text-white transition-colors">File</button>
          <button class="hover:text-white transition-colors">Edit</button>
          <button class="hover:text-white transition-colors">View</button>
          <button class="hover:text-white transition-colors">Tools</button>
          <button class="hover:text-white transition-colors">Help</button>
        </div>
      </div>

      <!-- Right: User & window controls -->
      <div class="flex items-center gap-3 text-gray-400">
        <span class="text-xs">v1.0.0-beta</span>
        <button class="hover:text-white">
          <Settings class="w-3.5 h-3.5" />
        </button>
        <div class="w-px h-3 bg-gray-600"></div>
        <button class="flex items-center gap-1 hover:text-white">
          <User class="w-3.5 h-3.5" />
          <span>root</span>
        </button>
      </div>
    </div>

    <!-- Second Level: Toolbar (Actions) -->
    <div
      class="bg-white text-gray-800 px-3 py-2 flex justify-between items-center shadow-sm border-b border-gray-200"
    >
      <!-- Left: Primary Actions -->
      <div class="flex items-center gap-2">
        <button
          @click="handleCreateDatabase"
          class="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-all shadow-sm active:scale-95"
          title="Create New Database"
        >
          <DatabaseIcon class="w-4 h-4" />
          <span>New Database</span>
        </button>

        <div class="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          class="p-1.5 text-gray-600 hover:bg-gray-100 rounded hover:text-blue-600"
          title="Execute SQL Query"
        >
          <Play class="w-4 h-4" />
        </button>

        <!-- SAVE SCHEMA BUTTON -->
        <button
          @click="handleSave"
          :disabled="isSaving"
          class="p-1.5 text-gray-600 hover:bg-gray-100 rounded hover:text-blue-600 disabled:opacity-50 disabled:cursor-wait"
          title="Save Schema to Database"
        >
          <Loader2
            v-if="isSaving"
            class="w-4 h-4 animate-spin text-emerald-600"
          />
          <Save v-else class="w-4 h-4" />
        </button>

        <button
          @click="handleImport"
          class="p-1.5 text-gray-600 hover:bg-gray-100 rounded hover:text-blue-600"
          title="Import Diagram"
        >
          <Upload class="w-4 h-4" />
        </button>
        <button
          @click="handleExport"
          class="p-1.5 text-gray-600 hover:bg-gray-100 rounded hover:text-blue-600"
          title="Export Diagram"
        >
          <Download class="w-4 h-4" />
        </button>
      </div>

      <!-- Center: Context / Breadcrumb -->
      <div
        class="absolute left-1/2 transform -translate-x-1/2 flex bg-gray-100 rounded-md p-1"
      >
        <button
          @click="$emit('navigate', 'diagram')"
          :class="
            currentPage === 'diagram'
              ? 'bg-white shadow-sm text-blue-700 font-semibold'
              : 'text-gray-500 hover:text-gray-800 font-medium'
          "
          class="px-4 py-1 text-xs rounded transition-all"
        >
          Diagram
        </button>
        <button
          @click="$emit('navigate', 'data')"
          :class="
            currentPage === 'data'
              ? 'bg-white shadow-sm text-blue-700 font-semibold'
              : 'text-gray-500 hover:text-gray-800 font-medium'
          "
          class="px-4 py-1 text-xs rounded transition-all"
        >
          Browse Data
        </button>
        <button
          @click="$emit('navigate', 'sql')"
          :class="
            currentPage === 'sql'
              ? 'bg-white shadow-sm text-blue-700 font-semibold'
              : 'text-gray-500 hover:text-gray-800 font-medium'
          "
          class="px-4 py-1 text-xs rounded transition-all"
        >
          SQL Editor
        </button>
      </div>

      <!-- Right: Toggle Panels -->
      <div class="flex items-center gap-1 text-xs">
        <!-- Placeholder for panel toggles -->
      </div>
    </div>

    <!-- Modals -->
    <AddTableModal
      :is-open="showAddTableModal"
      @close="showAddTableModal = false"
      @create="handleCreateTable"
    />

    <CreateDatabaseModal
      :is-open="showCreateDBModal"
      @close="showCreateDBModal = false"
      @create="executeCreateDatabase"
    />

    <ImportModal
      :is-open="showImportModal"
      @close="showImportModal = false"
      @import="executeImport"
    />

    <ExportModal
      :is-open="showExportModal"
      @close="showExportModal = false"
      @export="executeExport"
    />

    <ConfirmModal
      :is-open="showConfirmModal"
      :title="confirmConfig.title"
      :message="confirmConfig.message"
      :is-danger="confirmConfig.isDanger"
      :confirm-label="confirmConfig.confirmLabel"
      @close="showConfirmModal = false"
      @confirm="executeConfirmAction"
    />
  </header>
</template>
