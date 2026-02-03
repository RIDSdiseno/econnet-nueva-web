import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Product, ProductVariante } from '../data/products';
import { useCart } from '../context/CartContext';
import ProductImageGallery from './ProductImageGallery';
import { getProductImages } from '../utils/productImages';

interface ProductCardProps {
  product: Product;
  index: number;
  autoOpen?: boolean;
  hideCard?: boolean;
  onModalClose?: () => void;
  modalZIndexClass?: string;
  quantityModalZIndexClass?: string;
}

const categoryIcons: Record<string, ReactNode> = {
  'Obra gruesa': (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <rect x="3" y="6" width="8" height="4" rx="1" />
      <rect x="13" y="6" width="8" height="4" rx="1" />
      <rect x="3" y="13" width="8" height="4" rx="1" />
      <rect x="13" y="13" width="8" height="4" rx="1" />
    </svg>
  ),
  Aridos: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <circle cx="7" cy="15" r="3" />
      <circle cx="15" cy="16" r="3" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  'Fierro y mallas': (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <path d="M8 6v12M16 6v12" />
    </svg>
  ),
  Tabiqueria: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M9 4v16M15 4v16" />
    </svg>
  ),
};

const defaultIcon = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path d="M12 3l8 4v10l-8 4-8-4V7l8-4z" />
    <path d="M12 3v18" />
    <path d="M4 7l8 4 8-4" />
  </svg>
);

const palettes = [
  {
    gradient: 'from-[#F0E0E0] via-white to-white',
    ring: 'ring-[#E04040]/40',
    accent: 'text-[#B01010]',
  },
  {
    gradient: 'from-[#F7EAEA] via-white to-white',
    ring: 'ring-[#D03030]/35',
    accent: 'text-[#C02020]',
  },
  {
    gradient: 'from-[#EFE6E6] via-white to-white',
    ring: 'ring-[#B01010]/30',
    accent: 'text-[#A01010]',
  },
  {
    gradient: 'from-[#F5DADA] via-white to-white',
    ring: 'ring-[#E04040]/40',
    accent: 'text-[#D03030]',
  },
];

