import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { LoginPayload, User } from "@pulse/shared";
import { authApi } from "boot/axios";
import { LocalStorage } from "quasar";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string>("");
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const isAuthenticated = computed(() => !!token.value);

  const login = async (credentials: LoginPayload): Promise<User | null> => {
    isLoading.value = true;
    try {
      const response = await authApi.login(credentials);
      if (response.data) {
        token.value = response.data.token;
        user.value = response.data.user;
        LocalStorage.setItem("auth_token", response.data.token);
        return response.data.user;
      }
    } catch {
      isLoading.value = false;
    }

    return null;
  };

  const logout = () => {
    token.value = "";
    user.value = null;
    LocalStorage.removeItem("auth_token");
  };

  const initializeAuth = () => {
    const savedToken = LocalStorage.getItem("auth_token");
    if (savedToken && typeof savedToken === "string") {
      token.value = savedToken;
    }
  };

  return {
    token,
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    initializeAuth,
  };
});
