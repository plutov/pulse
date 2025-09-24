import * as cron from "node-cron";

import { Monitor, type MonitorRunStatus, HttpRunDetails } from "@pulse/shared";

export interface MonitorRunResult {
  status: MonitorRunStatus;
  durationMs: number;
  details: HttpRunDetails;
}

export interface MonitorRunner {
  run(monitor: Monitor): Promise<MonitorRunResult>;
}

export interface SchedulerJob {
  monitorId: string;
  schedule: string;
  task: cron.ScheduledTask;
}
