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
import { ref, watch, computed } from "vue";
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

const extractConfig = (config?: MonitorConfig) => ({
  url: config && "url" in config ? config.url : "",
  method: config && "method" in config ? config.method : HttpMethod.get,
  command: config && "command" in config ? config.command : "",
});

const localData = ref({
  config: extractConfig(props.modelValue.config),
});

const httpMethods = Object.keys(HttpMethod).map((key: string) => ({
  label: key.toUpperCase(),
  value: HttpMethod[key as keyof typeof HttpMethod],
}));

const builtConfig = computed<MonitorConfig>(() => {
  if (props.modelValue.monitorType === MonitorType.http) {
    return {
      url: localData.value.config.url,
      method: localData.value.config.method,
    };
  } else if (props.modelValue.monitorType === MonitorType.shell) {
    return {
      command: localData.value.config.command,
    };
  } else {
    throw new Error("Unsupported monitor type");
  }
});

const updateData = () => {
  emit("update:modelValue", { config: builtConfig.value });
};

const hasError = (field: string) => {
  return !!props.validationErrors?.[field];
};

const getError = (field: string) => {
  return props.validationErrors?.[field];
};

watch(
  () => props.modelValue.config,
  (newConfig) => {
    localData.value.config = extractConfig(newConfig);
  },
  { deep: true },
);
</script>
