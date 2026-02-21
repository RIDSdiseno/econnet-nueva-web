import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-20">
          
          {/* BLOQUE LOGO - NOMBRE UNIFICADO */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start space-y-6 text-center md:text-left">
            <img 
              src="/logo/logo-econnet.png" 
              alt="Econnet" 
              className="h-10 md:h-12 w-auto object-contain opacity-90"
            />
            <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] leading-relaxed max-w-[200px]">
              Hardware de alto rendimiento para mentes excepcionales.
            </p>
          </div>

          {/* NAVEGACIÓN - 2 COLUMNAS EN MÓVIL */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-8 col-span-1 md:col-span-2">
            <div className="space-y-6">
              <h4 className="text-gold text-[10px] uppercase tracking-[0.5em] font-bold">Explorar</h4>
              <ul className="space-y-4">
                <li><Link to="/products" className="text-white/40 hover:text-white text-[11px] uppercase tracking-widest transition-colors">Catálogo</Link></li>
                <li><Link to="/nosotros" className="text-white/40 hover:text-white text-[11px] uppercase tracking-widest transition-colors">Nosotros</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-gold text-[10px] uppercase tracking-[0.5em] font-bold">Soporte</h4>
              <ul className="space-y-4">
                <li><Link to="/contact" className="text-white/40 hover:text-white text-[11px] uppercase tracking-widest transition-colors">Contacto</Link></li>
                <li><Link to="/garantia" className="text-white/40 hover:text-white text-[11px] uppercase tracking-widest transition-colors">Garantía</Link></li>
              </ul>
            </div>
          </div>

          {/* UBICACIÓN */}
          <div className="space-y-6 text-center md:text-left">
            <h4 className="text-gold text-[10px] uppercase tracking-[0.5em] font-bold">Ubicación</h4>
            <p className="text-white/40 text-[11px] uppercase tracking-widest leading-loose">
              Santiago, Chile <br />
              Despacho a Regiones
            </p>
          </div>
        </div>

        {/* LÍNEA FINAL CON REDES SOCIALES */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-white/20 text-[9px] uppercase tracking-[0.4em]">
            © {currentYear} Econnet Chile.
          </p>
          
          {/* BOTONES REDES SOCIALES */}
          <div className="flex items-center gap-5">
            {/* INSTAGRAM */}
            <a 
              href="https://instagram.com/econnet.cl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-500 hover:border-gold hover:bg-gold/10"
            >
              <svg className="h-4 w-4 text-white/40 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            {/* LINKEDIN */}
            <a 
              href="https://cl.linkedin.com/in/asesorías-rids-ltda-348522107" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-500 hover:border-gold hover:bg-gold/10"
            >
              <svg className="h-4 w-4 text-white/40 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>

            {/* CORREO */}
            <a 
              href="mailto:soporte@rids.cl" 
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-500 hover:border-gold hover:bg-gold/10"
            >
              <svg className="h-4 w-4 text-white/40 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;