import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products as localProducts } from '../data/products'; 

const stats = [
  { value: '24h', label: 'Soporte experto' },
  { value: '100%', label: 'Garantía oficial' },
  { value: 'Swift', label: 'Envío Express' },
];

const HomePage = () => {
  // Usamos los productos locales para evitar errores de conexión
  const productos = localProducts;
  const featuredProducts = productos.slice(0, 8);

  return (
    <div className="space-y-20 md:space-y-32 pb-20 md:pb-40 bg-black text-white font-inter selection:bg-gold selection:text-black">
      
      {/* HERO SECTION - RESPONSIVE OPTIMIZED */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute top-[-10%] right-[-5%] w-[80%] md:w-[60%] h-[60%] bg-gold/10 rounded-full blur-[100px] md:blur-[150px] animate-pulse"></div>
        
        <div className="relative container mx-auto px-6 text-center space-y-8 md:space-y-12">
          <div className="inline-flex items-center gap-3 rounded-full border border-gold/30 bg-gold/10 px-4 md:px-6 py-2 text-[9px] md:text-[11px] uppercase tracking-[0.4em] md:tracking-[0.6em] font-bold text-gold backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-gold"></span>
            Econnet Premium Tech
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-[1.1] md:leading-[0.9]">
            Tecnología que <br />
            <span className="bg-gradient-to-r from-gold via-[#FFF5E0] to-gold bg-clip-text text-transparent italic font-normal">
              define tu estilo.
            </span>
          </h1>

          <p className="text-base md:text-2xl text-white/40 max-w-2xl mx-auto font-light leading-relaxed px-4">
            Curaduría de hardware excepcional para quienes <br className="hidden md:block" />
            exigen rendimiento y distinción.
          </p>

          <div className="flex justify-center pt-6">
            <Link to="/products" className="w-full sm:w-auto relative group px-10 md:px-16 py-5 md:py-6 overflow-hidden rounded-full bg-gold text-black font-black text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl shadow-gold/20">
              <span className="relative z-10">Explorar Catálogo</span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </Link>
          </div>

          {/* Stats - Grid Adaptable (1 col móvil, 3 cols desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto pt-16 md:pt-24 px-10 sm:px-0">
            {stats.map((stat) => (
              <div key={stat.label} className="relative group border-b border-white/5 sm:border-b-0 pb-6 sm:pb-0">
                <p className="text-3xl md:text-4xl font-light text-white group-hover:text-gold transition-colors">{stat.value}</p>
                <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 mt-2 font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN DE PRODUCTOS - CARRUSEL FLUIDO */}
      <section className="container mx-auto px-6 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="space-y-4">
            <div className="h-[1px] w-16 bg-gold/40"></div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-black">Lanzamientos</p>
            <h2 className="text-4xl md:text-6xl font-light tracking-tight italic">Novedades <span className="font-normal text-gold">Recientes.</span></h2>
          </div>
          <Link to="/products" className="group flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-white/40 hover:text-gold transition-all">
            Ver todo 
            <span className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-gold group-hover:translate-x-1 transition-all">→</span>
          </Link>
        </div>

        {/* Carrusel con ajuste de ancho para evitar cortes feos en móviles */}
        <div className="relative">
          <div className="flex gap-6 md:gap-10 overflow-x-auto pb-12 md:pb-20 snap-x snap-mandatory no-scrollbar scroll-smooth">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="min-w-[280px] xs:min-w-[300px] sm:min-w-[350px] md:min-w-[450px] snap-center">
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA INFERIOR - RESPONSIVE PADDING */}
      <section className="container mx-auto px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4rem] border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-10 md:p-32 text-center backdrop-blur-3xl">
          <div className="absolute -bottom-20 -left-20 w-60 md:w-80 h-60 md:h-80 bg-gold/10 rounded-full blur-[80px]"></div>
          <div className="relative space-y-8 md:space-y-10 max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-6xl font-light tracking-tighter italic leading-tight">
              ¿Listo para elevar <br />
              <span className="text-gold font-normal">tu experiencia?</span>
            </h3>
            <p className="text-white/40 font-light text-sm md:text-lg px-4">Asesoría personalizada para configuraciones de alto rendimiento.</p>
            <Link to="/contact" className="inline-block w-full sm:w-auto px-10 py-5 rounded-full border border-gold text-gold font-bold text-[9px] tracking-[0.4em] hover:bg-gold hover:text-black transition-all">
              SOLICITAR CONSULTORÍA
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default HomePage;