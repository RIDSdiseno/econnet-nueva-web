import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { GoogleOAuthProvider } from '@react-oauth/google';

import './index.css';
import App from './App.tsx';
import { msalConfig } from './auth/msal'; // <-- ajusta ruta si tu msal.ts está en otro lado

const msalInstance = new PublicClientApplication(msalConfig);
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// ✅ Importante en msal-browser v4: inicializar antes de usarlo
msalInstance
  .initialize()
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
          <MsalProvider instance={msalInstance}>
            <App />
          </MsalProvider>
        </GoogleOAuthProvider>
      </StrictMode>,
    );
  })
  .catch((err) => {
    console.error('MSAL init error:', err);

    // fallback: igual renderiza para no quedar pantalla en blanco
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
          <App />
        </GoogleOAuthProvider>
      </StrictMode>,
    );
  });
