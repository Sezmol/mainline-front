import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form";

import { projectQueries } from "@entities/project";

import { DEFAULT_COLUMNS } from "@shared/config";
import { Button } from "@shared/ui/button";
import { DatePicker } from "@shared/ui/date-picker";
import { FormField } from "@shared/ui/form-field";
import { Input } from "@shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

import {
  ATTACHMENT_LIMIT,
  type PostFormValues,
} from "../model/post-form.schema";
import { PrivacyField } from "./privacy-field";

const NO_PROJECT = "none";

const TASK_ACCESS = [
  { value: "private", label: "Private" },
  { value: "public", label: "Looking for somebody" },
] as const;

export const TaskFields = () => {
  const { control, register, setValue } = useFormContext<PostFormValues>();
  const { errors } = useFormState({ control });
  const projectId = useWatch({ control, name: "projectId" });

  const projects = useQuery(projectQueries.mine());

  const columns = useQuery({
    ...projectQueries.columns(projectId),
    enabled: projectId !== "",
  });

  const statuses =
    projectId === ""
      ? DEFAULT_COLUMNS.map((column) => column.name)
      : (columns.data ?? []).map((column) => column.name);

  const attachments = useFieldArray({ control, name: "attachments" });

  return (
    <>
      <FormField id="projectId" label="Project">
        <Controller
          control={control}
          name="projectId"
          render={({ field }) => (
            <Select
              items={{
                [NO_PROJECT]: "No project",
                ...Object.fromEntries(
                  (projects.data ?? []).map((project) => [
                    project.id,
                    project.name,
                  ]),
                ),
              }}
              value={field.value || NO_PROJECT}
              onValueChange={(value: string | null) => {
                field.onChange(value === NO_PROJECT ? "" : (value ?? ""));
                setValue("status", DEFAULT_COLUMNS[0].name);
              }}
            >
              <SelectTrigger id="projectId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PROJECT}>No project</SelectItem>
                {(projects.data ?? []).map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="status" label="Column" error={errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                items={Object.fromEntries(statuses.map((name) => [name, name]))}
                value={field.value || null}
                onValueChange={(value: string | null) =>
                  field.onChange(value ?? "")
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Pick a column" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField id="deadline" label="Deadline">
          <Controller
            control={control}
            name="deadline"
            render={({ field }) => (
              <DatePicker
                id="deadline"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
      </div>

      <PrivacyField id="task-access" label="Visibility" options={TASK_ACCESS} />

      <FormField
        id="attachments"
        label="Attachments"
        hint="links to mockups and specs"
      >
        <div className="flex flex-col gap-2">
          {attachments.fields.map((entry, index) => (
            <div key={entry.id} className="flex gap-2">
              <Input
                autoComplete="off"
                placeholder="https://"
                aria-label={`Attachment ${index + 1}`}
                {...register(`attachments.${index}.url`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove this link"
                onClick={() => attachments.remove(index)}
              >
                <XIcon />
              </Button>
            </div>
          ))}

          {attachments.fields.length < ATTACHMENT_LIMIT ? (
            <Button
              type="button"
              variant="outline"
              className="self-start"
              onClick={() => attachments.append({ url: "" })}
            >
              <PlusIcon />
              Add a link
            </Button>
          ) : null}
        </div>
      </FormField>
    </>
  );
};
