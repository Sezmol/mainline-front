const SKIP_REFRESH = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/logout',
];

let refreshing: Promise<boolean> | null = null;

const refreshSession = () => {
  const pending =
    refreshing ??
    fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
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

  const response = await fetch(input, init);

  if (response.status !== 401) return response;
  if (SKIP_REFRESH.includes(new URL(url, location.origin).pathname)) {
    return response;
  }
  if (!(await refreshSession())) return response;

  return replay ? fetch(replay) : fetch(input, init);
};
