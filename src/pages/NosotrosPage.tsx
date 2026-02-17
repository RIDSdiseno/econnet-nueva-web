import { Link } from 'react-router-dom';

const principles = [
  {
    title: 'Curaduría Experta',
    description: 'Seleccionamos dispositivos que fusionan ingeniería de vanguardia con un diseño excepcional.',
  },
  {
    title: 'Ecosistema Pro',
    description: 'Soluciones integrales configuradas para optimizar el rendimiento de profesionales exigentes.',
  },
  {
    title: 'Logística Elite',
    description: 'Gestión de entregas prioritarias con estándares de seguridad y precisión absoluta.',
  },
  {
    title: 'Soporte de Alto Nivel',
    description: 'Asesoría técnica dedicada para asegurar la continuidad de tu entorno digital.',
  },
];

const commitments = [
  {
    title: 'Inversión Tecnológica',
    description: 'Facilitamos el acceso a hardware de última generación con procesos de adquisición fluidos.',
  },
  {
    title: 'Expertiz Técnica',
    description: 'Nuestro equipo domina las especificaciones más complejas para guiar cada una de tus decisiones.',
  },
  {
    title: 'Visión de Futuro',
    description: 'Alineamos nuestro catálogo con las tendencias globales para mantenerte siempre a la vanguardia.',
  },
];

const NosotrosPage = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 font-inter">
      
      {/* HERO SECTION - Manifiesto Premium */}
      <section className="container mx-auto px-6 mb-32">
        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.02] p-8 md:p-20 shadow-2xl backdrop-blur-sm">
          {/* Detalle Dorado de Fondo */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/10 rounded-full blur-[100px]"></div>
          
          <div className="relative max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-[9px] uppercase tracking-[0.4em] text-gold font-medium">
              Econnet Global Identity
            </div>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-none">
              Elevando el estándar <span className="text-gold italic">digital.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed">
              Econnet es el epicentro de la tecnología de alta gama. Nos especializamos en proveer soluciones de hardware y ecosistemas digitales para profesionales y empresas que no aceptan menos que la excelencia.
            </p>
          </div>
        </div>
      </section>

      {/* QUIENES SOMOS - Liquid Glass Grid */}
      <section className="container mx-auto px-6 mb-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] items-start">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.5em] text-gold font-semibold">Identidad</p>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">Arquitectos de tu <br/> <span className="italic">infraestructura pro.</span></h2>
            </div>
            <p className="text-white/40 font-light leading-relaxed">
              Nacimos para eliminar la brecha entre la innovación mundial y el mercado local. Combinamos una selección rigurosa de productos con un soporte técnico que entiende el lenguaje de la ingeniería moderna.
            </p>
            <div className="h-px w-20 bg-gold/30"></div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {principles.map((item) => (
              <div
                key={item.title}
                className="group rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 transition-all duration-500 hover:bg-white/[0.05] hover:border-gold/30"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 font-bold">{item.title}</p>
                <p className="text-sm font-light text-white/60 leading-relaxed group-hover:text-white transition-colors">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPROMISO - Estilo Bang & Olufsen */}
      <section className="container mx-auto px-6">
        <div className="rounded-[3rem] border border-white/5 bg-[#050505] p-10 md:p-16 mb-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
          <div className="space-y-3 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.4em] text-gold font-medium">Excelencia Operativa</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tight">Comprometidos con el alto rendimiento.</h2>
          </div>
          <Link to="/products" className="px-10 py-4 rounded-full bg-white text-black font-bold text-[10px] tracking-widest hover:bg-gold transition-all duration-500 shadow-xl shadow-white/5">
            VER CATÁLOGO
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {commitments.map((item) => (
            <article
              key={item.title}
              className="p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-700 group"
            >
              <div className="h-1 w-10 bg-gold/20 mb-8 group-hover:w-20 group-hover:bg-gold transition-all duration-500"></div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4 group-hover:text-gold transition-colors font-bold">{item.title}</p>
              <p className="text-sm font-light text-white/50 leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container mx-auto px-6 pt-40 pb-20 text-center">
        <div className="max-w-2xl mx-auto space-y-10">
          <h2 className="text-4xl font-light tracking-tight">¿Hablamos de tu próximo proyecto?</h2>
          <Link to="/contact" className="inline-block rounded-full border border-white/20 px-16 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-white hover:bg-white hover:text-black transition-all duration-700">
            Contactar Especialista
          </Link>
        </div>
      </section>

    </div>
  );
};

export default NosotrosPage;