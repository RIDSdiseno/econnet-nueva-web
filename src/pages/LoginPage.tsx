import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  loginUsuario,
  registrarUsuario,
  loginGoogle,
  setAuthToken,
  type DireccionContacto,
} from '../services/api';

// MSAL & Google OAuth imports (mantenidos)
import { useMsal } from '@azure/msal-react';
import type { RedirectRequest } from '@azure/msal-browser';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { instance } = useMsal();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = activeTab === 'login' 
        ? await loginUsuario({ email: formData.email, password: formData.password })
        : await registrarUsuario({ nombre: formData.name, email: formData.email, password: formData.password });
      
      setAuthToken(data.token);

      // CORRECCIÓN DE PRECISIÓN: 'ecommerceClientId' y 'direccionPrincipal' según tus capturas de error
      login({
        id: data.usuario.id,
        name: data.usuario.nombre,
        email: data.usuario.email,
        telefono: data.usuario.telefono ?? null,
        // CORRECCIÓN FINAL: Nombre exacto según tu api.ts
        ecommerceClienteId: data.usuario.ecommerceClienteId ?? null,
        direccionPrincipal: (data as any).direccionPrincipal ?? (data.usuario as any).direccionPrincipal ?? null,
      });

      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Error al procesar el acceso.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers de Social Login (unificados)
  const handleMicrosoftLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await instance.loginRedirect({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account',
      });
    } catch (err) {
      setError('Error con Microsoft.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    setIsLoading(true);
    try {
      const data = await loginGoogle({ credential: credentialResponse.credential });
      setAuthToken(data.token);
      login({
        id: data.user.id,
        name: data.user.nombre,
        email: data.user.email,
        telefono: data.user.telefono ?? null,
        ecommerceClienteId: data.user.ecommerceClienteId ?? null,
        direccionPrincipal: (data as any).direccionPrincipal ?? null,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError('Error con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-inter">
      {/* Background Glow Premium */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative w-full max-w-[450px]">
        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-2xl p-10 shadow-2xl">
          <div className="text-center mb-10">
            <Link to="/" className="text-2xl font-light tracking-[0.4em] inline-block mb-8">
              ECON<span className="text-gold font-medium">NET</span>
            </Link>
            
            <div className="flex bg-white/5 p-1 rounded-full border border-white/5">
              <button onClick={() => { setActiveTab('login'); setError(''); }} className={`flex-1 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all ${activeTab === 'login' ? 'bg-white text-black font-bold' : 'text-white/40 hover:text-white'}`}>
                Acceso
              </button>
              <button onClick={() => { setActiveTab('register'); setError(''); }} className={`flex-1 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all ${activeTab === 'register' ? 'bg-white text-black font-bold' : 'text-white/40 hover:text-white'}`}>
                Registro
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-widest p-4 rounded-2xl text-center">{error}</div>}

            {activeTab === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 ml-4 font-bold">Nombre Completo</label>
                <input name="name" type="text" onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm focus:border-gold/50 outline-none transition-all placeholder:text-white/10" placeholder="Nombre y Apellido" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 ml-4 font-bold">Email Corporativo</label>
              <input name="email" type="email" onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm focus:border-gold/50 outline-none transition-all placeholder:text-white/10" placeholder="usuario@empresa.cl" />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-[9px] uppercase tracking-[0.3em] text-white/30 ml-4 font-bold">Contraseña</label>
              <input name="password" type={isPasswordVisible ? "text" : "password"} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm focus:border-gold/50 outline-none transition-all placeholder:text-white/10" placeholder="••••••••" />
              <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute right-6 top-[38px] text-white/20 hover:text-gold transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-5 rounded-full bg-gold text-black font-bold text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(197,160,89,0.2)] hover:bg-white transition-all duration-500 mt-4 disabled:opacity-50">
              {isLoading ? 'Sincronizando...' : activeTab === 'login' ? 'Entrar al Ecosistema' : 'Crear Cuenta Pro'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5">
            <p className="text-center text-[9px] uppercase tracking-[0.3em] text-white/20 mb-6">Acceso vía Provider</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleMicrosoftLogin} className="flex items-center justify-center gap-3 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-[9px] uppercase tracking-widest font-bold">
                Microsoft
              </button>
              <div className="[&>div]:w-full [&_iframe]:!w-full [&_iframe]:!rounded-full opacity-80 hover:opacity-100 transition-opacity">
                <GoogleLogin onSuccess={handleGoogleSuccess} shape="pill" size="medium" text="signin_with" width="100%" />
              </div>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-[8px] text-white/10 uppercase tracking-[0.5em]">Econnet Secure Access • 2026</p>
      </div>
    </div>
  );
};

export default LoginPage;