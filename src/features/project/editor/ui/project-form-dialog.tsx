import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { Project } from "@entities/project";
import { type Team, teamQueries } from "@entities/team";

import { toApiError } from "@shared/api";
import { applyFieldErrors } from "@shared/lib/apply-field-errors";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";
import { Spinner } from "@shared/ui/spinner";
import { Switch } from "@shared/ui/switch";
import { Textarea } from "@shared/ui/textarea";

import {
  type ProjectValues,
  useCreateProject,
  useUpdateProject,
} from "../model/use-save-project";

const NAME_LIMIT = 100;
const DESCRIPTION_LIMIT = 20_000;
const ATTACHMENT_LIMIT = 5;
const KNOWN_FIELDS = ["name", "endDate"] as const;

const link = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      z
        .url({ protocol: /^https?$/ })
        .max(500)
        .safeParse(value).success,
    "Enter a link that starts with http:// or https://",
  );

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a name")
      .max(NAME_LIMIT, `Name must be ${NAME_LIMIT} characters or fewer`),
    description: z
      .string()
      .trim()
      .max(DESCRIPTION_LIMIT, "The description is too long"),
    startDate: z.string(),
    endDate: z.string(),
    membersCanEditTasks: z.boolean(),
    attachments: z
      .array(z.object({ url: link }))
      .max(ATTACHMENT_LIMIT, `Up to ${ATTACHMENT_LIMIT} links`),
  })
  .refine(
    ({ startDate, endDate }) =>
      startDate === "" || endDate === "" || startDate <= endDate,
    { message: "The project cannot end before it starts", path: ["endDate"] },
  );

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string;
  project?: Project;
}

const teamLabel = (team: Team) =>
  team.companyName
    ? `${team.name} · ${team.companyName}`
    : `${team.name} · independent`;

const TeamPicker = ({
  teams,
  value,
  onChange,
}: {
  teams: Team[];
  value: string;
  onChange: (teamId: string) => void;
}) => (
  <Select
    value={value || null}
    onValueChange={(next: string | null) => onChange(next ?? "")}
    items={Object.fromEntries(teams.map((team) => [team.id, teamLabel(team)]))}
  >
    <SelectTrigger id="project-team" className="w-full">
      <SelectValue placeholder="Pick a team" />
    </SelectTrigger>
    <SelectContent>
      {teams.map((team) => (
        <SelectItem key={team.id} value={team.id}>
          {teamLabel(team)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export const ProjectFormDialog = ({
  open,
  onOpenChange,
  teamId,
  project,
}: ProjectFormDialogProps) => {
  const [failure, setFailure] = useState<string | null>(null);
  const [team, setTeam] = useState(teamId ?? project?.team.id ?? "");

  const teams = useQuery({ ...teamQueries.mine(), enabled: open && !project });

  const create = useCreateProject(team);
  const update = useUpdateProject(project?.id ?? "");
  const save = project ? update : create;

  const form = useForm<ProjectValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      startDate: project?.startDate ?? "",
      endDate: project?.endDate ?? "",
      membersCanEditTasks: project?.membersCanEditTasks ?? true,
      attachments: (project?.attachments ?? []).map((url) => ({ url })),
    },
  });

  const attachments = useFieldArray({
    control: form.control,
    name: "attachments",
  });

  const submit = form.handleSubmit((values) => {
    setFailure(null);

    if (!project && !team) {
      setFailure("Pick the team that will work on this project");
      return;
    }

    save.mutate(values, {
      onSuccess: () => {
        toast.success(project ? "Project updated" : "Project created");
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>
            A project belongs to one team, gets a board with three columns and a
            chat of its own.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => void submit(event)}
        >
          {project ? null : (
            <FormField id="project-team" label="Team">
              {teams.data && teams.data.length > 0 ? (
                <TeamPicker
                  teams={teams.data}
                  value={team}
                  onChange={setTeam}
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  You are not in a team yet. Create one first — a project needs
                  people to work on it.
                </p>
              )}
            </FormField>
          )}

          <FormField
            id="project-name"
            label="Name"
            error={form.formState.errors.name?.message}
          >
            <Input
              id="project-name"
              autoComplete="off"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
          </FormField>

          <FormField
            id="project-description"
            label="Description"
            hint="Markdown"
            error={form.formState.errors.description?.message}
          >
            <Textarea
              id="project-description"
              rows={5}
              placeholder="What this project is for."
              {...form.register("description")}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="project-start" label="Starts">
              <Controller
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <DatePicker
                    id="project-start"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField
              id="project-end"
              label="Ends"
              error={form.formState.errors.endDate?.message}
            >
              <Controller
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <DatePicker
                    id="project-end"
                    value={field.value}
                    onChange={field.onChange}
                    invalid={Boolean(form.formState.errors.endDate)}
                  />
                )}
              />
            </FormField>
          </div>

          <FormField
            id="project-attachments"
            label="Attachments"
            hint="links to specs and documents"
            error={form.formState.errors.attachments?.message}
          >
            <div className="flex flex-col gap-2">
              {attachments.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
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

          {project ? (
            <Label className="border-border flex items-start justify-between gap-4 rounded-lg border p-3">
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  Members may edit tasks
                </span>
                <span className="text-muted-foreground text-xs">
                  Off means only you add and edit tasks. Assignees can still
                  move their own across the board.
                </span>
              </span>
              <Controller
                control={form.control}
                name="membersCanEditTasks"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </Label>
          ) : null}

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
              {project ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
