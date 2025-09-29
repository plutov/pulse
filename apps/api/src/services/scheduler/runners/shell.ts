import { Monitor, ShellConfig, ShellRunDetails } from "@pulse/shared";
import { MonitorRunner, MonitorRunResult } from "../types";
import RunStatus from "../../../models/types/public/RunStatus";
import { exec } from "child_process";

const timeoutMs = 30000;

interface ErrnoException extends Error {
  code?: string;
  killed?: boolean;
}

interface ExecResult {
  code: number;
  signal?: NodeJS.Signals;
}

export class ShellMonitorRunner implements MonitorRunner {
  async run(monitor: Monitor): Promise<MonitorRunResult> {
    const startTime = Date.now();
    const config = monitor.config as ShellConfig;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const execPromise = new Promise<ExecResult>((resolve) => {
        exec(
          config.command,
          { signal: controller.signal },
          (error: Error | ErrnoException | null) => {
            const res: ExecResult = { code: 1 };
            if (error) {
              if ("killed" in error && error.killed) {
                res.signal = "SIGTERM";
              } else if ("code" in error && error.code !== undefined) {
                res.code = error.code === null ? 1 : parseInt(error.code, 10);
              } else {
                res.code = 1;
              }
            } else {
              res.code = 0;
            }

            resolve(res);
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
          code: result.code,
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
