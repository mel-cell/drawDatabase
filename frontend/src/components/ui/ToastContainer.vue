<script setup lang="ts">
import { useToast } from "../../composables/useToast";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-vue-next";

const { toasts, removeToast } = useToast();

const iconMap: Record<string, any> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap: Record<string, string> = {
  success: "border-emerald-400 bg-emerald-50 text-emerald-800",
  error: "border-red-400 bg-red-50 text-red-800",
  info: "border-blue-400 bg-blue-50 text-blue-800",
  warning: "border-amber-400 bg-amber-50 text-amber-800",
};

const iconColorMap: Record<string, string> = {
  success: "text-emerald-500",
  error: "text-red-500",
  info: "text-blue-500",
  warning: "text-amber-500",
};
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0 translate-x-8 scale-95"
        enter-to-class="opacity-100 translate-x-0 scale-100"
        leave-from-class="opacity-100 translate-x-0 scale-100"
        leave-to-class="opacity-0 translate-x-8 scale-95"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto rounded-2xl border-l-4 p-4 shadow-xl backdrop-blur-sm flex items-start gap-3"
          :class="colorMap[toast.type]"
        >
          <component
            :is="iconMap[toast.type]"
            class="w-5 h-5 mt-0.5 flex-shrink-0"
            :class="iconColorMap[toast.type]"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold">{{ toast.title }}</p>
            <p v-if="toast.message" class="text-xs opacity-75 mt-0.5">{{ toast.message }}</p>
          </div>
          <button
            @click="removeToast(toast.id)"
            class="p-1 rounded-lg hover:bg-black/10 transition-colors flex-shrink-0"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
