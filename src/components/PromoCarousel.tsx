import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const promos = [
  {
    id: 1,
    title: "Potencia sin límites",
    subtitle: "Hardware de última generación para profesionales.",
    image: "https://res.cloudinary.com/dvqpmttci/image/upload/v1771604386/banner-5_mpwqsl.png",
    link: "/products"
  },
  {
    id: 2,
    title: "Estética Pro",
    subtitle: "Configuraciones que definen tu espacio de trabajo.",
    image: "https://res.cloudinary.com/dvqpmttci/image/upload/v1771602005/econnet2_pnninm.png",
    link: "/products"
  },
  {
    id: 3,
    title: "Capacidades Únicas",
    subtitle: "Configuraciones que definen tu espacio de trabajo.",
    image: "https://res.cloudinary.com/dvqpmttci/image/upload/v1771602093/1_c37aqt.png",
    link: "/products"
  }
];

const PromoCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === promos.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="container mx-auto px-6 mb-20 md:mb-32">
      <div className="relative h-[450px] md:h-[650px] w-full overflow-hidden rounded-[2.5rem] md:rounded-[4rem] border border-white/10 shadow-2xl">
        {promos.map((promo, index) => (
          <div
            key={promo.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            <img src={promo.image} alt={promo.title} className="h-full w-full object-cover" />

            <div className="absolute bottom-12 left-8 md:bottom-24 md:left-20 z-20 space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-[9px] uppercase tracking-[0.4em] text-gold font-bold backdrop-blur-md">
                Destacado
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl md:text-7xl font-light tracking-tighter text-white italic">{promo.title}</h2>
                <p className="text-white/70 font-light text-base md:text-xl leading-relaxed">{promo.subtitle}</p>
              </div>
              <Link to={promo.link} className="inline-block px-10 py-4 rounded-full bg-white text-black font-black text-[10px] tracking-[0.3em] hover:bg-gold transition-all duration-500">
                VER DETALLES
              </Link>
            </div>
          </div>
        ))}

        <div className="absolute bottom-10 right-10 z-20 flex gap-4">
          {promos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                index === current ? 'w-10 bg-gold' : 'w-4 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoCarousel;