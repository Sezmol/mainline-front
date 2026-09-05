import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@shared/ui/sonner";

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
      <Toaster
        position="bottom-center"
        mobileOffset={{ bottom: "72px", left: "16px", right: "16px" }}
      />
    </QueryClientProvider>
  </ThemeProvider>
);
