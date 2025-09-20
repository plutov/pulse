import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { Monitor, CreateMonitorPayload } from "../apigen";
import { MonitorRepository } from "../database/repositories/monitor-repository";
import { createMonitorSchema, monitorIdParamSchema } from "../schemas/monitors";
import { randomUUID } from "crypto";
import { MonitorsId } from "../database/types/public/Monitors";
import { UsersId } from "../database/types/public/Users";
import MonitorType from "../database/types/public/MonitorType";

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
    const monitors: Monitor[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      monitorType: row.monitor_type,
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
    const { name, monitorType } = request.payload as CreateMonitorPayload;
    const id = randomUUID();
    const author = request.auth.credentials["id"];

    const existingMonitor = await monitorRepository.findByName(name);
    if (existingMonitor) {
      throw Boom.conflict(`Monitor with name '${name}' already exists`);
    }

    const row = await monitorRepository.create({
      id: id as MonitorsId,
      name,
      author: author as UsersId,
      monitor_type: monitorType as MonitorType,
    });
    const newMonitor: Monitor = {
      id: row.id,
      name: row.name,
      monitorType: row.monitor_type,
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

    const row = await monitorRepository.findById(id);
    if (!row) {
      throw Boom.notFound(`Monitor with ID ${id} not found`);
    }

    const monitor: Monitor = {
      id: row.id,
      name: row.name,
      monitorType: row.monitor_type,
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
