import * as cron from "node-cron";

import type { Monitor, MonitorRun } from "@pulse/shared";

export type MonitorRunResult = Pick<
  MonitorRun,
  "status" | "durationMs" | "details"
>;

export interface MonitorRunner {
  run(monitor: Monitor): Promise<MonitorRunResult>;
}

export interface SchedulerJob {
  monitorId: string;
  schedule: string;
  task: cron.ScheduledTask;
}
