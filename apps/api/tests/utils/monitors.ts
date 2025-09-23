import * as Hapi from "@hapi/hapi";
import {
  CreateMonitorPayload,
  ErrorResponse,
  HttpConfig,
  Monitor,
  MonitorType,
  WithStatusStatusEnum,
} from "@pulse/shared";
import { getAuthHeaders } from "./auth";

interface TestMonitorData {
  name?: string;
  monitorType?: MonitorType;
  schedule?: string;
  status?: WithStatusStatusEnum;
  config?: HttpConfig;
}

export const createTestMonitor = async (
  server: Hapi.Server,
  userId: string,
  data: TestMonitorData,
): Promise<Monitor | ErrorResponse> => {
  const payload: CreateMonitorPayload = {
    name: data.name || "test-monitor",
    monitorType: data.monitorType || MonitorType.http,
    schedule: data.schedule || "*/5 * * * *",
    status: data.status || WithStatusStatusEnum.active,
    config: data.config || {
      url: "https://example.com",
      method: "GET",
    },
  };
  const response = await server.inject({
    method: "POST",
    url: "/monitors",
    payload,
    headers: getAuthHeaders(userId),
  });

  if (response.statusCode === 201) {
    const monitor: Monitor = JSON.parse(response.payload);
    return monitor;
  }

  const error: ErrorResponse = JSON.parse(response.payload);
  return error;
};
