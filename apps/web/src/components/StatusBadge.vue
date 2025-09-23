<template>
  <q-badge :color="value === 'active' ? 'positive' : 'orange'" :label="value" />
</template>

<script setup lang="ts">
interface Props {
  value: string;
}

defineProps<Props>();
</script>
