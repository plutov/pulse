<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold text-center">Welcome to Pulse</CardTitle>
        <CardDescription class="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <Label for="username">Username</Label>
            <Input
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter your username"
              required
              :disabled="loading"
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
              :disabled="loading"
            />
          </div>

          <Alert v-if="error" variant="destructive" class="mt-4">
            <AlertDescription>
              {{ error }}
            </AlertDescription>
          </Alert>

          <Button type="submit" :disabled="loading" class="w-full">
            {{ loading ? "Signing in..." : "Sign in" }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const router = useRouter();

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const handleLogin = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await authApi.login({
      loginPayload: {
        username: username.value,
        password: password.value,
      },
    });

    localStorage.setItem("token", response.token);
    router.push("/dashboard");
  } catch (err) {
    error.value = "Invalid username or password. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>
