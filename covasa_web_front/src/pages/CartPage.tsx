import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const CartPage = () => {
  const { items, totalQuantity, updateQuantity, removeItem, clearCart } = useCart();
  const totalNet = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const taxRate = 0.19;
  const ivaAmount = Math.round(totalNet * taxRate);
  const totalWithIva = totalNet + ivaAmount;

  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-6 text-white shadow-[0_20px_50px_rgba(10,0,0,0.28)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Carrito</p>
              <h1 className="font-display text-4xl text-white">Carrito de compras</h1>
              <p className="text-sm text-white/75">
                Revisa los materiales agregados desde tu cotizacion y ajusta cantidades.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/80">
              {totalQuantity} items
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">Tu carrito esta vacio.</p>
            <p className="mt-2 text-sm text-slate-600">
              Agrega productos desde la cotizacion o el catalogo.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/products"
                className="rounded-full border border-[#F0E0E0] px-6 py-3 text-sm font-semibold text-[#B01010] transition hover:bg-[#F7EAEA]"
              >
                Ver productos
              </Link>
              <Link
                to="/cotizar"
                className="rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(176,16,16,0.3)] transition hover:bg-[#D03030]"
              >
                Cotizar materiales
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)]"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {item.image && (
                      <div className="flex h-20 w-24 items-center justify-center rounded-2xl border border-[#F0E0E0] bg-white/80 p-3">
                        <img src={item.image} alt={item.name} className="h-12 w-full object-contain" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.unit}</p>
                      <h3 className="text-xl font-semibold text-slate-900">{item.name}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600">
                      Cantidad
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={item.quantity}
                        onChange={(event) => updateQuantity(item.productId, Number(event.target.value))}
                        className="rounded-2xl border border-slate-200 bg-white w-full px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                      />
                    </label>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Neto unitario</p>
                      <p className="text-base font-semibold text-slate-900">{formatCurrency(item.unitPrice)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Neto total</p>
                      <p className="text-base font-semibold text-slate-900">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="rounded-full border border-[#F0E0E0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B01010] transition hover:bg-[#F7EAEA]"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-6 rounded-3xl border border-[#F0E0E0] bg-white/80 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Subtotal neto</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(totalNet)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">IVA 19%</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(ivaAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Total con IVA</p>
                    <p className="text-2xl font-semibold text-[#B01010]">{formatCurrency(totalWithIva)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-full border border-[#F0E0E0] px-6 py-3 text-sm font-semibold text-[#B01010] transition hover:bg-[#F7EAEA]"
                >
                  Vaciar carrito
                </button>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#F0E0E0] pt-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Pagar con</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    aria-label="Pagar con Apple Pay"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M16.365 1.43c0 1.14-.43 2.22-1.2 3.03-.87.9-2.31 1.6-3.63 1.49-.14-1.15.36-2.31 1.16-3.15.84-.9 2.28-1.58 3.67-1.37z" />
                      <path d="M12.12 5.05c1.74 0 2.5-.93 4.67-.93 2.17 0 3.26 1.2 3.26 1.2-1.24.76-2.1 2.18-2.1 3.86 0 2.1 1.5 3.18 2.1 3.54-.42 1.2-1.3 2.42-2.24 3.34-.86.84-1.74 1.42-3.03 1.42-1.27 0-1.68-.38-3.17-.38-1.5 0-2.02.4-3.18.4-1.2 0-2.06-.63-2.92-1.55-1.88-2-3.32-5.68-1.37-8.2.96-1.22 2.7-2.02 4.58-2.02 1.16 0 2.13.4 2.9.4z" />
                    </svg>
                    Apple Pay
                  </button>
                  <button
                    type="button"
                    aria-label="Pagar con Transbank"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(176,16,16,0.25)] transition hover:bg-[#D03030]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M7 15h6" />
                    </svg>
                    Transbank
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Metodo de pago solo referencial. Integracion real pendiente.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CartPage;
