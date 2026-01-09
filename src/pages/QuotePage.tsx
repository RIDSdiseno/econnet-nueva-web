import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../data/products';
import { useProductos } from '../hooks/useProductos';
import { crearCotizacion } from '../services/api';
import ModalSuccessCotizacion from '../components/ModalSuccessCotizacion';
import { useQuoteHistory } from '../context/QuoteHistoryContext';

type QuoteItem = {
  id: string;
  productoId: string;
  skuSnapshot?: string;
  nombreSnapshot: string;
  unidadSnapshot: string;
  cantidad: number;
  precioUnitario: number;
  observacion?: string;
};

type QuoteResult = {
  id: string;
  codigo: string;
  total: number;
  estado: string;
  createdAt?: string | null;
};

type QuoteFormErrors = {
  name?: string;
  contact?: string;
  items?: string;
};

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const createItem = (product: Product): QuoteItem => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  productoId: product.id,
  skuSnapshot: product.sku,
  nombreSnapshot: product.name,
  unidadSnapshot: product.unit,
  cantidad: 1,
  precioUnitario: product.price,
  observacion: '',
});

const leerUtm = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const utm: Record<string, string> = {};

  keys.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utm[key] = value;
    }
  });

  return Object.keys(utm).length > 0 ? utm : null;
};

const detalleUrlTemplate = (import.meta.env as Record<string, string | undefined>)[
  'VITE_COTIZACION_DETALLE_URL'
];
const defaultDetalleUrlTemplate = '/mis-cotizaciones/:id';

const buildDetalleUrl = (resultado: QuoteResult) => {
  const template = detalleUrlTemplate ?? defaultDetalleUrlTemplate;
  return template.replace(':id', resultado.id).replace(':codigo', resultado.codigo || resultado.id);
};

