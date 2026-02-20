import { Link } from 'react-router-dom';

const Nosotros = () => {
  return (
    <div className="bg-black text-white pt-32 pb-20 min-h-screen overflow-hidden relative">
      {/* Luces de fondo para mantener la estética */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px]"></div>
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <header className="space-y-6 mb-16 md:mb-32">
          <div className="h-[1px] w-20 bg-gold/40"></div>
          <p className="text-gold text-[10px] uppercase tracking-[0.6em] font-black">Manifiesto</p>
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-tight italic">
            Hardware con <br />
            <span className="font-normal text-gold not-italic">Propósito.</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
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
      </div>
    </div>
  );
};

export default Nosotros;