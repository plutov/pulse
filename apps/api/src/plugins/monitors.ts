import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { CreateMonitorPayload } from "@pulse/shared";
import { MonitorRepository } from "../database/repositories/monitor-repository";
import {
  convertMonitorRowToApi,
  convertMonitorRowsToApi,
  convertCreateMonitorPayloadToDb,
} from "../database/repositories/monitor-repository";
import { randomUUID } from "crypto";
import { createMonitorSchema, monitorIdParamSchema } from "../api/schemas";
import { validationFailAction } from "../api/errors";

const monitorRepository = new MonitorRepository();

const monitorsPlugin: Hapi.Plugin<null> = {
  name: "app/monitors",
  register: function (server: Hapi.Server) {
    server.route([
      {
        method: "GET",
        path: "/monitors",
        handler: getAllMonitorsHandler,
      },
    ]);

    server.route([
      {
        method: "POST",
        path: "/monitors",
        handler: createMonitorHandler,
        options: {
          validate: {
            payload: createMonitorSchema,
            failAction: validationFailAction,
          },
        },
      },
    ]);

    server.route([
      {
        method: "GET",
        path: "/monitors/{id}",
        handler: getMonitorByIdHandler,
        options: {
          validate: {
            params: monitorIdParamSchema,
            failAction: validationFailAction,
          },
        },
      },
    ]);

    server.route([
      {
        method: "DELETE",
        path: "/monitors/{id}",
        handler: deleteMonitorHandler,
        options: {
          validate: {
            params: monitorIdParamSchema,
            failAction: validationFailAction,
          },
        },
      },
    ]);
  },
};

export default monitorsPlugin;

async function getAllMonitorsHandler() {
  try {
    const rows = await monitorRepository.findAll();
    return convertMonitorRowsToApi(rows);
  } catch (error) {
    console.error("Error fetching monitors:", error);
    throw Boom.internal("Failed to fetch monitorsitories");
  }
}

async function createMonitorHandler(
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
      throw Boom.conflict(`Monitor with name '${payload.name}' already exists`);
    }

    const createData = convertCreateMonitorPayloadToDb(payload, authorId, id);
    await monitorRepository.create(createData);

    // Fetch the created monitor with author details
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

async function getMonitorByIdHandler(request: Hapi.Request) {
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

async function deleteMonitorHandler(
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
