<template>
  <q-badge :color="getBadgeColor(value)" :label="value" />
</template>

<script setup lang="ts">
defineProps<Props>();

type Status =
  | "active"
  | "success"
  | "failure"
  | "timeout"
  | "paused"
  | undefined;

interface Props {
  value: Status;
}

const getBadgeColor = (status: Status): string => {
  switch (status) {
    case "active":
    case "success":
      return "positive";
    case "failure":
      return "negative";
    case "timeout":
      return "warning";
    case "paused":
      return "orange";
    default:
      return "grey";
  }
};
</script>
