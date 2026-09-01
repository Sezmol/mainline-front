const SKIP_REFRESH = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
];

const TIMEOUT_MS = 10_000;

const withTimeout = (signal: AbortSignal | null | undefined) => {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);

  if (!signal) return timeout;
  if (signal.aborted) return signal;

  const merged = new AbortController();
  const abortWith = (source: AbortSignal) => () => merged.abort(source.reason);

  signal.addEventListener("abort", abortWith(signal), { once: true });
  timeout.addEventListener("abort", abortWith(timeout), { once: true });

  return merged.signal;
};

let refreshing: Promise<boolean> | null = null;

const refreshSession = () => {
  const pending =
    refreshing ??
    fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });

  refreshing = pending;
  return pending;
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
  if (!(await refreshSession())) return response;

  return replay
    ? fetch(replay, { signal: withTimeout(caller) })
    : fetch(input, { ...init, signal: withTimeout(caller) });
};
