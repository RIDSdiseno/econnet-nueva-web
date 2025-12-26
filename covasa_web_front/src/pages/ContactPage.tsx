import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Product } from '../data/products';
import { products } from '../data/products';

type QuoteItem = {
  id: string;
  productId: number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
};

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const createItem = (product?: Product): QuoteItem => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  productId: product?.id ?? 0,
  description: product?.description ?? '',
  unit: product?.unit ?? '',
  quantity: 1,
  unitPrice: product?.price ?? 0,
});

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const defaultProduct = products[0];
  const [items, setItems] = useState<QuoteItem[]>(() => [createItem(defaultProduct)]);
  const [selectedProductId, setSelectedProductId] = useState(defaultProduct?.id ?? 0);
  const totalNet = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  const handleItemChange = (id: string, updates: Partial<QuoteItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleProductChange = (id: string, productId: number) => {
    const product = products.find((entry) => entry.id === productId);
    handleItemChange(id, {
      productId: product?.id ?? 0,
      description: product?.description ?? '',
      unit: product?.unit ?? '',
      unitPrice: product?.price ?? 0,
    });
  };

  const handleAddItem = () => {
    const product = products.find((entry) => entry.id === selectedProductId);
    if (!product) {
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, createItem(product)];
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setItems([createItem(defaultProduct)]);
    setSelectedProductId(defaultProduct?.id ?? 0);
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-8 text-white lg:p-12">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Cotizacion</p>
            <h1 className="font-display text-4xl lg:text-5xl">Cotiza materiales para tu obra</h1>
            <p className="max-w-2xl text-sm text-white/75">
              En Covasa Chile coordinamos stock, despacho y asesoria tecnica para proyectos de construccion. Envia tu
              solicitud y un ejecutivo se contactara contigo.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="space-y-8">
          <form
            className="space-y-6 w-full min-w-0 rounded-3xl border border-[#F0E0E0] bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)]"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-[#B01010]">Formulario</p>
              <h2 className="text-2xl font-semibold text-slate-900">Detalles de tu cotizacion</h2>
              <p className="text-sm text-slate-600">
                Completa la informacion y responderemos con precio, disponibilidad y tiempos de despacho.
              </p>
            </div>

            {submitted && (
              <div className="rounded-2xl border border-[#F0E0E0] bg-[#F7EAEA] px-4 py-3 text-sm text-[#B01010]">
                Solicitud enviada. Te contactaremos pronto.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-slate-700">
                Nombre
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Nombre y apellido"
                  className="rounded-2xl border border-slate-200 bg-white w-full px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-slate-700">
                Empresa
                <input
                  type="text"
                  name="company"
                  placeholder="Constructora o maestro"
                  className="rounded-2xl border border-slate-200 bg-white w-full px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-slate-700">
                Email
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="correo@empresa.cl"
                  className="rounded-2xl border border-slate-200 bg-white w-full px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-slate-700">
                Telefono
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+56 9 1234 5678"
                  className="rounded-2xl border border-slate-200 bg-white w-full px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-slate-700">
                Tipo de obra
                <select
                  name="projectType"
                  required
                  className="rounded-2xl border border-slate-200 bg-white w-full px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                >
                  <option value="">Selecciona una opcion</option>
                  <option value="obra-gruesa">Obra gruesa</option>
                  <option value="terminaciones">Terminaciones</option>
                  <option value="ferreteria">Ferreteria</option>
                  <option value="mixta">Mixta</option>
                </select>
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-slate-700">
                Comuna o region
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="Santiago, RM"
                  className="rounded-2xl border border-slate-200 bg-white w-full px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.32em] text-[#B01010]">Items</p>
                <h3 className="text-xl font-semibold text-slate-900">Detalle de productos</h3>
                <p className="text-sm text-slate-600">
                  Selecciona productos del catalogo y ajusta cantidades para calcular el neto total.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600 sm:max-w-xs">
                  Producto a agregar
                  <select
                    value={selectedProductId || ''}
                    onChange={(event) => setSelectedProductId(Number(event.target.value))}
                    className="rounded-2xl border border-slate-200 bg-white w-full px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="rounded-full border border-[#F0E0E0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B01010] transition hover:bg-[#F7EAEA]"
                >
                  Agregar item
                </button>
              </div>

              <div className="hidden xl:grid min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                <span>Item</span>
                <span>Descripcion</span>
                <span>Unidad</span>
                <span>Cantidad</span>
                <span>Neto unitario</span>
                <span>Neto total</span>
                <span></span>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-[0_12px_24px_rgba(15,23,32,0.06)]"
                  >
                    <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                      <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600">
                        Item
                        <select
                          name="item"
                          required
                          value={item.productId || ''}
                          onChange={(event) => handleProductChange(item.id, Number(event.target.value))}
                          className="rounded-2xl border border-slate-200 bg-white w-full px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                        >
                          <option value="">Selecciona un producto</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600">
                        Descripcion
                        <input
                          type="text"
                          value={item.description}
                          readOnly
                          className="rounded-2xl border border-slate-200 bg-slate-50 w-full px-3 py-2 text-sm text-slate-600 shadow-sm"
                        />
                      </label>
                      <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600">
                        Unidad
                        <input
                          type="text"
                          value={item.unit}
                          readOnly
                          className="rounded-2xl border border-slate-200 bg-slate-50 w-full px-3 py-2 text-sm text-slate-600 shadow-sm"
                        />
                      </label>
                      <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600">
                        Cantidad
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={item.quantity}
                          onChange={(event) =>
                            handleItemChange(item.id, {
                              quantity: Math.max(1, Number(event.target.value) || 1),
                            })
                          }
                          className="rounded-2xl border border-slate-200 bg-white w-full px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                        />
                      </label>
                      <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600">
                        Neto unitario
                        <input
                          type="text"
                          value={formatCurrency(item.unitPrice)}
                          readOnly
                          className="rounded-2xl border border-slate-200 bg-slate-50 w-full px-3 py-2 text-sm text-slate-600 shadow-sm"
                        />
                      </label>
                      <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600">
                        Neto total
                        <input
                          type="text"
                          value={formatCurrency(item.unitPrice * item.quantity)}
                          readOnly
                          className="rounded-2xl border border-slate-200 bg-slate-50 w-full px-3 py-2 text-sm text-slate-600 shadow-sm"
                        />
                      </label>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length === 1}
                          className="rounded-full border border-[#F0E0E0] px-3 py-2 text-xs font-semibold text-[#B01010] transition hover:bg-[#F7EAEA] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Total neto</p>
                <div className="text-sm font-semibold text-slate-900">
                  <span className="text-[#B01010]">{formatCurrency(totalNet)}</span>
                </div>
              </div>
            </div>

            <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-slate-700">
              Detalle adicional
              <textarea
                name="details"
                rows={4}
                placeholder="Indica cantidades, plazos y forma de despacho."
                className="rounded-2xl border border-slate-200 bg-white w-full px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Respuesta en 24 a 72 horas habiles
              </p>
              <button
                type="submit"
                className="rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(176,16,16,0.3)] transition hover:bg-[#D03030]"
              >
                Enviar cotizacion
              </button>
            </div>
          </form>

          <aside className="space-y-6 w-full rounded-3xl border border-[#F0E0E0] bg-white/80 p-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-[#B01010]">Covasa Chile</p>
              <h3 className="text-xl font-semibold text-slate-900">Canales de contacto</h3>
              <p className="text-sm text-slate-600">
                Soporte para constructoras, maestros y proyectos industriales en Santiago y regiones.
              </p>
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Telefono</p>
                <p className="text-base font-semibold text-slate-900">+56 9 1234 5678</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Email</p>
                <p className="text-base font-semibold text-slate-900">ventas@covasa.cl</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Horario</p>
                <p className="text-base font-semibold text-slate-900">Lun a Sab 08:30 - 18:30</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#F0E0E0] bg-[#F7EAEA] px-4 py-4 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-[0.25em] text-[#B01010]">Incluye</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>Asesoria tecnica para partidas de obra.</li>
                <li>Stock reservado y entregas programadas.</li>
                <li>Condiciones especiales por volumen.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
