import { Monitor, HttpConfig, HttpRunDetails } from "@pulse/shared";
import { MonitorRunner, MonitorRunResult } from "../types";
import RunStatus from "../../../models/types/public/RunStatus";

const timeoutMs = 30000;

export class HttpMonitorRunner implements MonitorRunner {
  async run(monitor: Monitor): Promise<MonitorRunResult> {
    const startTime = Date.now();
    const config = monitor.config as HttpConfig;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(config.url, {
        method: config.method,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;

      return {
        status: response.ok ? RunStatus.success : RunStatus.failure,
        durationMs: durationMs,
        details: {
          statusCode: response.status,
        } as HttpRunDetails,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;

      const isTimeout = error instanceof Error && error.name === "AbortError";

      return {
        status: isTimeout ? RunStatus.timeout : RunStatus.failure,
        durationMs,
        details: {
          statusCode: 0,
        } as HttpRunDetails,
      };
    }
  }
}
