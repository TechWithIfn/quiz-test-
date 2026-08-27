/// <reference types="vite/client" />

export const APP_ENV = {
  mode: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  siteUrl: (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/+$/, ''),
} as const