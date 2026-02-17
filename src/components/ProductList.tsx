import type { Product } from '../data/products';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  startIndex?: number;
}

const ProductList = ({ products, startIndex = 0 }: ProductListProps) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 rounded-[3rem] border border-white/5 bg-white/[0.01] backdrop-blur-sm">
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/20">Sin resultados en la selección</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Decoración de fondo sutil para dar profundidad a la lista */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {products.map((product, index) => (
          <div 
            key={product.id} 
            className="flex justify-center"
            style={{ 
              animationDelay: `${(index % 4) * 100}ms`,
              animationFillMode: 'backwards' 
            }}
          >
            <ProductCard 
              product={product} 
              index={startIndex + index} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;