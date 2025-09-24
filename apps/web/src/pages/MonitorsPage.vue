<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-md">
      <h4 class="q-ma-none">Monitors</h4>
      <div class="row q-gutter-sm">
        <q-btn
          flat
          dense
          icon="refresh"
          @click="refresh"
          :loading="loading"
          label="Refresh"
        />
        <q-btn
          color="accent"
          label="Create Monitor"
          icon="add"
          @click="createMonitor"
        />
      </div>
    </div>

    <DataTable
      :data="data"
      :columns="monitorTableColumns"
      :loading="loading"
      :actions="tableActions"
      row-key="id"
    />

    <ConfirmDialog
      v-model="deleteDialog.show"
      :title="deleteDialog.title"
      :message="deleteDialog.message"
      :loading="deleteDialog.loading"
      confirm-label="Delete"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { getMonitorApi } from "boot/axios";
import { MonitorType, type Monitor } from "@pulse/shared";
import { useDataTable } from "../composables/useDataTable";
import DataTable from "../components/DataTable.vue";
import StatusBadge from "src/components/ui/StatusBadge.vue";
import ConfirmDialog from "src/components/ui/ConfirmDialog.vue";
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
const $q = useQuasar();

const { data, loading, refresh } = useDataTable<Monitor>({
  fetchFn: async () => {
    const monitorApi = getMonitorApi();
    return await monitorApi.listMonitors();
  },
});

const deleteDialog = ref({
  show: false,
  title: "",
  message: "",
  loading: false,
  monitorToDelete: null as Monitor | null,
});

const tableActions = [
  {
    label: "Runs",
    icon: "play_arrow",
    handler: (monitor: Monitor) => {
      void $router.push(`/runs?monitorId=${monitor.id}`);
    },
  },
  {
    label: "Delete",
    icon: "delete",
    class: "text-negative",
    handler: (monitor: Monitor) => {
      deleteDialog.value = {
        show: true,
        title: "Delete Monitor",
        message: `Are you sure you want to delete "${monitor.name}"? This action cannot be undone.`,
        loading: false,
        monitorToDelete: monitor,
      };
    },
  },
];

const createMonitor = () => {
  void $router.push("/monitors/create");
};

const confirmDelete = async () => {
  if (!deleteDialog.value.monitorToDelete) return;

  deleteDialog.value.loading = true;

  try {
    const monitorApi = getMonitorApi();
    await monitorApi.deleteMonitor(deleteDialog.value.monitorToDelete.id);

    $q.notify({
      type: "positive",
      message: "Monitor deleted successfully",
      position: "top",
    });

    await refresh();
    deleteDialog.value.show = false;
  } catch (error) {
    console.error("Failed to delete monitor:", error);
    $q.notify({
      type: "negative",
      message: "Failed to delete monitor",
      position: "top",
    });
  } finally {
    deleteDialog.value.loading = false;
  }
};

const cancelDelete = () => {
  deleteDialog.value.monitorToDelete = null;
};
</script>
