import { defineRouter } from "#q-app/wrappers";
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";
import routes from "./routes";
import { useAuthStore } from "stores/auth";

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();

    // Initialize auth state from localStorage on first navigation
    if (!authStore.token) {
      authStore.initializeAuth();
    }

    const requiresAuth = to.meta.requiresAuth !== false;

    if (requiresAuth && !authStore.isAuthenticated) {
      next("/login");
    } else if (to.path === "/login" && authStore.isAuthenticated) {
      next("/");
    } else {
      next();
    }
  });

  return Router;
});
