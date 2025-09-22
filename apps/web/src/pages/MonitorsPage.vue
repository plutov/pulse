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

    <q-table
      :rows="monitors"
      :columns="columns"
      row-key="id"
      :loading="monitorsLoading"
      :sortable="false"
      flat
      bordered
      hide-bottom
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.status === 'active' ? 'positive' : 'orange'"
            :label="props.row.status"
          />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getMonitorApi } from "boot/axios";
import { MonitorType, type ErrorResponse, type Monitor } from "@pulse/shared";
import { useQuasar, date } from "quasar";
import axios from "axios";

const $q = useQuasar();

const monitors = ref<Monitor[]>([]);
const monitorsLoading = ref(false);

const columns = [
  {
    name: "name",
    required: true,
    label: "Name",
    align: "left",
    field: (row: Monitor) => row.name,
  },
  {
    name: "monitorType",
    required: true,
    label: "Type",
    align: "left",
    field: (row: Monitor) => row.monitorType,
  },
  {
    name: "status",
    required: true,
    label: "Status",
    align: "left",
    field: (row: Monitor) => row.status,
  },
  {
    name: "schedule",
    required: true,
    label: "Schedule",
    align: "left",
    field: (row: Monitor) => row.schedule,
  },
  {
    name: "author",
    required: true,
    label: "Author",
    align: "left",
    field: (row: Monitor) => row.author.username,
  },
  {
    name: "createdAt",
    required: true,
    label: "Created",
    align: "left",
    field: (row: Monitor) =>
      date.formatDate(new Date(row.createdAt), "YYYY-MM-DD HH:mm"),
  },
  {
    name: "httpConfig",
    required: false,
    label: "Config",
    align: "left",
    field: (row: Monitor) =>
      row.monitorType === MonitorType.http && row.httpConfig
        ? `${row.httpConfig.method} ${row.httpConfig.url}`
        : "N/A",
  },
];

const listMonitors = async () => {
  monitorsLoading.value = true;
  try {
    const monitorApi = getMonitorApi();
    const response = await monitorApi.listMonitors();
    if (response.data) {
      monitors.value = response.data;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const response = error.response?.data as ErrorResponse;
      $q.notify({
        type: "negative",
        message: response.message,
      });
    }
  } finally {
    monitorsLoading.value = false;
  }
};

const createMonitor = () => {
  console.log("Create monitor clicked");
};

onMounted(() => {
  void listMonitors();
});
</script>
