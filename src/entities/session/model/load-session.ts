import type { QueryClient } from "@tanstack/react-query";

import { sessionQueries } from "../api";

export const loadSession = (queryClient: QueryClient) =>
  queryClient.query(sessionQueries.current());
