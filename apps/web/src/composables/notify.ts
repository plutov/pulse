import { useQuasar } from "quasar";
import type { ErrorResponse, ValidationMessage } from "@pulse/shared";
import axios from "axios";

export function notifyOnError(
  error: unknown,
  setValidationErrors?: (messages: ValidationMessage[]) => void,
) {
  const $q = useQuasar();

  if (axios.isAxiosError(error)) {
    const response = error.response?.data as ErrorResponse;

    if (error.response?.status === 400 && response.validationMessages) {
      if (setValidationErrors) {
        setValidationErrors(response.validationMessages);
      }
      $q.notify({
        type: "negative",
        message: response.message,
      });
      return;
    }
  }

  $q.notify({
    type: "negative",
    message: "An unexpected error occurred",
  });
}
