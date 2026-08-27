import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { Post } from "@entities/post";

import { toApiError } from "@shared/api";
import {
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

import {
  BODY_LIMIT,
  postFormSchema,
  type PostFormValues,
  TITLE_LIMIT,
} from "../model/post-form.schema";
import { useCreatePost, useUpdatePost } from "../model/use-save-post";
import { MarkdownEditor } from "./markdown-editor";

const KNOWN_FIELDS = ["direction", "title", "body"] as const;

interface PostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: Post;
}

export const PostFormDialog = ({
  open,
  onOpenChange,
  post,
}: PostFormDialogProps) => {
  const [failure, setFailure] = useState<string | null>(null);

  const create = useCreatePost();
  const update = useUpdatePost(post?.id ?? "");
  const save = post ? update : create;

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    mode: "onBlur",
    defaultValues: post
      ? { direction: post.direction, title: post.title, body: post.body }
      : { direction: undefined, title: "", body: "" },
  });

  const title = useWatch({ control: form.control, name: "title" });

  const submit = form.handleSubmit((values) => {
    setFailure(null);

    save.mutate(values, {
      onSuccess: () => {
        toast.success(post ? "Post updated" : "Post published");
        onOpenChange(false);
        if (!post) form.reset({ direction: undefined, title: "", body: "" });
      },
      onError: (error) => {
        setFailure(
          applyFieldErrors(toApiError(error), form.setError, KNOWN_FIELDS),
        );
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{post ? "Edit post" : "New post"}</DialogTitle>
          <DialogDescription>
            {post
              ? "Changes go live as soon as you save."
              : "It lands at the top of the feed right away."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-5" onSubmit={(e) => void submit(e)}>
          <FormField
            id="direction"
            label="Direction"
            error={form.formState.errors.direction?.message}
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
                  <SelectTrigger id="direction" className="w-full">
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

          <FormField
            id="title"
            label="Title"
            error={form.formState.errors.title?.message}
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
              aria-invalid={Boolean(form.formState.errors.title)}
              {...form.register("title")}
            />
          </FormField>

          <FormField
            id="body"
            label="Body"
            error={form.formState.errors.body?.message}
          >
            <Controller
              control={form.control}
              name="body"
              render={({ field }) => (
                <MarkdownEditor
                  id="body"
                  value={field.value}
                  onChange={field.onChange}
                  limit={BODY_LIMIT}
                  invalid={Boolean(form.formState.errors.body)}
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
              {save.isPending ? <Loader2Icon className="animate-spin" /> : null}
              {post ? "Save changes" : "Publish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
