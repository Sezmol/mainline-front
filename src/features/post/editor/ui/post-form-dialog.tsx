import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import {
  Controller,
  useFieldArray,
  useForm,
  useFormState,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";

import { companyQueries } from "@entities/company";
import type { Post } from "@entities/post";
import { projectQueries } from "@entities/project";

import { toApiError } from "@shared/api";
import {
  DEFAULT_COLUMNS,
  POST_TYPE_LABELS,
  POST_TYPES,
  SPECIALITIES,
  type Speciality,
  SPECIALITY_LABELS,
  WORK_FORMAT_LABELS,
  WORK_FORMATS,
} from "@shared/config";
import { applyFieldErrors } from "@shared/lib/apply-field-errors";
import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";
import { DatePicker } from "@shared/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/ui/dialog";
import { FormField } from "@shared/ui/form-field";
import { Input } from "@shared/ui/input";
import { Label } from "@shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@shared/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";
import { Spinner } from "@shared/ui/spinner";

import {
  BODY_LIMIT,
  emptyPostForm,
  postFormSchema,
  type PostFormValues,
  TITLE_LIMIT,
  toFormValues,
  toPayload,
} from "../model/post-form.schema";
import { useCreatePost, useUpdatePost } from "../model/use-save-post";
import { MarkdownEditor } from "./markdown-editor";

const PERSONAL = "personal";

const KNOWN_FIELDS = [
  "direction",
  "title",
  "body",
  "location",
  "salaryMin",
  "salaryMax",
  "workFormat",
  "participantLimit",
] as const;

const toOptionalNumber = (value: string) =>
  value === "" ? undefined : Number(value);

const EVENT_ACCESS = [
  { value: "public", label: "Open to everyone" },
  { value: "private", label: "By invitation" },
] as const;

const TASK_ACCESS = [
  { value: "private", label: "Private" },
  { value: "public", label: "Looking for somebody" },
] as const;

const NO_PROJECT = "none";
const ATTACHMENT_LIMIT = 5;

interface PostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: Post;
  companyId?: string;
  defaults?: { type?: PostFormValues["type"]; projectId?: string };
}

