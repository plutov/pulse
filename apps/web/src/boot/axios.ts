import { defineBoot } from "#q-app/wrappers";
import axios, { type AxiosInstance } from "axios";
import { AuthApi, MonitorApi, Configuration } from "@pulse/shared";

declare module "vue" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({
  baseURL: process.env.API_ADDR || "http://localhost:3000",
});

const config = new Configuration({
  basePath: process.env.API_ADDR || "http://localhost:3000",
});

export const authApi = new AuthApi(config);
export const monitorApi = new MonitorApi(config);

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});
