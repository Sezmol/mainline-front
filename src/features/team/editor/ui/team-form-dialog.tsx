import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { Team } from "@entities/team";

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
import { Spinner } from "@shared/ui/spinner";
import { Textarea } from "@shared/ui/textarea";

import { useCreateTeam, useUpdateTeam } from "../model/use-save-team";

const NAME_LIMIT = 60;
const DESCRIPTION_LIMIT = 2000;
const KNOWN_FIELDS = ["name"] as const;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a name")
    .max(NAME_LIMIT, `Name must be ${NAME_LIMIT} characters or fewer`),
  description: z
    .string()
    .trim()
    .max(DESCRIPTION_LIMIT, "Description is too long"),
});

type TeamFormValues = z.infer<typeof schema>;

interface TeamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
  team?: Team;
}

export const TeamFormDialog = ({
  open,
  onOpenChange,
  companyId,
  team,
}: TeamFormDialogProps) => {
  const [failure, setFailure] = useState<string | null>(null);

  const create = useCreateTeam(companyId);
  const update = useUpdateTeam(team?.id ?? "");
  const save = team ? update : create;

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: team?.name ?? "",
      description: team?.description ?? "",
    },
  });

  const submit = form.handleSubmit((values) => {
    setFailure(null);

    save.mutate(values, {
      onSuccess: () => {
        toast.success(team ? "Team updated" : "Team created");
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{team ? "Edit team" : "New team"}</DialogTitle>
          <DialogDescription>
            {companyId
              ? "A team pulls people from any department, and gets a chat of its own."
              : "An independent team belongs to no company. Anyone can be invited."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => void submit(event)}
        >
          <FormField
            id="team-name"
            label="Name"
            error={form.formState.errors.name?.message}
          >
            <Input
              id="team-name"
              autoComplete="off"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
          </FormField>

          <FormField
            id="team-description"
            label="Description"
            error={form.formState.errors.description?.message}
          >
            <Textarea
              id="team-description"
              rows={4}
              placeholder="What this team is for."
              {...form.register("description")}
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
              {team ? "Save changes" : "Create team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
