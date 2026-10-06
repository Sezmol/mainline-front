import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import { useSignIn } from "@entities/session";

import { toApiError } from "@shared/api";
import { applyFieldErrors } from "@shared/lib/apply-field-errors";
import { switchSession } from "@shared/lib/session-switch";
import { Button } from "@shared/ui/button";
import { FormField } from "@shared/ui/form-field";
import { Input } from "@shared/ui/input";
import { Spinner } from "@shared/ui/spinner";

import { signInSchema, type SignInValues } from "../model/sign-in.schema";

const FIELDS = ["nickname", "password"] as const;

export const SignInForm = ({ redirectTo }: { redirectTo?: string }) => {
  const signIn = useSignIn();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { nickname: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    try {
      await signIn.mutateAsync(values);
      switchSession(redirectTo ?? "/feed");
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
      <FormField
        id="nickname"
        label="Nickname"
        error={form.formState.errors.nickname?.message}
      >
        <Input
          id="nickname"
          autoComplete="username"
          autoFocus
          aria-invalid={Boolean(form.formState.errors.nickname)}
          {...form.register("nickname")}
        />
      </FormField>

      <FormField
        id="password"
        label="Password"
        error={form.formState.errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(form.formState.errors.password)}
          {...form.register("password")}
        />
      </FormField>

      {formError ? (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive-muted text-foreground rounded-md border px-4 py-3 text-sm"
        >
          <p>{formError}</p>
          <p className="text-muted-foreground mt-1">
            No account yet?{" "}
            <Link to="/register" className="text-primary-ink hover:underline">
              Create one
            </Link>
            .
          </p>
        </div>
      ) : null}

      <Button type="submit" disabled={signIn.isPending} className="mt-1 w-full">
        {signIn.isPending ? (
          <>
            <Spinner />
            Signing in
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
};
