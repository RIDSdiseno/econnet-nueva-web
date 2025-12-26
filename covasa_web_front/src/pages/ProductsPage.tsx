import ProductList from '../components/ProductList';
import { products } from '../data/products';

const ProductsPage = () => {
  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.32em] text-[#B01010]">Catalogo</p>
            <h1 className="font-display text-4xl text-slate-900">Productos Covasa Chile</h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Explora materiales para obra gruesa, terminaciones y ferreteria con detalle, precio y disponibilidad.
            </p>
          </div>
          <div className="rounded-2xl border border-[#F0E0E0] bg-white/80 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-500">
            {products.length} productos disponibles
          </div>
        </div>
        <div className="mt-8">
          <ProductList products={products} />
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
