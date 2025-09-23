import { Monitor, HttpConfig } from "@pulse/shared";
import { MonitorRunner, MonitorRunResult } from "../types";

export class HttpMonitorRunner implements MonitorRunner {
  async run(monitor: Monitor): Promise<MonitorRunResult> {
    const startTime = Date.now();
    const config = monitor.config as HttpConfig;

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(config.url, {
        method: config.method,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;

      return {
        status: response.ok ? "success" : "failure",
        durationMs: Math.max(durationMs, 1), // Ensure at least 1ms
        details: {
          statusCode: response.status,
        },
      };
    } catch (error) {
      const durationMs = Math.max(Date.now() - startTime, 1); // Ensure at least 1ms

      // Handle timeout or other network errors
      const isTimeout = error instanceof Error && error.name === "AbortError";

      return {
        status: isTimeout ? "timeout" : "failure",
        durationMs,
        details: {
          statusCode: 0, // 0 indicates network error
        },
      };
    }
  }
}
