<template>
  <q-table
    :rows="data"
    :columns="columns"
    :row-key="rowKey"
    :loading="loading"
    :sortable="sortable"
    flat
    bordered
    hide-bottom
    v-bind="$attrs"
  >
    <template
      v-for="column in columnsWithSlots"
      :key="column.name"
      #[`body-cell-${column.name}`]="props"
    >
      <q-td :props="props">
        <component
          :is="column.component"
          v-if="column.component"
          :value="column.field ? column.field(props.row) : props.value"
          :row="props.row"
        />
        <span v-else>
          {{ column.field ? column.field(props.row) : props.value }}
        </span>
      </q-td>
    </template>

    <template v-if="$slots.empty" #no-data>
      <slot name="empty" />
    </template>
  </q-table>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed } from "vue";
import type { QTableColumn } from "quasar";
import type { Component } from "vue";

interface DataTableColumn<T> extends Omit<QTableColumn, "field"> {
  name: string;
  field?: (row: T) => unknown;
  component?: Component;
}

interface Props<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  rowKey?: string | ((row: T) => string | number);
  sortable?: boolean;
}

const props = withDefaults(defineProps<Props<T>>(), {
  loading: false,
  rowKey: "id",
  sortable: false,
});

const columnsWithSlots = computed(() =>
  props.columns.filter((col) => col.component || col.field),
);
</script>
