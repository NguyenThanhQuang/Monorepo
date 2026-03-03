import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./style/index.css";
import App from "./app/App";
import { LanguageProvider } from "./contexts/LanguageContext";
import { queryClient } from "./core/query-client";
import "./style/overrides.css";

function Bootstrap() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("dark")) {
      html.classList.add("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

const rootEl = document.getElementById("root");
if (!rootEl)
  throw new Error('Không tìm thấy element id="root" trong index.html');

createRoot(rootEl).render(
  <StrictMode>
    <Bootstrap />
  </StrictMode>,
);
