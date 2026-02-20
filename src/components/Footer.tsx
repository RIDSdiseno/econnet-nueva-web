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
                <li><Link to="/terms" className="text-white/40 hover:text-white text-[11px] uppercase tracking-widest transition-colors">Garantía</Link></li>
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

        {/* LÍNEA FINAL */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/20 text-[9px] uppercase tracking-[0.4em]">
            © {currentYear} Econnet Chile.
          </p>
          
          <div className="flex gap-8">
            <a href="#" className="text-white/20 hover:text-gold transition-colors">
              <span className="text-[9px] uppercase tracking-[0.4em]">Instagram</span>
            </a>
            <a href="#" className="text-white/20 hover:text-gold transition-colors">
              <span className="text-[9px] uppercase tracking-[0.4em]">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;