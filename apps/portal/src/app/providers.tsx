import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Check localStorage and system preference on mount
    const stored = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme: Theme = (stored === 'dark' || stored === 'light') ? stored : (prefersDark ? 'dark' : 'light');

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const muiTheme = useMemo(() => {
    const isDark = theme === 'dark';

    return createTheme({
      palette: {
        mode: theme,
        primary: { main: '#2563eb' },   // blue-600
        secondary: { main: '#14b8a6' }, // teal-500
        error: { main: '#ef4444' },
        background: {
          // Keep page background controlled by web-ui.css (so make these transparent-ish)
          default: 'transparent',
          paper: isDark ? 'rgba(15, 23, 42, 0.78)' : '#ffffff',
        },
        text: {
          primary: isDark ? '#e2e8f0' : '#0f172a',
          secondary: isDark ? 'rgba(148, 163, 184, 0.85)' : '#475569',
        },
        divider: isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(2, 6, 23, 0.12)',
      },
      shape: { borderRadius: 14 },
      typography: {
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              // Background is handled by web-ui.css
              backgroundColor: 'transparent',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              border: isDark ? '1px solid rgba(148,163,184,0.18)' : '1px solid rgba(2,6,23,0.10)',
              boxShadow: isDark ? '0 14px 34px rgba(0,0,0,.22)' : '0 14px 34px rgba(2,6,23,.08)',
              backdropFilter: isDark ? 'blur(10px)' : 'none',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: { textTransform: 'none', borderRadius: 14, fontWeight: 800 },
            containedPrimary: {
              backgroundImage: 'linear-gradient(90deg, rgba(37,99,235,.95), rgba(20,184,166,.90))',
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 14,
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(2,6,23,0.03)',
            },
            notchedOutline: {
              borderColor: isDark ? 'rgba(148,163,184,0.22)' : 'rgba(2,6,23,0.14)',
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            head: { fontWeight: 900 },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: { borderRadius: 14 },
          },
        },
      },
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
