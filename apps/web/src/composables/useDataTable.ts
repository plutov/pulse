import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import type { ErrorResponse } from "@pulse/shared";

export interface PaginationParams {
  page: number;
  rowsPerPage: number;
  rowsNumber: number;
}

interface PaginatedResponse<T> {
  data?: {
    rows: T[];
    total: number;
  };
}

interface UseDataTableOptions<T> {
  fetchFn: (
    page: number,
    size: number,
  ) => Promise<{ data?: T[] } | PaginatedResponse<T>>;
  onError?: (error: string) => void;
  autoFetch?: boolean;
  paginated?: boolean;
  defaultPageSize?: number;
}

export function useDataTable<T>(options: UseDataTableOptions<T>) {
  const {
    fetchFn,
    onError,
    autoFetch = true,
    paginated = false,
    defaultPageSize = 50,
  } = options;
  const $q = useQuasar();

  const data = ref<T[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<PaginationParams>({
    page: 1,
    rowsPerPage: defaultPageSize,
    rowsNumber: 0,
  });

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
      const currentPage = pagination.value.page;
      const currentSize = pagination.value.rowsPerPage;

      const response = await fetchFn(currentPage, currentSize);

      if (paginated && response.data && "rows" in response.data) {
        const paginatedData = response.data as { rows: T[]; total: number };
        data.value = paginatedData.rows;
        pagination.value.rowsNumber = paginatedData.total;
        pagination.value.page = currentPage;
        pagination.value.rowsPerPage = currentSize;
      } else if (response.data && Array.isArray(response.data)) {
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

  const onRequest = (requestProps: {
    pagination: { page: number; rowsPerPage: number };
  }) => {
    const { page, rowsPerPage } = requestProps.pagination;
    const currentPage = rowsPerPage !== pagination.value.rowsPerPage ? 1 : page;

    pagination.value.page = currentPage;
    pagination.value.rowsPerPage = rowsPerPage;

    void fetch();
  };

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
    pagination,
    onRequest: paginated ? onRequest : undefined,
  };
}
