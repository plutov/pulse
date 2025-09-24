import type { RouteRecordRaw } from "vue-router";

const mainLayout = () => import("./../layouts/MainLayout.vue");

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    component: () => import("./../pages/LoginPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    component: mainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", component: () => import("./../pages/IndexPage.vue") },
    ],
  },
  {
    path: "/monitors",
    component: mainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", component: () => import("./../pages/MonitorsPage.vue") },
      {
        path: "create",
        component: () => import("./../pages/CreateMonitorPage.vue"),
      },
    ],
  },
  {
    path: "/runs",
    component: mainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", component: () => import("./../pages/RunsPage.vue") },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("./../pages/ErrorNotFound.vue"),
    meta: { requiresAuth: false },
  },
];

export default routes;
