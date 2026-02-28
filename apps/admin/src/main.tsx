import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App";
import { LanguageProvider } from "./contexts/LanguageContext";

function Bootstrap() {
  // Default to dark to match the portal/web UI.
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("dark")) html.classList.add("dark");
  }, []);

  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Bootstrap />
  </StrictMode>
);
