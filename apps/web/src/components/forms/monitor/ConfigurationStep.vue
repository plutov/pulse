<template>
  <div>
    <div v-if="props.modelValue.monitorType === 'http'">
      <q-input
        v-model="localData.config.url"
        label="URL"
        outlined
        placeholder="https://example.com"
        :error="hasError('config.url')"
        :error-message="getError('config.url')"
        @blur="updateData"
      />

      <q-select
        v-model="localData.config.method"
        :options="httpMethods"
        label="HTTP Method"
        outlined
        emit-value
        map-options
        class="q-mt-md"
        :error="hasError('config.method')"
        :error-message="getError('config.method')"
        @update:model-value="updateData"
      />
    </div>

    <div v-else class="text-grey-7">
      <q-icon name="info" class="q-mr-sm" />
      Configuration options will appear here based on the monitor type selected.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { HttpConfigMethodEnum, type CreateMonitorPayload } from "@pulse/shared";

interface Props {
  modelValue: Partial<CreateMonitorPayload>;
  validationErrors?: Record<string, string>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: Partial<CreateMonitorPayload>];
}>();

const localData = ref({
  config: {
    url: props.modelValue.config?.url || "",
    method: props.modelValue.config?.method || HttpConfigMethodEnum.get,
  },
});

const httpMethods = [
  { label: "GET", value: HttpConfigMethodEnum.get },
  { label: "POST", value: HttpConfigMethodEnum.post },
  { label: "PUT", value: HttpConfigMethodEnum.put },
  { label: "DELETE", value: HttpConfigMethodEnum.delete },
  { label: "HEAD", value: HttpConfigMethodEnum.head },
  { label: "OPTIONS", value: HttpConfigMethodEnum.options },
  { label: "PATCH", value: HttpConfigMethodEnum.patch },
];

const updateData = () => {
  emit("update:modelValue", { config: { ...localData.value.config } });
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
      config: {
        url: newValue.config?.url || "",
        method: newValue.config?.method || HttpConfigMethodEnum.get,
      },
    };
  },
  { deep: true },
);
</script>
