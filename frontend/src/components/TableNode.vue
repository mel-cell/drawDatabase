<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import { Key, Settings, Eye, Trash2 } from "lucide-vue-next";

defineProps<{
  data: {
    label: string;
    columns: Array<{
      name: string;
      type: string;
      is_pk: boolean;
      is_fk: boolean;
    }>;
  };
}>();

const getTypeColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("int")) return "text-blue-500";
  if (t.includes("char") || t.includes("text")) return "text-green-500";
  if (t.includes("date") || t.includes("time")) return "text-orange-500";
  if (t.includes("bool")) return "text-purple-500";
  return "text-gray-400";
};
</script>

<template>
  <div
    class="bg-white rounded-md shadow-md border border-gray-300 min-w-[220px] overflow-hidden group hover:shadow-xl transition-all hover:border-blue-400 relative"
  >
    <!-- Quick Actions Toolbar (Show on Hover) -->
    <div
      class="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1 bg-gray-800 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto shadow-lg z-50"
    >
      <button class="p-1 hover:bg-gray-600 rounded" title="Edit Structure">
        <Settings class="w-3.5 h-3.5" />
      </button>
      <button class="p-1 hover:bg-gray-600 rounded" title="View Data">
        <Eye class="w-3.5 h-3.5" />
      </button>
      <div class="w-px h-3 bg-gray-600 self-center mx-0.5"></div>
      <button
        class="p-1 hover:bg-red-600 rounded text-red-200 hover:text-white"
        title="Drop Table"
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Header -->
    <div
      class="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-3 py-2 font-bold text-gray-800 flex items-center justify-between text-sm"
    >
      <span class="truncate">{{ data.label }}</span>
      <!-- Table Options / More Menu could go here -->
    </div>

    <!-- Columns -->
    <div class="py-1 bg-white">
      <div
        v-for="(col, index) in data.columns"
        :key="index"
        class="relative flex justify-between items-center py-1 px-3 hover:bg-blue-50 text-xs transition-colors group/col"
      >
        <!-- Left Connection Handle (Target) -->
        <Handle
          :id="`target-${col.name}`"
          type="target"
          :position="Position.Left"
          class="!w-2 !h-2 !bg-gray-400 !-left-[5px] !border-none opacity-0 group-hover/col:opacity-100 transition-opacity"
        />

        <div class="flex items-center gap-2 flex-1 overflow-hidden">
          <!-- PK/FK Icons -->
          <div class="w-4 flex justify-center">
            <Key
              v-if="col.is_pk"
              class="w-3 h-3 text-yellow-500 fill-yellow-500"
            />
            <Key
              v-else-if="col.is_fk"
              class="w-3 h-3 text-gray-400 -rotate-45"
            />
          </div>

          <span
            class="text-gray-700 font-medium truncate"
            :class="{ 'font-bold text-black': col.is_pk }"
          >
            {{ col.name }}
          </span>
        </div>

        <span
          class="text-[10px] ml-2 font-mono"
          :class="getTypeColor(col.type)"
        >
          {{ col.type.replace(" PK", "").replace(" FK", "") }}
        </span>

        <!-- Right Connection Handle (Source) -->
        <Handle
          :id="`source-${col.name}`"
          type="source"
          :position="Position.Right"
          class="!w-2 !h-2 !bg-blue-500 !-right-[5px] !border-none opacity-0 group-hover/col:opacity-100 transition-opacity"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure handles are visible when connecting */
.vue-flow__node-table .vue-flow__handle {
  opacity: 0;
}
.vue-flow__node-table:hover .vue-flow__handle,
.vue-flow__connection-start .vue-flow__handle {
  opacity: 1;
}
</style>
