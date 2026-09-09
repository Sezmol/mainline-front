import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";

import { ApiError } from "@shared/api";
import { ErrorState } from "@shared/ui/error-state";

export const RouteError = ({ error, reset }: ErrorComponentProps) => {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <ErrorState
        message={
          error instanceof ApiError
            ? error.message
            : "This page could not be opened."
        }
        onRetry={() => {
          reset();
          void router.invalidate();
        }}
      />
    </div>
  );
};
