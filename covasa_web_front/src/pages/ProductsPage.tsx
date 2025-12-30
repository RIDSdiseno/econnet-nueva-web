import ProductList from '../components/ProductList';
import { useProductos } from '../hooks/useProductos';

const ProductsPage = () => {
  const { productos, cargando, error } = useProductos();
  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-6 text-white shadow-[0_20px_50px_rgba(10,0,0,0.28)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Catalogo</p>
              <h1 className="font-display text-4xl text-white">Productos Covasa Chile</h1>
              <p className="max-w-2xl text-sm text-white/75">
                Explora materiales para obra gruesa, terminaciones y ferreteria con detalle, precio y disponibilidad.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/80">
              {productos.length} productos disponibles
            </div>
          </div>
        </div>
        <div className="mt-8">
          {error && (
            <div className="mb-4 rounded-2xl border border-[#F0E0E0] bg-[#F7EAEA] px-4 py-3 text-sm text-[#B01010]">
              {error}
            </div>
          )}
          {cargando ? (
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-6 text-sm text-slate-600">
              Cargando catalogo...
            </div>
          ) : (
            <ProductList products={productos} />
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
