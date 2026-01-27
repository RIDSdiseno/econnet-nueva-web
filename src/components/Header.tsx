import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useQuoteHistory } from '../context/QuoteHistoryContext';
import SearchModal from './SearchModal';
import { covasaContact } from '../data/contact';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalQuantity, items } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { quotes } = useQuoteHistory();
  const [isLargeText, setIsLargeText] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isRegistroOpen, setIsRegistroOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const cartButtonDesktopRef = useRef<HTMLButtonElement | null>(null);
  const cartButtonMobileRef = useRef<HTMLButtonElement | null>(null);
  const cartPopoverRef = useRef<HTMLDivElement | null>(null);
  const registroButtonRef = useRef<HTMLButtonElement | null>(null);
  const registroPopoverRef = useRef<HTMLDivElement | null>(null);
  const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
    `border-b-2 pb-1 transition ${
      isActive
        ? 'border-[#B01010] text-[#B01010]'
        : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
    }`;
  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `border-b-2 pb-2 text-sm font-semibold transition ${
      isActive
        ? 'border-[#B01010] text-[#B01010]'
        : 'border-transparent text-slate-600 hover:border-slate-200 hover:text-slate-900'
    }`;
  const cartButtonClass = (isActive: boolean) =>
    `relative inline-flex items-center gap-2 rounded-full bg-[#B01010] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(176,16,16,0.25)] transition hover:bg-[#D03030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04040]/60 ${
      isActive ? 'ring-2 ring-[#E04040]/60' : ''
    }`;
  const searchButtonClass =
    'inline-flex items-center gap-2 px-2 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 hover:underline hover:underline-offset-4';
  const registroButtonClass = (isActive: boolean) =>
    `relative inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 ${
      isActive ? 'border-[#B01010] ring-2 ring-[#E04040]/50' : 'border-slate-200'
    }`;
  const displayName = user?.name ?? 'Usuario';
  const hasQuotes = quotes.length > 0;
  const isCartActive = location.pathname === '/cart';
  const totalCarrito = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const previewItems = items.slice(0, 3);
  const remainingItems = items.length - previewItems.length;
  const openSearch = () => {
    setIsSearchOpen(true);
    setIsCartOpen(false);
    setIsRegistroOpen(false);
    setIsMenuOpen(false);
  };

  const requestLogout = () => {
    setIsLogoutOpen(true);
    setIsMenuOpen(false);
    setIsCartOpen(false);
    setIsSearchOpen(false);
    setIsRegistroOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsLogoutOpen(false);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsCartOpen(false);
    setIsRegistroOpen(false);
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem('covasa_font_scale');
    if (stored === 'large') {
      setIsLargeText(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const root = window.document.documentElement;
    if (isLargeText) {
      root.classList.add('font-scale-lg');
      window.localStorage.setItem('covasa_font_scale', 'large');
    } else {
      root.classList.remove('font-scale-lg');
      window.localStorage.setItem('covasa_font_scale', 'normal');
    }
  }, [isLargeText]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const header = headerRef.current;
    if (!header) {
      return;
    }

    const root = window.document.documentElement;
    const updateHeaderHeight = () => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      root.style.setProperty('--site-header-height', `${height}px`);
    };

    updateHeaderHeight();

    const ResizeObserverCtor = window.ResizeObserver;
    if (typeof ResizeObserverCtor === 'function') {
      const observer = new ResizeObserverCtor(() => updateHeaderHeight());
      observer.observe(header);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  useEffect(() => {
    setIsCartOpen(false);
    setIsSearchOpen(false);
    setIsLogoutOpen(false);
    setIsRegistroOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isCartOpen) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        cartButtonDesktopRef.current?.contains(target) ||
        cartButtonMobileRef.current?.contains(target) ||
        cartPopoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsCartOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCartOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen]);

  useEffect(() => {
    if (!isRegistroOpen) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        registroButtonRef.current?.contains(target) ||
        registroPopoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsRegistroOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsRegistroOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRegistroOpen]);

  useEffect(() => {
    if (!isLogoutOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLogoutOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLogoutOpen]);

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="bg-gradient-to-r from-[#1b0b0b] via-[#2a1515] to-[#1b0b0b] text-[#F0E0E0]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-2 py-2.5 text-[0.65rem] uppercase tracking-[0.2em] sm:flex-row sm:items-center sm:justify-between sm:tracking-[0.28em]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2 font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#E04040] animate-pulse"></span>
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Despacho 24-72h en RM</span>
              </span>
              <span className="hidden md:inline text-white/70">Atención especializada para obras</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsLargeText((prev) => !prev)}
                className="rounded-full border border-[#E04040]/30 bg-[#E04040]/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/90 transition hover:bg-[#E04040]/20 hover:border-[#E04040]/50"
                aria-pressed={isLargeText}
                aria-label="Cambiar tamaño de letra"
              >
                {isLargeText ? 'A-' : 'A+'}
              </button>
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2.5 text-white/70">
                  <a
                    href="https://www.facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition hover:bg-[#E04040]/20 hover:border-[#E04040]/40 hover:text-white hover:scale-110"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition hover:bg-[#E04040]/20 hover:border-[#E04040]/40 hover:text-white hover:scale-110"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17" cy="7" r="1.2" />
                    </svg>
                  </a>
                  <a
                    href={covasaContact.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition hover:bg-[#E04040]/20 hover:border-[#E04040]/40 hover:text-white hover:scale-110"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.31 1.7.57 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.09a2 2 0 0 1 2.11-.45c.8.26 1.64.45 2.5.57a2 2 0 0 1 1.72 1.98z" />
                    </svg>
                  </a>
                </div>
                <span className="font-semibold text-white/90">{covasaContact.phone}</span>
                <span className="text-white/70">{covasaContact.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3 lg:py-4">
            <Link to="/" className="group flex items-center gap-3 lg:mr-2" aria-label="COVASA">
              <div className="flex h-24 items-center justify-center sm:h-28 lg:h-32 shrink-0 scale-[1.3] origin-left">
                <img
                  src="/img/covasa_chile.png"
                  alt="COVASA"
                  className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-[1.05]"
                />
              </div>
            </Link>

            <nav className="hidden lg:flex flex-1 items-center justify-start gap-3 text-sm font-semibold text-slate-600 min-w-0 lg:ml-6">
              <NavLink to="/" end className={desktopNavClass}>
                Inicio
              </NavLink>
              <NavLink to="/products" className={desktopNavClass}>
                Productos
              </NavLink>
              <NavLink to="/nosotros" className={desktopNavClass}>
                Nosotros
              </NavLink>
              <NavLink to="/contact" className={desktopNavClass}>
                Contacto
              </NavLink>
              <NavLink to="/cotizar" className={desktopNavClass}>
                Cotización
              </NavLink>
            </nav>

            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <button type="button" onClick={openSearch} className={searchButtonClass}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-slate-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                Buscar
              </button>
              <div className="relative">
                <button
                  ref={registroButtonRef}
                  type="button"
                  onClick={() => {
                    setIsRegistroOpen((prev) => !prev);
                    setIsCartOpen(false);
                    setIsSearchOpen(false);
                    setIsMenuOpen(false);
                    setIsLogoutOpen(false);
                  }}
                  aria-haspopup="menu"
                  aria-expanded={isRegistroOpen}
                  className={registroButtonClass(isRegistroOpen)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
                  </svg>
                  {(hasQuotes || isAuthenticated) && (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_2px_white]"></span>
                  )}
                </button>

                {isRegistroOpen && (
                  <div
                    ref={registroPopoverRef}
                    role="menu"
                    className="modal-panel absolute right-0 top-full mt-3 w-56 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_20px_50px_rgba(15,23,32,0.2)] backdrop-blur-md"
                  >
                    <p className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-400">
                      Registro
                    </p>
                    <div className="mt-3 grid gap-2 text-sm">
                      <NavLink
                        to="/mis-cotizaciones"
                        onClick={() => setIsRegistroOpen(false)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Mis cotizaciones
                      </NavLink>
                      <NavLink
                        to="/mis-pagos"
                        onClick={() => setIsRegistroOpen(false)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Mis pagos
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-gradient-to-r from-white to-slate-50/50 px-3 py-1.5 text-[0.85rem] text-slate-700 shadow-sm">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#B01010] to-[#D03030] text-white shadow-md">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c2-3 5-4 8-4s6 1 8 4" />
                      </svg>
                    </span>
                    <span className="max-w-[120px] truncate font-bold">{displayName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={requestLogout}
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500 transition hover:text-slate-900 hover:underline hover:underline-offset-4"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <NavLink to="/login" className={desktopNavClass}>
                  Iniciar sesión
                </NavLink>
              )}
              <div className="relative">
                <button
                  ref={cartButtonDesktopRef}
                  type="button"
                  onClick={() => setIsCartOpen((prev) => !prev)}
                  aria-expanded={isCartOpen}
                  aria-haspopup="dialog"
                  className={cartButtonClass(isCartActive)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Carrito</span>
                  {totalQuantity > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E04040] text-[0.65rem] font-bold text-white shadow-md animate-pulse">
                      {totalQuantity}
                    </span>
                  )}
                </button>

              </div>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden ml-auto rounded-full border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden pb-6">
              <nav className="grid gap-2 rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-600 shadow-sm">
                <NavLink to="/" end className={mobileNavClass} onClick={() => setIsMenuOpen(false)}>
                  Inicio
                </NavLink>
                <NavLink to="/products" className={mobileNavClass} onClick={() => setIsMenuOpen(false)}>
                  Productos
                </NavLink>
                <NavLink to="/nosotros" className={mobileNavClass} onClick={() => setIsMenuOpen(false)}>
                  Nosotros
                </NavLink>
                <NavLink to="/contact" className={mobileNavClass} onClick={() => setIsMenuOpen(false)}>
                  Contacto
                </NavLink>
                <NavLink to="/cotizar" className={mobileNavClass} onClick={() => setIsMenuOpen(false)}>
                  Cotización
                </NavLink>
                {!isAuthenticated && (
                  <NavLink to="/login" className={mobileNavClass} onClick={() => setIsMenuOpen(false)}>
                    Iniciar sesión
                  </NavLink>
                )}
              </nav>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Registro</p>
                <div className="mt-3 grid gap-2 text-sm">
                  <NavLink
                    to="/mis-cotizaciones"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Mis cotizaciones
                  </NavLink>
                  <NavLink
                    to="/mis-pagos"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Mis pagos
                  </NavLink>
                </div>
              </div>

              {isAuthenticated && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B01010] text-white">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c2-3 5-4 8-4s6 1 8 4" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Usuario</p>
                      <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={requestLogout}
                    className="mt-4 w-full text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-900 hover:underline hover:underline-offset-4"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}

              <div className="mt-4">
                <button
                  type="button"
                  onClick={openSearch}
                  className={`${searchButtonClass} w-full justify-center`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-slate-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" />
                  </svg>
                  Buscar productos
                </button>
              </div>

              <div className="mt-4">
                <button
                  ref={cartButtonMobileRef}
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsCartOpen((prev) => !prev);
                  }}
                  aria-expanded={isCartOpen}
                  aria-haspopup="dialog"
                  className={`${cartButtonClass(isCartActive)} w-full justify-center`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Carrito</span>
                  {totalQuantity > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E04040] text-[0.6rem] font-bold text-white">
                      {totalQuantity}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCartOpen && (
        <div
          ref={cartPopoverRef}
          role="dialog"
          aria-modal="false"
          className="modal-panel absolute right-4 top-full mt-3 z-[60] w-[90vw] max-w-sm rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_24px_60px_rgba(15,23,32,0.18)] backdrop-blur-xl"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Carrito</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{items.length} items</p>
          {items.length > 0 ? (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              {previewItems.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-3">
                  <span className="truncate">{item.name}</span>
                  <span className="text-xs text-slate-400">x{item.quantity}</span>
                </div>
              ))}
              {remainingItems > 0 && <p className="text-xs text-slate-400">y {remainingItems} mas</p>}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              Tu carrito esta vacio. Agrega productos para ver el resumen.
            </p>
          )}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
              <p className="uppercase tracking-[0.2em] text-slate-400">Total</p>
              <p className="mt-1 font-semibold text-slate-900">
                CLP {totalCarrito.toLocaleString('es-CL')}
              </p>
            </div>
            <Link
              to="/cart"
              onClick={() => setIsCartOpen(false)}
              className="rounded-full bg-[#B01010] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(176,16,16,0.25)] transition hover:bg-[#D03030]"
            >
              Ir al carrito
            </Link>
          </div>
        </div>
      )}

      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {isLogoutOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8" onClick={() => setIsLogoutOpen(false)}>
          <div className="modal-backdrop fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div
            role="dialog"
            aria-modal="true"
            className="modal-panel relative z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_60px_rgba(15,23,32,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cerrar sesion</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Confirmar cierre</h2>
            <p className="mt-2 text-sm text-slate-600">
              Estas seguro de cerrar sesion? Se guardara tu carrito en este dispositivo.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsLogoutOpen(false)}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-full bg-[#B01010] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#D03030]"
              >
                Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
