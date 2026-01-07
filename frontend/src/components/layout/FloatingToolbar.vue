<script setup lang="ts">
import { ref } from "vue";
import {
  MousePointer2,
  Hand,
  Square,
  StickyNote,
  Type,
  ZoomIn,
  ZoomOut,
  Redo,
  Undo,
  LayoutGrid,
} from "lucide-vue-next";

const emit = defineEmits(["tool-action"]);

const activeTool = ref("pointer");
const zoomLevel = ref(100);

const setTool = (tool: string) => {
  if (
    tool === "add-table" ||
    tool === "zoom-in" ||
    tool === "zoom-out" ||
    tool === "undo" ||
    tool === "redo"
  ) {
    emit("tool-action", tool);
    // Don't set activeTool for one-off actions
    return;
  }
  activeTool.value = tool;
  emit("tool-action", tool);
};
</script>

<template>
  <div
    class="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-auto"
  >
    <!-- Main Tools -->
    <div
      class="bg-white rounded-lg shadow-md border border-gray-200 p-1.5 flex flex-col gap-1"
    >
      <button
        @click="setTool('pointer')"
        class="p-2 rounded hover:bg-gray-100 transition-colors tooltip relative group"
        :class="{
          'bg-blue-50 text-blue-600': activeTool === 'pointer',
          'text-gray-600': activeTool !== 'pointer',
        }"
      >
        <MousePointer2 class="w-5 h-5" />
        <span class="tooltip-text">Select</span>
      </button>

      <button
        @click="setTool('hand')"
        class="p-2 rounded hover:bg-gray-100 transition-colors tooltip relative group"
        :class="{
          'bg-blue-50 text-blue-600': activeTool === 'hand',
          'text-gray-600': activeTool !== 'hand',
        }"
      >
        <Hand class="w-5 h-5" />
        <span class="tooltip-text">Pan</span>
      </button>

      <div class="h-px bg-gray-200 my-0.5"></div>

      <button
        @click="setTool('add-table')"
        class="p-2 rounded hover:bg-gray-100 transition-colors tooltip relative group"
        :class="{
          'bg-blue-50 text-blue-600': activeTool === 'add-table',
          'text-gray-600': activeTool !== 'add-table',
        }"
      >
        <Square class="w-5 h-5" />
        <span class="tooltip-text">Add Table</span>
      </button>

      <button
        @click="setTool('note')"
        class="p-2 rounded hover:bg-gray-100 transition-colors tooltip relative group"
        :class="{
          'bg-blue-50 text-blue-600': activeTool === 'note',
          'text-gray-600': activeTool !== 'note',
        }"
      >
        <StickyNote class="w-5 h-5" />
        <span class="tooltip-text">Add Note</span>
      </button>

      <button
        @click="setTool('text')"
        class="p-2 rounded hover:bg-gray-100 transition-colors tooltip relative group"
        :class="{
          'bg-blue-50 text-blue-600': activeTool === 'text',
          'text-gray-600': activeTool !== 'text',
        }"
      >
        <Type class="w-5 h-5" />
        <span class="tooltip-text">Add Text</span>
      </button>

      <button
        @click="setTool('group')"
        class="p-2 rounded hover:bg-gray-100 transition-colors tooltip relative group"
        :class="{
          'bg-blue-50 text-blue-600': activeTool === 'group',
          'text-gray-600': activeTool !== 'group',
        }"
      >
        <LayoutGrid class="w-5 h-5" />
        <span class="tooltip-text">Add Group</span>
      </button>
    </div>

    <!-- Zoom & History -->
    <div
      class="bg-white rounded-lg shadow-md border border-gray-200 p-1.5 flex flex-col gap-1"
    >
      <button
        class="p-2 text-gray-600 hover:bg-gray-100 rounded"
        @click="zoomLevel += 10"
      >
        <ZoomIn class="w-5 h-5" />
      </button>
      <div class="text-[10px] text-center font-mono py-1 text-gray-500">
        {{ zoomLevel }}%
      </div>
      <button
        class="p-2 text-gray-600 hover:bg-gray-100 rounded"
        @click="zoomLevel -= 10"
      >
        <ZoomOut class="w-5 h-5" />
      </button>

      <div class="h-px bg-gray-200 my-0.5"></div>

      <button class="p-2 text-gray-600 hover:bg-gray-100 rounded">
        <Undo class="w-5 h-5" />
      </button>
      <button class="p-2 text-gray-600 hover:bg-gray-100 rounded">
        <Redo class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.tooltip-text {
  @apply absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 pointer-events-none transition-opacity whitespace-nowrap z-50;
}
.group:hover .tooltip-text {
  @apply opacity-100;
}
</style>
