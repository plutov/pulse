<template>
  <div>
    <q-input
      v-model="localData.name"
      label="Monitor Name"
      outlined
      :error="hasError('name')"
      :error-message="getError('name')"
      @blur="updateData"
    />

    <q-select
      v-model="localData.monitorType"
      :options="monitorTypeOptions"
      label="Monitor Type"
      outlined
      emit-value
      map-options
      class="q-mt-md"
      :error="hasError('monitorType')"
      :error-message="getError('monitorType')"
      @update:model-value="updateData"
    />

    <q-select
      v-model="localData.status"
      :options="statusOptions"
      label="Status"
      outlined
      emit-value
      map-options
      class="q-mt-md"
      :error="hasError('status')"
      :error-message="getError('status')"
      @update:model-value="updateData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { MonitorType, type CreateMonitorPayload } from "@pulse/shared";

interface Props {
  modelValue: Partial<CreateMonitorPayload>;
  validationErrors?: Record<string, string>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: Partial<CreateMonitorPayload>];
}>();

const localData = ref({
  name: props.modelValue.name || "",
  monitorType: props.modelValue.monitorType || MonitorType.http,
  status: props.modelValue.status || "active",
});

const monitorTypeOptions = [{ label: "HTTP", value: MonitorType.http }];

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
];

const updateData = () => {
  emit("update:modelValue", { ...localData.value });
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
      name: newValue.name || "",
      monitorType: newValue.monitorType || MonitorType.http,
      status: newValue.status || "active",
    };
  },
  { deep: true },
);
</script>

