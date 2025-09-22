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
      <template v-slot:no-data="{ message }">
        <div class="full-width row flex-center q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span>{{ message }}</span>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getMonitorApi } from "boot/axios";
import type { ErrorResponse, Monitor } from "@pulse/shared";
import { useQuasar } from "quasar";
import axios from "axios";

const $q = useQuasar();

const monitors = ref<Monitor[]>([]);
const monitorsLoading = ref(false);

const columns = [
  {
    name: "id",
    required: true,
    label: "ID",
    align: "left",
    field: (row: Monitor) => row.id,
  },
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
