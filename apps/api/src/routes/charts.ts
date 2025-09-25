import { ServerRoute } from "@hapi/hapi";
import { getTimeSeriesChartDataHandler } from "../controllers/charts";
import { timeSeriesChartSchema } from "../api/schemas/charts";
import { validationFailAction } from "../api/errors";

export const chartsRoutes: ServerRoute[] = [
  {
    method: "POST",
    path: "/charts/timeSeries",
    handler: getTimeSeriesChartDataHandler,
    options: {
      validate: {
        payload: timeSeriesChartSchema,
        failAction: validationFailAction,
      },
    },
  },
];
