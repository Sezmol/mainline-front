import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import { configureApiClient } from "@shared/api";

import { AppProviders } from "./providers/app-providers";

import "./styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found in index.html");
}

configureApiClient();

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
);
