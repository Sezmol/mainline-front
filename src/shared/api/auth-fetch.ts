const SKIP_REFRESH = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
];

const TIMEOUT_MS = 10_000;

const withTimeout = (signal: AbortSignal | null | undefined) => {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
};

let refreshing: Promise<boolean> | null = null;

export const refreshSession = () => {
  refreshing ??= fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    signal: withTimeout(null),
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
};

export const authFetch: typeof fetch = async (input, init) => {
  const url = input instanceof Request ? input.url : input.toString();
  const replay = input instanceof Request ? input.clone() : null;
  const caller =
    init?.signal ?? (input instanceof Request ? input.signal : null);

  const response = await fetch(input, {
    ...init,
    signal: withTimeout(caller),
  });

  if (response.status !== 401) return response;
  if (SKIP_REFRESH.includes(new URL(url, location.origin).pathname)) {
    return response;
  }
  if (caller?.aborted) return response;
  if (!(await refreshSession())) return response;
  if (caller?.aborted) return response;

  return fetch(replay ?? input, { ...init, signal: withTimeout(caller) });
};
