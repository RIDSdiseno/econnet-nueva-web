import { useEffect, useMemo, useState } from 'react';
import ProductList from '../components/ProductList';
import { useProductos } from '../hooks/useProductos';

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
  const { productos, cargando, error } = useProductos();
  const [currentPage, setCurrentPage] = useState(1);

  // Lógica de ingeniería de datos mantenida
  const totalPages = Math.max(1, Math.ceil(productos.length / PRODUCTS_PER_PAGE));
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  
  const paginatedProducts = useMemo(
    () => productos.slice(startIndex, startIndex + PRODUCTS_PER_PAGE),
    [productos, startIndex]
  );

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 font-inter">
      <section className="container mx-auto px-6">
        
        {/* HEADER DE CATÁLOGO - Liquid Glass Style */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-8 md:p-12 mb-16 shadow-2xl backdrop-blur-sm">
          {/* Efecto de luz de fondo sutil */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/10 rounded-full blur-[100px]"></div>
          
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-[9px] uppercase tracking-[0.4em] text-gold font-medium">
                Inventario Oficial 2026
              </div>
              <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-none">
                Catálogo <span className="text-gold italic">Pro</span>
              </h1>
              <p className="max-w-xl text-sm md:text-base text-white/40 font-light leading-relaxed">
                Selección exclusiva de tecnología de alto rendimiento, configurada para profesionales y entusiastas del ecosistema digital.
              </p>
            </div>
            <div className="px-6 py-4 rounded-3xl border border-white/5 bg-white/[0.03] text-center">
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Disponibles</p>
              <p className="text-3xl font-light text-white">{productos.length}</p>
            </div>
          </div>
        </div>

        {/* CONTENIDO Y PAGINACIÓN */}
        <div className="space-y-12">
          {error && (
            <div className="p-6 rounded-3xl border border-red-500/20 bg-red-500/5 text-center text-red-500/60 font-light">
              {error}
            </div>
          )}

          {cargando ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <div className="h-10 w-10 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/20">Sincronizando con Econnet...</p>
            </div>
          ) : (
            <>
              {/* Grid de productos usando el ProductCard que ya Apple-ficamos */}
              <ProductList products={paginatedProducts} startIndex={startIndex} />

              {/* PAGINACIÓN PREMIUM */}
              {productos.length > 0 && totalPages > 1 && (
                <div className="mt-20 flex flex-col items-center gap-8">
                  <div className="h-px w-24 bg-white/10"></div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={!canGoPrev}
                      className="h-12 px-6 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-widest text-white/60 transition-all hover:border-gold hover:text-gold disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>

                    <div className="flex items-center gap-2">
                      {pageNumbers.map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`h-12 w-12 rounded-full text-xs font-medium transition-all duration-500 border ${
                            page === currentPage
                              ? 'bg-gold border-gold text-black shadow-lg shadow-gold/20 scale-110'
                              : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={!canGoNext}
                      className="h-12 px-6 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-widest text-white/60 transition-all hover:border-gold hover:text-gold disabled:opacity-20 disabled:cursor-not-allowed"
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