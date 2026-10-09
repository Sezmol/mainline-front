import { Controller, useFormContext, useFormState } from "react-hook-form";

import { WORK_FORMAT_LABELS, WORK_FORMATS } from "@shared/config";
import { FormField } from "@shared/ui/form-field";
import { Input } from "@shared/ui/input";
import { Label } from "@shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@shared/ui/radio-group";

import {
  type PostFormValues,
  toOptionalNumber,
} from "../model/post-form.schema";
import { LocationField } from "./location-field";

export const VacancyFields = () => {
  const { control, register } = useFormContext<PostFormValues>();
  const { errors } = useFormState({ control });

  return (
    <>
      <FormField
        id="workFormat"
        label="Work format"
        error={errors.workFormat?.message}
      >
        <Controller
          control={control}
          name="workFormat"
          render={({ field }) => (
            <RadioGroup
              id="workFormat"
              className="flex flex-wrap gap-x-6"
              value={field.value ?? null}
              onValueChange={field.onChange}
            >
              {WORK_FORMATS.map((format) => (
                <Label
                  key={format}
                  className="flex items-center gap-2 font-normal"
                >
                  <RadioGroupItem
                    value={format}
                    aria-invalid={Boolean(errors.workFormat)}
                  />
                  {WORK_FORMAT_LABELS[format]}
                </Label>
              ))}
            </RadioGroup>
          )}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="salaryMin"
          label="Salary from"
          error={errors.salaryMin?.message}
        >
          <Input
            id="salaryMin"
            type="number"
            inputMode="numeric"
            placeholder="Leave empty if it is open"
            className="font-mono tabular-nums"
            aria-invalid={Boolean(errors.salaryMin)}
            {...register("salaryMin", { setValueAs: toOptionalNumber })}
          />
        </FormField>

        <FormField
          id="salaryMax"
          label="Salary up to"
          error={errors.salaryMax?.message}
        >
          <Input
            id="salaryMax"
            type="number"
            inputMode="numeric"
            className="font-mono tabular-nums"
            aria-invalid={Boolean(errors.salaryMax)}
            {...register("salaryMax", { setValueAs: toOptionalNumber })}
          />
        </FormField>
      </div>

      <LocationField />
    </>
  );
};
