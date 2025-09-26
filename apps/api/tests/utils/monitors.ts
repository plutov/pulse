import * as Hapi from "@hapi/hapi";
import {
  CreateMonitorPayload,
  ErrorResponse,
  HttpConfig,
  HttpMethod,
  Monitor,
  MonitorType,
  MonitorStatus,
  MonitorConfig,
} from "@pulse/shared";
import { getAuthHeaders } from "./auth";
import { randomUUID } from "crypto";

interface TestMonitorData {
  name?: string;
  monitorType?: MonitorType;
  schedule?: string;
  status?: MonitorStatus;
  config?: MonitorConfig;
}

export const createTestMonitor = async (
  server: Hapi.Server,
  userId: string,
  data: TestMonitorData,
): Promise<Monitor> => {
  const monitor = await createTestMonitorOrFail(server, userId, data);
  return monitor as Monitor;
};

export const createTestMonitorOrFail = async (
  server: Hapi.Server,
  userId: string,
  data: TestMonitorData,
): Promise<Monitor | ErrorResponse> => {
  const defaultName = `test-monitor-${randomUUID()}`;
  const payload: CreateMonitorPayload = {
    name: data.name || defaultName,
    monitorType: data.monitorType || MonitorType.http,
    schedule: data.schedule || "* * * * *",
    status: data.status || MonitorStatus.active,
    config:
      data.config ||
      ({
        url: "https://example.com",
        method: HttpMethod.get,
      } as HttpConfig),
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
