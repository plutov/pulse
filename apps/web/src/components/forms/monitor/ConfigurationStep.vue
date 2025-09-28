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

    <div v-else-if="props.modelValue.monitorType === 'shell'">
      <q-input
        v-model="localData.config.command"
        label="Command"
        outlined
        placeholder="echo 'Hello World'"
        type="textarea"
        rows="3"
        :error="hasError('config.command')"
        :error-message="getError('config.command')"
        @blur="updateData"
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
import {
  HttpMethod,
  MonitorConfig,
  MonitorType,
  type CreateMonitorPayload,
} from "@pulse/shared";

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
    url:
      props.modelValue.config && "url" in props.modelValue.config
        ? props.modelValue.config.url
        : "",
    method:
      props.modelValue.config && "method" in props.modelValue.config
        ? props.modelValue.config.method
        : HttpMethod.get,
    command:
      props.modelValue.config && "command" in props.modelValue.config
        ? props.modelValue.config.command
        : "",
  },
});

const httpMethods = [
  { label: "GET", value: HttpMethod.get },
  { label: "POST", value: HttpMethod.post },
  { label: "PUT", value: HttpMethod.put },
  { label: "DELETE", value: HttpMethod.delete },
  { label: "HEAD", value: HttpMethod.head },
  { label: "OPTIONS", value: HttpMethod.options },
  { label: "PATCH", value: HttpMethod.patch },
];

const updateData = () => {
  let config: MonitorConfig;

  if (props.modelValue.monitorType === MonitorType.http) {
    config = {
      url: localData.value.config.url,
      method: localData.value.config.method,
    };
  } else if (props.modelValue.monitorType === MonitorType.shell) {
    config = {
      command: localData.value.config.command,
    };
  } else {
    throw new Error("Unsupported monitor type");
  }

  emit("update:modelValue", { config });
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
        url:
          newValue.config && "url" in newValue.config
            ? newValue.config.url
            : "",
        method:
          newValue.config && "method" in newValue.config
            ? newValue.config.method
            : HttpMethod.get,
        command:
          newValue.config && "command" in newValue.config
            ? newValue.config.command
            : "",
      },
    };
  },
  { deep: true },
);
</script>
