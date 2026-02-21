import { Link } from 'react-router-dom';

const Garantia = () => {
  return (
    <div className="min-h-screen bg-black text-white font-inter selection:bg-gold selection:text-black pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* Encabezado */}
        <header className="space-y-6 mb-20">
          <div className="h-[1px] w-20 bg-gold/40"></div>
          <p className="text-gold text-[10px] uppercase tracking-[0.5em] font-black">Compromiso Econnet</p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter italic">
            Garantía de <span className="font-normal text-gold not-italic">Excelencia.</span>
          </h1>
        </header>

        {/* Cuerpo de la Garantía */}
        <div className="space-y-16 border-l border-white/5 pl-8 md:pl-16">
          
          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-medium tracking-tight">100% Calidad Certificada</h2>
            <p className="text-white/50 leading-relaxed font-light text-sm md:text-base">
              Cada unidad en nuestro catálogo atraviesa un riguroso proceso de inspección técnica. No solo vendemos hardware; entregamos herramientas de precisión validadas para flujos de trabajo de alto rendimiento.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-medium tracking-tight">Garantía Oficial Swift</h2>
            <p className="text-white/50 leading-relaxed font-light text-sm md:text-base">
              Nuestros productos cuentan con respaldo directo de fábrica y nuestra propia cobertura prioritaria. Ante cualquier eventualidad técnica, nuestro equipo de soporte experto responde en menos de 24 horas.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-medium tracking-tight">Protección de Inversión</h2>
            <p className="text-white/50 leading-relaxed font-light text-sm md:text-base">
              Si el producto no cumple con los estándares de rendimiento prometidos, gestionamos el cambio o soporte técnico de manera inmediata. Tu tranquilidad es el pilar de nuestra marca.
            </p>
          </section>

        </div>

        {/* CTA de contacto */}
        <div className="mt-24 pt-16 border-t border-white/5 text-center space-y-8">
          <p className="text-white/30 text-[10px] uppercase tracking-[0.4em]">¿Tienes alguna duda técnica?</p>
          <Link 
            to="/contact" 
            className="inline-block px-12 py-5 rounded-full border border-gold text-gold font-bold text-[10px] tracking-[0.4em] hover:bg-gold hover:text-black transition-all duration-500"
          >
            CONTACTAR SOPORTE
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Garantia;