<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-md">
      <h4 class="q-ma-none">Monitor Runs</h4>
      <q-btn
        flat
        dense
        icon="refresh"
        @click="refresh"
        :loading="loading"
        label="Refresh"
      />
    </div>

    <div class="row q-mb-md">
      <div class="col-12 col-md-4">
        <q-select
          v-model="selectedMonitorId"
          :options="monitorOptions"
          option-value="id"
          option-label="name"
          emit-value
          map-options
          clearable
          label="Filter by Monitor"
          @update:model-value="onMonitorFilterChange"
        />
      </div>
    </div>

    <DataTable
      :data="data"
      :columns="runsTableColumns"
      :loading="loading"
      @request="onRequest"
      row-key="id"
      :pagination="pagination"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getMonitorApi } from "boot/axios";
import type { MonitorRun, Monitor } from "@pulse/shared";

import StatusBadge from "src/components/ui/StatusBadge.vue";
import DataTable from "src/components/DataTable.vue";
import { date } from "quasar";
import { useDataTable } from "src/composables/useDataTable";
import RunDetails from "src/components/ui/table/RunDetails.vue";
import { notifyOnError } from "src/composables/notify";

const $route = useRoute();

const selectedMonitorId = ref<string | null>(null);
const monitorOptions = ref<Monitor[]>([]);

const {
  data,
  loading,
  refresh,
  pagination,
  onRequest: baseOnRequest,
} = useDataTable<MonitorRun>({
  fetchFn: async (page: number, size: number) => {
    const monitorApi = getMonitorApi();
    const currentPage = page || 1;
    const offset = (currentPage - 1) * size;
    return await monitorApi.listMonitorRuns(
      selectedMonitorId.value || undefined,
      size,
      offset,
    );
  },
  paginated: true,
  autoFetch: false,
});

const runsTableColumns = [
  {
    name: "monitor",
    required: true,
    label: "Monitor",
    align: "left" as const,
    field: (row: MonitorRun) => row.monitor.name,
    sortable: false,
  },
  {
    name: "status",
    required: true,
    label: "Status",
    align: "left" as const,
    field: (row: MonitorRun) => row.status,
    component: StatusBadge,
    sortable: false,
  },
  {
    name: "duration",
    required: true,
    label: "Duration (ms)",
    align: "right" as const,
    field: (row: MonitorRun) => `${row.durationMs}ms`,
    sortable: false,
  },
  {
    name: "details",
    required: true,
    label: "Details",
    align: "right" as const,
    field: (row: MonitorRun) => row.details,
    component: RunDetails,
    sortable: false,
  },
  {
    name: "createdAt",
    required: true,
    label: "Run Time",
    align: "left" as const,
    field: (row: MonitorRun) =>
      date.formatDate(new Date(row.createdAt), "YYYY-MM-DD HH:mm:ss"),
    sortable: false,
  },
];

const fetchMonitors = async () => {
  try {
    const monitorApi = getMonitorApi();
    const response = await monitorApi.listMonitors();
    monitorOptions.value = response.data;
  } catch (err: unknown) {
    notifyOnError(err);
  }
};

const onRequest = (requestProps: {
  pagination: { page: number; rowsPerPage: number };
}) => {
  baseOnRequest(requestProps);
};

const onMonitorFilterChange = () => {
  pagination.value.page = 1;
  void refresh();
};

onMounted(async () => {
  const monitorIdFromQuery = $route.query.monitorId as string;
  if (monitorIdFromQuery) {
    selectedMonitorId.value = monitorIdFromQuery;
  }

  await fetchMonitors();
  void refresh();
});
</script>
