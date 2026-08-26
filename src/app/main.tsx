import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import { AppProviders } from "./providers/app-providers";

import "./styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
);
