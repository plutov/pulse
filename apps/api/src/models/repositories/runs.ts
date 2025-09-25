import { Knex } from "knex";
import { getDb } from "../connection";
import {
  MonitorRun,
  HttpRunDetails,
  TimeSeriesChartPayload,
  ChartInterval,
} from "@pulse/shared";
import Runs from "../types/public/Runs";
import { RunsInitializer } from "../types/public/Runs";
import RunStatus from "../types/public/RunStatus";

export interface ListRunsOptions {
  monitorId?: string;
  size?: number;
  offset?: number;
}

export interface RunWithMonitorMinimal extends Runs {
  monitor_name: string;
}

export interface TimeSeriesDataRow {
  monitor_id: string;
  monitor_name: string;
  interval_start: Date;
  avg_duration_ms: string;
  status: RunStatus;
  run_count: string;
}

export class RunRepository {
  private db: Knex;
  private tableName = "runs";

  constructor(database?: Knex) {
    this.db = database || getDb();
  }

  async create(data: RunsInitializer): Promise<Runs> {
    const [run] = await this.db(this.tableName)
      .insert(data)
      .returning<Runs[]>("*");

    if (!run) {
      throw new Error("Failed to create run");
    }

    return run;
  }

  async list(params: ListRunsOptions): Promise<RunWithMonitorMinimal[]> {
    const q = this.db(this.tableName)
      .select("runs.*", "monitors.name as monitor_name")
      .join("monitors", "runs.monitor_id", "monitors.id");

    if (params.monitorId) {
      q.where("runs.monitor_id", params.monitorId);
    }
    if (params.size) {
      q.limit(params.size);
    }
    if (params.offset) {
      q.offset(params.offset);
    }
    q.orderBy("runs.created_at", "desc");
    return q;
  }

  async count(params: ListRunsOptions): Promise<number> {
    const q = this.db(this.tableName).count("id", { as: "count" });

    if (params.monitorId) {
      q.where("runs.monitor_id", params.monitorId);
    }
    return q.first().then((row) => parseInt(row?.count as string, 10) || 0);
  }

  async getTimeSeriesData(
    options: TimeSeriesChartPayload,
  ): Promise<TimeSeriesDataRow[]> {
    const { monitorIds, timeRange, interval } = options;

    const timeRangeHours = Math.max(1, this.parseTimeRangeToHours(timeRange));

    const timeBucket = this.getTimeBucketExpression(interval);

    // Use raw SQL for time bucketing and aggregation
    const query = `
      SELECT 
        runs.monitor_id,
        monitors.name as monitor_name,
        ${timeBucket} as interval_start,
        AVG(runs.duration_ms) as avg_duration_ms,
        runs.status,
        COUNT(*) as run_count
      FROM runs
      JOIN monitors ON runs.monitor_id = monitors.id
      WHERE runs.monitor_id = ANY(?)
        AND runs.created_at >= NOW() - INTERVAL '${timeRangeHours} hours'
      GROUP BY 
        runs.monitor_id, 
        monitors.name, 
        ${timeBucket},
        runs.status
      ORDER BY interval_start ASC
    `;

    const result = await this.db.raw(query, [monitorIds]);
    return result.rows;
  }

  private parseTimeRangeToHours(timeRange: ChartInterval): number {
    switch (timeRange) {
      case "5m":
        return 1;
      case "1h":
        return 1;
      case "1d":
        return 24;
      case "1w":
        return 168;
      case "30d":
        return 720;
      default:
        return 1;
    }
  }

  private getTimeBucketExpression(interval: ChartInterval): string {
    switch (interval) {
      case "5m":
        return "date_trunc('minute', runs.created_at) - (EXTRACT(minute FROM runs.created_at)::int % 5) * interval '1 minute'";
      case "1h":
        return "date_trunc('hour', runs.created_at)";
      case "1d":
        return "date_trunc('day', runs.created_at)";
      case "1w":
        return "date_trunc('week', runs.created_at)";
      case "30d":
        return "date_trunc('month', runs.created_at)";
      default:
        return "date_trunc('hour', runs.created_at)";
    }
  }
}

export function convertRunRowToApi(row: RunWithMonitorMinimal): MonitorRun {
  const res: MonitorRun = {
    id: row.id,
    status: row.status,
    durationMs: row.duration_ms,
    createdAt: row.created_at.toISOString(),
    monitor: {
      id: row.monitor_id,
      name: row.monitor_name,
    },
    details: row.result_details as HttpRunDetails,
  };
  return res;
}

export function convertRunRowsToApi(
  rows: RunWithMonitorMinimal[],
): MonitorRun[] {
  return rows.map(convertRunRowToApi);
}
