<script setup lang="ts">
import { Database, Info, Trash2, Edit3, Calendar } from "lucide-vue-next";

const props = defineProps<{
  dbName: string;
}>();

const emit = defineEmits(["delete"]);
</script>

<template>
  <div class="space-y-6">
    <div
      class="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-4"
    >
      <div
        class="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center"
      >
        <Database class="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h2
          class="font-bold text-gray-900 leading-tight truncate max-w-[200px]"
        >
          {{ dbName }}
        </h2>
        <p
          class="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1"
        >
          Active Database
        </p>
      </div>
    </div>

    <section class="space-y-4">
      <div class="flex items-center gap-2 text-gray-500">
        <Info class="w-4 h-4" />
        <span
          class="text-xs font-semibold uppercase tracking-wider text-gray-400"
          >Database Info</span
        >
      </div>

      <div class="grid grid-cols-1 gap-2">
        <div
          class="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <Calendar class="w-4 h-4 text-gray-400" />
            <span class="text-xs text-gray-600 font-medium">Character Set</span>
          </div>
          <span class="text-xs font-mono text-blue-600">utf8mb4</span>
        </div>

        <div
          class="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <Info class="w-4 h-4 text-gray-400" />
            <span class="text-xs text-gray-600 font-medium">Engine</span>
          </div>
          <span class="text-xs font-mono text-blue-600">InnoDB</span>
        </div>
      </div>
    </section>

    <section class="pt-6 border-t border-gray-100 space-y-2">
      <label class="text-[10px] uppercase font-bold text-gray-400 block mb-2"
        >Management</label
      >
      <button
        class="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs font-semibold"
      >
        <Edit3 class="w-4 h-4" /> Rename Database
      </button>
      <button
        @click="emit('delete')"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-semibold"
      >
        <Trash2 class="w-4 h-4" /> Drop Database
      </button>
    </section>
  </div>
</template>