const QuotePage = () => {
  const navigate = useNavigate();
  const { upsertQuote } = useQuoteHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { productos, cargando, error: catalogoError } = useProductos({ search: searchQuery, limit: 200 });
  const [submitted, setSubmitted] = useState<QuoteResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<QuoteFormErrors>({});
  const [successOpen, setSuccessOpen] = useState(false);
  const [successStage, setSuccessStage] = useState<'confirming' | 'confirmed'>('confirming');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const totalNet = items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);
  const canAddItem = Boolean(selectedProductId) && !submitting;
  const isSubmitDisabled = items.length === 0 || submitting;
  const hasContactError = Boolean(formErrors.contact);
  const detalleUrl = submitted ? buildDetalleUrl(submitted) : null;

  const handleCloseSuccess = () => setSuccessOpen(false);

  const handleViewSuccess = () => {
    if (!detalleUrl) {
      return;
    }

    setSuccessOpen(false);
    if (/^https?:\/\//i.test(detalleUrl)) {
      window.location.assign(detalleUrl);
      return;
    }
    navigate(detalleUrl);
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearchQuery(searchTerm.trim());
    }, 250);

    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    if (!successOpen) {
      return;
    }

    setSuccessStage('confirming');
    const timer = setTimeout(() => setSuccessStage('confirmed'), 700);

    return () => clearTimeout(timer);
  }, [successOpen]);

  const clearFieldError = (key: keyof QuoteFormErrors) => {
    setFormErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      return { ...prev, [key]: undefined };
    });
  };

  const clearSubmitError = () => {
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleItemChange = (id: string, updates: Partial<QuoteItem>) => {
    clearFieldError('items');
    clearSubmitError();
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleProductChange = (id: string, productId: string) => {
    const product = productos.find((entry) => entry.id === productId);
    if (!product) {
      handleItemChange(id, {
        productoId: productId,
        nombreSnapshot: '',
        unidadSnapshot: '',
        precioUnitario: 0,
        skuSnapshot: undefined,
      });
      return;
    }
    handleItemChange(id, {
      productoId: product.id,
      nombreSnapshot: product.name,
      unidadSnapshot: product.unit,
      precioUnitario: product.price,
      skuSnapshot: product.sku,
    });
  };

  const handleAddItem = () => {
    if (!selectedProductId) {
      return;
    }

    const product = productos.find((entry) => entry.id === selectedProductId);
    if (!product) {
      return;
    }

    clearFieldError('items');
    clearSubmitError();

    setItems((prev) => {
      const existing = prev.find((item) => item.productoId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productoId === product.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        );
      }
      return [...prev, createItem(product)];
    });
  };

  const handleRemoveItem = (id: string) => {
    clearFieldError('items');
    clearSubmitError();
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nombre = String(formData.get('name') ?? '').trim();
    const empresa = String(formData.get('company') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const telefono = String(formData.get('phone') ?? '').trim();
    const direccion = String(formData.get('address') ?? '').trim();
    const tipoObra = String(formData.get('projectType') ?? '').trim();
    const ubicacion = String(formData.get('location') ?? '').trim();
    const mensaje = String(formData.get('message') ?? '').trim();

    const nextErrors: QuoteFormErrors = {};

    if (!nombre) {
      nextErrors.name = 'El nombre es obligatorio.';
    }

    if (!email && !telefono) {
      nextErrors.contact = 'Email o teléfono es obligatorio.';
    }

    if (items.length === 0) {
      nextErrors.items = 'Agrega al menos un item.';
    } else {
      const itemSinProducto = items.find((item) => !item.productoId);
      if (itemSinProducto) {
        nextErrors.items = 'Selecciona un producto para cada item.';
      }
      const itemCantidadInvalida = items.find((item) => item.cantidad < 1);
      if (!nextErrors.items && itemCantidadInvalida) {
        nextErrors.items = 'La cantidad mínima es 1.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      setSubmitError('Revisa los campos marcados.');
      return;
    }

    setFormErrors({});
    setSubmitting(true);
    setSubmitError(null);
    setSubmitted(null);
    setSuccessOpen(false);

    try {
      const resultado = await crearCotizacion({
        contacto: {
          nombre,
          email: email || null,
          telefono: telefono || null,
          empresa: empresa || null,
          direccion: direccion || null,
          mensaje: mensaje || null,
          tipoObra: tipoObra || null,
          ubicacion: ubicacion || null,
        },
        items: items.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          observacion: item.observacion?.trim() ? item.observacion.trim() : null,
        })),
        origen: 'ECOMMERCE',
        metadata: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          utm: leerUtm(),
        },
      });

      const createdAt = resultado.createdAt ?? new Date().toISOString();
      setSubmitted({ ...resultado, createdAt });
      upsertQuote({
        id: resultado.id,
        codigo: resultado.codigo,
        total: resultado.total,
        estado: resultado.estado,
        createdAt,
        nombreContacto: nombre,
        itemsCount: items.length,
      });
      setSuccessOpen(true);
      setItems([]);
      setSelectedProductId('');
      setSearchTerm('');
      setSearchQuery('');
      form.reset();
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : 'No se pudo enviar la cotizacion.';
      setSubmitError(mensajeError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-8 text-white lg:p-12">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Cotizacion</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl">Cotiza materiales para tu obra</h1>
            <p className="max-w-2xl text-sm text-white/75">
              En Covasa Chile coordinamos stock, despacho y asesoria tecnica para proyectos de construccion. Envia tu
              solicitud y un ejecutivo se contactara contigo.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="mx-auto w-full">
          <form
            className="space-y-8 w-full min-w-0 rounded-3xl border border-[#F0E0E0] bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)] sm:p-8"
            onSubmit={handleSubmit}
            aria-busy={submitting}
          >
            <div className="relative overflow-hidden rounded-2xl bg-[#1b0b0b] px-5 py-5 text-white shadow-[0_18px_40px_rgba(10,0,0,0.28)] sm:px-6 sm:py-6">
              <div className="absolute inset-0 hero-grid opacity-10"></div>
              <div className="relative space-y-2">
                <p className="text-[0.65rem] uppercase tracking-[0.32em] text-[#E04040]">Formulario</p>
                <h2 className="text-2xl font-semibold">Datos para tu cotizacion</h2>
                <p className="text-sm text-white/75">
                  Completa la informacion y responderemos con precio, disponibilidad y tiempos de despacho.
                </p>
              </div>
            </div>

            {submitError && (
              <div
                role="alert"
                className="rounded-2xl border border-[#F0E0E0] bg-[#F7EAEA] px-4 py-3 text-sm text-[#B01010]"
              >
                {submitError}
              </div>
            )}

            {catalogoError && (
              <div className="rounded-2xl border border-[#F0E0E0] bg-[#F7EAEA] px-4 py-3 text-sm text-[#B01010]">
                {catalogoError}
              </div>
            )}

            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl bg-[#1b0b0b] px-5 py-4 text-white shadow-[0_16px_34px_rgba(10,0,0,0.24)]">
                <div className="absolute inset-0 hero-grid opacity-10"></div>
                <div className="relative flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[0.65rem] uppercase tracking-[0.32em] text-[#E04040]">Datos de contacto</p>
                  <span className="text-[0.65rem] text-white/70">Nombre y email o telefono *</span>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="group flex min-w-0 flex-col gap-2.5 text-sm font-semibold text-slate-700">
                  Nombre *
                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Nombre y apellido"
                      aria-invalid={Boolean(formErrors.name)}
                      onInput={() => {
                        clearFieldError('name');
                        clearSubmitError();
                      }}
                      className={`rounded-2xl border border-slate-200 bg-white w-full pl-11 pr-4 py-3.5 text-sm text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#E04040] focus:border-transparent hover:border-slate-300 ${
                        formErrors.name ? 'border-[#B01010] focus:ring-[#B01010]' : ''
                      }`}
                    />
                  </div>
                  {formErrors.name && <span className="text-xs text-[#B01010]">{formErrors.name}</span>}
                </label>
                <label className="group flex min-w-0 flex-col gap-2.5 text-sm font-semibold text-slate-700">
                  Empresa
                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="company"
                      placeholder="Constructora o maestro"
                      className="rounded-2xl border border-slate-200 bg-white w-full pl-11 pr-4 py-3.5 text-sm text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#E04040] focus:border-transparent hover:border-slate-300"
                    />
                  </div>
                </label>
                <label className="group flex min-w-0 flex-col gap-2.5 text-sm font-semibold text-slate-700">
                  Email
                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="correo@empresa.cl"
                      aria-invalid={hasContactError}
                      onInput={() => {
                        clearFieldError('contact');
                        clearSubmitError();
                      }}
                      className={`rounded-2xl border border-slate-200 bg-white w-full pl-11 pr-4 py-3.5 text-sm text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#E04040] focus:border-transparent hover:border-slate-300 ${
                        hasContactError ? 'border-[#B01010] focus:ring-[#B01010]' : ''
                      }`}
                    />
                  </div>
                </label>
                <label className="group flex min-w-0 flex-col gap-2.5 text-sm font-semibold text-slate-700">
                  Telefono
                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+56 9 1234 5678"
                      aria-invalid={hasContactError}
                      onInput={() => {
                        clearFieldError('contact');
                        clearSubmitError();
                      }}
                      className={`rounded-2xl border border-slate-200 bg-white w-full pl-11 pr-4 py-3.5 text-sm text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#E04040] focus:border-transparent hover:border-slate-300 ${
                        hasContactError ? 'border-[#B01010] focus:ring-[#B01010]' : ''
                      }`}
                    />
                  </div>
                </label>
                <label className="group flex min-w-0 flex-col gap-2.5 text-sm font-semibold text-slate-700">
                  Direccion
                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="address"
                      placeholder="Direccion de la obra"
                      className="rounded-2xl border border-slate-200 bg-white w-full pl-11 pr-4 py-3.5 text-sm text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#E04040] focus:border-transparent hover:border-slate-300"
                    />
                  </div>
                </label>
                <label className="group flex min-w-0 flex-col gap-2.5 text-sm font-semibold text-slate-700">
                  Tipo de obra
                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <select
                      name="projectType"
                      className="rounded-2xl border border-slate-200 bg-white w-full pl-11 pr-10 py-3.5 text-sm text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#E04040] focus:border-transparent hover:border-slate-300 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                      }}
                    >
                      <option value="">Selecciona una opcion</option>
                      <option value="obra-gruesa">Obra gruesa</option>
                      <option value="terminaciones">Terminaciones</option>
                      <option value="ferreteria">Ferreteria</option>
                      <option value="mixta">Mixta</option>
                    </select>
                  </div>
                </label>
                <label className="group flex min-w-0 flex-col gap-2.5 text-sm font-semibold text-slate-700">
                  Comuna o region
                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="location"
                      placeholder="Santiago, RM"
                      className="rounded-2xl border border-slate-200 bg-white w-full pl-11 pr-4 py-3.5 text-sm text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#E04040] focus:border-transparent hover:border-slate-300"
                    />
                  </div>
                </label>
              </div>
              {formErrors.contact && (
                <p className="text-xs text-[#B01010]">{formErrors.contact}</p>
              )}
            </div>

            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-2xl bg-[#1b0b0b] px-5 py-4 text-white shadow-[0_16px_34px_rgba(10,0,0,0.24)]">
                <div className="absolute inset-0 hero-grid opacity-10"></div>
                <div className="relative space-y-2">
                  <p className="text-[0.65rem] uppercase tracking-[0.32em] text-[#E04040]">Detalle de cotizacion</p>
                  <h3 className="text-xl font-semibold">Items solicitados</h3>
                  <p className="text-sm text-white/75">
                    Selecciona productos del catalogo y ajusta cantidades para calcular el neto total.
                  </p>
                </div>
              </div>
              {formErrors.items && (
                <div className="rounded-2xl border border-[#F0E0E0] bg-[#F7EAEA] px-4 py-3 text-sm text-[#B01010]">
                  {formErrors.items}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600 sm:max-w-xs">
                  Buscar producto
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Busca por nombre o SKU"
                    className="rounded-2xl border border-slate-200 bg-white w-full px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                  />
                </label>
                <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600 sm:max-w-xs">
                  Producto a agregar
                  <select
                    value={selectedProductId || ''}
                    onChange={(event) => setSelectedProductId(event.target.value)}
                    disabled={cargando}
                    className="rounded-2xl border border-slate-200 bg-white w-full px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                  >
                    <option value="">{cargando ? 'Cargando catalogo...' : 'Selecciona un producto'}</option>
                    {productos.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!canAddItem}
                  className="rounded-full border border-[#F0E0E0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B01010] transition hover:bg-[#F7EAEA] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Agregar item
                </button>
              </div>

              {items.length > 0 ? (
                <>
                  <div className="hidden xl:grid min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                    <span>Item</span>
                    <span>Nombre</span>
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
                              value={item.productoId || ''}
                              onChange={(event) => handleProductChange(item.id, event.target.value)}
                              className="rounded-2xl border border-slate-200 bg-white w-full px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                            >
                              <option value="">Selecciona un producto</option>
                              {productos.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600">
                            Nombre
                            <input
                              type="text"
                              value={item.nombreSnapshot}
                              readOnly
                              className="rounded-2xl border border-slate-200 bg-slate-50 w-full px-3 py-2 text-sm text-slate-600 shadow-sm"
                            />
                          </label>
                          <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600">
                            Unidad
                            <input
                              type="text"
                              value={item.unidadSnapshot}
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
                              value={item.cantidad}
                              onChange={(event) =>
                                handleItemChange(item.id, {
                                  cantidad: Math.max(1, Number(event.target.value) || 1),
                                })
                              }
                              className="rounded-2xl border border-slate-200 bg-white w-full px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                            />
                          </label>
                          <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600">
                            Neto unitario
                            <input
                              type="text"
                              value={formatCurrency(item.precioUnitario)}
                              readOnly
                              className="rounded-2xl border border-slate-200 bg-slate-50 w-full px-3 py-2 text-sm text-slate-600 shadow-sm"
                            />
                          </label>
                          <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600">
                            Neto total
                            <input
                              type="text"
                              value={formatCurrency(item.precioUnitario * item.cantidad)}
                              readOnly
                              className="rounded-2xl border border-slate-200 bg-slate-50 w-full px-3 py-2 text-sm text-slate-600 shadow-sm"
                            />
                          </label>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              aria-label="Quitar item"
                              className="rounded-full border border-[#F0E0E0] px-3 py-2 text-xs font-semibold text-[#B01010] transition hover:bg-[#F7EAEA]"
                            >
                              X
                            </button>
                          </div>
                        </div>
                        <label className="mt-3 flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600">
                          Observacion
                          <textarea
                            rows={2}
                            value={item.observacion || ''}
                            onChange={(event) =>
                              handleItemChange(item.id, {
                                observacion: event.target.value,
                              })
                            }
                            placeholder="Notas del item (opcional)"
                            className="rounded-2xl border border-slate-200 bg-white w-full px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-600">
                  Aun no agregas items. Selecciona un producto y usa "Agregar item".
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Total neto</p>
                <div className="text-sm font-semibold text-slate-900">
                  <span className="text-[#B01010]">{formatCurrency(totalNet)}</span>
                </div>
              </div>
            </div>

            <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-slate-700">
              Mensaje
              <textarea
                name="message"
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
                disabled={isSubmitDisabled}
                className="rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(176,16,16,0.3)] transition hover:bg-[#D03030] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creando...' : 'Enviar cotizacion'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <ModalSuccessCotizacion
        open={successOpen}
        stage={successStage}
        data={submitted}
        onClose={handleCloseSuccess}
        onView={detalleUrl ? handleViewSuccess : undefined}
      />
    </div>
  );
};

export default QuotePage;
