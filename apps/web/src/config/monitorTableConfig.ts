import { date } from "quasar";
import { MonitorType, type Monitor } from "@pulse/shared";
import StatusBadge from "../components/StatusBadge.vue";

export const monitorTableColumns = [
  {
    name: "name",
    required: true,
    label: "Name",
    align: "left" as const,
    field: (row: Monitor) => row.name,
  },
  {
    name: "monitorType",
    required: true,
    label: "Type",
    align: "left" as const,
    field: (row: Monitor) => row.monitorType,
  },
  {
    name: "status",
    required: true,
    label: "Status",
    align: "left" as const,
    field: (row: Monitor) => row.status,
    component: StatusBadge,
  },
  {
    name: "schedule",
    required: true,
    label: "Schedule",
    align: "left" as const,
    field: (row: Monitor) => row.schedule,
  },
  {
    name: "author",
    required: true,
    label: "Author",
    align: "left" as const,
    field: (row: Monitor) => row.author.username,
  },
  {
    name: "createdAt",
    required: true,
    label: "Created",
    align: "left" as const,
    field: (row: Monitor) =>
      date.formatDate(new Date(row.createdAt), "YYYY-MM-DD HH:mm"),
  },
  {
    name: "httpConfig",
    required: false,
    label: "Config",
    align: "left" as const,
    field: (row: Monitor) =>
      row.monitorType === MonitorType.http && row.config
        ? `${row.config.method} ${row.config.url}`
        : "N/A",
  },
];
