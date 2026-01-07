<script setup lang="ts">
import { ref } from "vue";
import { X, Download, FileJson, FileCode, Image } from "lucide-vue-next";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(["close", "export"]);

const selectedFormat = ref("png");
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
            <Download class="w-4 h-4" />
          </div>
          <h3 class="font-bold text-gray-800">Export Diagram</h3>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- BODY -->
      <div class="p-6 grid grid-cols-2 gap-4">
        <button
          @click="selectedFormat = 'png'"
          class="p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center gap-2 group relative"
          :class="
            selectedFormat === 'png'
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-gray-100 hover:border-gray-200 bg-gray-50'
          "
        >
          <div
            class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 mb-1"
          >
            <Image class="w-5 h-5" />
          </div>
          <span class="font-bold text-sm text-gray-700">Image (PNG)</span>
          <div
            v-if="selectedFormat === 'png'"
            class="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"
          ></div>
        </button>

        <button
          @click="selectedFormat = 'sql'"
          class="p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center gap-2 group relative"
          :class="
            selectedFormat === 'sql'
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-gray-100 hover:border-gray-200 bg-gray-50'
          "
        >
          <div
            class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 mb-1"
          >
            <FileCode class="w-5 h-5" />
          </div>
          <span class="font-bold text-sm text-gray-700">SQL Schema</span>
          <div
            v-if="selectedFormat === 'sql'"
            class="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"
          ></div>
        </button>

        <button
          @click="selectedFormat = 'json'"
          class="p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center gap-2 group relative"
          :class="
            selectedFormat === 'json'
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-gray-100 hover:border-gray-200 bg-gray-50'
          "
        >
          <div
            class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 mb-1"
          >
            <FileJson class="w-5 h-5" />
          </div>
          <span class="font-bold text-sm text-gray-700">JSON</span>
          <div
            v-if="selectedFormat === 'json'"
            class="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500"
          ></div>
        </button>
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
          @click="$emit('export', selectedFormat)"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-2"
        >
          <Download class="w-3.5 h-3.5" /> Download
        </button>
      </div>
    </div>
  </div>
</template>
