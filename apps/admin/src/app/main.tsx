// Entry point, mount React
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// Import the aggregated CSS entry so custom overrides (layout breakpoints, etc.)
// are applied in addition to the checked-in Tailwind output.
import "../index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error('Root element "#root" not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);