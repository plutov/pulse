<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md">
      <div class="row q-gutter-md q-mb-md">
        <div class="col-12">
          <q-select
            v-model="selectedMonitors"
            :options="monitorOptions"
            option-value="id"
            option-label="name"
            multiple
            use-chips
            label="Select Monitors"
            :loading="loadingMonitors"
            :rules="[
              (val: Monitor[]) =>
                (val && val.length > 0) ||
                'At least one monitor must be selected',
            ]"
          />
        </div>
      </div>
      <div class="row q-gutter-md">
        <div class="col-2">
          <q-select
            v-model="selectedInterval"
            :options="intervalOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Interval"
          />
        </div>
        <div class="col-2">
          <q-select
            v-model="selectedTimeRange"
            :options="intervalOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            label="Time Range"
          />
        </div>
      </div>
    </div>

    <TimeSeriesChart
      title="Latencies"
      v-if="selectedMonitorIds.length > 0"
      :monitor-ids="selectedMonitorIds"
      :interval="selectedInterval"
      :time-range="selectedTimeRange"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { monitorApi } from "src/boot/axios";
import { type Monitor, ChartInterval } from "@pulse/shared";
import TimeSeriesChart from "src/components/ui/TimeSeriesChart.vue";
import { useNotify } from "src/composables/notify";

const selectedMonitors = ref<Monitor[]>([]);
const monitors = ref<Monitor[]>([]);
const loadingMonitors = ref(false);
const selectedInterval = ref<ChartInterval>(ChartInterval._5m);
const selectedTimeRange = ref<ChartInterval>(ChartInterval._1h);

const { notifyOnError } = useNotify();

const monitorOptions = computed(() => monitors.value);

const selectedMonitorIds = computed(() =>
  selectedMonitors.value.map((monitor: Monitor) => monitor.id),
);

const intervalOptions = [
  { label: "5 minutes", value: ChartInterval._5m },
  { label: "1 hour", value: ChartInterval._1h },
  { label: "1 day", value: ChartInterval._1d },
  { label: "1 week", value: ChartInterval._1w },
  { label: "30 days", value: ChartInterval._30d },
];

const fetchMonitors = async () => {
  loadingMonitors.value = true;
  try {
    const response = await monitorApi.listMonitors();
    monitors.value = response.data;
    selectedMonitors.value = monitors.value;
  } catch (error) {
    notifyOnError(error);
  } finally {
    loadingMonitors.value = false;
  }
};

onMounted(() => {
  void fetchMonitors();
});
</script>
