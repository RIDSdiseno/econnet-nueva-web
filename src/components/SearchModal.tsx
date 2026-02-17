import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Product } from '../data/products';
import { useProductos } from '../hooks/useProductos';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';

type SearchModalProps = {
  open: boolean;
  onClose: () => void;
};

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const SearchModal = ({ open, onClose }: SearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { productos, cargando, error } = useProductos({ search: searchQuery, limit: 8 });
  const { addItems } = useCart();
  const hasQuery = searchTerm.trim().length > 0;

  const handleClose = useCallback(() => {
    setDetailOpen(false);
    setSelectedProduct(null);
    onClose();
  }, [onClose]);

  const handleOpenDetail = useCallback((product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setSearchTerm('');
    setSearchQuery('');
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(() => setSearchQuery(searchTerm.trim()), 250);
    return () => clearTimeout(handle);
  }, [searchTerm, open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-20 md:pt-32" onClick={handleClose}>
      {/* Backdrop con desenfoque de alta fidelidad */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-2xl"></div>
      
      <div
        role="dialog"
        aria-modal="true"
        className="modal-panel relative z-10 w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0A0A0A]/80 shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl animate-in zoom-in-95 duration-300"
        onClick={(event) => event.stopPropagation()}
      >
        {/* BUSCADOR ESTILO SPOTLIGHT */}
        <div className="p-8 border-b border-white/5">
          <div className="relative group">
            <svg
              className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors duration-300"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}
            >
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Explorar ecosistema Econnet..."
              className="w-full rounded-full border border-white/10 bg-white/[0.03] py-5 pl-16 pr-8 text-lg font-light text-white outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all placeholder:text-white/10"
            />
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="max-h-[50vh] overflow-y-auto px-8 py-6 no-scrollbar">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-[10px] uppercase tracking-widest text-red-400 text-center">
              {error}
            </div>
          )}

          {!hasQuery ? (
            <div className="text-center py-10 opacity-20">
              <p className="text-[10px] uppercase tracking-[0.5em] font-light italic">Inicia tu búsqueda tecnológica</p>
            </div>
          ) : cargando ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : productos.length > 0 ? (
            <div className="space-y-3">
              {productos.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleOpenDetail(product)}
                  className="group flex items-center justify-between gap-4 p-5 rounded-[1.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="h-14 w-14 rounded-xl bg-white/[0.03] border border-white/5 p-2 shrink-0">
                      <img src={product.image} alt={product.name} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-light text-white group-hover:text-gold transition-colors">{product.name}</p>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 mt-1">{product.unit}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-gold">{formatCurrency(product.price)}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const minQty = product.minQuantity || 1;
                        addItems([{
                          productId: product.id,
                          name: product.name,
                          description: product.description,
                          unit: product.unit,
                          unitPrice: product.price,
                          quantity: minQty,
                          image: product.image || undefined,
                          minQuantity: product.minQuantity ?? 0,
                        }]);
                      }}
                      className="mt-2 text-[8px] uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors"
                    >
                      + Añadir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-light">Sin coincidencias en el catálogo</p>
            </div>
          )}
        </div>

        {/* FOOTER MODAL */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-center items-center gap-4">
           <span className="text-[8px] uppercase tracking-[0.5em] text-white/10 leading-none">ESC para cerrar</span>
        </div>
      </div>

      {detailOpen && selectedProduct && (
        <ProductCard
          product={selectedProduct}
          index={0}
          autoOpen
          hideCard
          onModalClose={() => setDetailOpen(false)}
          modalZIndexClass="z-[110]"
          quantityModalZIndexClass="z-[120]"
        />
      )}
    </div>,
    document.body,
  );
};

export default SearchModal;