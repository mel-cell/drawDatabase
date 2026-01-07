<script setup lang="ts">
import { ref } from "vue";
import { X, Upload, FileJson, FileCode } from "lucide-vue-next";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(["close", "import"]);

const isDragging = ref(false);

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  // Placeholder: In real app, handle file processing
  emit("import", e.dataTransfer?.files[0]);
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm transition-all"
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
            <Upload class="w-4 h-4" />
          </div>
          <h3 class="font-bold text-gray-800">Import Diagram</h3>
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
        <div
          class="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors"
          :class="
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
          "
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <div
            class="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-blue-500"
          >
            <Upload class="w-6 h-6" />
          </div>
          <h4 class="font-bold text-gray-700 mb-1">
            Click or Drag file to upload
          </h4>
          <p class="text-xs text-gray-400 mb-6">Supports .json or .sql files</p>

          <button
            class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50"
          >
            Browse Files
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
