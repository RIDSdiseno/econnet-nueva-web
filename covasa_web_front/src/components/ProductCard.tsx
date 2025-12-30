import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Product } from '../data/products';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
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

const ProductCard = ({ product }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const gallery = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    if (product.image) {
      return [product.image];
    }
    return [];
  }, [product.images, product.image]);
  const [activeImage, setActiveImage] = useState<string | null>(gallery[0] ?? null);
  const palette = palettes[(product.id - 1) % palettes.length];
  const icon = categoryIcons[product.category] ?? defaultIcon;
  const { addItems } = useCart();
  const modalId = `product-modal-${product.id}`;
  const titleId = `product-title-${product.id}`;

  const details = [
    { label: 'Unidad', value: product.unit },
    { label: 'Categoria', value: product.category },
    { label: 'SKU', value: `COV-${String(product.id).padStart(3, '0')}` },
    { label: 'Despacho', value: product.id % 2 === 0 ? 'Entrega 24-72h' : 'Retiro inmediato' },
  ];
  const previewImage = gallery[0] ?? product.image;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCardKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openModal();
    }
  };

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    addItems([
      {
        productId: product.id,
        name: product.name,
        description: product.description,
        unit: product.unit,
        unitPrice: product.price,
        quantity: 1,
        image: product.image || undefined,
      },
    ]);
  };

  useEffect(() => {
    if (isModalOpen) {
      setActiveImage(gallery[0] ?? null);
    }
  }, [gallery, isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      overlayRef.current?.scrollTo({ top: 0 });
    }
  }, [isModalOpen]);

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

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        aria-expanded={isModalOpen}
        aria-controls={modalId}
        aria-haspopup="dialog"
        aria-label={`Ver detalles de ${product.name}`}
        onClick={openModal}
        onKeyDown={handleCardKeyDown}
        className="card-reveal group flex h-full cursor-pointer flex-col rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_20px_50px_rgba(15,23,32,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(15,23,32,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04040] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <div
          className={`relative flex h-56 flex-col gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${palette.gradient} p-4 ring-1 ${palette.ring}`}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/80 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-600">
              {product.category}
            </span>
            <span className={`rounded-full bg-white/80 p-2 ${palette.accent}`}>{icon}</span>
          </div>
          <div className="flex h-20 items-center justify-center rounded-2xl bg-white/90 p-2">
            {previewImage ? (
              <img src={previewImage} alt={product.name} className="h-16 w-full object-contain" loading="lazy" />
            ) : (
              <span className={`rounded-full bg-white/80 p-3 ${palette.accent}`}>{icon}</span>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Stock nuevo</p>
            <h3 className="font-display text-2xl text-slate-900">{product.name}</h3>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 pt-4">
          <p className="text-sm text-slate-600">{product.description}</p>
          <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.25em] text-slate-400">
            <span>Ver detalles</span>
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <div className="mt-auto flex items-center justify-between gap-3">
            <span className="text-xl font-semibold text-slate-900">
              CLP {product.price.toLocaleString('es-CL')}
            </span>
            <button
              type="button"
              onClick={handleAddToCart}
              onKeyDown={(event) => event.stopPropagation()}
              className="rounded-full bg-[#B01010] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#D03030]"
            >
              Agregar
            </button>
          </div>
        </div>
      </article>

      {isModalOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={overlayRef}
              className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto px-4 py-10"
              onClick={closeModal}
            >
              <div className="modal-backdrop absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
              <div
                id={modalId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="modal-panel relative z-10 w-full max-w-3xl rounded-3xl bg-white p-6 shadow-[0_30px_80px_rgba(15,23,32,0.35)] sm:p-8"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#B01010]">{product.category}</p>
                    <h3 id={titleId} className="font-display text-3xl text-slate-900">
                      {product.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Cerrar"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex h-40 items-center justify-center rounded-2xl bg-white">
                      {previewImage ? (
                        <img
                          src={activeImage ?? previewImage}
                          alt={product.name}
                          className="h-28 w-full object-contain"
                        />
                      ) : (
                        <span className={`rounded-full bg-white/80 p-4 ${palette.accent}`}>{icon}</span>
                      )}
                    </div>
                    {gallery.length > 1 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {gallery.map((image, index) => {
                          const isActive = image === (activeImage ?? previewImage);
                          return (
                            <button
                              key={`${image}-${index}`}
                              type="button"
                              onClick={() => setActiveImage(image)}
                              aria-pressed={isActive}
                              aria-label={`Ver imagen ${index + 1} de ${product.name}`}
                              className={`flex h-14 w-16 items-center justify-center rounded-2xl border bg-white/90 transition ${
                                isActive
                                  ? 'border-[#B01010] shadow-sm'
                                  : 'border-slate-200 hover:border-[#B01010]/60'
                              }`}
                            >
                              <img
                                src={image}
                                alt={`${product.name} vista ${index + 1}`}
                                className="h-10 w-full object-contain"
                              />
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                    <p className="mt-4 text-sm text-slate-600">{product.description}</p>
                    <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-600">
                      {details.map((detail) => (
                        <div key={detail.label} className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                          <p className="text-[0.6rem] uppercase tracking-[0.25em] text-slate-400">{detail.label}</p>
                          <p className="mt-1 font-semibold text-slate-700">{detail.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Precio</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-900">
                        CLP {product.price.toLocaleString('es-CL')}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">Precio referencial por {product.unit}.</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-[#1b0b0b] p-6 text-white shadow-sm">
                      <p className="text-xs uppercase tracking-[0.3em] text-[#E04040]">Compra rapida</p>
                      <p className="mt-2 text-sm text-white/75">
                        Agrega al carrito y coordina despacho o retiro en bodega.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="mt-5 w-full rounded-full bg-[#B01010] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#D03030]"
                      >
                        Agregar al carrito
                      </button>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Disponibilidad</p>
                      <p className="mt-2 font-semibold text-slate-900">Stock inmediato en bodega central.</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Coordinamos entregas por etapa y volumen.
                      </p>
                    </div>
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