const ProductCard = ({
  product,
  index,
  autoOpen = false,
  hideCard = false,
  onModalClose,
  modalZIndexClass = 'z-[60]',
  quantityModalZIndexClass = 'z-[70]',
}: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariante, setSelectedVariante] = useState<ProductVariante | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const gallery = useMemo(() => getProductImages(product), [product]);
  const palette = palettes[index % palettes.length];
  const icon = categoryIcons[product.category] ?? defaultIcon;
  const { addItems } = useCart();
  const modalId = `product-modal-${product.id}`;
  const titleId = `product-title-${product.id}`;
  const quantityModalId = `quantity-modal-${product.id}`;

  // Variantes agrupadas por atributo
  const variantesPorAtributo = useMemo(() => {
    if (!product.variantes?.length) return {};
    return product.variantes.reduce((acc, v) => {
      if (!acc[v.atributo]) acc[v.atributo] = [];
      acc[v.atributo].push(v);
      return acc;
    }, {} as Record<string, ProductVariante[]>);
  }, [product.variantes]);

  const tieneVariantes = product.tieneVariantes && (product.variantes?.length ?? 0) > 0;

  // Primera variante con stock > 0, o la primera si ninguna tiene stock
  const primeraVarianteConStock = useMemo(() => {
    if (!product.variantes?.length) return null;
    return product.variantes.find((v) => v.stock > 0) ?? product.variantes[0];
  }, [product.variantes]);

  // Precio efectivo basado en variante seleccionada
  const precioEfectivo = useMemo(() => {
    if (product.precioPorVariante && selectedVariante?.precio !== null && selectedVariante?.precio !== undefined) {
      return selectedVariante.precio;
    }
    return product.price;
  }, [product.precioPorVariante, product.price, selectedVariante]);

  // Stock efectivo basado en variante seleccionada
  const stockEfectivo = useMemo(() => {
    if (tieneVariantes && selectedVariante) {
      return selectedVariante.stock;
    }
    return product.stockDisponible ?? null;
  }, [tieneVariantes, selectedVariante, product.stockDisponible]);

  const sku = product.sku ?? `COV-${String(index + 1).padStart(3, '0')}`;
  const stockDisponible = stockEfectivo;
  const stockValor = stockDisponible ?? 0;
  const stockResumen = stockDisponible === null ? 'Por confirmar' : `${stockValor}`;
  const despacho = index % 2 === 0 ? 'Entrega 24-72h' : 'Retiro inmediato';
  const description = product.descripcionCorta || product.description?.trim();
  const disponibilidadTitulo =
    stockDisponible === null ? 'Stock por confirmar' : stockDisponible > 0 ? 'Disponible para entrega' : 'Sin stock inmediato';
  const disponibilidadDetalle =
    stockDisponible === null
      ? 'Actualiza stock para ver cantidad.'
      : stockDisponible > 0
        ? `${stockValor} ${stockValor === 1 ? 'unidad disponible' : 'unidades disponibles'}`
        : 'Sin stock inmediato en bodega.';

  // Mostrar rango de precios si tiene variantes con precios diferentes
  const mostrarRangoPrecios = product.precioPorVariante && product.precioMinimo !== product.precioMaximo;

  // Cantidad mínima de compra (1 si no está definida o es 0)
  const minQuantity = product.minQuantity && product.minQuantity > 0 ? product.minQuantity : 1;

  const details = [
    { label: 'Unidad', value: product.unit },
    { label: 'Categoria', value: product.category },
    { label: 'SKU', value: sku },
    { label: 'Stock', value: stockResumen },
    { label: 'Despacho', value: despacho },
    ...(minQuantity > 1 ? [{ label: 'Compra mínima', value: `${minQuantity} unidades` }] : []),
  ].filter((detail) => detail.value);
  const previewImage = gallery[0];

  const openModal = () => {
    // Al abrir modal de detalle, preseleccionar variante con stock
    if (tieneVariantes && primeraVarianteConStock) {
      setSelectedVariante(primeraVarianteConStock);
    }
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVariante(null);
    onModalClose?.();
  };

  const handleCardKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal();
    }
  };

  const openQuantityModal = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setQuantity(minQuantity);  // Iniciar con la cantidad mínima
    // Si tiene variantes, seleccionar la primera con stock > 0 por defecto
    if (tieneVariantes && primeraVarianteConStock) {
      setSelectedVariante(primeraVarianteConStock);
    } else {
      setSelectedVariante(null);
    }
    setIsQuantityModalOpen(true);
  };

  const closeQuantityModal = () => {
    setIsQuantityModalOpen(false);
    setQuantity(minQuantity);
    setSelectedVariante(null);
  };

  const handleConfirmAddToCart = () => {
    // Si tiene variantes obligatorias y no hay selección, no permitir
    if (tieneVariantes && !selectedVariante) {
      return;
    }

    addItems([
      {
        productId: product.id,
        varianteId: selectedVariante?.id,
        name: product.name,
        description: selectedVariante
          ? `${product.description} - ${selectedVariante.atributo}: ${selectedVariante.valor}`
          : product.description,
        unit: product.unit,
        unitPrice: precioEfectivo,
        quantity: quantity,
        image: product.image || undefined,
        minQuantity: minQuantity > 1 ? minQuantity : undefined,
      },
    ]);
    closeQuantityModal();
  };

  const incrementQuantity = () => {
    const maxStock = stockEfectivo ?? 9999;
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > minQuantity) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQuantityInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    const maxStock = stockEfectivo ?? 9999;
    if (!isNaN(value) && value >= minQuantity && value <= maxStock) {
      setQuantity(value);
    } else if (event.target.value === '') {
      setQuantity(minQuantity);
    }
  };

  const handleVarianteSelect = (variante: ProductVariante) => {
    setSelectedVariante(variante);
    setQuantity(minQuantity); // Reset cantidad al cambiar variante (respetando mínimo)
  };

  useEffect(() => {
    if (isModalOpen) {
      overlayRef.current?.scrollTo({ top: 0 });
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (autoOpen && !isModalOpen) {
      openModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isQuantityModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsQuantityModalOpen(false);
        setQuantity(minQuantity);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isQuantityModalOpen]);

  return (
    <>
      {!hideCard && (
        <article
          role="button"
          tabIndex={0}
          aria-expanded={isModalOpen}
          aria-controls={modalId}
          aria-haspopup="dialog"
          aria-label={`Ver detalles de ${product.name}`}
          onClick={openModal}
          onKeyDown={handleCardKeyDown}
          className="card-reveal group flex h-full cursor-pointer flex-col rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,23,32,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(15,23,32,0.15)] hover:border-[#E04040]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04040] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
        <div
          className={`relative flex h-64 flex-col gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${palette.gradient} p-5 ring-1 ${palette.ring} sm:h-72 transition-all duration-300 group-hover:scale-[1.02]`}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm">
              {product.category}
            </span>
            <span className={`rounded-full bg-white/90 backdrop-blur-sm p-2.5 ${palette.accent} shadow-sm transition-transform duration-300 group-hover:rotate-12`}>{icon}</span>
          </div>
          <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm shadow-md sm:h-44 transition-all duration-300 group-hover:shadow-lg">
            {previewImage ? (
              <img
                src={previewImage}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <span className={`rounded-full bg-white/80 p-3 ${palette.accent} z-10`}>{icon}</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 pt-4">
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 line-clamp-2 transition-colors duration-300 group-hover:text-[#B01010] leading-snug">{product.name}</h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 px-3 py-2.5 border border-slate-200/50">
              <div className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-[0.6rem] uppercase tracking-wider text-slate-500 font-semibold">Stock</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{stockValor}</p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 px-3 py-2.5 border border-slate-200/50">
              <div className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <p className="text-[0.6rem] uppercase tracking-wider text-slate-500 font-semibold">SKU</p>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{sku}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-slate-400 py-2 border-y border-slate-100">
            <span className="transition-colors duration-300 group-hover:text-[#B01010] font-semibold">Ver detalles</span>
            <svg viewBox="0 0 24 24" className="h-3 w-3 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className="mt-auto space-y-3">
            <div className="rounded-2xl bg-gradient-to-br from-[#1b0b0b] via-[#2a1515] to-[#1b0b0b] px-4 py-3 text-white shadow-xl border border-white/5">
              <p className="text-[0.55rem] uppercase tracking-[0.3em] text-white/50 font-semibold mb-0.5">Precio</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold text-white/70">CLP</span>
                {mostrarRangoPrecios ? (
                  <span className="text-xl font-black text-white">
                    {product.precioMinimo?.toLocaleString('es-CL')} - {product.precioMaximo?.toLocaleString('es-CL')}
                  </span>
                ) : (
                  <span className="text-2xl font-black text-white">{product.price.toLocaleString('es-CL')}</span>
                )}
              </div>
              {tieneVariantes && (
                <p className="text-[0.5rem] text-white/40 mt-1">Selecciona variante para ver precio</p>
              )}
              {minQuantity > 1 && (
                <p className="text-[0.5rem] text-amber-300 mt-1 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Compra mínima: {minQuantity} unidades
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={openQuantityModal}
              onKeyDown={(event) => event.stopPropagation()}
              className="w-full rounded-full bg-gradient-to-r from-[#B01010] to-[#D03030] px-5 py-3.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:from-[#D03030] hover:to-[#E04040] hover:shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5 border border-white/10"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="uppercase tracking-wide">Agregar</span>
            </button>
          </div>
        </div>
        </article>
      )}

      {isModalOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={overlayRef}
              className={`fixed inset-0 ${modalZIndexClass} flex items-center justify-center overflow-y-auto px-4 py-8 sm:py-12`}
              onClick={closeModal}
            >
              <div className="modal-backdrop fixed inset-0 bg-gradient-to-br from-[#1b0b0b]/80 via-[#2a1515]/75 to-[#1b0b0b]/80 backdrop-blur-lg"></div>
                <div
                  id={modalId}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  className="modal-panel relative z-10 w-full max-w-4xl rounded-3xl border border-slate-200/50 bg-gradient-to-br from-white via-slate-50/95 to-white shadow-[0_40px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl overflow-hidden"
                  onClick={(event) => event.stopPropagation()}
                >
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#E04040]/5 to-transparent rounded-full blur-3xl"></div>

                <div className="relative p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E04040]/10 to-[#E04040]/5 px-3 py-1.5 border border-[#E04040]/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#E04040] animate-pulse"></span>
                        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#B01010] font-bold">{product.category}</p>
                      </div>
                      <h3 id={titleId} className="font-display text-3xl sm:text-4xl text-slate-900 leading-tight">
                        {product.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="group rounded-full border-2 border-slate-200/80 bg-white/80 backdrop-blur-sm p-2.5 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 hover:border-[#E04040]/30 hover:scale-110 active:scale-95"
                      aria-label="Cerrar"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
                    <div className="min-w-0 space-y-5">
                      <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl p-5 shadow-sm">
                        <ProductImageGallery images={gallery} title={product.name} />
                      </div>
                      {description ? (
                        <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl px-5 py-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="h-4 w-4 text-[#E04040]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-slate-500 font-bold">Descripcion</p>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{description}</p>
                        </div>
                      ) : null}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="h-4 w-4 text-[#E04040]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-[0.6rem] uppercase tracking-[0.25em] text-slate-500 font-bold">Ficha tecnica</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 sm:grid-cols-3">
                          {details.map((detail) => (
                            <div
                              key={detail.label}
                              className="min-w-0 rounded-xl border border-slate-200/60 bg-white/60 backdrop-blur-xl px-3 py-2.5 shadow-sm hover:shadow-md hover:border-[#E04040]/20 transition-all"
                            >
                              <p className="text-[0.6rem] uppercase tracking-[0.25em] text-slate-400 font-semibold">{detail.label}</p>
                              <p className="mt-1 break-words font-bold text-slate-900">{detail.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 flex flex-col gap-4">
                      <div className="relative overflow-hidden rounded-2xl border-2 border-[#E04040]/20 bg-gradient-to-br from-[#1b0b0b] via-[#2a1515] to-[#1b0b0b] p-6 shadow-2xl">
                        <div className="absolute inset-0 hero-grid opacity-10"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#E04040]/20 to-transparent rounded-full blur-2xl"></div>
                        <div className="relative">
                          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#E04040] font-bold mb-2">Precio</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-semibold text-white/70">CLP</span>
                            <p className="text-4xl font-black text-white">
                              {precioEfectivo.toLocaleString('es-CL')}
                            </p>
                          </div>
                          <p className="mt-3 text-xs text-white/60 leading-relaxed">
                            Precio por <span className="font-semibold text-white/80">{product.unit}</span>.
                            {selectedVariante && (
                              <span className="block mt-1 text-white/50">
                                SKU: {selectedVariante.skuVariante ?? product.sku ?? 'N/A'} | Stock: {selectedVariante.stock}
                              </span>
                            )}
                          </p>
                          {minQuantity > 1 && (
                            <p className="mt-2 text-xs text-amber-300">
                              Compra mínima: {minQuantity} unidades
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Selector de variantes en modal de detalle */}
                      {tieneVariantes && Object.keys(variantesPorAtributo).length > 0 && (
                        <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl p-5 shadow-sm space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="h-4 w-4 text-[#E04040]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-slate-500 font-bold">Variantes</p>
                          </div>
                          {Object.entries(variantesPorAtributo).map(([atributo, variantes]) => (
                            <div key={atributo}>
                              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">{atributo}</p>
                              <div className="flex flex-wrap gap-2">
                                {variantes.map((v) => {
                                  const isSelected = selectedVariante?.id === v.id;
                                  const sinStock = v.stock <= 0;
                                  return (
                                    <button
                                      key={v.id}
                                      type="button"
                                      onClick={() => handleVarianteSelect(v)}
                                      disabled={sinStock}
                                      className={`
                                        px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                        ${isSelected
                                          ? 'bg-gradient-to-r from-[#B01010] to-[#D03030] text-white shadow-lg scale-105'
                                          : sinStock
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                                            : 'bg-white border border-slate-200 text-slate-700 hover:border-[#E04040]/50 hover:text-[#B01010]'
                                        }
                                      `}
                                    >
                                      {v.valor}
                                      {product.precioPorVariante && v.precio !== null && (
                                        <span className="ml-1 opacity-75">
                                          ${v.precio.toLocaleString('es-CL')}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="rounded-2xl border border-[#E04040]/20 bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-xl p-6 shadow-md">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="h-5 w-5 text-[#E04040]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <p className="text-xs uppercase tracking-[0.3em] text-[#B01010] font-bold">Compra rapida</p>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-5">
                          {tieneVariantes && !selectedVariante
                            ? 'Selecciona una variante para agregar al carrito.'
                            : 'Agrega al carrito y coordina despacho o retiro en bodega.'}
                        </p>
                        {minQuantity > 1 && (
                          <p className="text-xs text-amber-600 mb-4">
                            Compra mínima: <span className="font-semibold">{minQuantity}</span> unidades
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={openQuantityModal}
                          disabled={(tieneVariantes && !selectedVariante) || stockEfectivo === 0}
                          className="group w-full flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#B01010] to-[#D03030] px-6 py-3.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:from-[#D03030] hover:to-[#E04040] hover:shadow-2xl hover:scale-[1.02] active:scale-95 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="uppercase tracking-wide">
                            {stockEfectivo === 0 ? 'Sin stock' : tieneVariantes && !selectedVariante ? 'Selecciona variante' : 'Agregar al carrito'}
                          </span>
                        </button>
                      </div>

                      <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-500 font-bold">Disponibilidad</p>
                        </div>
                        <p className="font-bold text-slate-900 mb-2">{disponibilidadTitulo}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{disponibilidadDetalle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {isQuantityModalOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className={`fixed inset-0 ${quantityModalZIndexClass} flex items-center justify-center px-4 py-8`}
              onClick={closeQuantityModal}
            >
              <div className="fixed inset-0 bg-gradient-to-br from-[#1b0b0b]/80 via-[#2a1515]/75 to-[#1b0b0b]/80 backdrop-blur-lg"></div>
              <div
                id={quantityModalId}
                role="dialog"
                aria-modal="true"
                aria-label={`Seleccionar cantidad de ${product.name}`}
                className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200/50 bg-gradient-to-br from-white via-slate-50/95 to-white shadow-[0_40px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl overflow-hidden"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#E04040]/5 to-transparent rounded-full blur-3xl"></div>

                <div className="relative p-8">
                  <div className="flex items-start justify-between gap-4 mb-8">
                    <div className="space-y-1">
                      <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#B01010] font-bold">Cantidad</p>
                      <h3 className="font-display text-xl text-slate-900 leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={closeQuantityModal}
                      className="group rounded-full border-2 border-slate-200/80 bg-white/80 backdrop-blur-sm p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 hover:border-[#E04040]/30 hover:scale-110 active:scale-95"
                      aria-label="Cerrar"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Selector de variantes */}
                  {tieneVariantes && Object.keys(variantesPorAtributo).length > 0 && (
                    <div className="mb-6 space-y-3">
                      {Object.entries(variantesPorAtributo).map(([atributo, variantes]) => (
                        <div key={atributo}>
                          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">{atributo}</p>
                          <div className="flex flex-wrap gap-2">
                            {variantes.map((v) => {
                              const isSelected = selectedVariante?.id === v.id;
                              const sinStock = v.stock <= 0;
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => handleVarianteSelect(v)}
                                  disabled={sinStock}
                                  className={`
                                    px-4 py-2 rounded-xl text-sm font-semibold transition-all
                                    ${isSelected
                                      ? 'bg-gradient-to-r from-[#B01010] to-[#D03030] text-white shadow-lg scale-105'
                                      : sinStock
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                                        : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-[#E04040]/50 hover:text-[#B01010]'
                                    }
                                  `}
                                >
                                  {v.valor}
                                  {product.precioPorVariante && v.precio !== null && (
                                    <span className="ml-1.5 text-xs opacity-75">
                                      ${v.precio.toLocaleString('es-CL')}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {selectedVariante && (
                        <p className="text-xs text-slate-500">
                          Seleccionado: <span className="font-semibold text-slate-700">{selectedVariante.atributo}: {selectedVariante.valor}</span>
                          {selectedVariante.skuVariante && (
                            <span className="ml-2 text-slate-400">({selectedVariante.skuVariante})</span>
                          )}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-5 mb-8">
                    <button
                      type="button"
                      onClick={decrementQuantity}
                      disabled={quantity <= minQuantity}
                      className="rounded-full border-2 border-slate-200 bg-white p-4 text-slate-600 transition-all hover:bg-slate-100 hover:border-[#E04040]/30 hover:text-[#B01010] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:text-slate-600"
                      aria-label="Disminuir cantidad"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      </svg>
                    </button>

                    <input
                      type="number"
                      min={minQuantity}
                      max={stockEfectivo ?? 9999}
                      value={quantity}
                      onChange={handleQuantityInputChange}
                      className="w-32 rounded-xl border-2 border-slate-200 bg-white px-4 py-4 text-center text-3xl font-bold text-slate-900 focus:border-[#E04040] focus:outline-none focus:ring-2 focus:ring-[#E04040]/20 transition-all"
                      aria-label="Cantidad"
                    />

                    <button
                      type="button"
                      onClick={incrementQuantity}
                      disabled={stockEfectivo !== null && quantity >= stockEfectivo}
                      className="rounded-full border-2 border-slate-200 bg-white p-4 text-slate-600 transition-all hover:bg-slate-100 hover:border-[#E04040]/30 hover:text-[#B01010] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:text-slate-600"
                      aria-label="Aumentar cantidad"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {stockEfectivo !== null && (
                    <p className="text-center text-xs text-slate-500 mb-4">
                      Stock disponible: <span className="font-semibold text-slate-700">{stockEfectivo}</span> unidades
                    </p>
                  )}
                  {minQuantity > 1 && (
                    <p className="text-center text-xs text-amber-600 mb-4">
                      Compra mínima: <span className="font-semibold">{minQuantity}</span> unidades
                    </p>
                  )}

                  <div className="rounded-2xl bg-gradient-to-br from-[#1b0b0b] via-[#2a1515] to-[#1b0b0b] px-4 py-3 text-white shadow-xl border border-white/5 mb-5">
                    <p className="text-[0.55rem] uppercase tracking-[0.3em] text-white/50 font-semibold mb-0.5">Total</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-white/70">CLP</span>
                      <span className="text-2xl font-black text-white">{(precioEfectivo * quantity).toLocaleString('es-CL')}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeQuantityModal}
                      className="flex-1 rounded-full border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 hover:border-slate-300 active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAddToCart}
                      disabled={tieneVariantes && !selectedVariante}
                      className="flex-1 rounded-full bg-gradient-to-r from-[#B01010] to-[#D03030] px-5 py-3 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:from-[#D03030] hover:to-[#E04040] hover:shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {tieneVariantes && !selectedVariante ? 'Selecciona variante' : 'Confirmar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};

export default ProductCard;
