<script setup lang="ts">
import { AlertTriangle, Info } from "lucide-vue-next";

defineProps<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDanger?: boolean;
}>();

defineEmits(["close", "confirm"]);
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm transition-all"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200"
    >
      <div class="p-6">
        <div class="flex items-start gap-4">
          <div
            class="p-2 rounded-full shrink-0"
            :class="
              isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            "
          >
            <AlertTriangle v-if="isDanger" class="w-6 h-6" />
            <Info v-else class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-lg mb-1">{{ title }}</h3>
            <p
              class="text-sm text-gray-500 leading-relaxed whitespace-pre-line"
            >
              {{ message }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3"
      >
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          @click="$emit('confirm')"
          class="px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-all"
          :class="
            isDanger
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          "
        >
          {{ confirmLabel || "Confirm" }}
        </button>
      </div>
    </div>
  </div>
</template>
