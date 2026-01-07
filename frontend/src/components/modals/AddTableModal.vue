<script setup lang="ts">
import { ref } from "vue";
import {
  X,
  Key,
  Plus,
  Trash2,
  Table as TableIcon,
  Settings,
} from "lucide-vue-next";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(["close", "create"]);

const tableName = ref("");
const activeTab = ref("columns"); // columns | indexes | foreign_keys

// Advanced Column Definition
const columns = ref([
  {
    name: "id",
    type: "INT",
    length: "",
    is_pk: true,
    is_nn: true,
    ai: true,
    default: "",
  },
  {
    name: "created_at",
    type: "TIMESTAMP",
    length: "",
    is_pk: false,
    is_nn: true,
    ai: false,
    default: "CURRENT_TIMESTAMP",
  },
]);

const colTypes = [
  "INT",
  "BIGINT",
  "VARCHAR",
  "TEXT",
  "BOOLEAN",
  "DECIMAL",
  "DAE",
  "TIMESTAMP",
  "JSON",
];

const addColumn = () => {
  columns.value.push({
    name: "new_column",
    type: "VARCHAR",
    length: "255",
    is_pk: false,
    is_nn: false,
    ai: false,
    default: "",
  });
};

const removeColumn = (index: number) => {
  if (columns.value.length > 1) {
    columns.value.splice(index, 1);
  }
};

const handleCreate = () => {
  emit("create", {
    name: tableName.value,
    columns: columns.value.map((c) => ({
      ...c,
      type: c.length ? `${c.type}(${c.length})` : c.type, // Format type with length
    })),
  });
  // Reset
  tableName.value = "";
  columns.value = [
    {
      name: "id",
      type: "INT",
      length: "",
      is_pk: true,
      is_nn: true,
      ai: true,
      default: "",
    },
  ];
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm transition-all"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- HEADER -->
      <div
        class="px-5 py-3 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center shrink-0"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <TableIcon class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-gray-800 leading-tight">
              New Table Structure
            </h3>
            <p class="text-xs text-gray-500">
              Define schema for your new database entity
            </p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- MAIN BODY -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <!-- General Settings -->
        <div
          class="px-6 py-4 bg-white border-b border-gray-100 shrink-0 grid grid-cols-2 gap-6"
        >
          <div>
            <label
              class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
              >Table Name</label
            >
            <input
              v-model="tableName"
              type="text"
              placeholder="e.g. users"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:font-normal"
              autofocus
            />
          </div>
          <div>
            <label
              class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
              >Table Comment (Optional)</label
            >
            <input
              type="text"
              placeholder="Brief description..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-gray-200 border-dashed focus:border-gray-400 outline-none transition-all"
            />
          </div>
        </div>

        <!-- Tabs -->
        <div
          class="flex border-b border-gray-200 bg-gray-50/50 px-6 gap-6 shrink-0"
        >
          <button
            @click="activeTab = 'columns'"
            class="py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
            :class="
              activeTab === 'columns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            "
          >
            Columns
            <span
              class="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full"
              >{{ columns.length }}</span
            >
          </button>
          <button
            @click="activeTab = 'indexes'"
            class="py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
            :class="
              activeTab === 'indexes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            "
          >
            Indexes
          </button>
        </div>

        <!-- COLUMN DESIGNER -->
        <div
          v-show="activeTab === 'columns'"
          class="flex-1 overflow-auto p-0 bg-white relative"
        >
          <table class="w-full text-left text-sm border-collapse">
            <thead
              class="bg-gray-50 sticky top-0 z-10 text-xs text-gray-500 font-semibold uppercase tracking-wider shadow-sm"
            >
              <tr>
                <th class="pl-6 py-2 w-8">#</th>
                <th class="px-3 py-2 w-10 text-center" title="Primary Key">
                  <Key class="w-3.5 h-3.5 inline text-gray-400" />
                </th>
                <th class="px-3 py-2">Column Name</th>
                <th class="px-3 py-2 w-32">Data Type</th>
                <th class="px-3 py-2 w-24">Length</th>
                <th class="px-3 py-2 w-12 text-center" title="Not Null">NN</th>
                <th class="px-3 py-2 w-12 text-center" title="Auto Increment">
                  AI
                </th>
                <th class="px-3 py-2">Default Value</th>
                <th class="pr-6 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(col, idx) in columns"
                :key="idx"
                class="group hover:bg-blue-50/30 transition-colors"
              >
                <td class="pl-6 py-2 text-gray-400 text-xs font-mono">
                  {{ idx + 1 }}
                </td>

                <!-- PK Toggle -->
                <td class="px-3 py-2 text-center">
                  <button
                    @click="col.is_pk = !col.is_pk"
                    class="p-1 rounded transition-all hover:bg-gray-200"
                    :class="
                      col.is_pk
                        ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                        : 'text-gray-300'
                    "
                  >
                    <Key
                      class="w-4 h-4"
                      :class="{ 'fill-current': col.is_pk }"
                    />
                  </button>
                </td>

                <!-- Name -->
                <td class="px-3 py-2">
                  <input
                    v-model="col.name"
                    type="text"
                    class="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none font-medium text-gray-700 placeholder-gray-300"
                  />
                </td>

                <!-- Type -->
                <td class="px-3 py-2">
                  <select
                    v-model="col.type"
                    class="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none text-xs font-mono text-blue-600"
                  >
                    <option v-for="t in colTypes" :key="t" :value="t">
                      {{ t }}
                    </option>
                  </select>
                </td>
                <!-- Length -->
                <td class="px-3 py-2">
                  <input
                    v-model="col.length"
                    type="text"
                    placeholder="-"
                    class="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none text-center font-mono text-xs"
                  />
                </td>

                <!-- Flags -->
                <td class="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    v-model="col.is_nn"
                    class="rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </td>
                <td class="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    v-model="col.ai"
                    class="rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </td>

                <!-- Default -->
                <td class="px-3 py-2">
                  <input
                    v-model="col.default"
                    type="text"
                    placeholder="NULL"
                    class="w-full px-2 py-1.5 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none text-gray-500 text-xs"
                  />
                </td>

                <!-- Actions -->
                <td class="pr-6 py-2 text-right">
                  <button
                    @click="removeColumn(idx)"
                    class="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Add Column Button -->
          <div class="p-4 border-t border-gray-100 bg-gray-50/30">
            <button
              @click="addColumn"
              class="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700 px-3 py-2 rounded hover:bg-blue-50 transition-colors w-full justify-center border border-dashed border-blue-200"
            >
              <Plus class="w-4 h-4" /> Add New Column
            </button>
          </div>
        </div>

        <!-- PLACEHOLDER FOR OTHER TABS -->
        <div
          v-if="activeTab !== 'columns'"
          class="flex-1 flex items-center justify-center flex-col text-gray-400 bg-gray-50/50"
        >
          <Settings class="w-12 h-12 mb-2 opacity-20" />
          <p class="text-sm">Indexes & FK configuration coming soon</p>
        </div>
      </div>

      <!-- FOOTER -->
      <div
        class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0"
      >
        <div class="text-xs text-gray-500 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-green-500"></div>
          Ready to create
        </div>
        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            class="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="handleCreate"
            :disabled="!tableName"
            class="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
          >
            <Plus class="w-4 h-4" /> Create Table
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
