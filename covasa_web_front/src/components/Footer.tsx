import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto bg-[#120606] text-[#F0E0E0]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-16 items-center justify-center overflow-hidden rounded-full border border-[#2a0d0d] bg-white/90 shadow-sm">
                <img
                  src="/img/logo_covasa_actua.png"
                  alt="COVASA"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: 'center 70%' }}
                />
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Abastecimiento Ã¡gil para constructoras, maestros y proyectos en crecimiento. LogÃ­stica confiable y
              asesorÃ­a tÃ©cnica para cada etapa de obra.
            </p>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-[0.32em] text-slate-400">NavegaciÃ³n</h5>
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
            <h5 className="text-xs uppercase tracking-[0.32em] text-slate-400">CatÃ¡logo</h5>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>Obra gruesa y Ã¡ridos</li>
              <li>Fierro, mallas y perfiles</li>
              <li>TabiquerÃ­a y cielos</li>
              <li>Terminaciones y pintura</li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-[0.32em] text-slate-400">AtenciÃ³n</h5>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>Av. Principal 1234, Santiago</li>
              <li>+56 9 1234 5678</li>
              <li>ventas@covasa.cl</li>
              <li>Lun a sÃ¡b 08:30 - 18:30</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#2a0d0d] pt-4 text-xs uppercase tracking-[0.25em] text-slate-500">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span>&copy; {new Date().getFullYear()} COVASA. Todos los derechos reservados.</span>
            <span>Proveedor oficial de materiales para la construcciÃ³n.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
