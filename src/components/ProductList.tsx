import type { Product } from '../data/products';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  startIndex?: number;
}

const ProductList = ({ products, startIndex = 0 }: ProductListProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={startIndex + index} />
      ))}
    </div>
  );
};

export default ProductList;
