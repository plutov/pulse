<template>
  <q-badge outline color="primary" :label="value.statusCode" />
</template>

<script setup lang="ts">
import { HttpRunDetails } from "@pulse/shared";

defineProps<Props>();

interface Props {
  value: HttpRunDetails;
}
</script>
