import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { BoardColumn } from "@entities/project";

import { toApiError } from "@shared/api";
import { COLUMN_KIND_LABELS, COLUMN_KINDS } from "@shared/config";
import { applyFieldErrors } from "@shared/lib/apply-field-errors";
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
  type ColumnValues,
  useAddColumn,
  useUpdateColumn,
} from "../model/use-columns";

const NAME_LIMIT = 40;
const KNOWN_FIELDS = ["name"] as const;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a name")
    .max(NAME_LIMIT, `Name must be ${NAME_LIMIT} characters or fewer`),
  kind: z.enum(COLUMN_KINDS),
});

interface ColumnFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  column?: BoardColumn;
}

const KIND_ITEMS = COLUMN_KINDS.map((kind) => ({
  value: kind,
  label: COLUMN_KIND_LABELS[kind],
}));

export const ColumnFormDialog = ({
  open,
  onOpenChange,
  projectId,
  column,
}: ColumnFormDialogProps) => {
  const [failure, setFailure] = useState<string | null>(null);

  const add = useAddColumn(projectId);
  const update = useUpdateColumn(projectId, column?.id ?? "");
  const save = column ? update : add;

  const form = useForm<ColumnValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: column?.name ?? "",
      kind: column?.kind ?? "doing",
    },
  });

  const submit = form.handleSubmit((values) => {
    setFailure(null);

    save.mutate(values, {
      onSuccess: () => {
        toast.success(column ? "Column renamed" : "Column added");
        onOpenChange(false);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{column ? "Edit column" : "New column"}</DialogTitle>
          <DialogDescription>
            Renaming a column carries the tasks standing in it. The kind is what
            the progress summary counts by.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => void submit(event)}
        >
          <FormField
            id="column-name"
            label="Name"
            error={form.formState.errors.name?.message}
          >
            <Input
              id="column-name"
              autoComplete="off"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
          </FormField>

          <FormField id="column-kind" label="Counts as">
            <Controller
              control={form.control}
              name="kind"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value: string | null) =>
                    field.onChange(value ?? "doing")
                  }
                  items={KIND_ITEMS}
                >
                  <SelectTrigger id="column-kind" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KIND_ITEMS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              {column ? "Save changes" : "Add column"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
