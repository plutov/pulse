<template>
  <q-table
    :rows="data"
    :columns="tableColumns"
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

    <template #body-cell-actions="props" v-if="actions && actions.length > 0">
      <q-td :props="props">
        <q-btn-dropdown
          flat
          dense
          icon="more_vert"
          dropdown-icon="none"
          size="sm"
          padding="xs"
        >
          <q-list>
            <q-item
              v-for="action in actions"
              :key="action.label"
              clickable
              v-close-popup
              @click="action.handler(props.row)"
              :class="action.class"
            >
              <q-item-section avatar v-if="action.icon">
                <q-icon :name="action.icon" />
              </q-item-section>
              <q-item-section>{{ action.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
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

interface DataTableAction<T> {
  label: string;
  icon?: string;
  handler: (row: T) => void;
  class?: string;
}

interface Props<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  rowKey?: string | ((row: T) => string | number);
  sortable?: boolean;
  actions?: DataTableAction<T>[];
}

const props = withDefaults(defineProps<Props<T>>(), {
  loading: false,
  rowKey: "id",
  sortable: false,
});

const tableColumns = computed(() => {
  const cols = [...props.columns];
  if (props.actions && props.actions.length > 0) {
    cols.push({
      name: "actions",
      label: "",
      align: "right" as const,
      sortable: false,
      style: "width: 50px",
    });
  }
  return cols;
});

const columnsWithSlots = computed(() =>
  props.columns.filter((col) => col.component || col.field),
);
</script>
