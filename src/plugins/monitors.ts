import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { Monitor, CreateMonitorPayload } from "../apigen";
import { MonitorRepository } from "../database/repositories/monitor-repository";
import Joi from "joi";

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
            payload: Joi.object({
              name: Joi.string().min(1).max(255).required(),
            }),
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
            params: Joi.object({
              id: Joi.string().guid({ version: "uuidv4" }).required(),
            }),
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
            params: Joi.object({
              id: Joi.string().guid({ version: "uuidv4" }).required(),
            }),
          },
        },
      },
    ]);
  },
};

export default monitorsPlugin;

async function getAllMonitorsHandler() {
  try {
    const monitorRows = await monitorRepository.findAll();
    const monitors: Monitor[] = monitorRows.map((row) => ({
      id: row.id,
      name: row.name,
    }));
    return monitors;
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
    const { name } = request.payload as CreateMonitorPayload;

    const existingMonitor = await monitorRepository.findByName(name);
    if (existingMonitor) {
      throw Boom.conflict(`Monitor with name '${name}' already exists`);
    }

    const monitorRow = await monitorRepository.create({ name });
    const newMonitor: Monitor = {
      id: monitorRow.id,
      name: monitorRow.name,
    };

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

    const monitorRow = await monitorRepository.findById(id);
    if (!monitorRow) {
      throw Boom.notFound(`Monitor with ID ${id} not found`);
    }

    const monitor: Monitor = {
      id: monitorRow.id,
      name: monitorRow.name,
    };

    return monitor;
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
