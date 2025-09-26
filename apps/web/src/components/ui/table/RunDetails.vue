<template>
  <q-badge
    v-if="'statusCode' in value"
    outline
    color="primary"
    :label="value.statusCode"
  />
  <q-badge v-if="'code' in value" outline color="primary" :label="value.code" />
</template>

<script setup lang="ts">
import type { MonitorRunDetails } from "@pulse/shared";

defineProps<Props>();

interface Props {
  value: MonitorRunDetails;
}
</script>
