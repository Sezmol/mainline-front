import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { PortfolioItem } from "@entities/portfolio-item";

import { toApiError } from "@shared/api";
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
import { Label } from "@shared/ui/label";
import { Spinner } from "@shared/ui/spinner";
import { Textarea } from "@shared/ui/textarea";

import {
  DESCRIPTION_LIMIT,
  LINK_LIMIT,
  portfolioItemFormSchema,
  type PortfolioItemFormValues,
  TITLE_LIMIT,
} from "../model/portfolio-item-form.schema";
import {
  useCreateProject,
  useUpdateProject,
} from "../model/use-save-portfolio-item";

const KNOWN_FIELDS = ["title", "description", "previewUrl"] as const;

const EMPTY: PortfolioItemFormValues = {
  title: "",
  description: "",
  previewUrl: "",
  links: [],
};

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  item?: PortfolioItem;
}

const PortfolioItemForm = ({
  userId,
  item,
  onDone,
}: {
  userId: string;
  item?: PortfolioItem;
  onDone: () => void;
}) => {
  const [failure, setFailure] = useState<string | null>(null);

  const create = useCreateProject(userId);
  const update = useUpdateProject(userId, item?.id ?? "");
  const save = item ? update : create;

  const form = useForm<PortfolioItemFormValues>({
    resolver: zodResolver(portfolioItemFormSchema),
    mode: "onBlur",
    defaultValues: item
      ? {
          title: item.title,
          description: item.description ?? "",
          previewUrl: item.previewUrl ?? "",
          links: item.links.map((url) => ({ url })),
        }
      : EMPTY,
  });

  const links = useFieldArray({ control: form.control, name: "links" });

  const title = useWatch({ control: form.control, name: "title" });
  const description = useWatch({ control: form.control, name: "description" });

  const submit = form.handleSubmit((values) => {
    setFailure(null);

    save.mutate(values, {
      onSuccess: () => {
        toast.success(item ? "PortfolioItem updated" : "PortfolioItem added");
        onDone();
      },
      onError: (error) => {
        setFailure(
          applyFieldErrors(toApiError(error), form.setError, KNOWN_FIELDS),
        );
      },
    });
  });

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => void submit(e)}>
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
        id="description"
        label="Description"
        error={form.formState.errors.description?.message}
        hint={
          <span
            className={cn(
              "font-mono tabular-nums",
              description.length > DESCRIPTION_LIMIT && "text-destructive",
            )}
          >
            {description.length} / {DESCRIPTION_LIMIT}
          </span>
        }
      >
        <Textarea
          id="description"
          rows={6}
          placeholder="What it does, what you built it with, what you are proud of."
          aria-invalid={Boolean(form.formState.errors.description)}
          {...form.register("description")}
        />
      </FormField>

      <FormField
        id="previewUrl"
        label="Preview image"
        error={form.formState.errors.previewUrl?.message}
        hint="A link to an image."
      >
        <Input
          id="previewUrl"
          inputMode="url"
          placeholder="https://"
          autoComplete="off"
          aria-invalid={Boolean(form.formState.errors.previewUrl)}
          {...form.register("previewUrl")}
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="link-0">Links</Label>
          <span className="text-muted-foreground font-mono text-xs tabular-nums">
            {links.fields.length} / {LINK_LIMIT}
          </span>
        </div>

        {links.fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Input
                id={`link-${index}`}
                inputMode="url"
                placeholder="https://"
                autoComplete="off"
                aria-invalid={Boolean(
                  form.formState.errors.links?.[index]?.url,
                )}
                {...form.register(`links.${index}.url`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove link ${index + 1}`}
                onClick={() => links.remove(index)}
              >
                <XIcon />
              </Button>
            </div>

            {form.formState.errors.links?.[index]?.url ? (
              <p role="alert" className="text-destructive text-xs">
                {form.formState.errors.links[index].url.message}
              </p>
            ) : null}
          </div>
        ))}

        {links.fields.length < LINK_LIMIT ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start font-mono text-xs"
            onClick={() => links.append({ url: "" })}
          >
            <PlusIcon className="size-3.5" />
            Add link
          </Button>
        ) : null}
      </div>

      {failure ? (
        <p role="alert" className="text-destructive text-sm">
          {failure}
        </p>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? <Spinner /> : null}
          {item ? "Save changes" : "Add item"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export const PortfolioItemFormDialog = ({
  open,
  onOpenChange,
  userId,
  item,
}: ProjectFormDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{item ? "Edit item" : "New item"}</DialogTitle>
        <DialogDescription>
          Anyone visiting your profile can see it.
        </DialogDescription>
      </DialogHeader>

      <PortfolioItemForm
        userId={userId}
        item={item}
        onDone={() => onOpenChange(false)}
      />
    </DialogContent>
  </Dialog>
);
