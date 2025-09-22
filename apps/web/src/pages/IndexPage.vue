<template>
  <q-page class="row items-center justify-evenly">
    <div class="column q-gutter-md">
      <example-component
        title="Example component"
        active
        :todos="todos"
        :meta="meta"
      ></example-component>

      <div class="q-pa-md">
        <h5>API Demo</h5>
        <div class="q-gutter-sm">
          <q-btn
            color="primary"
            label="Login Demo"
            @click="loginDemo"
            :loading="loginLoading"
          />
          <q-btn
            color="secondary"
            label="List Monitors"
            @click="listMonitors"
            :loading="monitorsLoading"
            :disable="!isLoggedIn"
          />
        </div>

        <div v-if="monitors.length > 0" class="q-mt-md">
          <q-card>
            <q-card-section>
              <div class="text-h6">Monitors</div>
              <q-list>
                <q-item v-for="monitor in monitors" :key="monitor.id">
                  <q-item-section>
                    <q-item-label>{{ monitor.name }}</q-item-label>
                    <q-item-label caption
                      >Type: {{ monitor.monitorType }}</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Todo, Meta } from "components/models";
import ExampleComponent from "components/ExampleComponent.vue";
import { authApi, monitorApi } from "boot/axios";
import type { LoginPayload, Monitor } from "@pulse/shared";

const todos = ref<Todo[]>([
  {
    id: 1,
    content: "ct1",
  },
  {
    id: 2,
    content: "ct2",
  },
  {
    id: 3,
    content: "ct3",
  },
  {
    id: 4,
    content: "ct4",
  },
  {
    id: 5,
    content: "ct5",
  },
]);

const meta = ref<Meta>({
  totalCount: 1200,
});

const monitors = ref<Monitor[]>([]);
const loginLoading = ref(false);
const monitorsLoading = ref(false);
const isLoggedIn = ref(false);
const authToken = ref<string>("");

const loginDemo = async () => {
  loginLoading.value = true;
  try {
    const loginPayload: LoginPayload = {
      username: "admin",
      password: "admin123",
    };

    const response = await authApi.login(loginPayload);

    if (response.data) {
      authToken.value = response.data.token;
      isLoggedIn.value = true;
    }
  } catch (error: unknown) {
    console.log("api error:", error);
  } finally {
    loginLoading.value = false;
  }
};

const listMonitors = async () => {
  monitorsLoading.value = true;
  try {
    const response = await monitorApi.listMonitors();
    if (response.data) {
      monitors.value = response.data;
    }
  } catch (error: unknown) {
    console.log("api error:", error);
  } finally {
    monitorsLoading.value = false;
  }
};
</script>
