import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SearchModal from './SearchModal';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalQuantity } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/products' },
    { name: 'Nosotros', path: '/nosotros' },
    { name: 'Contacto', path: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 z-[70] w-full transition-all duration-700 ${
          isScrolled 
            ? 'bg-black/80 backdrop-blur-2xl border-b border-white/10 py-3' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          
          {/* LOGO - NOMBRE UNIFICADO Y RESPONSIVE */}
          <Link to="/" className="relative group z-10 flex items-center">
            <div className="absolute inset-0 bg-gold/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img 
              src="/logo/logo-econnet.png" 
              alt="Econnet Domina la Tecnología" 
              className="h-7 sm:h-10 md:h-14 w-auto relative z-10 transition-all duration-500 group-hover:scale-105 object-contain"
            />
          </Link>

          {/* NAVEGACIÓN */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-[10px] uppercase tracking-[0.4em] transition-all duration-300 hover:text-gold font-medium ${
                    isActive ? 'text-gold' : 'text-white/40'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* ACCIONES */}
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSearchOpen(true)} className="text-white/60 hover:text-gold transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>

            <Link to="/cart" className="relative text-white/60 hover:text-gold transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-black text-black shadow-lg shadow-gold/20">
                  {totalQuantity}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <button 
                onClick={() => setIsLogoutOpen(true)}
                className="hidden md:block text-[9px] font-bold uppercase tracking-[0.3em] border border-white/10 bg-white/5 rounded-full px-5 py-2.5 hover:bg-gold hover:text-black transition-all duration-500"
              >
                {(user as any)?.nombre?.split(' ')[0] || 'Mi Cuenta'}
              </button>
            ) : (
              <Link to="/login" className="hidden md:block text-[9px] font-bold uppercase tracking-[0.3em] bg-gold text-black rounded-full px-6 py-2.5 hover:bg-white transition-all duration-500 shadow-xl shadow-gold/10">
                Acceso
              </Link>
            )}
          </div>
        </div>
      </header>

      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* MODAL DE LOGOUT */}
      {isLogoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsLogoutOpen(false)}></div>
          <div className="relative w-full max-w-sm rounded-[3rem] border border-white/10 bg-[#0A0A0A] p-10 shadow-3xl text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-6 font-bold">Seguridad</p>
            <h2 className="text-2xl font-light text-white mb-8 italic">¿Finalizar sesión?</h2>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => { logout(); setIsLogoutOpen(false); }} 
                className="w-full py-4 bg-gold text-black rounded-full font-bold text-[10px] tracking-widest hover:bg-white transition-all duration-500"
              >
                CONFIRMAR SALIDA
              </button>
              <button onClick={() => setIsLogoutOpen(false)} className="w-full py-4 text-[10px] tracking-widest text-white/30">CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;