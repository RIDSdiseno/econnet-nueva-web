import { Link } from 'react-router-dom';
import { covasaContact } from '../data/contact';

const Footer = () => {
  return (
    <footer className="mt-auto bg-[#120606] text-[#F0E0E0]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-40 items-center justify-center overflow-hidden rounded-xl border border-[#2a0d0d] bg-white/90 p-0 shadow-sm sm:h-24 sm:w-48">
                <img
                  src="/img/covasa_chile.png"
                  alt="COVASA"
                  className="h-full w-full object-cover scale-110"
                />
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Soluciones integrales para la construccion, con abastecimiento, logistica y soporte tecnico para empresas
              y obras.
            </p>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-[0.32em] text-slate-400">Navegacion</h5>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/" className="transition hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/products" className="transition hover:text-white">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="transition hover:text-white">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-white">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/cart" className="transition hover:text-white">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-[0.32em] text-slate-400">Catalogo</h5>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>Obra gruesa y aridos</li>
              <li>Fierro, mallas y perfiles</li>
              <li>Tabiqueria y cielos</li>
              <li>Terminaciones y pintura</li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-[0.32em] text-slate-400">Contacto</h5>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>{covasaContact.address}</li>
              <li>
                <a
                  href={covasaContact.phoneUrl}
                  className="inline-flex items-center gap-2 transition hover:text-white"
                  aria-label={`WhatsApp ${covasaContact.phone}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.31 1.7.57 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.09a2 2 0 0 1 2.11-.45c.8.26 1.64.45 2.5.57a2 2 0 0 1 1.72 1.98z" />
                  </svg>
                  {covasaContact.phone}
                </a>
              </li>
              <li>
                <a href={covasaContact.whatsappUrl} target="_blank" rel="noreferrer" className="transition hover:text-white">
                  {covasaContact.whatsapp}
                </a>
              </li>
              <li>
                <a href={covasaContact.emailUrl} className="transition hover:text-white">
                  {covasaContact.email}
                </a>
              </li>
              <li>
                <a href={covasaContact.mapsUrl} target="_blank" rel="noreferrer" className="transition hover:text-white">
                  Abrir en Google Maps
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#2a0d0d] pt-4 text-xs uppercase tracking-[0.25em] text-slate-500">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span>&copy; 2026 Covasa Chile. Todos los derechos reservados.</span>
            <span>Abastecimiento y logistica para proyectos de construccion B2B.</span>
            <span>Pagina hecha por el equipo RIDS.</span>
          </div>
        </div>
      </div>

      <a
        href={covasaContact.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-4 right-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_24px_rgba(37,211,102,0.35)] transition hover:bg-[#1EBE57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:bottom-6 sm:right-6 sm:h-12 sm:w-12"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" aria-hidden="true">
          <path d="M20.52 3.49A11.82 11.82 0 0 0 12.05 0 11.9 11.9 0 0 0 1.5 17.45L0 24l6.74-1.47A11.9 11.9 0 0 0 12.05 24h.01A11.9 11.9 0 0 0 24 12.1c0-3.2-1.25-6.2-3.48-8.61ZM12.06 21.9h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-4 .87.85-3.9-.23-.38A9.9 9.9 0 1 1 12.06 21.9Zm5.75-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.07-.3-.15-1.27-.47-2.42-1.5-.89-.8-1.49-1.78-1.66-2.08-.17-.3-.02-.46.13-.61.14-.14.3-.34.45-.5.15-.17.2-.28.3-.47.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.2-.24-.57-.49-.5-.66-.5h-.57c-.2 0-.52.08-.8.37-.27.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.25 5.14 4.56.72.31 1.28.5 1.71.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35Z" />
        </svg>
      </a>
    </footer>
  );
};

export default Footer;
