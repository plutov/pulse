<template>
  <div>
    <q-input
      v-model="localData.schedule"
      label="Schedule (cron expression)"
      outlined
      placeholder="*/5 * * * *"
      hint="Example: */5 * * * * (every 5 minutes)"
      :error="hasError('schedule')"
      :error-message="getError('schedule')"
      @blur="updateData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { CreateMonitorPayload } from "@pulse/shared";

interface Props {
  modelValue: Partial<CreateMonitorPayload>;
  validationErrors?: Record<string, string>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: Partial<CreateMonitorPayload>];
}>();

const localData = ref({
  schedule: props.modelValue.schedule || "*/5 * * * *",
});

const updateData = () => {
  emit("update:modelValue", { schedule: localData.value.schedule });
};

const hasError = (field: string) => {
  return !!props.validationErrors?.[field];
};

const getError = (field: string) => {
  return props.validationErrors?.[field];
};

watch(
  () => props.modelValue,
  (newValue) => {
    localData.value = {
      schedule: newValue.schedule || "*/5 * * * *",
    };
  },
  { deep: true },
);
</script>

