import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalQuantity } = useCart();
  const [isLargeText, setIsLargeText] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div className="bg-[#1b0b0b] text-[#F0E0E0]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-[0.65rem] uppercase tracking-[0.28em]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#E04040]"></span>
                Despacho 24-72h en RM
              </span>
              <span className="hidden md:inline">Atención especializada para obras</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsLargeText((prev) => !prev)}
                className="rounded-full border border-white/20 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/10"
                aria-pressed={isLargeText}
                aria-label="Cambiar tamaño de letra"
              >
                {isLargeText ? 'A-' : 'A+'}
              </button>
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 text-white/70">
                  <a
                    href="https://www.facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 transition hover:bg-white/10 hover:text-white"
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
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 transition hover:bg-white/10 hover:text-white"
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
                    href="https://wa.me/56912345678"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 transition hover:bg-white/10 hover:text-white"
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
                <span>+56 9 1234 5678</span>
                <span>ventas@covasa.cl</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 py-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/img/logo_covasa_redondeado.jpg"
                alt="COVASA"
                className="h-12 w-12 rounded-full border border-[#F0E0E0] object-cover shadow-sm"
              />
              <div className="leading-tight">
                <span className="font-display text-3xl text-slate-900">COVASA</span>
                <span className="block text-[0.6rem] uppercase tracking-[0.32em] text-[#B01010]">
                  Materiales y ferretería
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex flex-1 items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="search"
                  placeholder="Buscar materiales o marcas"
                  className="w-full rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 pr-10 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </div>
              <Link
                to="/cotizar"
                className="rounded-full bg-[#B01010] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[0_12px_24px_rgba(176,16,16,0.25)] transition hover:bg-[#D03030]"
              >
                Cotizar
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600">
              <Link to="/products" className="transition hover:text-slate-900">
                Productos
              </Link>
              <Link to="/contact" className="transition hover:text-slate-900">
                Contacto
              </Link>
              <Link
                to="/cart"
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#1b0b0b] text-white transition hover:bg-[#2a0d0d]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {totalQuantity > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E04040] text-[0.6rem] font-bold text-white">
                    {totalQuantity}
                  </span>
                )}
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden rounded-full border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
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
                <Link to="/" className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
                  Inicio
                </Link>
                <Link to="/products" className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
                  Productos
                </Link>
                <Link to="/contact" className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
                  Contacto
                </Link>
              </nav>

              <div className="mt-4">
                <input
                  type="search"
                  placeholder="Buscar materiales o marcas"
                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Link
                  to="/cotizar"
                  className="flex-1 rounded-full bg-[#B01010] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-[0_12px_24px_rgba(176,16,16,0.25)] transition hover:bg-[#D03030]"
                >
                  Cotizar
                </Link>
                <Link
                  to="/cart"
                  className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#1b0b0b] text-white transition hover:bg-[#2a0d0d]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {totalQuantity > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E04040] text-[0.6rem] font-bold text-white">
                      {totalQuantity}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
