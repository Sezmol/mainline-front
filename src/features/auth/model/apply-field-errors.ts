import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import type { ApiError } from '@shared/api/error';

export const applyFieldErrors = <TValues extends FieldValues>(
  failure: ApiError,
  setError: UseFormSetError<TValues>,
  knownFields: readonly Path<TValues>[],
) => {
  if (!failure.fields) return failure.message;

  let matched = false;

  for (const [field, messages] of Object.entries(failure.fields)) {
    const message = messages[0];
    if (!message) continue;

    if ((knownFields as readonly string[]).includes(field)) {
      setError(field as Path<TValues>, { type: 'server', message });
      matched = true;
    }
  }

  return matched ? null : failure.message;
};
