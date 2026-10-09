import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  Controller,
  FormProvider,
  useForm,
  useFormState,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";

import { companyQueries } from "@entities/company";
import type { Post } from "@entities/post";

import { toApiError } from "@shared/api";
import {
  POST_TYPE_LABELS,
  POST_TYPES,
  SPECIALITIES,
  type Speciality,
  SPECIALITY_LABELS,
} from "@shared/config";
import { applyFieldErrors } from "@shared/lib/apply-field-errors";
import { cn } from "@shared/lib/cn";
import { Button } from "@shared/ui/button";
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
import { useSavePost } from "../model/use-save-post";
import { EventFields } from "./event-fields";
import { MarkdownEditor } from "./markdown-editor";
import { TaskFields } from "./task-fields";
import { VacancyFields } from "./vacancy-fields";

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

  const save = useSavePost(post?.id);

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
  const companies = useQuery(companyQueries.mine());

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

        <FormProvider {...form}>
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => void submit(e)}
          >
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
                        variant={
                          field.value === option ? "secondary" : "outline"
                        }
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

            {type === "vacancy" ? <VacancyFields /> : null}
            {type === "event" ? <EventFields /> : null}
            {type === "task" ? <TaskFields /> : null}

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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
