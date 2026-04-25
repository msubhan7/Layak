/**
 * main.jsx
 * --------
 * Application entry point.
 * Mounts the React tree into #root and imports global styles.
 *
 * Load order matters:
 *   1. Tailwind (via index.css)
 *   2. Our design-system overrides (styles.css)
 *   3. React app
 */

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";     // Tailwind base / components / utilities
import "./styles.css";    // Sarjana design-system tokens & global classes
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
