import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApp } from "vue";
import { createPinia, setActivePinia } from "pinia";
import TimeSeriesChart from "../../src/components/ui/TimeSeriesChart.vue";
import type { TimeSeriesChartData } from "@pulse/shared";
import { ChartInterval, RunStatus } from "@pulse/shared";

// Mock Chart.js
const mockChartInstance = {
  destroy: vi.fn(),
};

vi.mock("chart.js", () => {
  const Chart = Object.assign(
    vi.fn().mockImplementation(() => mockChartInstance),
    {
      register: vi.fn(),
    },
  );
  return {
    Chart,
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    LineElement: vi.fn(),
    PointElement: vi.fn(),
    Title: vi.fn(),
    Tooltip: vi.fn(),
    Legend: vi.fn(),
    TimeScale: vi.fn(),
    LineController: vi.fn(),
  };
});

// Mock chartjs-adapter-date-fns
vi.mock("chartjs-adapter-date-fns", () => ({}));

// Mock the charts API
vi.mock("src/boot/axios", () => ({
  chartsApi: {
    getTimeSeriesChartData: vi.fn(),
  },
}));

import { chartsApi } from "src/boot/axios";

describe("TimeSeriesChart.vue", () => {
  let wrapper: ReturnType<typeof mount>;

  const mockChartData: TimeSeriesChartData = {
    data: [
      {
        monitor: {
          id: "1",
          name: "Test Monitor 1",
        },
        dataPoints: [
          {
            createdAt: "2023-01-01T00:00:00.000Z",
            durationMs: 100,
            status: RunStatus.success,
          },
          {
            createdAt: "2023-01-01T01:00:00.000Z",
            durationMs: 150,
            status: RunStatus.failure,
          },
        ],
      },
      {
        monitor: {
          id: "2",
          name: "Test Monitor 2",
        },
        dataPoints: [
          {
            createdAt: "2023-01-01T00:00:00.000Z",
            durationMs: 200,
            status: RunStatus.timeout,
          },
        ],
      },
    ],
  };

  const defaultProps = {
    title: "Test Chart",
    monitorIds: ["1", "2"],
    timeRange: ChartInterval._1d,
    interval: ChartInterval._1h,
  };

  beforeEach(() => {
    setActivePinia(createPinia());

    vi.mocked(chartsApi.getTimeSeriesChartData).mockResolvedValue({
      data: mockChartData,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it("renders with default props", async () => {
    wrapper = mount(TimeSeriesChart, {
      props: defaultProps,
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.text()).toContain("Test Chart");
    expect(wrapper.text()).toContain("Showing results over 1d (1h intervals)");
  });

  it("renders chart when data is loaded", async () => {
    wrapper = mount(TimeSeriesChart, {
      props: defaultProps,
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find("canvas").exists()).toBe(true);
    expect(wrapper.findComponent({ name: "q-spinner-dots" }).exists()).toBe(
      false,
    );
    expect(wrapper.text()).not.toContain("Failed to load chart data");
  });

  it("refresh button is enabled when monitorIds are provided", async () => {
    wrapper = mount(TimeSeriesChart, {
      props: defaultProps,
    });

    await wrapper.vm.$nextTick();

    const refreshButton = wrapper.find("q-btn");
    expect(refreshButton.attributes("disable")).not.toBe("true");
  });

  it("refresh button is disabled when no monitorIds are provided", async () => {
    wrapper = mount(TimeSeriesChart, {
      props: {
        ...defaultProps,
        monitorIds: [],
      },
    });

    await wrapper.vm.$nextTick();

    const refreshButton = wrapper.find("q-btn");
    expect(refreshButton.attributes("disable")).toBeDefined();
  });

  it("calls fetchChartData when refresh button is clicked", async () => {
    wrapper = mount(TimeSeriesChart, {
      props: defaultProps,
    });

    await wrapper.vm.$nextTick();

    const refreshButton = wrapper.find("q-btn");
    await refreshButton.trigger("click");

    expect(vi.mocked(chartsApi.getTimeSeriesChartData)).toHaveBeenCalledTimes(
      2,
    ); // Once on mount, once on click
    expect(
      vi.mocked(chartsApi.getTimeSeriesChartData),
    ).toHaveBeenLastCalledWith({
      monitorIds: ["1", "2"],
      timeRange: ChartInterval._1d,
      interval: ChartInterval._1h,
    });
  });

  it("does not fetch data when monitorIds is empty", async () => {
    vi.mocked(chartsApi.getTimeSeriesChartData).mockClear();

    wrapper = mount(TimeSeriesChart, {
      props: {
        ...defaultProps,
        monitorIds: [],
      },
    });

    await wrapper.vm.$nextTick();

    expect(vi.mocked(chartsApi.getTimeSeriesChartData)).not.toHaveBeenCalled();
  });

  it("displays correct title and subtitle", async () => {
    wrapper = mount(TimeSeriesChart, {
      props: {
        ...defaultProps,
        title: "Custom Title",
        timeRange: ChartInterval._30d,
        interval: ChartInterval._5m,
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Custom Title");
    expect(wrapper.text()).toContain("Showing results over 30d (5m intervals)");
  });

  it("shows tooltip on refresh button", async () => {
    wrapper = mount(TimeSeriesChart, {
      props: defaultProps,
    });

    await wrapper.vm.$nextTick();

    const tooltip = wrapper.find("q-tooltip");
    expect(tooltip.text()).toBe("Refresh chart");
  });
});