export const PostFormDialog = ({
  open,
  onOpenChange,
  post,
  companyId,
  defaults,
}: PostFormDialogProps) => {
  const [failure, setFailure] = useState<string | null>(null);

  const create = useCreatePost();
  const update = useUpdatePost(post?.id ?? "");
  const save = post ? update : create;

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    mode: "onBlur",
    defaultValues: post
      ? toFormValues(post)
      : {
          ...emptyPostForm(defaults?.type ?? "content"),
          companyId: companyId ?? "",
          projectId: defaults?.projectId ?? "",
        },
  });

  const { errors } = useFormState({ control: form.control });

  const title = useWatch({ control: form.control, name: "title" });
  const type = useWatch({ control: form.control, name: "type" });
  const isPrivate = useWatch({ control: form.control, name: "isPrivate" });
  const projectId = useWatch({ control: form.control, name: "projectId" });
  const companies = useQuery(companyQueries.mine());

  const projects = useQuery({
    ...projectQueries.mine(),
    enabled: open && type === "task",
  });

  const columns = useQuery({
    ...projectQueries.columns(projectId),
    enabled: open && type === "task" && projectId !== "",
  });

  const statuses =
    projectId === ""
      ? DEFAULT_COLUMNS.map((column) => column.name)
      : (columns.data ?? []).map((column) => column.name);

  const attachments = useFieldArray({
    control: form.control,
    name: "attachments",
  });

  const submit = form.handleSubmit((values) => {
    setFailure(null);

    save.mutate(toPayload(values), {
      onSuccess: () => {
        const noun = values.type === "task" ? "Task" : "Post";
        toast.success(post ? `${noun} updated` : `${noun} saved`);
        onOpenChange(false);
        if (!post)
          form.reset({
            ...emptyPostForm(defaults?.type ?? "content"),
            companyId: companyId ?? "",
            projectId: defaults?.projectId ?? "",
          });
      },
      onError: (error) => {
        setFailure(
          applyFieldErrors(toApiError(error), form.setError, KNOWN_FIELDS),
        );
      },
    });
  });

  const subject = type === "task" ? "task" : "post";
  const dialogTitle = post ? `Edit ${subject}` : `New ${subject}`;

  const postDescription = post
    ? "Changes go live as soon as you save."
    : "It lands at the top of the feed right away.";
  const dialogDescription =
    type === "task"
      ? "A private task lives on its board. Make it public and anyone can offer to take it on."
      : postDescription;

  const createLabel = type === "task" ? "Create" : "Publish";
  const submitLabel = post ? "Save changes" : createLabel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-5" onSubmit={(e) => void submit(e)}>
          <FormField
            id="type"
            label="Kind"
            hint={
              post ? (
                <span className="font-mono text-xs">
                  fixed after publishing
                </span>
              ) : null
            }
          >
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {POST_TYPES.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={field.value === option ? "secondary" : "outline"}
                      disabled={Boolean(post)}
                      aria-pressed={field.value === option}
                      className={cn(
                        "font-mono text-xs",
                        field.value === option && "border-primary",
                      )}
                      onClick={() => field.onChange(option)}
                    >
                      {POST_TYPE_LABELS[option]}
                    </Button>
                  ))}
                </div>
              )}
            />
          </FormField>

          <FormField
            id="direction"
            label="Direction"
            error={errors.direction?.message}
          >
            <Controller
              control={form.control}
              name="direction"
              render={({ field }) => (
                <Select
                  value={field.value ?? null}
                  onValueChange={(value: string | null) => {
                    if (value) field.onChange(value);
                  }}
                >
                  <SelectTrigger
                    id="direction"
                    className="w-full"
                    aria-invalid={Boolean(errors.direction)}
                  >
                    <SelectValue>
                      {(value: string | null) =>
                        value
                          ? SPECIALITY_LABELS[value as Speciality]
                          : "Who is this for?"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALITIES.map((speciality) => (
                      <SelectItem key={speciality} value={speciality}>
                        {SPECIALITY_LABELS[speciality]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {companies.data && companies.data.length > 0 ? (
            <FormField id="companyId" label="Publish as">
              <Controller
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <Select
                    items={{
                      [PERSONAL]: "Just me",
                      ...Object.fromEntries(
                        companies.data.map((company) => [
                          company.id,
                          company.name,
                        ]),
                      ),
                    }}
                    value={field.value || PERSONAL}
                    onValueChange={(value: string | null) => {
                      field.onChange(value === PERSONAL ? "" : (value ?? ""));
                    }}
                  >
                    <SelectTrigger id="companyId" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PERSONAL}>Just me</SelectItem>
                      {companies.data.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          ) : null}

          <FormField
            id="title"
            label="Title"
            error={errors.title?.message}
            hint={
              <span
                className={cn(
                  "font-mono tabular-nums",
                  title.length > TITLE_LIMIT && "text-destructive",
                )}
              >
                {title.length} / {TITLE_LIMIT}
              </span>
            }
          >
            <Input
              id="title"
              autoComplete="off"
              aria-invalid={Boolean(errors.title)}
              {...form.register("title")}
            />
          </FormField>

          {type === "vacancy" ? (
            <>
              <FormField
                id="workFormat"
                label="Work format"
                error={errors.workFormat?.message}
              >
                <Controller
                  control={form.control}
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
                    {...form.register("salaryMin", {
                      setValueAs: toOptionalNumber,
                    })}
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
                    {...form.register("salaryMax", {
                      setValueAs: toOptionalNumber,
                    })}
                  />
                </FormField>
              </div>
            </>
          ) : null}

          {type === "event" ? (
            <>
              <FormField id="access" label="Access">
                <Controller
                  control={form.control}
                  name="isPrivate"
                  render={({ field }) => (
                    <RadioGroup
                      id="access"
                      className="flex flex-wrap gap-x-6"
                      value={field.value ? "private" : "public"}
                      onValueChange={(value) =>
                        field.onChange(value === "private")
                      }
                    >
                      {EVENT_ACCESS.map((option) => (
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
                    {...form.register("participantLimit", {
                      setValueAs: toOptionalNumber,
                    })}
                  />
                </FormField>
              )}
            </>
          ) : null}

          {type === "content" || type === "task" ? null : (
            <FormField
              id="location"
              label="Location"
              error={errors.location?.message}
            >
              <Input
                id="location"
                autoComplete="off"
                placeholder="Optional"
                aria-invalid={Boolean(errors.location)}
                {...form.register("location")}
              />
            </FormField>
          )}

          {type === "task" ? (
            <>
              <FormField id="projectId" label="Project">
                <Controller
                  control={form.control}
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
                        field.onChange(
                          value === NO_PROJECT ? "" : (value ?? ""),
                        );
                        form.setValue("status", DEFAULT_COLUMNS[0].name);
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
                <FormField
                  id="status"
                  label="Column"
                  error={errors.status?.message}
                >
                  <Controller
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        items={Object.fromEntries(
                          statuses.map((name) => [name, name]),
                        )}
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
                    control={form.control}
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

              <FormField id="task-access" label="Visibility">
                <Controller
                  control={form.control}
                  name="isPrivate"
                  render={({ field }) => (
                    <RadioGroup
                      id="task-access"
                      className="flex flex-wrap gap-x-6"
                      value={field.value ? "private" : "public"}
                      onValueChange={(value) =>
                        field.onChange(value === "private")
                      }
                    >
                      {TASK_ACCESS.map((option) => (
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
                        {...form.register(`attachments.${index}.url`)}
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
          ) : null}

          <FormField id="body" label="Body" error={errors.body?.message}>
            <Controller
              control={form.control}
              name="body"
              render={({ field }) => (
                <MarkdownEditor
                  id="body"
                  value={field.value}
                  onChange={field.onChange}
                  limit={BODY_LIMIT}
                  invalid={Boolean(errors.body)}
                />
              )}
            />
          </FormField>

          {failure ? (
            <p role="alert" className="text-destructive text-sm">
              {failure}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? <Spinner /> : null}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
