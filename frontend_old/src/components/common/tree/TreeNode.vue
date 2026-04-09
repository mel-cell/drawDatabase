<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  label: string;
  icon?: string;
  isOpen?: boolean;
  hasChildren?: boolean;
}>();

const emit = defineEmits(["toggle", "click", "contextmenu"]);

const isOpen = ref(props.isOpen || false);

watch(
  () => props.isOpen,
  (newVal) => {
    isOpen.value = newVal || false;
  }
);

const toggle = () => {
  if (props.hasChildren) {
    isOpen.value = !isOpen.value;
    emit("toggle", isOpen.value);
  }
};
</script>

<template>
  <div class="select-none">
    <div
      @click="
        toggle();
        $emit('click');
      "
      @contextmenu.prevent="$emit('contextmenu', $event)"
      class="flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer rounded-sm group text-sm"
      :class="{ 'text-blue-600': isOpen }"
    >
      <!-- Arrow Icon -->
      <span
        v-if="hasChildren"
        class="mr-1 text-gray-400 transform transition-transform"
        :class="{ 'rotate-90': isOpen }"
      >
        <svg
          class="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </span>
      <span v-else class="w-4"></span>

      <!-- Folder/Item Icon -->
      <span class="mr-2 opacity-70 flex items-center">
        <slot name="icon">
          <!-- Fallback if prop provided -->
          <i v-if="icon" :class="icon"></i>
        </slot>
      </span>

      <span
        class="truncate font-medium group-hover:text-black"
        :class="isOpen ? 'text-gray-900' : 'text-gray-600'"
      >
        {{ label }}
      </span>
    </div>

    <!-- Children Container -->
    <div
      v-if="isOpen && hasChildren"
      class="pl-4 border-l border-gray-100 ml-2"
    >
      <slot></slot>
    </div>
  </div>
</template>
