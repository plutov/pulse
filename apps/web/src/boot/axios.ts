import { defineBoot } from "#q-app/wrappers";
import axios, { type AxiosInstance } from "axios";
import { AuthApi, MonitorApi, Configuration } from "@pulse/shared";
import { useAuthStore } from "stores/auth";
import { unref } from "vue";

declare module "vue" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const createConfig = () => {
  return new Configuration({
    basePath: process.env.API_ADDR || "http://localhost:3000",
    accessToken: () => unref(useAuthStore().token),
  });
};

export const getAuthApi = () => new AuthApi(createConfig());
export const getMonitorApi = () => new MonitorApi(createConfig());

export const authApi = new AuthApi(createConfig());
export const monitorApi = new MonitorApi(createConfig());

export default defineBoot(({ app }) => {
  const authStore = useAuthStore();
  authStore.initializeAuth();

  app.config.globalProperties.$authStore = authStore;
  app.config.globalProperties.$axios = axios;
});
