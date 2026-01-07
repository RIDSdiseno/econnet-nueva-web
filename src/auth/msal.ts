// src/auth/msal.ts
import { LogLevel, type Configuration } from '@azure/msal-browser';

const clientId = (import.meta.env.VITE_MS_CLIENT_ID || '').trim();
const tenantId = (import.meta.env.VITE_MS_TENANT_ID || '').trim();
const redirectUri = (import.meta.env.VITE_MS_REDIRECT_URI || window.location.origin).trim();

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: tenantId
      ? `https://login.microsoftonline.com/${tenantId}`
      : 'https://login.microsoftonline.com/common',
    redirectUri,

    // ✅ VA AQUÍ (en auth), NO en system
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (level === LogLevel.Error) console.error(message);
        if (level === LogLevel.Warning) console.warn(message);
      },
    },
  },
};
