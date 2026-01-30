import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { useAuth } from '../context/AuthContext';
import { loginMicrosoft, setAuthToken, type DireccionContacto } from '../services/api';
import { uiLogger } from '../utils/logger';

const MicrosoftCallbackPage = () => {
  const navigate = useNavigate();
  const { instance } = useMsal();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // MSAL procesa el callback automáticamente via handleRedirectPromise en main.tsx
        // Aquí verificamos si ya hay una cuenta activa
        const accounts = instance.getAllAccounts();

        if (accounts.length > 0) {
          // Ya hay sesión MSAL, obtener token silenciosamente
          const account = accounts[0];
          instance.setActiveAccount(account);

          const tokenResponse = await instance.acquireTokenSilent({
            scopes: ['openid', 'profile', 'email'],
            account,
          });

          const idToken = tokenResponse.idToken;
          if (!idToken) throw new Error('No se pudo obtener idToken de Microsoft.');

          // Backend valida y devuelve sesión
          const data = await loginMicrosoft({ idToken });
          setAuthToken(data.token);

          // Guardar en AuthContext
          login({
            id: data.user.id,
            name: data.user.nombre,
            email: data.user.email,
            telefono: data.user.telefono ?? null,
            ecommerceClienteId: data.user.ecommerceClienteId ?? null,
            direccionPrincipal: (data.direccionPrincipal ?? null) as DireccionContacto | null,
          });

          
          navigate('/', { replace: true });
        } else {

          setTimeout(() => {
            const retryAccounts = instance.getAllAccounts();
            if (retryAccounts.length === 0) {
              // No se completó el login, volver a /login
              navigate('/login', { replace: true });
            }
          }, 2000);
        }
      } catch (err) {
        uiLogger.error('microsoft_callback_error', {
          message: err instanceof Error ? err.message : String(err),
        });
        setError(err instanceof Error ? err.message : 'Error al procesar autenticación');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    processCallback();
  }, [instance, login, navigate]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <p className="mt-2 text-sm text-gray-500">Redirigiendo a login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#B01010]"></div>
        <p className="mt-4 text-sm text-gray-600">Completando inicio de sesion...</p>
      </div>
    </div>
  );
};

export default MicrosoftCallbackPage;
