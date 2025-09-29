import { defineBoot } from "#q-app/wrappers";
import { AuthApi, MonitorApi, ChartsApi, Configuration } from "@pulse/shared";
import { useAuthStore } from "stores/auth";
import { unref } from "vue";
import axios from "axios";

const createConfig = () => {
  return new Configuration({
    basePath: process.env.API_ADDR || "http://localhost:3000",
    accessToken: () => unref(useAuthStore().token),
  });
};

export const getAuthApi = () => new AuthApi(createConfig());
export const getMonitorApi = () => new MonitorApi(createConfig());
export const getChartsApi = () => new ChartsApi(createConfig());

export const authApi = new AuthApi(createConfig());
export const monitorApi = new MonitorApi(createConfig());
export const chartsApi = new ChartsApi(createConfig());

export default defineBoot(({ app, router }) => {
  const authStore = useAuthStore();
  authStore.initializeAuth();

  app.config.globalProperties.$authStore = authStore;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        authStore.logout();
        router.push("/login");
      }
      return Promise.reject(error);
    },
  );
});
