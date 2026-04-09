import { ref } from "vue";

export interface Toast {
  id: number;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

export function useToast() {
  const addToast = (toast: Omit<Toast, "id">) => {
    const id = nextId++;
    const duration = toast.duration ?? 4000;
    toasts.value.push({ ...toast, id });

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const success = (title: string, message?: string) =>
    addToast({ type: "success", title, message });

  const error = (title: string, message?: string) =>
    addToast({ type: "error", title, message, duration: 6000 });

  const info = (title: string, message?: string) =>
    addToast({ type: "info", title, message });

  const warning = (title: string, message?: string) =>
    addToast({ type: "warning", title, message });

  return { toasts, addToast, removeToast, success, error, info, warning };
}
