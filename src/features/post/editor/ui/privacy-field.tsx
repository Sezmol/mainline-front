import { Controller, useFormContext } from "react-hook-form";

import { FormField } from "@shared/ui/form-field";
import { Label } from "@shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@shared/ui/radio-group";

import type { PostFormValues } from "../model/post-form.schema";

interface PrivacyFieldProps {
  id: string;
  label: string;
  options: readonly { value: "public" | "private"; label: string }[];
}

export const PrivacyField = ({ id, label, options }: PrivacyFieldProps) => {
  const { control } = useFormContext<PostFormValues>();

  return (
    <FormField id={id} label={label}>
      <Controller
        control={control}
        name="isPrivate"
        render={({ field }) => (
          <RadioGroup
            id={id}
            className="flex flex-wrap gap-x-6"
            value={field.value ? "private" : "public"}
            onValueChange={(value) => field.onChange(value === "private")}
          >
            {options.map((option) => (
              <Label
                key={option.value}
                className="flex items-center gap-2 font-normal"
              >
                <RadioGroupItem value={option.value} />
                {option.label}
              </Label>
            ))}
          </RadioGroup>
        )}
      />
    </FormField>
  );
};
