import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
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

const monitorRepository = new MonitorRepository();
const runRepository = new RunRepository();

export async function getAllMonitorsHandler() {
  try {
    const rows = await monitorRepository.findAll();
    return convertMonitorRowsToApi(rows);
  } catch (error) {
    console.error("Error fetching monitors:", error);
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
    return h.response(newMonitor).code(201);
  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    }
    console.error("Error creating monitor:", error);
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
    console.error("Error fetching monitor by ID:", error);
    throw Boom.internal("Failed to fetch monitor");
  }
}

export async function deleteMonitorHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  try {
    const id = request.params["id"] as string;

    const deleted = await monitorRepository.delete(id);
    if (!deleted) {
      throw Boom.notFound(`Monitor with ID ${id} not found`);
    }

    return h.response().code(204);
  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    }
    console.error("Error deleting monitor:", error);
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
    console.error("Error fetching monitor runs:", error);
    throw Boom.internal("Failed to fetch monitor runs");
  }
}
