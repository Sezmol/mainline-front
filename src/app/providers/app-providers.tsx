import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';

import { Toaster } from '@shared/ui/sonner';

import '@shared/api/client';
import { router } from '../router';
import { queryClient } from './query-client';

export const AppProviders = () => (
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <Toaster position="bottom-right" />
  </QueryClientProvider>
);
