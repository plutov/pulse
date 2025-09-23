<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-md">
      <h4 class="q-ma-none">Monitors</h4>
      <q-btn
        color="accent"
        label="Create Monitor"
        icon="add"
        @click="createMonitor"
      />
    </div>

    <DataTable
      :data="data"
      :columns="monitorTableColumns"
      :loading="loading"
      row-key="id"
    />
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { getMonitorApi } from "boot/axios";
import { MonitorType, type Monitor } from "@pulse/shared";
import { useDataTable } from "../composables/useDataTable";
import DataTable from "../components/DataTable.vue";
import StatusBadge from "src/components/ui/StatusBadge.vue";
import { date } from "quasar";

const monitorTableColumns = [
  {
    name: "name",
    required: true,
    label: "Name",
    align: "left" as const,
    field: (row: Monitor) => row.name,
  },
  {
    name: "monitorType",
    required: true,
    label: "Type",
    align: "left" as const,
    field: (row: Monitor) => row.monitorType,
  },
  {
    name: "status",
    required: true,
    label: "Status",
    align: "left" as const,
    field: (row: Monitor) => row.status,
    component: StatusBadge,
  },
  {
    name: "schedule",
    required: true,
    label: "Schedule",
    align: "left" as const,
    field: (row: Monitor) => row.schedule,
  },
  {
    name: "author",
    required: true,
    label: "Author",
    align: "left" as const,
    field: (row: Monitor) => row.author.username,
  },
  {
    name: "createdAt",
    required: true,
    label: "Created",
    align: "left" as const,
    field: (row: Monitor) =>
      date.formatDate(new Date(row.createdAt), "YYYY-MM-DD HH:mm"),
  },
  {
    name: "httpConfig",
    required: false,
    label: "Config",
    align: "left" as const,
    field: (row: Monitor) =>
      row.monitorType === MonitorType.http && row.config
        ? `${row.config.method} ${row.config.url}`
        : "N/A",
  },
];

const $router = useRouter();

const { data, loading } = useDataTable<Monitor>({
  fetchFn: async () => {
    const monitorApi = getMonitorApi();
    return await monitorApi.listMonitors();
  },
});

const createMonitor = () => {
  void $router.push("/monitors/create");
};
</script>
