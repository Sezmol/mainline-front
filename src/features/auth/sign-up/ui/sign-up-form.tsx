import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { useSignUp } from "@entities/session";
import { userQueries } from "@entities/user";

import { toApiError } from "@shared/api";
import { SPECIALITIES, SPECIALITY_LABELS } from "@shared/config";
import { applyFieldErrors } from "@shared/lib/apply-field-errors";
import { useDebouncedValue } from "@shared/lib/use-debounced-value";
import { Button } from "@shared/ui/button";
import { FormField } from "@shared/ui/form-field";
import { Input } from "@shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

import { signUpSchema, type SignUpValues } from "../model/sign-up.schema";

const FIELDS = [
  "firstName",
  "lastName",
  "nickname",
  "email",
  "password",
  "confirmPassword",
  "speciality",
] as const;

interface AvailabilityHintProps {
  checking: boolean;
  free: boolean;
  freeLabel: string;
  idleLabel: string;
}

const AvailabilityHint = ({
  checking,
  free,
  freeLabel,
  idleLabel,
}: AvailabilityHintProps) => {
  if (checking) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Loader2Icon className="size-3 animate-spin" />
        Checking…
      </span>
    );
  }

  if (free) {
    return (
      <span className="text-system-ink inline-flex items-center gap-1.5">
        <CheckIcon className="size-3" />
        {freeLabel}
      </span>
    );
  }

  return <span>{idleLabel}</span>;
};

export const SignUpForm = () => {
  const navigate = useNavigate();
  const signUp = useSignUp();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      nickname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const nickname = useWatch({ control: form.control, name: "nickname" });
  const email = useWatch({ control: form.control, name: "email" });
  const speciality = useWatch({ control: form.control, name: "speciality" });

  const nicknameToCheck = useDebouncedValue(
    signUpSchema.shape.nickname.safeParse(nickname).success ? nickname : "",
  );
  const emailToCheck = useDebouncedValue(
    signUpSchema.shape.email.safeParse(email).success ? email : "",
  );

  const availability = useQuery(
    userQueries.availability({
      ...(nicknameToCheck ? { nickname: nicknameToCheck } : {}),
      ...(emailToCheck ? { email: emailToCheck } : {}),
    }),
  );

  const nicknameTaken = availability.data?.nickname === false;
  const emailTaken = availability.data?.email === false;

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    try {
      await signUp.mutateAsync(values);
      await navigate({ to: "/feed" });
    } catch (error) {
      setFormError(applyFieldErrors(toApiError(error), form.setError, FIELDS));
    }
  });

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      noValidate
      className="flex flex-col gap-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="firstName"
          label="First name"
          error={form.formState.errors.firstName?.message}
        >
          <Input
            id="firstName"
            autoComplete="given-name"
            autoFocus
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
          (nicknameTaken ? "This nickname is already taken" : undefined)
        }
        hint={
          <AvailabilityHint
            checking={availability.isFetching && Boolean(nicknameToCheck)}
            free={availability.data?.nickname === true}
            freeLabel="Nickname is free"
            idleLabel="Letters, digits, underscores and hyphens"
          />
        }
      >
        <Input
          id="nickname"
          autoComplete="username"
          aria-invalid={
            Boolean(form.formState.errors.nickname) || nicknameTaken
          }
          {...form.register("nickname")}
        />
      </FormField>

      <FormField
        id="email"
        label="Email"
        error={
          form.formState.errors.email?.message ??
          (emailTaken ? "This email is already registered" : undefined)
        }
        hint={
          <AvailabilityHint
            checking={availability.isFetching && Boolean(emailToCheck)}
            free={availability.data?.email === true}
            freeLabel="Email is free"
            idleLabel="We never show your email to other people"
          />
        }
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(form.formState.errors.email) || emailTaken}
          {...form.register("email")}
        />
      </FormField>

      <FormField
        id="speciality"
        label="Speciality"
        error={form.formState.errors.speciality?.message}
      >
        <Select
          items={SPECIALITY_LABELS}
          value={speciality ?? null}
          onValueChange={(value: string | null) => {
            if (!value) return;
            form.setValue("speciality", value as SignUpValues["speciality"], {
              shouldValidate: true,
            });
          }}
        >
          <SelectTrigger id="speciality" className="w-full">
            <SelectValue>
              {(value: string | null) =>
                value
                  ? SPECIALITY_LABELS[value as SignUpValues["speciality"]]
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
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="password"
          label="Password"
          error={form.formState.errors.password?.message}
          hint="At least 8 characters, with a letter and a digit"
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
        </FormField>

        <FormField
          id="confirmPassword"
          label="Confirm password"
          error={form.formState.errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(form.formState.errors.confirmPassword)}
            {...form.register("confirmPassword")}
          />
        </FormField>
      </div>

      {formError ? (
        <p
          role="alert"
          className="border-destructive/40 bg-destructive-muted text-foreground rounded-md border px-4 py-3 text-sm"
        >
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={signUp.isPending} className="mt-1 w-full">
        {signUp.isPending ? (
          <>
            <Loader2Icon className="animate-spin" />
            Creating account
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
};
