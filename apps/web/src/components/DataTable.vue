<template>
  <div>
    <q-table
      :rows="data"
      :columns="tableColumns"
      :row-key="rowKey"
      :loading="loading"
      :sortable="sortable"
      :pagination="tablePaginationProps"
      :hide-bottom="true"
      @request="onRequest"
      :rows-per-page-options="rowsPerPageOptions"
      :server-side="!!pagination"
      flat
      bordered
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

    <div v-if="pagination" class="row justify-between items-center q-mt-md">
      <div class="text-body2 text-grey-7">
        Showing {{ startRecord }}-{{ endRecord }} of
        {{ pagination.rowsNumber }} results
      </div>
      <q-pagination
        v-model="currentPage"
        :max="maxPages"
        :max-pages="7"
        boundary-numbers
        @update:model-value="onPageChange"
      />
      <div class="row items-center q-gutter-sm">
        <span class="text-body2 text-grey-7">Rows per page:</span>
        <q-select
          v-model="currentRowsPerPage"
          :options="rowsPerPageOptions"
          dense
          outlined
          style="min-width: 70px"
          @update:model-value="onRowsPerPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, ref, watch } from "vue";
import type { QTableColumn } from "quasar";
import type { Component } from "vue";
import { type PaginationParams } from "src/composables/useDataTable";

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
  pagination?: PaginationParams;
  columns: DataTableColumn<T>[];
  loading?: boolean;
  rowKey?: string | ((row: T) => string | number);
  sortable?: boolean;
  actions?: DataTableAction<T>[];
  rowsPerPageOptions?: number[];
}

const props = withDefaults(defineProps<Props<T>>(), {
  loading: false,
  rowKey: "id",
  sortable: false,
  rowsPerPageOptions: () => [10, 25, 50, 100],
});

const emit = defineEmits<{
  request: [payload: { pagination: { page: number; rowsPerPage: number } }];
}>();

const currentPage = ref(1);
const currentRowsPerPage = ref(10);

watch(
  () => props.pagination,
  (newPagination) => {
    if (newPagination) {
      currentPage.value = newPagination.page;
      currentRowsPerPage.value = newPagination.rowsPerPage;
    }
  },
  { deep: true, immediate: true },
);

const tablePaginationProps = computed(() => {
  if (!props.pagination) return undefined;
  return {
    page: currentPage.value,
    rowsPerPage: currentRowsPerPage.value,
    rowsNumber: props.pagination.rowsNumber,
  };
});

const maxPages = computed(() => {
  if (!props.pagination) return 0;
  return Math.ceil(props.pagination.rowsNumber / currentRowsPerPage.value);
});

const startRecord = computed(() => {
  if (!props.pagination) return 0;
  return (currentPage.value - 1) * currentRowsPerPage.value + 1;
});

const endRecord = computed(() => {
  if (!props.pagination) return 0;
  const end = currentPage.value * currentRowsPerPage.value;
  return Math.min(end, props.pagination.rowsNumber);
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

const onRequest = (requestProps: {
  pagination: { page: number; rowsPerPage: number };
}) => {
  if (props.pagination) {
    emit("request", requestProps);
  }
};

const onPageChange = (newPage: number) => {
  currentPage.value = newPage;
  onRequest({
    pagination: {
      page: newPage,
      rowsPerPage: currentRowsPerPage.value,
    },
  });
};

const onRowsPerPageChange = (newRowsPerPage: number) => {
  currentRowsPerPage.value = newRowsPerPage;
  currentPage.value = 1;
  onRequest({
    pagination: {
      page: 1,
      rowsPerPage: newRowsPerPage,
    },
  });
};
</script>
