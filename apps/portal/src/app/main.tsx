import React from "react";
import ReactDOM from "react-dom/client";
// import "../style/index.css";
import App from "./App";
import "../core/i18n/i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
