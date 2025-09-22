import { Monitor } from "@pulse/shared";
import type { default as MonitorsRow } from "./types/public/Monitors";

export function convertMonitorRowToApi(row: MonitorsRow): Monitor {
  return {
    id: row.id,
    name: row.name,
    monitorType: row.monitor_type,
  };
}

export function convertMonitorRowsToApi(rows: MonitorsRow[]): Monitor[] {
  return rows.map(convertMonitorRowToApi);
}

