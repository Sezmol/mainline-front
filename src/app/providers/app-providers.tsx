import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@shared/ui/sonner";

import "@shared/api";
import { router } from "../router";
import { queryClient } from "./query-client";

export const AppProviders = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="dark"
    enableSystem
    storageKey="mainline-theme"
    disableTransitionOnChange
  >
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  </ThemeProvider>
);
