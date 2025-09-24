import * as Hapi from "@hapi/hapi";
import {
  getAllMonitorsHandler,
  createMonitorHandler,
  getMonitorByIdHandler,
  deleteMonitorHandler,
  listMonitorRuns,
} from "../controllers/monitors";
import {
  createMonitorSchema,
  monitorIdParamSchema,
} from "../api/schemas/monitors";
import { listMonitorRunsParamsSchema } from "../api/schemas/runs";
import { validationFailAction } from "../api/errors";

export const monitorRoutes: Hapi.ServerRoute[] = [
  {
    method: "GET",
    path: "/monitors",
    handler: getAllMonitorsHandler,
  },
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
  {
    method: "GET",
    path: "/runs",
    handler: listMonitorRuns,
    options: {
      validate: {
        query: listMonitorRunsParamsSchema,
        failAction: validationFailAction,
      },
    },
  },
];
