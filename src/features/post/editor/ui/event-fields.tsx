import { useFormContext, useFormState, useWatch } from "react-hook-form";

import { FormField } from "@shared/ui/form-field";
import { Input } from "@shared/ui/input";

import {
  type PostFormValues,
  toOptionalNumber,
} from "../model/post-form.schema";
import { LocationField } from "./location-field";
import { PrivacyField } from "./privacy-field";

const EVENT_ACCESS = [
  { value: "public", label: "Open to everyone" },
  { value: "private", label: "By invitation" },
] as const;

export const EventFields = () => {
  const { control, register } = useFormContext<PostFormValues>();
  const { errors } = useFormState({ control });
  const isPrivate = useWatch({ control, name: "isPrivate" });

  return (
    <>
      <PrivacyField id="access" label="Access" options={EVENT_ACCESS} />

      {isPrivate ? null : (
        <FormField
          id="participantLimit"
          label="Participant limit"
          error={errors.participantLimit?.message}
        >
          <Input
            id="participantLimit"
            type="number"
            inputMode="numeric"
            placeholder="Leave empty for no limit"
            className="font-mono tabular-nums"
            aria-invalid={Boolean(errors.participantLimit)}
            {...register("participantLimit", {
              setValueAs: toOptionalNumber,
            })}
          />
        </FormField>
      )}

      <LocationField />
    </>
  );
};
