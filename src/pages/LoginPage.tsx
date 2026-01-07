import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUsuario, registrarUsuario, loginMicrosoft, type DireccionContacto } from '../services/api';

// MSAL
import { useMsal } from '@azure/msal-react';
import type { PopupRequest } from '@azure/msal-browser';

type LoginFormState = {
  email: string;
  password: string;
};

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ✅ Requiere <MsalProvider /> en main.tsx
  const { instance } = useMsal();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [isLoginPasswordVisible, setIsLoginPasswordVisible] = useState(false);
  const [isLoadingMicrosoft, setIsLoadingMicrosoft] = useState(false);

  const [loginForm, setLoginForm] = useState<LoginFormState>({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState<RegisterFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Apple (si lo usas por URL)
  const appleAuthUrl = (import.meta.env.VITE_APPLE_AUTH_URL || '').trim();

  // ✅ Microsoft habilitado solo si hay client id
  const msClientId = (import.meta.env.VITE_MS_CLIENT_ID || '').trim();
  const isMicrosoftEnabled = Boolean(msClientId);
  const isAppleEnabled = Boolean(appleAuthUrl);

  const microsoftRequest: PopupRequest = useMemo(
    () => ({
      scopes: ['openid', 'profile', 'email'],
      prompt: 'select_account',
    }),
    [],
  );

  const providerTitle = activeTab === 'login' ? 'Acceso rapido' : 'Registro rapido';

  const handleProviderLogin = (url: string) => {
    if (!url) {
      setError('Acceso externo no disponible por ahora.');
      return;
    }
    window.location.assign(url);
  };

  const handleLoginChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Login local (email/password)
  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = loginForm.email.trim();
    const password = loginForm.password.trim();

    if (!email || !password) {
      setError('Completa todos los campos para continuar.');
      return;
    }

    setError('');

    try {
      const data = await loginUsuario({ email, password });
      const usuario = data.usuario;

      login({
        id: usuario.id,
        name: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono ?? null,
        ecommerceClienteId: usuario.ecommerceClienteId ?? null,
        direccionPrincipal: (data.direccionPrincipal ?? null) as DireccionContacto | null,
      });

      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar sesion.';
      setError(message);
    }
  };

  // ✅ Registro local
  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = registerForm.name.trim();
    const email = registerForm.email.trim();
    const password = registerForm.password.trim();
    const confirmPassword = registerForm.confirmPassword.trim();

    if (!name || !email || !password || !confirmPassword) {
      setError('Completa todos los campos para continuar.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setError('');

    try {
      const data = await registrarUsuario({ nombre: name, email, password });
      const usuario = data.usuario;

      login({
        id: usuario.id,
        name: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono ?? null,
        ecommerceClienteId: usuario.ecommerceClienteId ?? null,
        direccionPrincipal: null,
      });

      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo completar el registro.';
      setError(message);
    }
  };

  // ✅ Login Microsoft (MSAL popup => idToken => backend => user)
  const handleMicrosoftLogin = async () => {
    if (!isMicrosoftEnabled) {
      setError('Microsoft no está configurado. Falta VITE_MS_CLIENT_ID.');
      return;
    }

    setError('');
    setIsLoadingMicrosoft(true);

    try {
      // 1) Login con MSAL
      const result = await instance.loginPopup(microsoftRequest);

      const idToken = result.idToken;
      if (!idToken) {
        throw new Error('No se pudo obtener idToken de Microsoft.');
      }

      // 2) Backend valida y devuelve sesión propia
      const data = await loginMicrosoft({ idToken });

      // 3) Guardar en AuthContext
      login({
        id: data.user.id,
        name: data.user.nombre,
        email: data.user.email,
        telefono: data.user.telefono ?? null,
        ecommerceClienteId: data.user.ecommerceClienteId ?? null,
        direccionPrincipal: (data.direccionPrincipal ?? null) as DireccionContacto | null,
      });

      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar sesion con Microsoft.';
      setError(message);
    } finally {
      setIsLoadingMicrosoft(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-8 text-white lg:p-12">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Acceso</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl">Ingreso clientes</h1>
            <p className="max-w-2xl text-sm text-white/75">
              Inicia sesion para ver tus cotizaciones, historial de pedidos y condiciones especiales.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="mx-auto grid w-full max-w-4xl gap-8">
          <div className="rounded-3xl border border-white/10 bg-[#1b0b0b] p-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] lg:p-10">
            <div className="flex rounded-full border border-white/10 bg-white/5 p-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                className={`flex-1 rounded-full px-4 py-2 transition ${
                  activeTab === 'login' ? 'bg-white text-[#1b0b0b]' : 'hover:bg-white/10'
                }`}
                aria-pressed={activeTab === 'login'}
              >
                Iniciar sesion
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError('');
                }}
                className={`flex-1 rounded-full px-4 py-2 transition ${
                  activeTab === 'register' ? 'bg-white text-[#1b0b0b]' : 'hover:bg-white/10'
                }`}
                aria-pressed={activeTab === 'register'}
              >
                Registrar usuario
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-xs uppercase tracking-[0.32em] text-[#B01010]">Credenciales</p>
              <h2 className="text-2xl font-semibold text-white">
                {activeTab === 'login' ? 'Accede a tu cuenta' : 'Crea tu cuenta'}
              </h2>
              <p className="text-sm text-white/70">
                {activeTab === 'login'
                  ? 'Usa tu correo y clave de cliente para continuar.'
                  : 'Completa tus datos para crear tu usuario.'}
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={activeTab === 'login' ? handleLoginSubmit : handleRegisterSubmit}>
              {error && (
                <div className="rounded-2xl border border-[#5a1b1b] bg-[#3a1414] px-4 py-3 text-sm text-[#F2B2B2]">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.32em] text-white/60">{providerTitle}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleMicrosoftLogin}
                    disabled={!isMicrosoftEnabled || isLoadingMicrosoft}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-[#1E3A8A] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#2548A3] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                    </svg>
                    {isLoadingMicrosoft ? 'Conectando...' : 'Microsoft'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProviderLogin(appleAuthUrl)}
                    disabled={!isAppleEnabled}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#0f0f0f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Apple
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-white/40">
                  <span className="h-px flex-1 bg-white/10"></span>
                  O con tu correo
                  <span className="h-px flex-1 bg-white/10"></span>
                </div>
              </div>

              {activeTab === 'login' ? (
                <>
                  <label className="flex min-w-0 flex-col gap-3 text-sm font-semibold text-white/80">
                    Email
                    <input
                      type="email"
                      name="email"
                      value={loginForm.email}
                      onChange={handleLoginChange}
                      placeholder="correo@empresa.cl"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                    />
                  </label>

                  <label className="flex min-w-0 flex-col gap-3 text-sm font-semibold text-white/80">
                    Contrasena
                    <div className="relative">
                      <input
                        type={isLoginPasswordVisible ? 'text' : 'password'}
                        name="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        placeholder="********"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                      />
                      <button
                        type="button"
                        onClick={() => setIsLoginPasswordVisible((prev) => !prev)}
                        aria-label={isLoginPasswordVisible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                        aria-pressed={isLoginPasswordVisible}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04040]"
                      >
                        {isLoginPasswordVisible ? (
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M4 4l16 16" />
                            <path d="M10.12 5.3a9.9 9.9 0 0 1 1.88-.2c6 0 9.5 5.9 9.5 5.9a17.6 17.6 0 0 1-3.07 3.9" />
                            <path d="M6.1 6.1C3.5 8 2 10.9 2 10.9s3.5 5.9 9.5 5.9c1.2 0 2.3-.2 3.3-.6" />
                            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </label>
                </>
              ) : (
                <>
                  <label className="flex min-w-0 flex-col gap-3 text-sm font-semibold text-white/80">
                    Nombre
                    <input
                      type="text"
                      name="name"
                      value={registerForm.name}
                      onChange={handleRegisterChange}
                      placeholder="Nombre y apellido"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                    />
                  </label>

                  <label className="flex min-w-0 flex-col gap-3 text-sm font-semibold text-white/80">
                    Email
                    <input
                      type="email"
                      name="email"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      placeholder="correo@empresa.cl"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                    />
                  </label>

                  <label className="flex min-w-0 flex-col gap-3 text-sm font-semibold text-white/80">
                    Contrasena
                    <input
                      type="password"
                      name="password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      placeholder="********"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                    />
                  </label>

                  <label className="flex min-w-0 flex-col gap-3 text-sm font-semibold text-white/80">
                    Confirmar contrasena
                    <input
                      type="password"
                      name="confirmPassword"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="********"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                    />
                  </label>
                </>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(176,16,16,0.3)] transition hover:bg-[#D03030]"
              >
                {activeTab === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
              </button>

              {!isMicrosoftEnabled && (
                <p className="text-xs text-white/50">
                  Para habilitar Microsoft, configura <b>VITE_MS_CLIENT_ID</b> en tu <code>.env</code> y reinicia Vite.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
