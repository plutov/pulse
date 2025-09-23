<template>
  <div class="form-stepper">
    <q-stepper
      v-model="currentStep"
      ref="stepper"
      color="primary"
      animated
      vertical
      class="q-pa-md"
    >
      <q-step
        v-for="(step, index) in steps"
        :key="step.name"
        :name="index + 1"
        :title="step.title"
        :caption="step.caption"
        :icon="step.icon"
        :done="index + 1 < currentStep"
        :done-icon="step.doneIcon || 'check'"
        :active-icon="step.activeIcon || step.icon"
        :error-icon="step.errorIcon || 'warning'"
        :header-nav="step.headerNav !== false"
      >
        <component
          :is="step.component"
          :model-value="formData"
          @update:model-value="updateFormData"
          :validation-errors="validationErrors"
          :loading="loading"
        />

        <q-stepper-navigation class="q-mt-lg">
          <q-btn
            v-if="index < steps.length - 1"
            @click="nextStep"
            color="accent"
            label="Continue"
            :disable="!step.isValid?.(formData) || loading"
          />
          <q-btn
            v-else
            @click="submit"
            color="accent"
            label="Create"
            :loading="loading"
            :disable="!step.isValid?.(formData)"
          />
          <q-btn
            v-if="index > 0"
            flat
            color="primary"
            @click="previousStep"
            label="Back"
            class="q-ml-sm"
            :disable="loading"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ref, computed } from "vue";
import type { Component } from "vue";

export interface FormStep<T> {
  name: string;
  title: string;
  caption?: string;
  icon?: string;
  doneIcon?: string;
  activeIcon?: string;
  errorIcon?: string;
  headerNav?: boolean;
  component: Component;
  isValid?: (data: Partial<T>) => boolean;
}

interface Props<T> {
  steps: FormStep<T>[];
  modelValue: Partial<T>;
  validationErrors?: Record<string, string>;
  loading?: boolean;
}

interface Emits<T> {
  "update:modelValue": [value: Partial<T>];
  submit: [data: Partial<T>];
}

const props = defineProps<Props<T>>();
const emit = defineEmits<Emits<T>>();

const currentStep = ref(1);
const stepper = ref();

const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const updateFormData = (data: Partial<T>) => {
  emit("update:modelValue", { ...props.modelValue, ...data });
};

const nextStep = () => {
  stepper.value?.next();
};

const previousStep = () => {
  stepper.value?.previous();
};

const submit = () => {
  emit("submit", props.modelValue);
};
</script>

<style scoped>
.form-stepper {
  max-width: 600px;
  margin: 0 auto;
}
</style>

