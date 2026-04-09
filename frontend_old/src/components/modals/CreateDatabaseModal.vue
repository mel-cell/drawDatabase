<script setup lang="ts">
import { ref } from "vue";
import { X, Database, Plus } from "lucide-vue-next";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(["close", "create"]);

const dbName = ref("");

const handleCreate = () => {
  if (!dbName.value) return;
  emit("create", dbName.value);
  dbName.value = "";
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm transition-all"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- HEADER -->
      <div
        class="px-5 py-3 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center"
      >
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
            <Database class="w-4 h-4" />
          </div>
          <h3 class="font-bold text-gray-800">New Database</h3>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- BODY -->
      <div class="p-6">
        <label
          class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
          >Database Name</label
        >
        <input
          v-model="dbName"
          @keyup.enter="handleCreate"
          type="text"
          placeholder="e.g. ecommerce_db"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          autofocus
        />
        <p class="text-[10px] text-gray-400 mt-2">
          Use lowercase letters, numbers, and underscores only.
        </p>
      </div>

      <!-- FOOTER -->
      <div
        class="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-3"
      >
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleCreate"
          :disabled="!dbName"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <Plus class="w-3.5 h-3.5" /> Create
        </button>
      </div>
    </div>
  </div>
</template>
