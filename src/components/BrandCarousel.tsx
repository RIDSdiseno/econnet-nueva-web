const BrandCarousel = () => {
  // AQUÍ PEGAS TUS URLS DE CLOUDINARY
  const brands = [
    { name: "Apple", url: "https://res.cloudinary.com/dvqpmttci/image/upload/v1771595050/png-transparent-apple-logo-apple-logo-company-heart-logo-510x426_o1abma.png" },
    { name: "Asus", url: "https://res.cloudinary.com/dvqpmttci/image/upload/v1771680523/Unknown_wtsyqc.png" },
    { name: "Dell", url: "https://res.cloudinary.com/dvqpmttci/image/upload/v1771595686/Dell_Logo.svg-247x296_jlll0y.png" },
    { name: "HP", url: "https://res.cloudinary.com/dvqpmttci/image/upload/v1771680689/Unknown-2_ai74wq.jpg" },
    { name: "Lenovo", url: "hhttps://res.cloudinary.com/dvqpmttci/image/upload/v1771598011/Branding_lenovo-logo_lenovologoposred_low_res-510x170_wrxxrv.png" },
  ];

  // Duplicamos para el efecto infinito
  const scrollingBrands = [...brands, ...brands, ...brands];

  return (
    <section className="w-full bg-black py-16 border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-6 mb-12">
        <p className="text-[10px] uppercase tracking-[0.5em] text-gold/40 font-black text-center">
          Partners Tecnológicos
        </p>
      </div>
      
      <div className="relative flex w-full">
        {/* Degradados laterales para suavizar la entrada/salida de logos */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>

        <div className="flex animate-scroll whitespace-nowrap gap-20 md:gap-40 items-center">
          {scrollingBrands.map((brand, index) => (
            <div key={index} className="flex-shrink-0 group">
              <img 
                src={brand.url} 
                alt={brand.name}
                className="h-8 md:h-12 w-auto object-contain opacity-20 grayscale brightness-200 transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scrollBrands {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-scroll {
          animation: scrollBrands 40s linear infinite;
          display: flex;
          width: max-content;
        }
      `}</style>
    </section>
  );
};

export default BrandCarousel;