<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import { useDiagram } from "../../composables/useDiagram";
import { X } from "lucide-vue-next";

const props = defineProps<{
  id: string;
  data: {
    label: string;
    color?: string;
  };
  selected?: boolean;
}>();

const { removeNode } = useDiagram();
</script>

<template>
  <div class="group-node w-full h-full relative group">
    <!-- Handles (Hidden) -->
    <Handle type="target" :position="Position.Top" class="!opacity-0" />
    <Handle type="source" :position="Position.Bottom" class="!opacity-0" />

    <!-- Delete Button (Visible on Hover/Select) -->
    <button
      @click.stop="removeNode(props.id)"
      class="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:bg-red-600 scale-75 hover:scale-100"
      title="Delete Group"
    >
      <X class="w-3 h-3" />
    </button>

    <!-- Label -->
    <div
      class="absolute -top-6 left-0 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
      :style="{ color: props.selected ? '#3b82f6' : '#94a3b8' }"
    >
      {{ props.data.label }}
    </div>

    <!-- The actual visual box is handled by the parent wrapper style, 
         but we can add a subtle inner border or effect if selected -->
    <div
      class="w-full h-full border-2 border-transparent transition-colors rounded-lg pointer-events-none"
      :class="{ '!border-blue-400': selected }"
    ></div>
  </div>
</template>

<style scoped>
/* No styles needed yet */
</style>
