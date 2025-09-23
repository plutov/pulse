import { Knex } from "knex";
import { getDb } from "../connection";
import { MonitorRun, HttpRunDetails } from "@pulse/shared";
import Runs from "../types/public/Runs";
import { RunsInitializer } from "../types/public/Runs";

export interface ListRunsOptions {
  monitorId?: string;
  size?: number;
  offset?: number;
}

export interface RunWithMonitorMinimal extends Runs {
  monitor_name: string;
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
