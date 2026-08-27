import type { ErrorResponse } from "./generated/types.gen";

type Failure = Pick<ErrorResponse, "code" | "message" | "details">;

export class ApiError extends Error {
  readonly code: ErrorResponse["code"];
  readonly fields: ErrorResponse["details"];

  constructor(failure: Failure) {
    super(failure.message);
    this.name = "ApiError";
    this.code = failure.code;
    this.fields = failure.details;
  }
}

const isFailure = (value: unknown): value is Failure =>
  typeof value === "object" &&
  value !== null &&
  "code" in value &&
  "message" in value;

export const toApiError = (error: unknown) => {
  if (error instanceof ApiError) return error;
  if (isFailure(error)) return new ApiError(error);

  return new ApiError({
    code: "INTERNAL",
    message: "Could not reach the server. Check your connection and try again.",
  });
};
