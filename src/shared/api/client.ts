import { client } from './generated/client.gen';
import { authFetch } from './auth-fetch';
import { toApiError } from './error';
client.setConfig({
  credentials: 'include',
  fetch: authFetch,
});

client.interceptors.error.use((error: unknown) => toApiError(error));

export { client };
