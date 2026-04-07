<script setup lang="ts">
import { ref, watch } from "vue";
import { Plus, Trash2, Key, ChevronRight } from "lucide-vue-next";

const props = defineProps<{
  data: any;
  nodes: any[];
}>();

const emit = defineEmits(["update"]);

const tablename = ref("");
const tableColor = ref("#ffffff");
const columns = ref<any[]>([]);

// Sync Local state from props
watch(
  () => props.data,
  (newData) => {
    if (newData) {
      const d = newData.data || newData;
      tablename.value = d.name || d.label || "";
      tableColor.value = d.headerColor || "#ffffff";
      columns.value = (d.columns || []).map((c: any) => ({
        ...c,
        expanded: false,
      }));
    }
  },
  { immediate: true, deep: true },
);

// Push changes back to parent
watch(
  [tablename, tableColor, columns],
  () => {
    emit("update", {
      name: tablename.value,
      label: tablename.value,
      headerColor: tableColor.value,
      columns: columns.value.map((c) => {
        const { expanded, ...rest } = c;
        return rest;
      }),
    });
  },
  { deep: true },
);

const addColumn = () => {
  columns.value.push({
    name: "new_column",
    type: "VARCHAR(255)",
    is_pk: false,
    is_nn: true,
  });
};

const removeColumn = (idx: number) => {
  columns.value.splice(idx, 1);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Basic Info -->
    <section>
      <label class="text-[10px] uppercase font-bold text-gray-400 block mb-1"
        >Table Identity</label
      >
      <input
        v-model="tablename"
        class="w-full text-sm font-bold border border-gray-200 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
        placeholder="e.g. users"
      />
    </section>

    <!-- Colors -->
    <section>
      <label class="text-[10px] uppercase font-bold text-gray-400 block mb-2"
        >Header Color</label
      >
      <div class="flex flex-wrap gap-2">
        <button
          v-for="color in [
            '#ffffff',
            '#f8fafc',
            '#f0f9ff',
            '#f0fdf4',
            '#fef2f2',
            '#fffbeb',
            '#faf5ff',
          ]"
          :key="color"
          @click="tableColor = color"
          class="w-8 h-8 rounded-full border transition-all hover:scale-110 active:scale-95 shadow-sm"
          :class="
            tableColor === color
              ? 'ring-2 ring-blue-500 ring-offset-2 scale-110'
              : 'border-gray-200'
          "
          :style="{ backgroundColor: color }"
        ></button>
      </div>
    </section>

    <!-- Column Management -->
    <section>
      <div
        class="flex items-center justify-between mb-3 border-b border-gray-100 pb-2"
      >
        <label class="text-[10px] uppercase font-bold text-gray-400"
          >Schema ({{ columns.length }})</label
        >
        <button
          @click="addColumn"
          class="flex items-center gap-1 text-[11px] bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus class="w-3 h-3" /> Add Column
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="(col, idx) in columns"
          :key="idx"
          class="bg-gray-50/50 p-2.5 rounded-lg border border-gray-200 hover:border-blue-200 transition-all shadow-sm"
        >
          <div class="flex items-center gap-2 mb-2">
            <button
              @click="col.expanded = !col.expanded"
              class="text-gray-400 transition-transform"
              :class="{ 'rotate-90': col.expanded }"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
            <input
              v-model="col.name"
              class="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-400"
              placeholder="name"
            />
            <select
              v-model="col.type"
              class="w-24 text-[10px] border-none bg-transparent font-mono focus:ring-0"
            >
              <optgroup label="Core">
                <option>INT</option>
                <option>BIGINT</option>
                <option>VARCHAR(255)</option>
                <option>TEXT</option>
              </optgroup>
              <optgroup label="Other">
                <option>BOOL</option>
                <option>JSON</option>
                <option>TIMESTAMP</option>
              </optgroup>
            </select>
            <button
              @click="removeColumn(idx)"
              class="text-gray-300 hover:text-red-500 transition-colors p-1"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Attributes (Compact) -->
          <div class="flex gap-4 px-1">
            <label
              class="flex items-center gap-1.5 text-[10px] cursor-pointer group/attr"
            >
              <input
                type="checkbox"
                v-model="col.is_pk"
                class="w-3 h-3 rounded sm text-blue-600"
              />
              <Key
                class="w-3 h-3"
                :class="
                  col.is_pk
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300 group-hover/attr:text-gray-500'
                "
              />
              <span
                class="font-bold"
                :class="col.is_pk ? 'text-gray-900' : 'text-gray-400'"
                >PK</span
              >
            </label>
            <label class="flex items-center gap-1.5 text-[10px] cursor-pointer">
              <input
                type="checkbox"
                v-model="col.is_nn"
                class="w-3 h-3 rounded sm text-blue-600"
              />
              <span
                :class="col.is_nn ? 'text-gray-900 font-bold' : 'text-gray-400'"
                >NOT NULL</span
              >
            </label>
            <label class="flex items-center gap-1.5 text-[10px] cursor-pointer">
              <input
                type="checkbox"
                v-model="col.is_ai"
                class="w-3 h-3 rounded sm text-blue-600"
              />
              <span
                :class="col.is_ai ? 'text-gray-900 font-bold' : 'text-gray-400'"
                >AI</span
              >
            </label>
          </div>

          <div v-if="col.expanded" class="mt-3 pt-3 border-t border-gray-200">
            <label
              class="text-[9px] uppercase font-bold text-gray-400 mb-1 block"
              >Default Value</label
            >
            <input
              v-model="col.default"
              class="w-full text-[11px] border border-gray-100 rounded px-2 py-1 bg-white"
              placeholder="NULL"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
