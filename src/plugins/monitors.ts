import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { Monitor, CreateMonitorPayload } from "../apigen";
import { MonitorMonitorsitory } from "../database/repositories/monitor-repository";

const monitorMonitorsitory = new MonitorMonitorsitory();

function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

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
      },
    ]);

    server.route([
      {
        method: "GET",
        path: "/monitors/{id}",
        handler: getMonitorByIdHandler,
      },
    ]);

    server.route([
      {
        method: "DELETE",
        path: "/monitors/{id}",
        handler: deleteMonitorHandler,
      },
    ]);
  },
};

export default monitorsPlugin;

async function getAllMonitorsHandler() {
  try {
    const monitorRows = await monitorMonitorsitory.findAll();
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

    // Check if monitor already exists
    const existingMonitor = await monitorMonitorsitory.findByName(name);
    if (existingMonitor) {
      throw Boom.conflict(`Monitorsitory with name '${name}' already exists`);
    }

    const monitorRow = await monitorMonitorsitory.create({ name });
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
    throw Boom.internal("Failed to create monitorsitory");
  }
}

async function getMonitorByIdHandler(request: Hapi.Request) {
  try {
    const id = request.params["id"] as string;

    if (!id) {
      throw Boom.badRequest("Monitorsitory ID is required");
    }

    if (!isValidUUID(id)) {
      throw Boom.badRequest("Invalid monitorsitory ID format");
    }

    const monitorRow = await monitorMonitorsitory.findById(id);
    if (!monitorRow) {
      throw Boom.notFound(`Monitorsitory with ID ${id} not found`);
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
    throw Boom.internal("Failed to fetch monitorsitory");
  }
}

async function deleteMonitorHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit,
) {
  try {
    const id = request.params["id"] as string;

    if (!id) {
      throw Boom.badRequest("Monitorsitory ID is required");
    }

    if (!isValidUUID(id)) {
      throw Boom.badRequest("Invalid monitorsitory ID format");
    }

    const deleted = await monitorMonitorsitory.delete(id);
    if (!deleted) {
      throw Boom.notFound(`Monitorsitory with ID ${id} not found`);
    }

    return h.response().code(204);
  } catch (error) {
    if (Boom.isBoom(error)) {
      throw error;
    }
    console.error("Error deleting monitor:", error);
    throw Boom.internal("Failed to delete monitorsitory");
  }
}
