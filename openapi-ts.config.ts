import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:3000/api/openapi.json',
  output: {
    path: 'src/shared/api/generated',
    postProcess: ['prettier'],
  },
  plugins: [
    { name: '@hey-api/client-fetch', bundle: true },
    {
      name: '@tanstack/react-query',
      queryOptions: true,
      mutationOptions: true,
    },
  ],
});
