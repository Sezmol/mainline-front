import { Link } from "@tanstack/react-router";

import { SignUpForm } from "@features/auth/sign-up";

import { authRoute } from "../model/auth-route";

export const RegisterPage = () => {
  const { redirect } = authRoute.useSearch();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">
          Your speciality decides what you can do here — HR posts vacancies,
          managers run teams, everyone else writes, builds a portfolio and
          applies.
        </p>
      </header>

      <SignUpForm redirectTo={redirect} />

      <p className="text-muted-foreground border-border flex gap-2 border-t pt-5 text-sm">
        Already have an account?{" "}
        <Link
          to="/login"
          search={redirect ? { redirect } : {}}
          className="text-primary-ink hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
