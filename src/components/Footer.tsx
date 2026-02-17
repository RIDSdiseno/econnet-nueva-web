import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Datos locales para evitar depender de archivos de Covasa con errores
  const contactInfo = {
    address: "La Concepción 65, Oficina 1003, Providencia, Santiago, Chile",
    phone: "+56990308676",
    email: "contacto@econnet.cl",
    whatsappUrl: "https://wa.me/56912345678"
  };

  return (
    <footer className="mt-auto bg-black text-white border-t border-white/5">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* IDENTIDAD ECONNET */}
          <div className="space-y-6">
            <Link to="/" className="text-xl font-light tracking-[0.3em]">
              ECON<span className="text-gold font-medium">NET</span>
            </Link>
            <p className="text-sm text-white/40 font-light leading-relaxed max-w-xs">
              Curaduría experta de tecnología y electrónica de alta gama para elevar tu estilo de vida digital.
            </p>
          </div>

          {/* NAVEGACIÓN */}
          <div className="space-y-6">
            <h5 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Explorar</h5>
            <ul className="space-y-4 text-sm font-light text-white/60">
              <li><Link to="/" className="transition hover:text-white">Inicio</Link></li>
              <li><Link to="/products" className="transition hover:text-white">Catálogo</Link></li>
              <li><Link to="/nosotros" className="transition hover:text-white">Nosotros</Link></li>
              <li><Link to="/contact" className="transition hover:text-white">Soporte</Link></li>
            </ul>
          </div>

          {/* CATEGORÍAS TECH */}
          <div className="space-y-6">
            <h5 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Ecosistema</h5>
            <ul className="space-y-4 text-sm font-light text-white/60">
              <li>Audio de Alta Gama</li>
              <li>Computación Pro</li>
              <li>Smart Home</li>
              <li>Fotografía & Video</li>
            </ul>
          </div>

          {/* CONTACTO */}
          <div className="space-y-6">
            <h5 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Contacto</h5>
            <ul className="space-y-4 text-sm font-light text-white/60">
              <li>{contactInfo.address}</li>
              <li>{contactInfo.phone}</li>
              <li>
                <a href={`mailto:${contactInfo.email}`} className="transition hover:text-white">
                  {contactInfo.email}
                </a>
              </li>
              <li className="pt-2 flex gap-4">
                 <span className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] hover:border-gold transition-colors cursor-pointer">IG</span>
                 <span className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] hover:border-gold transition-colors cursor-pointer">LI</span>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR LEGAL */}
        <div className="mt-20 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-white/20">
              &copy; {currentYear} ECONNET. TODOS LOS DERECHOS RESERVADOS.
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gold/30">
              Tecnología y Electrónica de vanguardia.
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-white/20">
            SANTIAGO • CHILE
          </span>
        </div>
      </div>

      {/* WHATSAPP FLOAT - Apple Style */}
      <a
        href={contactInfo.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-2xl transition-all hover:scale-110 hover:border-gold/50 group"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current group-hover:text-gold transition-colors">
          <path d="M12.06 21.9h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-4 .87.85-3.9-.23-.38A9.9 9.9 0 1 1 12.06 21.9Zm5.75-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.07-.3-.15-1.27-.47-2.42-1.5-.89-.8-1.49-1.78-1.66-2.08-.17-.3-.02-.46.13-.61.14-.14.3-.34.45-.5.15-.17.2-.28.3-.47.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.2-.24-.57-.49-.5-.66-.5h-.57c-.2 0-.52.08-.8.37-.27.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.25 5.14 4.56.72.31 1.28.5 1.71.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35Z" />
        </svg>
      </a>
    </footer>
  );
};

export default Footer;