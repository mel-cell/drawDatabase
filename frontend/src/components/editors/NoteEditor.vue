<script setup lang="ts">
import { ref, watch } from "vue";
import { Palette, Trash2 } from "lucide-vue-next";

const props = defineProps<{
  data: any;
}>();

const emit = defineEmits(["update", "delete"]);

const noteLabel = ref("");
const noteStyle = ref({
  fontSize: 14,
  color: "#000000",
  backgroundColor: "#fef3c7",
  fontWeight: "normal",
});

watch(
  () => props.data,
  (newData) => {
    if (newData) {
      const d = newData.data;
      const s = newData.style || {};
      noteLabel.value = d.label || "";
      noteStyle.value = {
        fontSize: d.style?.fontSize || 14,
        color: d.style?.color || "#000000",
        fontWeight: d.style?.fontWeight || "normal",
        backgroundColor: s.backgroundColor || "#fef3c7",
      };
    }
  },
  { immediate: true, deep: true },
);

watch(
  [noteLabel, noteStyle],
  () => {
    emit("update", {
      data: {
        label: noteLabel.value,
        style: {
          fontSize: Number(noteStyle.value.fontSize),
          color: noteStyle.value.color,
          fontWeight: noteStyle.value.fontWeight,
        },
      },
      style: {
        backgroundColor: noteStyle.value.backgroundColor,
      },
    });
  },
  { deep: true },
);
</script>

<template>
  <div class="space-y-6">
    <section>
      <label class="text-[10px] uppercase font-bold text-gray-400 block mb-1"
        >Content</label
      >
      <textarea
        v-model="noteLabel"
        class="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 focus:ring-2 focus:ring-amber-50 focus:border-amber-400 outline-none min-h-[120px] transition-all resize-y shadow-sm"
        placeholder="Don't forget to add indexes..."
      ></textarea>
    </section>

    <section>
      <label
        class="text-[10px] uppercase font-bold text-gray-400 block mb-3 flex items-center gap-1"
      >
        <Palette class="w-3 h-3" /> Appearance
      </label>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-[10px] text-gray-500 block mb-1">Font Size</label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model="noteStyle.fontSize"
              class="w-full border border-gray-100 rounded px-2 py-1 text-xs"
            />
          </div>
        </div>
        <div>
          <label class="text-[10px] text-gray-500 block mb-1">Weight</label>
          <select
            v-model="noteStyle.fontWeight"
            class="w-full border border-gray-100 rounded px-2 py-1 text-xs bg-white"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] text-gray-500 block mb-1">Text Color</label>
          <input
            type="color"
            v-model="noteStyle.color"
            class="w-full h-8 rounded border border-gray-200 cursor-pointer"
          />
        </div>
        <div>
          <label class="text-[10px] text-gray-500 block mb-1">Background</label>
          <input
            type="color"
            v-model="noteStyle.backgroundColor"
            class="w-full h-8 rounded border border-gray-200 cursor-pointer"
          />
        </div>
      </div>
    </section>

    <section class="pt-6 border-t border-gray-100">
      <button
        @click="emit('delete')"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-semibold"
      >
        <Trash2 class="w-4 h-4" /> Delete Note
      </button>
    </section>
  </div>
</template>
