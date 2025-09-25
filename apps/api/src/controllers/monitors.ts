import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { logger } from "../logging";
import { CreateMonitorPayload, MonitorRunsList } from "@pulse/shared";
import { MonitorRepository } from "../models/repositories/monitors";
import {
  convertMonitorRowToApi,
  convertMonitorRowsToApi,
  convertCreateMonitorPayloadToDb,
} from "../models/repositories/monitors";
import { randomUUID } from "crypto";
import {
  convertRunRowsToApi,
  ListRunsOptions,
  RunRepository,
} from "../models/repositories/runs";
import { MonitorScheduler } from "../services/scheduler";
import MonitorStatus from "../models/types/public/MonitorStatus";

const monitorRepository = new MonitorRepository();
const runRepository = new RunRepository();

// Global scheduler instance - this will be set by the server
let schedulerInstance: MonitorScheduler | null = null;

export function setSchedulerInstance(scheduler: MonitorScheduler) {
  schedulerInstance = scheduler;
}

export async function getAllMonitorsHandler() {
  try {
    const rows = await monitorRepository.findAll({});
    return convertMonitorRowsToApi(rows);
  } catch (err) {
    logger.error(err, "Error fetching monitors");
    throw Boom.internal("Failed to fetch monitors");
  }
}

export async function createMonitorHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  try {
    const payload = request.payload as CreateMonitorPayload;
    const id = randomUUID();
    const authorId = request.auth.credentials["id"] as string;
    if (!authorId) {
      throw Boom.unauthorized("User not authenticated");
    }

    const existingMonitor = await monitorRepository.findByName(payload.name);
    if (existingMonitor) {
      throw Boom.conflict(`Monitor with this name already exists`);
    }

    const createData = convertCreateMonitorPayloadToDb(payload, authorId, id);
    await monitorRepository.create(createData);

    const createdMonitor = await monitorRepository.findById(id);
    if (!createdMonitor) {
      throw Boom.internal("Failed to retrieve created monitor");
    }

    const newMonitor = convertMonitorRowToApi(createdMonitor);

    // Schedule the monitor if it's active and scheduler is available
    if (schedulerInstance && newMonitor.status === MonitorStatus.active) {
      schedulerInstance.scheduleMonitor(newMonitor);
    }

    return h.response(newMonitor).code(201);
  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    }
    logger.error("Error creating monitor");
    throw Boom.internal("Failed to create monitor");
  }
}

export async function getMonitorByIdHandler(request: Hapi.Request) {
  try {
    const id = request.params["id"] as string;

    const row = await monitorRepository.findById(id);
    if (!row) {
      throw Boom.notFound(`Monitor with ID ${id} not found`);
    }

    return convertMonitorRowToApi(row);
  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    }
    logger.error(error, "Error fetching monitor by ID");
    throw Boom.internal("Failed to fetch monitor");
  }
}

export async function deleteMonitorHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  try {
    const id = request.params["id"] as string;

    // Check if monitor exists before deleting
    const existingMonitor = await monitorRepository.findById(id);
    if (!existingMonitor) {
      throw Boom.notFound(`Monitor with ID ${id} not found`);
    }

    const deleted = await monitorRepository.delete(id);
    if (!deleted) {
      throw Boom.notFound(`Monitor with ID ${id} not found`);
    }

    // Unschedule the monitor if scheduler is available
    if (schedulerInstance) {
      schedulerInstance.unscheduleMonitor(id);
    }

    return h.response().code(204);
  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    }
    logger.error(error, "Error deleting monitor");
    throw Boom.internal("Failed to delete monitor");
  }
}

export async function listMonitorRuns(request: Hapi.Request) {
  try {
    const params: ListRunsOptions = {
      monitorId: request.query["monitorId"] as string | undefined,
      size: request.query["size"]
        ? parseInt(request.query["size"] as string, 10)
        : undefined,
      offset: request.query["offset"]
        ? parseInt(request.query["offset"] as string, 10)
        : undefined,
    };
    const rows = await runRepository.list(params);
    const count = await runRepository.count(params);
    const res: MonitorRunsList = {
      rows: convertRunRowsToApi(rows),
      total: count,
    };
    return res;
  } catch (error) {
    logger.error(error, "Error fetching monitor runs");
    throw Boom.internal("Failed to fetch monitor runs");
  }
}
