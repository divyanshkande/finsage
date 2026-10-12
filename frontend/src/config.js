// src/config.js
// Centralized backend URL config.
// Set REACT_APP_API_URL in your .env (and in your hosting provider's env vars
// when you deploy) instead of hardcoding "http://localhost:8080" everywhere.
// Falls back to localhost so local development keeps working unchanged.

export const API_ROOT = (process.env.REACT_APP_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

// Some parts of the app (auth, ocr, suggestions) build their own paths off the
// plain backend origin (no trailing /api). Derive it from API_ROOT so it's
// still driven by the single REACT_APP_API_URL env var.
export const API_BASE_URL = API_ROOT.replace(/\/api$/, "");
