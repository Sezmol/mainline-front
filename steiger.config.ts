import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ["./src/shared/ui/**", "./src/shared/lib/**"],
    rules: { "fsd/public-api": "off" },
  },
  {
    files: ["./src/app/**"],
    rules: { "fsd/segments-by-purpose": "off" },
  },
  {
    rules: {
      "fsd/insignificant-slice": "off",
      "fsd/repetitive-naming": "off",
    },
  },
]);
