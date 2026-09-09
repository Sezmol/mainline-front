import { zodResolver } from "@hookform/resolvers/zod";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { toApiError } from "@shared/api";
import { ASSIGNABLE_ROLES, COMPANY_ROLE_LABELS } from "@shared/config";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";
import { Spinner } from "@shared/ui/spinner";

import { type InviteTarget, useInvite } from "../model/use-invite";

const schema = z.object({
  nickname: z
    .string()
    .trim()
    .min(3, "At least three characters")
    .max(32, "32 characters or fewer")
    .regex(/^[a-zA-Z0-9_-]+$/, "Letters, digits, underscores and hyphens")
    .toLowerCase(),
  role: z.enum(ASSIGNABLE_ROLES),
});

type InviteValues = z.infer<typeof schema>;

interface InviteFormProps {
  target: InviteTarget;
  withRole?: boolean;
}

export const InviteForm = ({ target, withRole }: InviteFormProps) => {
  const invite = useInvite(target);

  const form = useForm<InviteValues>({
    resolver: zodResolver(schema),
    defaultValues: { nickname: "", role: "employee" },
  });

  const submit = form.handleSubmit(({ nickname, role }) => {
    invite.mutate(
      { nickname, ...(withRole ? { role } : {}) },
      {
        onSuccess: () => form.reset({ nickname: "", role }),
        onError: (error) => {
          const api = toApiError(error);

          form.setError("nickname", { message: api.message });
        },
      },
    );
  });

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => void submit(event)}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Controller
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <Input
              aria-label="Nickname"
              placeholder="nickname"
              autoComplete="off"
              className="w-40 font-mono"
              aria-invalid={Boolean(form.formState.errors.nickname)}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
          )}
        />

        {withRole ? (
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <Select
                items={COMPANY_ROLE_LABELS}
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-32" aria-label="Role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {COMPANY_ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        ) : null}

        <Button type="submit" disabled={invite.isPending}>
          {invite.isPending ? (
            <Spinner />
          ) : (
            <PaperPlaneTiltIcon className="size-3.5" />
          )}
          Invite
        </Button>
      </div>

      {form.formState.errors.nickname ? (
        <p role="alert" className="text-destructive text-xs">
          {form.formState.errors.nickname.message}
        </p>
      ) : null}
    </form>
  );
};
