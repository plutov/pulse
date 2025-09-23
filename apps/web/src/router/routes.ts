import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    component: () => import("./../pages/LoginPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    component: () => import("./../layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", component: () => import("./../pages/IndexPage.vue") },
    ],
  },
  {
    path: "/monitors",
    component: () => import("./../layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", component: () => import("./../pages/MonitorsPage.vue") },
      { path: "create", component: () => import("./../pages/CreateMonitorPage.vue") },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("./../pages/ErrorNotFound.vue"),
    meta: { requiresAuth: false },
  },
];

export default routes;
