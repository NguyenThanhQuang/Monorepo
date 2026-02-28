// Admin uses prebuilt CSS (Tailwind output checked into src/style).
// Do NOT run Tailwind/PostCSS plugins here; otherwise PostCSS will try to re-process
// generated CSS and can fail (e.g. "@layer base" without "@tailwind base").

export default {
  plugins: {},
};
