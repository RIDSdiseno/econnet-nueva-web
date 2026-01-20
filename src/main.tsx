// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App.tsx";
import { msalConfig } from "./auth/msal";

const msalInstance = new PublicClientApplication(msalConfig);
const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

async function bootstrap() {
  try {
    // ✅ Importante: inicializar MSAL
    await msalInstance.initialize();

    // ✅ Procesa retorno del loginRedirect (si vienes volviendo desde Microsoft)
    const res = await msalInstance.handleRedirectPromise();

    if (res?.account) {
      msalInstance.setActiveAccount(res.account);
    } else {
      // ✅ Si ya había sesión guardada, fija una cuenta activa
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length) msalInstance.setActiveAccount(accounts[0]);
    }

    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
          <MsalProvider instance={msalInstance}>
            <App />
          </MsalProvider>
        </GoogleOAuthProvider>
      </StrictMode>
    );
  } catch (err) {
    console.error("MSAL bootstrap error:", err);

    // fallback: renderiza igual (por ejemplo, para que Google login funcione)
    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
          <App />
        </GoogleOAuthProvider>
      </StrictMode>
    );
  }
}

bootstrap();