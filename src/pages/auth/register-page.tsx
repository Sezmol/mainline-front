import { Link } from '@tanstack/react-router';

import { SignUpForm } from '@features/auth/sign-up';

export const RegisterPage = () => (
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

    <SignUpForm />

    <p className="text-muted-foreground border-border flex gap-2 border-t pt-5 text-sm">
      Already have an account?{' '}
      <Link to="/login" className="text-primary hover:underline">
        Sign in
      </Link>
    </p>
  </div>
);
