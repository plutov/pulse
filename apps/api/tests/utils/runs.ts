import { HttpRunDetails } from "@pulse/shared";
import RunStatus from "../../src/models/types/public/RunStatus";
import Runs from "../../src/models/types/public/Runs";
import { RunRepository } from "../../src/models/repositories/runs";
import { randomUUID } from "crypto";
import { getTestDb } from "../setup/database";

interface TestRunData {
  monitorId: string;
  status?: RunStatus;
  durationMs?: number;
  details?: HttpRunDetails;
}

export const createTestRun = async (data: TestRunData): Promise<Runs> => {
  const db = getTestDb();
  const runsRepository = new RunRepository(db);
  return runsRepository.create({
    id: randomUUID(),
    monitor_id: data.monitorId,
    status: data.status || RunStatus.success,
    duration_ms: data.durationMs || 123,
    result_details: data.details || {
      statusCode: 200,
    },
  });
};
