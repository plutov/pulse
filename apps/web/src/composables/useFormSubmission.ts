import { ref } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import type { ValidationMessage } from "@pulse/shared";
import { useNotify } from "./notify";

interface UseFormSubmissionOptions<T> {
  submitFn: (data: T) => Promise<unknown>;
  successMessage?: string;
  redirectTo?: string;
  onSuccess?: () => void;
}

export function useFormSubmission<T>(options: UseFormSubmissionOptions<T>) {
  const {
    submitFn,
    successMessage = "Successfully created!",
    redirectTo,
    onSuccess,
  } = options;
  const $q = useQuasar();
  const router = useRouter();
  const { notifyOnError } = useNotify();

  const loading = ref(false);
  const validationErrors = ref<Record<string, string>>({});

  const clearValidationErrors = () => {
    validationErrors.value = {};
  };

  const setValidationErrors = (messages: ValidationMessage[]) => {
    const errors: Record<string, string> = {};
    messages.forEach((msg) => {
      if (msg.path && msg.path.length > 0) {
        const fieldPath = msg.path.join(".");
        errors[fieldPath] = msg.message;
      }
    });
    validationErrors.value = errors;
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors.value[fieldName];
  };

  const hasFieldError = (fieldName: string): boolean => {
    return !!validationErrors.value[fieldName];
  };

  const submit = async (data: T): Promise<boolean> => {
    loading.value = true;
    clearValidationErrors();

    try {
      await submitFn(data);

      $q.notify({
        type: "positive",
        message: successMessage,
      });

      if (onSuccess) {
        onSuccess();
      }

      if (redirectTo) {
        await router.push(redirectTo);
      }

      return true;
    } catch (error: unknown) {
      notifyOnError(error, setValidationErrors);
    } finally {
      loading.value = false;
    }

    return false;
  };

  return {
    loading,
    validationErrors,
    submit,
    getFieldError,
    hasFieldError,
    clearValidationErrors,
  };
}
