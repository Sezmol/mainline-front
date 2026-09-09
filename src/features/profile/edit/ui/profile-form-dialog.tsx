import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { type Profile, userQueries } from "@entities/user";

import { toApiError } from "@shared/api";
import {
  SPECIALITIES,
  type Speciality,
  SPECIALITY_LABELS,
} from "@shared/config";
import { applyFieldErrors } from "@shared/lib/apply-field-errors";
import { cn } from "@shared/lib/cn";
import { useDebouncedValue } from "@shared/lib/use-debounced-value";
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
import { Textarea } from "@shared/ui/textarea";

import {
  DESCRIPTION_LIMIT,
  profileFormSchema,
  type ProfileFormValues,
} from "../model/profile-form.schema";
import { useUpdateProfile } from "../model/use-update-profile";

const KNOWN_FIELDS = [
  "firstName",
  "lastName",
  "nickname",
  "speciality",
  "description",
  "workplace",
] as const;

interface ProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

const ProfileForm = ({
  profile,
  onDone,
}: {
  profile: Profile;
  onDone: () => void;
}) => {
  const [failure, setFailure] = useState<string | null>(null);
  const navigate = useNavigate();
  const update = useUpdateProfile(profile);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      nickname: profile.nickname,
      speciality: profile.speciality,
      description: profile.description ?? "",
      workplace: profile.workplace ?? "",
    },
  });

  const nickname = useWatch({ control: form.control, name: "nickname" });
  const description = useWatch({ control: form.control, name: "description" });

  const candidate =
    profileFormSchema.shape.nickname.safeParse(nickname).success &&
    nickname.toLowerCase() !== profile.nickname
      ? nickname
      : "";

  const nicknameToCheck = useDebouncedValue(candidate);

  const availability = useQuery(
    userQueries.availability(
      nicknameToCheck ? { nickname: nicknameToCheck } : {},
    ),
  );

  const taken = availability.data?.nickname === false;
  const checking = availability.isFetching && Boolean(nicknameToCheck);

  const submit = form.handleSubmit((values) => {
    setFailure(null);

    update.mutate(values, {
      onSuccess: (user) => {
        toast.success("Profile updated");
        onDone();

        if (user.nickname !== profile.nickname) {
          void navigate({
            to: "/u/$nickname",
            params: { nickname: user.nickname },
            replace: true,
          });
        }
      },
      onError: (error) => {
        setFailure(
          applyFieldErrors(toApiError(error), form.setError, KNOWN_FIELDS),
        );
      },
    });
  });

  const nicknameHint = () => {
    if (checking) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <Spinner className="size-3" />
          Checking…
        </span>
      );
    }

    if (availability.data?.nickname === true) {
      return (
        <span className="text-system-ink inline-flex items-center gap-1.5">
          <CheckIcon className="size-3" />
          Nickname is free
        </span>
      );
    }

    return <span>Your profile link changes with it</span>;
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={(e) => void submit(e)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="firstName"
          label="First name"
          error={form.formState.errors.firstName?.message}
        >
          <Input
            id="firstName"
            autoComplete="given-name"
            aria-invalid={Boolean(form.formState.errors.firstName)}
            {...form.register("firstName")}
          />
        </FormField>

        <FormField
          id="lastName"
          label="Last name"
          error={form.formState.errors.lastName?.message}
        >
          <Input
            id="lastName"
            autoComplete="family-name"
            aria-invalid={Boolean(form.formState.errors.lastName)}
            {...form.register("lastName")}
          />
        </FormField>
      </div>

      <FormField
        id="nickname"
        label="Nickname"
        error={
          form.formState.errors.nickname?.message ??
          (taken ? "This nickname is already taken" : undefined)
        }
        hint={nicknameHint()}
      >
        <Input
          id="nickname"
          autoComplete="username"
          aria-invalid={Boolean(form.formState.errors.nickname) || taken}
          {...form.register("nickname")}
        />
      </FormField>

      <FormField
        id="speciality"
        label="Speciality"
        error={form.formState.errors.speciality?.message}
      >
        <Controller
          control={form.control}
          name="speciality"
          render={({ field }) => (
            <Select
              value={field.value ?? null}
              onValueChange={(value: string | null) => {
                if (value) field.onChange(value);
              }}
            >
              <SelectTrigger
                id="speciality"
                className="w-full"
                aria-invalid={Boolean(form.formState.errors.speciality)}
              >
                <SelectValue>
                  {(value: string | null) =>
                    value
                      ? SPECIALITY_LABELS[value as Speciality]
                      : "Pick your speciality"
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
        id="workplace"
        label="Workplace"
        error={form.formState.errors.workplace?.message}
        hint="Where you work now. Leave it empty if you would rather not say."
      >
        <Input
          id="workplace"
          autoComplete="organization"
          aria-invalid={Boolean(form.formState.errors.workplace)}
          {...form.register("workplace")}
        />
      </FormField>

      <FormField
        id="description"
        label="About"
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
          rows={5}
          placeholder="What you build, what you are into, what you are looking for."
          aria-invalid={Boolean(form.formState.errors.description)}
          {...form.register("description")}
        />
      </FormField>

      {failure ? (
        <p role="alert" className="text-destructive text-sm">
          {failure}
        </p>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={update.isPending || taken}>
          {update.isPending ? <Spinner /> : null}
          Save changes
        </Button>
      </DialogFooter>
    </form>
  );
};

export const ProfileFormDialog = ({
  open,
  onOpenChange,
  profile,
}: ProfileFormDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Everything here is public. Your email stays private.
        </DialogDescription>
      </DialogHeader>

      <ProfileForm profile={profile} onDone={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
);
