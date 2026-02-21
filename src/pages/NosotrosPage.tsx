import { useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: "¿Los productos cuentan con garantía oficial?",
    answer: "Absolutamente. Todos nuestros equipos cuentan con garantía oficial del fabricante, sumada a nuestra Garantía de Excelencia Econnet que asegura soporte técnico prioritario en las primeras 24 horas."
  },
  {
    question: "¿Realizan envíos a regiones?",
    answer: "Sí, despachamos a todo Chile a través de servicios logísticos premium asegurados. El tiempo estimado de entrega es de 2 a 4 días hábiles dependiendo de la zona geográfica."
  },
  {
    question: "¿Cómo puedo solicitar una asesoría técnica?",
    answer: "Puedes contactarnos vía WhatsApp o a través de nuestro formulario de contacto. Un especialista senior se pondrá en contacto contigo para entender tus necesidades de flujo de trabajo."
  },
  {
    question: "¿Emiten factura para empresas?",
    answer: "Sí, emitimos factura electrónica para todas nuestras ventas corporativas. Solo debes proporcionar los datos de facturación al momento de concretar tu pedido."
  }
];

const Nosotros = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-black text-white pt-32 pb-20 min-h-screen overflow-hidden relative">
      {/* Luces de fondo */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-gold/5 rounded-full blur-[120px]"></div>
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        {/* SECCIÓN MANIFIESTO */}
        <header className="space-y-6 mb-16 md:mb-32">
          <div className="h-[1px] w-20 bg-gold/40"></div>
          <p className="text-gold text-[10px] uppercase tracking-[0.6em] font-black">Manifiesto</p>
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-tight italic">
            Hardware con <br />
            <span className="font-normal text-gold not-italic">Propósito.</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center mb-40">
          <div className="space-y-10 order-2 lg:order-1">
            <div className="space-y-6 text-white/50 font-light leading-relaxed text-lg md:text-xl border-l border-gold/20 pl-8">
              <p>
                Econnet nace de la intersección entre la potencia bruta y el diseño minimalista. 
                No creemos en el hardware genérico; creemos en herramientas que inspiran.
              </p>
              <p>
                Cada equipo en nuestro catálogo ha pasado por un proceso de curaduría técnica 
                riguroso, asegurando que el rendimiento sea tan excepcional como su apariencia.
              </p>
            </div>
            
            <div className="flex gap-10 pt-4">
              <div>
                <p className="text-2xl text-white font-light">100%</p>
                <p className="text-[9px] uppercase tracking-[0.3em] text-gold">Curaduría</p>
              </div>
              <div>
                <p className="text-2xl text-white font-light">Swift</p>
                <p className="text-[9px] uppercase tracking-[0.3em] text-gold">Logística</p>
              </div>
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="absolute inset-0 bg-gold/10 blur-3xl rounded-full"></div>
            <div className="relative aspect-square rounded-[3rem] md:rounded-[5rem] overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent flex items-center justify-center p-12 backdrop-blur-3xl">
               <img 
                src="/logo/logo-econnet.png" 
                alt="Logo Econnet" 
                className="w-full h-auto opacity-40 hover:opacity-100 transition-opacity duration-1000"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN FAQ - INTEGRADA AL FINAL */}
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="space-y-4">
            <p className="text-gold text-[10px] uppercase tracking-[0.5em] font-black">Soporte y Claridad</p>
            <h2 className="text-4xl md:text-6xl font-light tracking-tighter italic">
              Preguntas <span className="text-gold not-italic">Frecuentes.</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border border-white/10 rounded-[2rem] overflow-hidden bg-white/[0.02] transition-all duration-500 hover:border-white/20"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left outline-none"
                >
                  <span className="text-sm md:text-base font-light tracking-tight text-white/80">
                    {faq.question}
                  </span>
                  <span className={`text-gold transition-transform duration-500 ${openIndex === index ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 9l-7 7-7-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>

                <div 
                  className={`transition-all duration-500 ease-in-out ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 md:p-8 pt-0 text-white/40 font-light text-sm md:text-base leading-relaxed border-t border-white/5">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nosotros;