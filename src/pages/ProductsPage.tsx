import { useState } from 'react';
import { products } from '../data/products'; // Tus datos locales sagrados
import ProductCard from '../components/ProductCard';

const ProductsPage = () => {
  // Ignoramos el useEffect que hace el fetch y usamos los datos locales directamente
  const [items] = useState(products);

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 font-inter">
      <div className="container mx-auto px-6">
        
        {/* HEADER DEL CATÁLOGO */}
        <header className="mb-16 space-y-6">
          <div className="h-[1px] w-20 bg-gold/40"></div>
          <p className="text-gold text-[10px] uppercase tracking-[0.5em] font-black">Hardware de Élite</p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter italic">
            Catálogo <span className="font-normal text-gold not-italic">Premium.</span>
          </h1>
        </header>

        {/* GRID DE PRODUCTOS - RESPONSIVE Y LOCAL */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
            {items.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index} 
              />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center">
            <p className="text-white/20 uppercase tracking-[0.5em] text-[10px]">No se encontraron productos en el sistema local.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;