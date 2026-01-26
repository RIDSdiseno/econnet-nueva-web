// src/auth/msal.ts
import { LogLevel, type Configuration } from "@azure/msal-browser";

const clientId = (import.meta.env.VITE_MS_CLIENT_ID || "").trim();
const tenantId = (import.meta.env.VITE_MS_TENANT_ID || "").trim();

// ✅ Usa VITE_MS_REDIRECT_URI de .env / .env.production
// Dev: http://localhost:5174  |  Prod: https://covasachile.cl
const redirectUri = (import.meta.env.VITE_MS_REDIRECT_URI || "").trim();
const postLogoutRedirectUri = (import.meta.env.VITE_PUBLIC_URL || "").trim();

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: tenantId
      ? `https://login.microsoftonline.com/${tenantId}`
      : "https://login.microsoftonline.com/common",
    redirectUri,
    postLogoutRedirectUri,

    // ✅ Para SPAs suele convenir false (evita volver a la URL original con query/hash raros)
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (level === LogLevel.Error) console.error(message);
        else if (level === LogLevel.Warning) console.warn(message);
        // (Info/Verbose los dejamos apagados por Warning)
      },
    },
  },
};