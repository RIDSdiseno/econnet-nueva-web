import { useEffect, useMemo, useState } from 'react';
import ProductList from '../components/ProductList';
import { useProductos } from '../hooks/useProductos';

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
  const { productos, cargando, error } = useProductos();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(productos.length / PRODUCTS_PER_PAGE));
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = useMemo(
    () => productos.slice(startIndex, startIndex + PRODUCTS_PER_PAGE),
    [productos, startIndex],
  );
  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);
  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-6 text-white shadow-[0_20px_50px_rgba(10,0,0,0.28)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Catalogo</p>
              <h1 className="font-display text-3xl text-white sm:text-4xl lg:text-5xl">Productos Covasa Chile</h1>
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
            <>
              <ProductList products={paginatedProducts} startIndex={startIndex} />
              {productos.length > 0 && totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-slate-500">
                    <span>Pagina</span>
                    <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.25em] text-slate-600">
                      {currentPage} / {totalPages}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={!canGoPrev}
                      className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:border-[#E04040]/40 hover:text-[#B01010] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    {pageNumbers.map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        aria-current={page === currentPage ? 'page' : undefined}
                        className={`h-10 min-w-[2.5rem] rounded-full border px-4 text-sm font-semibold transition ${
                          page === currentPage
                            ? 'border-[#B01010] bg-[#B01010] text-white shadow-[0_12px_24px_rgba(176,16,16,0.25)]'
                            : 'border-slate-200 bg-white/80 text-slate-600 hover:border-[#E04040]/40 hover:text-[#B01010]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={!canGoNext}
                      className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:border-[#E04040]/40 hover:text-[#B01010] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
