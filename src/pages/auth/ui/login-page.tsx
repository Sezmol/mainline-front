import { Link } from "@tanstack/react-router";

import { SignInForm } from "@features/auth/sign-in";

export const LoginPage = () => (
  <div className="flex flex-col gap-6">
    <header className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="text-muted-foreground text-sm">
        Sign in to your mainline account.
      </p>
    </header>

    <SignInForm />

    <p className="text-muted-foreground border-border flex gap-2 border-t pt-5 text-sm">
      <span> New here?</span>
      <Link to="/register" className="text-primary-ink hover:underline">
        Create an account
      </Link>
    </p>
  </div>
);
