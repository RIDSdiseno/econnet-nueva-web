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
        const accounts = instance.getAllAccounts();

        if (accounts.length > 0) {
          const account = accounts[0];
          instance.setActiveAccount(account);

          const tokenResponse = await instance.acquireTokenSilent({
            scopes: ['openid', 'profile', 'email'],
            account,
          });

          const idToken = tokenResponse.idToken;
          if (!idToken) throw new Error('No se pudo obtener idToken de Microsoft.');

          const data = await loginMicrosoft({ idToken });
          setAuthToken(data.token);

          login({
            id: data.user.id,
            name: data.user.nombre,
            email: data.user.email,
            telefono: data.user.telefono ?? null,
            // Nombre de variable exacto para evitar errores de compilación previos
            ecommerceClienteId: data.user.ecommerceClienteId ?? null,
            direccionPrincipal: (data.direccionPrincipal ?? null) as DireccionContacto | null,
          });

          navigate('/', { replace: true });
        } else {
          setTimeout(() => {
            if (instance.getAllAccounts().length === 0) {
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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-inter p-6">
      {/* Resplandor de fondo estilo Apple */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/10 rounded-full blur-[100px]"></div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-2xl p-12 text-center shadow-2xl">
          
          {error ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="mx-auto w-12 h-12 rounded-full border border-red-500/20 bg-red-500/5 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.4em] text-red-500/60 font-bold">Error de Acceso</p>
                <p className="text-sm text-white/60 font-light">{error}</p>
              </div>
              <p className="text-[8px] uppercase tracking-widest text-white/20 pt-4 border-t border-white/5">Redirigiendo a identificación...</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-700">
              {/* Spinner Premium Dorado */}
              <div className="relative mx-auto h-16 w-16">
                <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
                <div className="absolute inset-0 rounded-full border-t-2 border-gold animate-spin"></div>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">Sincronizando</p>
                <h2 className="text-xl font-light text-white tracking-tight italic">Validando Credenciales Pro</h2>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium leading-relaxed">
                  Conectando tu cuenta Microsoft <br /> con el ecosistema Econnet
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MicrosoftCallbackPage;