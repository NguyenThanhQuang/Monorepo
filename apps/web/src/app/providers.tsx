import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Toaster } from "react-hot-toast";
import { queryClient } from "../lib/react-query";
import { LanguageProvider } from "../contexts/LanguageContext";
import { ThemeProvider } from "../contexts/ThemeProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <BrowserRouter>
              {children}

              <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#363636",
                    color: "#fff",
                    padding: "16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "500",
                  },
                  success: {
                    style: {
                      background: "#10B981",
                    },
                  },
                  error: {
                    style: {
                      background: "#EF4444",
                    },
                  },
                }}
              />
            </BrowserRouter>
          </LocalizationProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
