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
    </footer>
  );
};

export default Footer;
