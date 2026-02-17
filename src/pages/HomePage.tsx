import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProductos } from '../hooks/useProductos';

const stats = [
  { value: '24h', label: 'Soporte experto' },
  { value: '100%', label: 'Garantía oficial' },
  { value: 'Swift', label: 'Envío Express' },
];

const HomePage = () => {
  const { productos, cargando, error } = useProductos();
  const featuredProducts = productos.slice(0, 8);

  return (
    <div className="space-y-32 pb-40 bg-black text-white font-inter selection:bg-gold selection:text-black">
      
      {/* HERO SECTION - ATMÓSFERA DORADA */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Luces ambientales doradas - Efecto Apple Pro */}
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-gold/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]"></div>
        
        <div className="relative container mx-auto px-6 text-center space-y-12">
          <div className="inline-flex items-center gap-3 rounded-full border border-gold/30 bg-gold/10 px-6 py-2.5 text-[11px] uppercase tracking-[0.6em] font-bold text-gold backdrop-blur-md shadow-[0_0_30px_rgba(197,160,89,0.2)]">
            <span className="h-1.5 w-1.5 rounded-full bg-gold"></span>
            Econnet Premium Tech
          </div>

          <h1 className="text-7xl md:text-9xl font-light tracking-tighter leading-[0.9] perspective-1000">
            Tecnología que <br />
            <span className="bg-gradient-to-r from-gold via-[#FFF5E0] to-gold bg-clip-text text-transparent italic font-normal drop-shadow-2xl">
              define tu estilo.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/30 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
            Curaduría de hardware excepcional diseñada para quienes <br className="hidden md:block" />
            exigen el máximo rendimiento y distinción.
          </p>

          <div className="flex flex-wrap justify-center gap-8 pt-10">
            <Link to="/products" className="relative group px-16 py-6 overflow-hidden rounded-full bg-gold text-black font-black text-xs uppercase tracking-[0.4em] transition-all duration-500 hover:bg-white hover:scale-105 active:scale-95 shadow-[0_20px_60px_rgba(197,160,89,0.3)]">
              <span className="relative z-10">Explorar Ecosistema</span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </Link>
          </div>

          {/* Stats con divisores dorados */}
          <div className="grid grid-cols-3 gap-12 max-w-4xl mx-auto pt-24">
            {stats.map((stat) => (
              <div key={stat.label} className="relative group">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-8 w-[1px] bg-gradient-to-b from-gold/0 to-gold/40"></div>
                <p className="text-3xl md:text-4xl font-light text-white group-hover:text-gold transition-colors duration-500">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 mt-2 font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN DE PRODUCTOS - LUZ LATERAL */}
      <section className="container mx-auto px-6 relative">
        <div className="absolute -left-20 top-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="h-[1px] w-20 bg-gold/40"></div>
            <p className="text-[10px] uppercase tracking-[0.6em] text-gold font-black">Lanzamientos</p>
            <h2 className="text-5xl md:text-6xl font-light tracking-tight italic">Productos <span className="font-normal text-gold">Recientes.</span></h2>
          </div>
          <Link to="/products" className="group flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-white/40 hover:text-gold transition-all duration-500">
            Ver catálogo completo 
            <span className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-gold group-hover:translate-x-2 transition-all">→</span>
          </Link>
        </div>

        {/* Carrusel con máscara de degradado */}
        <div className="relative group">
          <div className="flex gap-10 overflow-x-auto pb-20 snap-x snap-mandatory no-scrollbar scroll-smooth">
            {cargando ? (
              <div className="w-full py-40 text-center">
                <div className="h-12 w-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/20">Sincronizando Hardware...</p>
              </div>
            ) : error ? (
              <div className="w-full py-20 text-center text-red-400 font-light tracking-widest uppercase text-xs">Fallo en la conexión del catálogo.</div>
            ) : (
              featuredProducts.map((product, index) => (
                <div key={product.id} className="min-w-[320px] md:min-w-[450px] snap-center">
                  <ProductCard product={product} index={index} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA INFERIOR - EL SELLO DORADO */}
      <section className="container mx-auto px-6">
        <div className="relative overflow-hidden rounded-[4rem] border border-gold/20 bg-gradient-to-b from-gold/[0.05] to-transparent p-16 md:p-32 text-center backdrop-blur-3xl shadow-3xl">
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gold/10 rounded-full blur-[100px]"></div>
          <div className="relative space-y-10 max-w-4xl mx-auto">
            <h3 className="text-4xl md:text-6xl font-light tracking-tighter italic leading-tight">
              ¿Listo para elevar <br />
              <span className="text-gold font-normal">tu ecosistema digital?</span>
            </h3>
            <p className="text-white/40 font-light text-lg">Asesoría personalizada para configuraciones de alto rendimiento.</p>
            <Link to="/contact" className="inline-block px-14 py-6 rounded-full border border-gold text-gold font-bold text-[10px] tracking-[0.5em] hover:bg-gold hover:text-black transition-all duration-700">
              SOLICITAR CONSULTORÍA
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default HomePage;