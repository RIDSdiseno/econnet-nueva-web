import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto bg-[#120606] text-[#F0E0E0]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/img/logo_covasa_redondeado.jpg"
                alt="COVASA"
                className="h-10 w-10 rounded-full border border-[#2a0d0d] object-cover"
              />
              <div className="leading-tight">
                <span className="font-display text-2xl text-white">COVASA</span>
                <span className="block text-[0.6rem] uppercase tracking-[0.32em] text-[#E04040]">
                  Materiales y ferretería
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Abastecimiento ágil para constructoras, maestros y proyectos en crecimiento. Logística confiable y
              asesoría técnica para cada etapa de obra.
            </p>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-[0.32em] text-slate-400">Navegación</h5>
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
            <h5 className="text-xs uppercase tracking-[0.32em] text-slate-400">Catálogo</h5>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>Obra gruesa y áridos</li>
              <li>Fierro, mallas y perfiles</li>
              <li>Tabiquería y cielos</li>
              <li>Terminaciones y pintura</li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-[0.32em] text-slate-400">Atención</h5>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>Av. Principal 1234, Santiago</li>
              <li>+56 9 1234 5678</li>
              <li>ventas@covasa.cl</li>
              <li>Lun a sáb 08:30 - 18:30</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#2a0d0d] pt-4 text-xs uppercase tracking-[0.25em] text-slate-500">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span>&copy; {new Date().getFullYear()} COVASA. Todos los derechos reservados.</span>
            <span>Proveedor oficial de materiales para la construcción.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
