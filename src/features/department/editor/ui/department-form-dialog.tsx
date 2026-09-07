import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { companyQueries, type Member } from "@entities/company";
import type { Department } from "@entities/department";

import { toApiError } from "@shared/api";
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
  useCreateDepartment,
  useUpdateDepartment,
} from "../model/use-save-department";

const NAME_LIMIT = 60;
const NO_HEAD = "none";

const nameOf = (members: Member[], id: string | null) => {
  const member = members.find((row) => row.user.id === id);

  return member
    ? `${member.user.firstName} ${member.user.lastName}`
    : "No head yet";
};

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a name")
    .max(NAME_LIMIT, `Name must be ${NAME_LIMIT} characters or fewer`),
  managerId: z.string(),
});

type DepartmentFormValues = z.infer<typeof schema>;

const KNOWN_FIELDS = ["name"] as const;

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  department?: Department;
}

export const DepartmentFormDialog = ({
  open,
  onOpenChange,
  companyId,
  department,
}: DepartmentFormDialogProps) => {
  const [failure, setFailure] = useState<string | null>(null);

  const create = useCreateDepartment(companyId);
  const update = useUpdateDepartment(companyId, department?.id ?? "");
  const save = department ? update : create;

  const staff = useInfiniteQuery(companyQueries.members(companyId));
  const members = staff.data?.pages.flatMap((page) => page.items) ?? [];

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: department?.name ?? "",
      managerId: department?.manager?.id ?? NO_HEAD,
    },
  });

  const submit = form.handleSubmit((values) => {
    setFailure(null);

    save.mutate(
      {
        name: values.name,
        managerId: values.managerId === NO_HEAD ? "" : values.managerId,
      },
      {
        onSuccess: () => {
          toast.success(
            department ? "Department updated" : "Department created",
          );
          onOpenChange(false);
        },
        onError: (error) => {
          setFailure(
            applyFieldErrors(toApiError(error), form.setError, KNOWN_FIELDS),
          );
        },
      },
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {department ? "Edit department" : "New department"}
          </DialogTitle>
          <DialogDescription>
            It gets a chat of its own, and everyone in it is added to that chat.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => void submit(event)}
        >
          <FormField
            id="department-name"
            label="Name"
            error={form.formState.errors.name?.message}
          >
            <Input
              id="department-name"
              autoComplete="off"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
          </FormField>

          <FormField
            id="department-head"
            label="Head"
            hint="The head is put into the department and its chat, and stays in it after being taken off."
          >
            <Controller
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="department-head">
                    <SelectValue>
                      {(value: string | null) => nameOf(members, value)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_HEAD}>No head yet</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.user.id} value={member.user.id}>
                        {member.user.firstName} {member.user.lastName}
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
              {department ? "Save changes" : "Create department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
