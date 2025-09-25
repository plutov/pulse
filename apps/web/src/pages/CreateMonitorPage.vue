<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <h4 class="q-ma-none">Create Monitor</h4>
        <p class="text-grey-7 q-mb-none">Set up a new monitor</p>
      </div>
      <q-btn
        flat
        icon="arrow_back"
        label="Back to Monitors"
        @click="$router.push('/monitors')"
      />
    </div>

    <FormStepper
      v-model="formData"
      :steps="steps"
      :validation-errors="validationErrors"
      :loading="loading"
      @submit="handleSubmit"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getMonitorApi } from "boot/axios";
import { MonitorType, type CreateMonitorPayload } from "@pulse/shared";
import { useFormSubmission } from "../composables/useFormSubmission";
import FormStepper from "components/FormStepper.vue";
import BasicInfoStep from "components/forms/monitor/BasicInfoStep.vue";
import ScheduleStep from "components/forms/monitor/ScheduleStep.vue";
import ConfigurationStep from "components/forms/monitor/ConfigurationStep.vue";

const $router = useRouter();

const formData = ref<Partial<CreateMonitorPayload>>({
  name: "",
  monitorType: MonitorType.http,
  status: "active",
  schedule: "* * * * *",
  config: {
    url: "",
    method: "GET",
  },
});

const steps = [
  {
    name: "basic",
    title: "Basic Information",
    caption: "Monitor name, type, and status",
    icon: "settings",
    component: BasicInfoStep,
    isValid: (data: Partial<CreateMonitorPayload>) =>
      !!(data.name && data.monitorType && data.status),
  },
  {
    name: "schedule",
    title: "Schedule",
    caption: "When to run the monitor",
    icon: "schedule",
    component: ScheduleStep,
    isValid: (data: Partial<CreateMonitorPayload>) => !!data.schedule,
  },
  {
    name: "configuration",
    title: "Configuration",
    caption: "Monitor-specific settings",
    icon: "tune",
    component: ConfigurationStep,
    isValid: (data: Partial<CreateMonitorPayload>) => {
      if (data.monitorType === MonitorType.http) {
        return !!(data.config?.url && data.config?.method);
      }
      return true;
    },
  },
];

const { loading, validationErrors, submit } =
  useFormSubmission<CreateMonitorPayload>({
    submitFn: async (data) => {
      const monitorApi = getMonitorApi();
      return await monitorApi.createMonitor(data);
    },
    successMessage: "Monitor created successfully!",
    redirectTo: "/monitors",
  });

const handleSubmit = async (data: Partial<CreateMonitorPayload>) => {
  await submit(data as CreateMonitorPayload);
};
</script>
