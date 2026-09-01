import { client } from "./generated/client.gen";
import { authFetch } from "./auth-fetch";
import { toApiError } from "./error";

export const configureApiClient = () => {
  client.setConfig({
    credentials: "include",
    fetch: authFetch,
  });

  client.interceptors.error.use((error: unknown) => toApiError(error));
};
