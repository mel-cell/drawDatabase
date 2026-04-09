<script setup lang="ts">
import { ref, computed } from "vue";
import { X, Save } from "lucide-vue-next";

const props = defineProps<{
  isOpen: boolean;
  tableName: string;
  columns: string[];
}>();

const emit = defineEmits(["close", "success"]);

const formData = ref<Record<string, any>>({});
const isSaving = ref(false);

const handleSubmit = async () => {
  isSaving.value = true;
  try {
    const res = await fetch(
      `http://localhost:3000/api/data?table=${props.tableName}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData.value),
      }
    );

    if (res.ok) {
      emit("success");
      emit("close");
      formData.value = {}; // Reset
    } else {
      const err = await res.json();
      alert(`Failed: ${err.error}`);
    }
  } catch (e) {
    console.error(e);
    alert("Network error");
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-[500px] border border-gray-200 flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200"
    >
      <!-- Header -->
      <div
        class="h-12 border-b border-gray-100 flex items-center justify-between px-4 bg-gray-50/50"
      >
        <h3 class="font-bold text-gray-800 flex items-center gap-2">
          Add Row to
          <span
            class="text-blue-600 font-mono text-sm bg-blue-50 px-2 py-0.5 rounded"
            >{{ tableName }}</span
          >
        </h3>
        <button
          @click="$emit('close')"
          class="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <div v-for="col in columns" :key="col" class="space-y-1">
          <label class="text-xs font-semibold text-gray-500 uppercase">{{
            col
          }}</label>
          <input
            v-model="formData[col]"
            type="text"
            class="w-full text-sm border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            :placeholder="`Enter ${col}...`"
          />
        </div>
        <div
          v-if="columns.length === 0"
          class="text-center text-gray-400 text-sm py-4"
        >
          No columns detected.
        </div>
      </div>

      <!-- Footer -->
      <div
        class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2"
      >
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-200 rounded"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="isSaving"
          class="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-wait flex items-center gap-2"
        >
          <Save v-if="!isSaving" class="w-4 h-4" />
          <span v-else>Saving...</span>
          Save Row
        </button>
      </div>
    </div>
  </div>
</template>
