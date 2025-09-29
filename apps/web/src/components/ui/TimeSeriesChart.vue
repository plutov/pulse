<template>
  <div class="time-series-chart">
    <q-card>
      <q-card-section>
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6">{{ title }}</div>
            <div class="text-subtitle2 text-grey">
              Showing results over {{ timeRange }} ({{ interval }} intervals)
            </div>
          </div>
          <q-btn
            icon="refresh"
            round
            flat
            :loading="loading"
            @click="fetchChartData"
            :disable="!monitorIds.length"
          >
            <q-tooltip>Refresh chart</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
      <q-card-section>
        <div v-if="loading" class="row justify-center q-pa-md">
          <q-spinner-dots size="lg" />
        </div>
        <div v-else-if="error" class="text-negative q-pa-md">
          {{ error }}
        </div>
        <canvas ref="chartCanvas" id="chartCanvas"></canvas>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { chartsApi } from "src/boot/axios";
import type {
  TimeSeriesChartPayload,
  TimeSeriesChartData,
  ChartInterval,
} from "@pulse/shared";
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  LineController,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { chartColors } from "./colors";
import { DateTimeFormat } from "src/api/time";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  TimeScale,
);

interface Props {
  title: string;
  monitorIds: string[];
  timeRange: ChartInterval;
  interval: ChartInterval;
}

const props = withDefaults(defineProps<Props>(), {});

const chartCanvas = ref<HTMLCanvasElement>();
const loading = ref(false);
const error = ref("");
let chartInstance: Chart | null = null;

const statusColors: Record<string, string> = {
  success: chartColors.positive,
  failure: chartColors.negative,
  timeout: chartColors.warning,
};

const lineColors = [
  chartColors.primary,
  chartColors.warning,
  chartColors.info,
  chartColors.secondary,
  chartColors.accent,
];

const fetchChartData = async () => {
  if (!props.monitorIds.length) return;

  loading.value = true;
  error.value = "";

  try {
    const payload: TimeSeriesChartPayload = {
      monitorIds: props.monitorIds,
      timeRange: props.timeRange,
      interval: props.interval,
    };

    const response = await chartsApi.getTimeSeriesChartData(payload);
    const chartData = response.data;

    if (chartCanvas.value) {
      createChart(chartData);
    }
  } catch {
    error.value = "Failed to load chart data";
  } finally {
    loading.value = false;
  }
};

const createChart = (data: TimeSeriesChartData) => {
  if (!chartCanvas.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = chartCanvas.value.getContext("2d");
  if (!ctx) return;

  // Generate datasets for each monitor
  const datasets = data.data.map((monitor, index) => {
    const color = lineColors[index % lineColors.length];

    return {
      label: monitor.monitor.name,
      data: monitor.dataPoints.map((point) => ({
        x: new Date(point.createdAt).getTime(),
        y: point.durationMs,
      })),
      borderColor: color,
      backgroundColor: color + "20",
      fill: false,
      tension: 0.3,
      pointBackgroundColor: monitor.dataPoints.map((point) => {
        const statusColor = statusColors[point.status as string];
        return statusColor || color;
      }),
      pointBorderColor: "",
      pointRadius: 2,
      pointHoverRadius: 4,
    };
  });

  chartInstance = new Chart(ctx, {
    type: "line",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
          bottom: 10,
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      scales: {
        x: {
          type: "time",
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          title: {
            display: true,
            text: "Duration (ms)",
          },
          beginAtZero: true,
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const monitorData = data.data[context.datasetIndex];
              const dataPoint = monitorData?.dataPoints[context.dataIndex];
              if (!dataPoint) {
                return `${context.dataset.label}: ${context.parsed.y}ms`;
              }
              return `${context.dataset.label}: ${context.parsed.y}ms (${dataPoint.status})`;
            },
          },
        },
        legend: {
          position: "top",
        },
      },
    },
  });
};

onMounted(async () => {
  await nextTick();
  await fetchChartData();
});

watch(
  () => [props.monitorIds, props.timeRange, props.interval],
  () => {
    void fetchChartData();
  },
  { deep: true },
);
</script>

<style scoped>
.time-series-chart {
  width: 100%;
  height: 400px;
}

.time-series-chart .q-card-section:last-child {
  height: 300px;
  position: relative;
}

canvas {
  width: 100% !important;
  height: 300px !important;
}
</style>
