import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <div className="hidden md:flex items-center gap-4">
              <span>+56 9 1234 5678</span>
              <span>ventas@covasa.cl</span>
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
                to="/contact"
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
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E04040] text-[0.6rem] font-bold text-white">
                  2
                </span>
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
                  to="/contact"
                  className="flex-1 rounded-full bg-[#B01010] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-[0_12px_24px_rgba(176,16,16,0.25)] transition hover:bg-[#D03030]"
                >
                  Cotizar
                </Link>
                <Link
                  to="/cart"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1b0b0b] text-white transition hover:bg-[#2a0d0d]"
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
