import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUsuario, registrarUsuario } from '../services/api';

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
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
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
  const googleAuthUrl = (import.meta.env.VITE_GOOGLE_AUTH_URL || '').trim();
  const microsoftAuthUrl = (import.meta.env.VITE_MICROSOFT_AUTH_URL || '').trim();
  const appleAuthUrl = (import.meta.env.VITE_APPLE_AUTH_URL || '').trim();
  const providerTitle = activeTab === 'login' ? 'Acceso rapido' : 'Registro rapido';
  const isGoogleEnabled = Boolean(googleAuthUrl);
  const isMicrosoftEnabled = Boolean(microsoftAuthUrl);
  const isAppleEnabled = Boolean(appleAuthUrl);

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
        clienteId: usuario.clienteId ?? null,
        direccionPrincipal: data.direccionPrincipal ?? null,
      });
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo iniciar sesion.';
      setError(message);
    }
  };

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
        clienteId: usuario.clienteId ?? null,
        direccionPrincipal: null,
      });
      navigate('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo completar el registro.';
      setError(message);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-8 text-white lg:p-12">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Acceso</p>
            <h1 className="font-display text-4xl lg:text-5xl">Ingreso clientes</h1>
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

            <form
              className="mt-8 space-y-6"
              onSubmit={activeTab === 'login' ? handleLoginSubmit : handleRegisterSubmit}
            >
              {error && (
                <div className="rounded-2xl border border-[#5a1b1b] bg-[#3a1414] px-4 py-3 text-sm text-[#F2B2B2]">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.32em] text-white/60">{providerTitle}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleProviderLogin(googleAuthUrl)}
                    disabled={!isGoogleEnabled}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                      <svg className="h-4 w-4 text-[#4285F4]" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        />
                      </svg>
                      Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderLogin(microsoftAuthUrl)}
                    disabled={!isMicrosoftEnabled}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-[#1E3A8A] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#2548A3] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                        <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                        <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                        <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                      </svg>
                      Microsoft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderLogin(appleAuthUrl)}
                    disabled={!isAppleEnabled}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-black px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#0f0f0f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                        />
                      </svg>
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
                    <input
                      type="password"
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      placeholder="********"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                    />
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
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
