<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import { ref, watch } from "vue";
import { X } from "lucide-vue-next"; // Import X icon
import { useDiagram } from "../../composables/useDiagram"; // Import logic

const props = defineProps<{
  id: string; // Inject ID
  data: {
    label: string;
    style?: any;
    isText?: boolean;
  };
  selected?: boolean;
}>();

const { removeNode } = useDiagram();
const text = ref(props.data.label || "");

// Sync external changes
watch(
  () => props.data.label,
  (newVal) => {
    text.value = newVal;
  }
);

const onInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  text.value = target.value;
  props.data.label = target.value;
};
</script>

<template>
  <div
    class="node-wrapper group relative h-full w-full"
    :class="{ selected: selected }"
  >
    <!-- Hidden Handles for VueFlow -->
    <Handle type="target" :position="Position.Top" class="!opacity-0" />
    <Handle type="source" :position="Position.Bottom" class="!opacity-0" />

    <!-- Delete Button (Visible on Hover/Select) -->
    <button
      @click.stop="removeNode(props.id)"
      class="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:bg-red-600 scale-75 hover:scale-100"
      title="Delete Note"
    >
      <X class="w-3 h-3" />
    </button>

    <textarea
      v-model="text"
      @input="onInput"
      @contextmenu.prevent
      class="w-full h-full resize-none outline-none border-none bg-transparent p-2 font-sans placeholder-black/20"
      :class="{
        'text-center': props.data.isText,
        'text-left': !props.data.isText,
      }"
      :style="{
        fontSize: (props.data.style?.fontSize || 14) + 'px',
        color: props.data.style?.color || 'inherit',
        fontWeight: props.data.style?.fontWeight || 'normal',
      }"
      placeholder="Type something..."
    ></textarea>

    <!-- Resize Indicator -->
    <div
      v-if="selected"
      class="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-tl cursor-se-resize opacity-50 pointer-events-none"
    ></div>
  </div>
</template>

<style scoped>
.node-wrapper {
  min-width: 50px;
  min-height: 30px;
  box-sizing: border-box;
}

textarea {
  overflow: hidden;
}

.selected {
  outline: 2px solid #3b82f6;
}
</style>
