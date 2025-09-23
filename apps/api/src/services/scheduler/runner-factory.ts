import { MonitorType } from "@pulse/shared";
import { MonitorRunner } from "./types";
import { HttpMonitorRunner } from "./runners/http";

export class MonitorRunnerFactory {
  private static runners: Map<MonitorType, () => MonitorRunner> = new Map([
    ["http", () => new HttpMonitorRunner()],
  ]);

  static getRunner(monitorType: MonitorType): MonitorRunner {
    const runnerFactory = this.runners.get(monitorType);
    if (!runnerFactory) {
      throw new Error(`No runner found for monitor type: ${monitorType}`);
    }
    return runnerFactory();
  }

  static registerRunner(
    monitorType: MonitorType,
    runnerFactory: () => MonitorRunner,
  ): void {
    this.runners.set(monitorType, runnerFactory);
  }
}
