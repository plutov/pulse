import { defineBoot } from "#q-app/wrappers";
import axios, { type AxiosInstance } from "axios";
import { AuthApi, MonitorApi, Configuration } from "@pulse/shared";
import { useAuthStore } from "../stores/auth";

declare module "vue" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({
  baseURL: process.env.API_ADDR || "http://localhost:3000",
});

let authStore: ReturnType<typeof useAuthStore>;

const createConfig = () => {
  return new Configuration({
    basePath: process.env.API_ADDR || "http://localhost:3000",
    accessToken: () => authStore?.token.value || "",
  });
};

const createApis = () => {
  const config = createConfig();
  return {
    authApi: new AuthApi(config),
    monitorApi: new MonitorApi(config),
  };
};

let apis = createApis();

export const getAuthApi = () => apis.authApi;
export const getMonitorApi = () => apis.monitorApi;

// Legacy exports for compatibility
export const authApi = new AuthApi(new Configuration({
  basePath: process.env.API_ADDR || "http://localhost:3000",
}));

export const monitorApi = new MonitorApi(new Configuration({
  basePath: process.env.API_ADDR || "http://localhost:3000",
}));

export default defineBoot(({ app }) => {
  authStore = useAuthStore();
  
  // Update APIs when auth store changes
  app.config.globalProperties.$authStore = authStore;
  
  // Recreate APIs when token changes
  authStore.$subscribe(() => {
    apis = createApis();
  });

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});
