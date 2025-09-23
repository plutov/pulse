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
import { getMonitorApi } from "boot/axios";
import type { Monitor } from "@pulse/shared";
import { useDataTable } from "../composables/useDataTable";
import { monitorTableColumns } from "../config/monitorTableConfig";
import DataTable from "../components/DataTable.vue";

const { data, loading } = useDataTable<Monitor>({
  fetchFn: async () => {
    const monitorApi = getMonitorApi();
    return await monitorApi.listMonitors();
  },
});

const createMonitor = () => {
  console.log("Create monitor clicked");
};
</script>
