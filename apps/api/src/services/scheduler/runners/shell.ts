import { Monitor, ShellConfig, ShellRunDetails } from "@pulse/shared";
import { MonitorRunner, MonitorRunResult } from "../types";
import RunStatus from "../../../models/types/public/RunStatus";
import { exec } from "child_process";

const timeoutMs = 30000;

interface ErrnoException extends Error {
  code?: string;
  killed?: boolean;
}

export class ShellMonitorRunner implements MonitorRunner {
  async run(monitor: Monitor): Promise<MonitorRunResult> {
    const startTime = Date.now();
    const config = monitor.config as ShellConfig;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const execPromise = new Promise<{
        code: number | null;
        signal: NodeJS.Signals | null;
      }>((resolve) => {
        exec(
          config.command,
          { signal: controller.signal },
          (error: Error | ErrnoException | null) => {
            if (error) {
              if ("killed" in error && error.killed) {
                resolve({ code: null, signal: "SIGTERM" });
              } else if ("code" in error && error.code !== undefined) {
                resolve({ code: parseInt(error.code, 10), signal: null });
              } else {
                resolve({ code: 1, signal: null });
              }
            } else {
              resolve({ code: 0, signal: null });
            }
          },
        );
      });

      const result = await execPromise;

      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;

      return {
        status:
          result.code === 0
            ? RunStatus.success
            : result.signal
              ? RunStatus.timeout
              : RunStatus.failure,
        durationMs: durationMs,
        details: {
          code: result.code !== null ? result.code : -1,
        } as ShellRunDetails,
      };
    } catch {
      const durationMs = Date.now() - startTime;

      return {
        status: RunStatus.failure,
        durationMs,
        details: {
          code: 1,
        } as ShellRunDetails,
      };
    }
  }
}
