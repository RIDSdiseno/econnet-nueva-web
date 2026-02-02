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
    if (!open) {
      return;
    }
    setSearchTerm('');
    setSearchQuery('');
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handle = setTimeout(() => {
      setSearchQuery(searchTerm.trim());
    }, 250);

    return () => clearTimeout(handle);
  }, [searchTerm, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 py-10" onClick={handleClose}>
      <div className="modal-backdrop fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div
        role="dialog"
        aria-modal="true"
        className="modal-panel relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-[0_30px_80px_rgba(15,23,32,0.25)] backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Buscar</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Busca productos de Covasa</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Busca por nombre o SKU"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 rounded-2xl border border-[#F0E0E0] bg-[#F7EAEA] px-4 py-3 text-sm text-[#B01010]">
              {error}
            </div>
          )}
          {!hasQuery ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Escribe para buscar productos.
            </div>
          ) : cargando ? (
            <p className="text-sm text-slate-500">Buscando productos...</p>
          ) : productos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {productos.map((product) => (
                <div
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenDetail(product)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleOpenDetail(product);
                    }
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-[#E04040]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04040]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 line-clamp-2">{product.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{product.unit}</p>
                      {typeof product.stockDisponible === 'number' && (
                        <p className="mt-1 text-xs text-slate-400">Stock: {product.stockDisponible}</p>
                      )}
                      {product.minQuantity && product.minQuantity > 1 && (
                        <p className="mt-1 text-xs text-amber-600">Compra mínima: {product.minQuantity} unidades</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#B01010]">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        const minQty = product.minQuantity && product.minQuantity > 0 ? product.minQuantity : 1;
                        addItems([
                          {
                            productId: product.id,
                            name: product.name,
                            description: product.description,
                            unit: product.unit,
                            unitPrice: product.price,
                            quantity: minQty,
                            image: product.image || undefined,
                            minQuantity: product.minQuantity ?? 0,
                          },
                        ]);
                      }}
                      className="rounded-full border border-[#F0E0E0] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B01010] transition hover:bg-[#F7EAEA]"
                    >
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenDetail(product);
                      }}
                      className="text-xs font-semibold text-slate-600 transition hover:text-[#B01010]"
                    >
                      Ver mas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              No encontramos productos con ese criterio.
            </div>
          )}
        </div>
      </div>
      {detailOpen && selectedProduct && (
        <ProductCard
          product={selectedProduct}
          index={0}
          autoOpen
          hideCard
          onModalClose={() => setDetailOpen(false)}
          modalZIndexClass="z-[80]"
          quantityModalZIndexClass="z-[90]"
        />
      )}
    </div>,
    document.body,
  );
};

export default SearchModal;
