import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { logger } from "../logging";
import {
  TimeSeriesChartPayload,
  TimeSeriesChartData,
  TimeSeriesMonitorData,
  TimeSeriesDataPoint,
} from "@pulse/shared";
import { RunRepository } from "../models/repositories/runs";

const runRepository = new RunRepository();

export async function getTimeSeriesChartDataHandler(request: Hapi.Request) {
  try {
    const payload = request.payload as TimeSeriesChartPayload;

    const aggregatedData = await runRepository.getTimeSeriesData(payload);

    // Group aggregated data by monitor
    const dataByMonitor = aggregatedData.reduce(
      (acc, row) => {
        if (!acc[row.monitor_id]) {
          acc[row.monitor_id] = {
            monitorId: row.monitor_id,
            monitorName: row.monitor_name,
            dataPoints: [],
          };
        }

        // Add aggregated data point
        acc[row.monitor_id].dataPoints.push({
          createdAt: row.interval_start.toISOString(),
          durationMs: Math.round(parseFloat(row.avg_duration_ms)),
          status: row.status,
        });

        return acc;
      },
      {} as Record<
        string,
        {
          monitorId: string;
          monitorName: string;
          dataPoints: TimeSeriesDataPoint[];
        }
      >,
    );

    // Convert to API format
    const data: TimeSeriesMonitorData[] = (
      Object.values(dataByMonitor) as Array<{
        monitorId: string;
        monitorName: string;
        dataPoints: TimeSeriesDataPoint[];
      }>
    ).map((group) => ({
      monitor: {
        id: group.monitorId,
        name: group.monitorName,
      },
      dataPoints: group.dataPoints.sort(
        (a: TimeSeriesDataPoint, b: TimeSeriesDataPoint) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    }));

    const response: TimeSeriesChartData = { data };
    return response;
  } catch (error) {
    logger.error(error, "Error fetching time series chart data");
    throw Boom.internal("Failed to fetch chart data");
  }
}
