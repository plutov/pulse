import * as cron from "node-cron";
import { Monitor } from "@pulse/shared";
import {
  convertMonitorRowToApi,
  MonitorRepository,
} from "../../models/repositories/monitors";
import { RunRepository } from "../../models/repositories/runs";
import { MonitorRunnerFactory } from "./runner-factory";
import { SchedulerJob } from "./types";
import RunStatus from "../../models/types/public/RunStatus";
import { Knex } from "knex";
import MonitorStatus from "../../models/types/public/MonitorStatus";
import { randomUUID } from "crypto";
import { logger } from "../../logging";

export class MonitorScheduler {
  private jobs: Map<string, SchedulerJob> = new Map();
  private monitorRepo: MonitorRepository;
  private runRepo: RunRepository;

  constructor(db?: Knex) {
    this.monitorRepo = new MonitorRepository(db);
    this.runRepo = new RunRepository(db);
  }

  async start(): Promise<void> {
    logger.info("starting monitor scheduler...");

    try {
      const monitors = await this.monitorRepo.findAll();
      let scheduledCount = 0;

      for (const monitorRow of monitors) {
        try {
          const monitor: Monitor = convertMonitorRowToApi(monitorRow);

          if (monitor.status === MonitorStatus.active) {
            this.scheduleMonitor(monitor);
            scheduledCount++;
          }
        } catch (error) {
          logger.error(error, `failed to schedule monitor ${monitorRow.id}`);
        }
      }

      logger.info(`scheduled ${scheduledCount} active monitors`);
    } catch (error) {
      logger.error(error, "failed to start monitor scheduler");
      throw error;
    }
  }

  scheduleMonitor(monitor: Monitor): void {
    if (this.jobs.has(monitor.id)) {
      this.unscheduleMonitor(monitor.id);
    }

    if (!cron.validate(monitor.schedule)) {
      logger.error(
        `invalid cron expression for monitor ${monitor.id}: ${monitor.schedule}`,
      );
      return;
    }

    try {
      const task = cron.schedule(monitor.schedule, async () => {
        await this.executeMonitor(monitor);
      });

      this.jobs.set(monitor.id, {
        monitorId: monitor.id,
        schedule: monitor.schedule,
        task,
      });

      logger.info(
        `scheduled monitor ${monitor.id} with schedule: ${monitor.schedule}`,
      );
    } catch (error) {
      logger.error(error, `failed to schedule monitor ${monitor.id}`);
    }
  }

  unscheduleMonitor(monitorId: string): void {
    const job = this.jobs.get(monitorId);
    if (job) {
      job.task.stop();
      job.task.destroy();
      this.jobs.delete(monitorId);
      logger.info(`unscheduled monitor ${monitorId}`);
    }
  }

  async executeMonitor(monitor: Monitor): Promise<void> {
    const startTime = Date.now();
    logger.info(`executing monitor ${monitor.id}`);

    let dbStatus: RunStatus = RunStatus.failure;
    try {
      const runner = MonitorRunnerFactory.getRunner(monitor.monitorType);
      const result = await runner.run(monitor);
      dbStatus = result.status as RunStatus;

      await this.runRepo.create({
        id: randomUUID(),
        monitor_id: monitor.id,
        status: dbStatus,
        duration_ms: result.durationMs,
        result_details: result.details,
      });

      logger.info(
        `monitor ${monitor.name} executed successfully: ${result.status}`,
      );
    } catch (error) {
      logger.error(error, `error executing monitor ${monitor.id}`);
    }

    const executionTime = Date.now() - startTime;
    await this.runRepo.create({
      id: randomUUID(),
      monitor_id: monitor.id,
      status: dbStatus,
      duration_ms: executionTime,
      result_details: {
        statusCode: 0,
      },
    });
  }

  stop(): void {
    logger.info("stopping monitor scheduler...");
    const activeJobs = Array.from(this.jobs.keys());

    for (const monitorId of activeJobs) {
      try {
        this.unscheduleMonitor(monitorId);
      } catch (error) {
        logger.error(error, `failed to unschedule monitor ${monitorId}`);
      }
    }

    logger.info("monitor scheduler stopped");
  }

  rescheduleMonitor(monitor: Monitor): void {
    logger.info(`rescheduling monitor ${monitor.id}`);

    if (this.jobs.has(monitor.id)) {
      this.unscheduleMonitor(monitor.id);
    }

    if (monitor.status === MonitorStatus.active) {
      this.scheduleMonitor(monitor);
    }
  }

  getActiveJobs(): string[] {
    return Array.from(this.jobs.keys());
  }

  isMonitorScheduled(monitorId: string): boolean {
    return this.jobs.has(monitorId);
  }
}
