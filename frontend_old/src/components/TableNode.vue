<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import { Key } from "lucide-vue-next";

const props = defineProps<{
  id: string;
  data: {
    name: string;
    label?: string;
    headerColor?: string;
    columns: Array<{
      name: string;
      type: string;
      is_pk: boolean;
      is_fk: boolean;
    }>;
  };
  selected?: boolean;
}>();

const getTypeColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("int")) return "text-blue-500";
  if (t.includes("char") || t.includes("text")) return "text-emerald-500";
  if (t.includes("date") || t.includes("time") || t.includes("stamp"))
    return "text-orange-500";
  if (t.includes("bool") || t.includes("json")) return "text-purple-500";
  return "text-gray-400";
};
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-lg border-2 min-w-[200px] overflow-hidden transition-all duration-300 group"
    :class="
      selected
        ? 'border-blue-500 ring-4 ring-blue-50/50 scale-[1.02]'
        : 'border-gray-200 hover:border-blue-300'
    "
  >
    <!-- Header -->
    <div
      class="px-4 py-3 border-b flex items-center justify-between"
      :style="{
        backgroundColor: data.headerColor || '#ffffff',
        borderColor: selected ? '#3b82f6' : '#e2e8f0',
      }"
    >
      <div class="flex flex-col">
        <span
          class="text-[10px] uppercase font-black tracking-widest text-gray-400 leading-none mb-1"
          >Table</span
        >
        <span
          class="text-sm font-bold text-gray-900 truncate max-w-[150px] uppercase"
          >{{ data.name || data.label }}</span
        >
      </div>
    </div>

    <!-- Column List -->
    <div class="py-1 bg-white">
      <div
        v-for="(col, index) in data.columns"
        :key="index"
        class="relative flex justify-between items-center py-1.5 px-4 hover:bg-blue-50/50 transition-colors group/col"
      >
        <!-- Target Handle (Left) -->
        <Handle
          :id="`target-${col.name}`"
          type="target"
          :position="Position.Left"
          class="!w-2 !h-2 !bg-blue-400 !border-none !-left-1 opacity-0 group-hover/col:opacity-100 transition-all"
        />

        <div class="flex items-center gap-2 flex-1 min-w-0">
          <!-- PK Icon -->
          <div class="w-4 flex-shrink-0">
            <Key
              v-if="col.is_pk"
              class="w-3.5 h-3.5 text-amber-500 fill-amber-500"
            />
            <Key
              v-else-if="col.is_fk"
              class="w-3 h-3 text-gray-300 -rotate-45"
            />
          </div>

          <span
            class="text-[12px] font-medium truncate"
            :class="col.is_pk ? 'text-gray-900 font-bold' : 'text-gray-600'"
          >
            {{ col.name }}
          </span>
        </div>

        <span
          class="text-[10px] ml-4 font-mono font-bold uppercase shrink-0 opacity-70"
          :class="getTypeColor(col.type)"
        >
          {{ col.type }}
        </span>

        <!-- Source Handle (Right) -->
        <Handle
          :id="`source-${col.name}`"
          type="source"
          :position="Position.Right"
          class="!w-2 !h-2 !bg-blue-600 !border-none !-right-1 opacity-0 group-hover/col:opacity-100 transition-all"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.vue-flow__handle:hover {
  transform: scale(1.5);
  background: #2563eb !important;
}
</style>
