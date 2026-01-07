<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";

const props = defineProps<{
  x: number;
  y: number;
  items: { label: string; action: string; danger?: boolean; icon?: any }[];
}>();

const emit = defineEmits(["close", "select"]);
const menuRef = ref<HTMLElement | null>(null);

// Close when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit("close");
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("contextmenu", handleClickOutside); // Close on functionality right click elsewhere
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("contextmenu", handleClickOutside);
});
</script>

<template>
  <div
    ref="menuRef"
    class="fixed z-50 bg-white min-w-[160px] shadow-xl border border-gray-200 rounded-lg py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100"
    :style="{ top: `${y}px`, left: `${x}px` }"
  >
    <button
      v-for="(item, idx) in items"
      :key="idx"
      @click="$emit('select', item.action)"
      class="text-left px-4 py-2 text-xs font-medium hover:bg-gray-100 flex items-center gap-2 transition-colors w-full"
      :class="item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'"
    >
      <component :is="item.icon" v-if="item.icon" class="w-3.5 h-3.5" />
      {{ item.label }}
    </button>
  </div>
</template>
