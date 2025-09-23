import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import type { ErrorResponse } from "@pulse/shared";

interface UseDataTableOptions<T> {
  fetchFn: () => Promise<{ data?: T[] }>;
  onError?: (error: string) => void;
  autoFetch?: boolean;
}

export function useDataTable<T>(options: UseDataTableOptions<T>) {
  const { fetchFn, onError, autoFetch = true } = options;
  const $q = useQuasar();

  const data = ref<T[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const handleError = (errorMessage: string) => {
    error.value = errorMessage;
    if (onError) {
      onError(errorMessage);
    } else {
      $q.notify({
        type: "negative",
        message: errorMessage,
      });
    }
  };

  const fetch = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetchFn();
      if (response.data) {
        data.value = response.data;
      }
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred";

      if (axios.isAxiosError(err)) {
        const response = err.response?.data as ErrorResponse;
        errorMessage = response?.message || "API request failed";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      handleError(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  const refresh = () => fetch();

  onMounted(() => {
    if (autoFetch) {
      void fetch();
    }
  });

  return {
    data,
    loading,
    error,
    fetch,
    refresh,
  };
}
