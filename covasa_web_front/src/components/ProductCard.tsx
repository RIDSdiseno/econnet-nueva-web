import type { ReactNode } from 'react';
import type { Product } from '../data/products';

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
  Áridos: (
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
  Tabiquería: (
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
  const palette = palettes[(product.id - 1) % palettes.length];
  const icon = categoryIcons[product.category] ?? defaultIcon;

  return (
    <article className="group flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_20px_50px_rgba(15,23,32,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(15,23,32,0.12)]">
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
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-16 w-full object-contain" loading="lazy" />
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
        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="text-xl font-semibold text-slate-900">
            CLP {product.price.toLocaleString('es-CL')}
          </span>
          <button className="rounded-full bg-[#B01010] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#D03030]">
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
