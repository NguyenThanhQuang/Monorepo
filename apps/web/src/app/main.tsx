import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../style/index.css";
import App from "./App";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Providers } from "./providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider>
        <LanguageProvider>
          <Providers>
            <App />
          </Providers>
          </LanguageProvider>
      </ThemeProvider>
    </LocalizationProvider>
  </StrictMode>,
);
