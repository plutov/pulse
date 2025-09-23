<template>
  <div
    class="fullscreen bg-dark-page y text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6 text-primary">Login to Pulse</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              filled
              v-model="username"
              label="Username"
              :disable="authStore.isLoading"
              :rules="[(val: string) => !!val || 'Username is required']"
            />

            <q-input
              filled
              type="password"
              v-model="password"
              label="Password"
              :disable="authStore.isLoading"
              :rules="[(val: string) => !!val || 'Password is required']"
            />

            <div v-if="errorMessage" class="text-negative text-center">
              {{ errorMessage }}
            </div>

            <div>
              <q-btn
                label="Login"
                type="submit"
                color="primary"
                :loading="authStore.isLoading"
                class="full-width"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const errorMessage = ref("");

const onSubmit = async () => {
  errorMessage.value = "";

  const user = await authStore.login({
    username: username.value,
    password: password.value,
  });

  if (user) {
    void router.push("/");
  } else {
    errorMessage.value = "Invalid username or password";
  }
};
</script>
