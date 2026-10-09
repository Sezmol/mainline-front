import { useFormContext, useFormState } from "react-hook-form";

import { FormField } from "@shared/ui/form-field";
import { Input } from "@shared/ui/input";

import type { PostFormValues } from "../model/post-form.schema";

export const LocationField = () => {
  const { control, register } = useFormContext<PostFormValues>();
  const { errors } = useFormState({ control });

  return (
    <FormField id="location" label="Location" error={errors.location?.message}>
      <Input
        id="location"
        autoComplete="off"
        placeholder="Optional"
        aria-invalid={Boolean(errors.location)}
        {...register("location")}
      />
    </FormField>
  );
};
