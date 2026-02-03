import { Link } from 'react-router-dom';
import ProductList from '../components/ProductList';
import { useProductos } from '../hooks/useProductos';

const categories = [
  {
    title: 'Insumos de obra',
    description: 'Consumibles y suministros para faenas y montaje.',
    stat: '120+ SKU',
    accent: 'bg-[#F0E0E0] text-[#B01010]',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="4" y="7" width="16" height="10" rx="2" />
        <path d="M9 7V5h6v2" />
        <path d="M4 11h16" />
      </svg>
    ),
  },
  {
    title: 'Moldajes y encofrados',
    description: 'Soluciones de moldaje, accesorios y elementos de soporte.',
    stat: '60+ SKU',
    accent: 'bg-[#F7EAEA] text-[#C02020]',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M4 9h16" />
        <path d="M9 4v16" />
      </svg>
    ),
  },
  {
    title: 'Carton, proteccion y embalaje',
    description: 'Cartones, separadores, protecciones y materiales de embalaje.',
    stat: '80+ SKU',
    accent: 'bg-[#EFE6E6] text-[#A01010]',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M4 9h16" />
        <path d="M12 5v14" />
      </svg>
    ),
  },
  {
    title: 'Accesorios y complementos',
    description: 'Productos complementarios para instalacion, fijacion y operacion en obra.',
    stat: '90+ SKU',
    accent: 'bg-[#F5DADA] text-[#D03030]',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <circle cx="12" cy="12" r="7" />
        <path d="M12 9v6M9 12h6" />
      </svg>
    ),
  },
];

const serviceCards = [
  {
    title: 'Despacho coordinado',
    description: 'Planificamos rutas según comuna, volumen y fecha de obra.',
  },
  {
    title: 'Atención especializada',
    description: 'Equipo comercial con foco en constructoras y proyectos.',
  },
  {
    title: 'Stock permanente',
    description: 'Reposición semanal para mantener continuidad de suministro.',
  },
  {
    title: 'Pagos flexibles',
    description: 'Transferencia, tarjetas y condiciones para empresas.',
  },
];

const heroHighlights = [
  {
    title: 'Cotiza en el día',
    description: 'Respuesta rápida con alternativas de despacho.',
  },
  {
    title: 'Retiro en bodega',
    description: 'Pick-up rápido con estacionamiento dedicado.',
  },
  {
    title: 'Soporte técnico',
    description: 'Recomendaciones según partidas de obra.',
  },
  {
    title: 'Precios mayoristas',
    description: 'Escala de descuentos por volumen y recurrencia.',
  },
];

const stats = [
  { value: '10+', label: 'Años abasteciendo obras' },
  { value: '1.800+', label: 'Productos activos' },
  { value: '95%', label: 'Entregas en plazo' },
];

const brands = [
  { name: 'Sika', logo: '/img/alianzas/sika.png' },
  { name: 'Bosch', logo: '/img/alianzas/Bosch-1.png' },
  { name: 'Ceresita', logo: '/img/alianzas/ceresita.png' },
  { name: 'Arauco', logo: '/img/alianzas/Celulosa-Arauco-tratamiento-de-la-celulosa-1-2048.webp' },
  { name: 'Volcan', logo: '/img/alianzas/volcan.png' },
];

const HomePage = () => {
  const { productos, cargando, error } = useProductos();
  const featuredProducts = productos.slice(0, 6);

  return (
    <div className="space-y-20 pb-20">
      <section className="hero-surface text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-20"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#E04040]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#E04040]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-28">
          <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="fade-up space-y-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#E04040]/30 bg-gradient-to-r from-[#E04040]/15 to-[#E04040]/10 backdrop-blur-sm px-5 py-2.5 text-xs uppercase tracking-[0.32em] font-bold shadow-lg">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E04040] animate-pulse shadow-lg shadow-[#E04040]/50"></span>
                <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">Centro de materiales y ferretería</span>
              </div>
              <h1 className="font-display text-5xl leading-[1.1] sm:text-6xl md:text-7xl font-bold bg-gradient-to-br from-white via-white to-white/80 bg-clip-text text-transparent">
                Todo para construir sin quiebres de stock.
              </h1>
              <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
                Abastecemos obras con logística precisa, asesoría técnica y precios mayoristas en los materiales clave.
              </p>
              <div className="flex flex-wrap gap-5">
                <Link
                  to="/cotizar"
                  className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#B01010] to-[#D03030] px-8 py-4 text-base font-bold text-white shadow-[0_20px_40px_rgba(176,16,16,0.35)] transition-all duration-300 hover:shadow-[0_25px_50px_rgba(176,16,16,0.45)] hover:scale-105 active:scale-95 border border-white/10"
                >
                  <span>Cotizar proyecto</span>
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-3 rounded-full border-2 border-white/40 bg-white/5 backdrop-blur-sm px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:bg-white/15 hover:border-white/60 hover:scale-105 active:scale-95"
                >
                  <span>Ver catálogo</span>
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-3 pt-4">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="group relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm px-5 py-4 transition-all duration-300 hover:border-[#E04040]/40 hover:bg-gradient-to-br hover:from-white/20 hover:to-white/10 hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#E04040]/10 to-transparent rounded-full blur-xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative">
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs uppercase tracking-[0.28em] text-white/70 font-semibold mt-1">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:items-start">
              <div className="glass-panel fade-up rounded-3xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)] border border-white/20 bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-xl" style={{ animationDelay: '120ms' }}>
                <div className="grid gap-5 sm:grid-cols-2">
                  {heroHighlights.map((item, index) => (
                    <div
                      key={item.title}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-5 transition-all duration-300 hover:border-[#E04040]/30 hover:shadow-lg hover:scale-105"
                      style={{ animationDelay: `${(index + 1) * 80}ms` }}
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#E04040]/5 to-transparent rounded-full blur-xl -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#B01010] transition-colors duration-300">{item.title}</h3>
                        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="float-slow hidden self-start rounded-2xl border border-[#E04040]/30 bg-gradient-to-br from-[#E04040]/20 to-[#E04040]/10 backdrop-blur-sm px-6 py-5 text-sm text-white shadow-xl lg:inline-flex lg:flex-col">
                <p className="text-3xl font-bold text-white">10+</p>
                <p className="text-xs uppercase tracking-[0.32em] text-white/90 font-bold mt-1">Años en obra</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-6 text-white shadow-[0_20px_50px_rgba(10,0,0,0.28)] md:p-8">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Categorías</p>
              <h2 className="font-display text-4xl text-white">Abastecimiento completo para la obra</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold text-[#E04040] transition hover:text-[#FF6B6B]">
              Explorar catálogo completo
            </Link>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <div
              key={category.title}
              className="fade-up zoom-card group rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)]"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${category.accent}`}>
                  {category.icon}
                </span>
                <span className="text-xs uppercase tracking-[0.25em] text-slate-400">{category.stat}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">{category.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{category.description}</p>
              <button className="mt-6 text-sm font-semibold text-[#B01010] transition group-hover:text-[#D03030]">
                Ver selección
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0404] via-[#120606] to-[#1a0808] py-20">
        <div className="absolute inset-0 hero-grid opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.32em] text-[#E04040] font-semibold">Servicios</p>
                <h2 className="font-display text-4xl lg:text-5xl text-white leading-tight">Logística y soporte para cada etapa</h2>
                <p className="text-base text-white/75 leading-relaxed max-w-xl">
                  Nuestro equipo acompaña desde la planificación hasta la entrega en obra. Coordinamos stock, despacho y
                  asesoría para mantener tu cronograma.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {serviceCards.map((card, index) => (
                  <div
                    key={card.title}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-5 transition-all duration-300 hover:border-[#E04040]/30 hover:bg-gradient-to-br hover:from-white/15 hover:to-white/10 hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#E04040]/10 to-transparent rounded-full blur-2xl -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative">
                      <h3 className="text-base font-bold text-white group-hover:text-[#E04040] transition-colors duration-300">{card.title}</h3>
                      <p className="mt-2 text-sm text-white/70 leading-relaxed">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl p-8 lg:p-10 text-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#E04040]/10 to-transparent rounded-full blur-3xl"></div>
              <div className="relative space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E04040]/10 to-[#E04040]/5 px-4 py-2 border border-[#E04040]/20">
                  <span className="h-2 w-2 rounded-full bg-[#E04040] animate-pulse"></span>
                  <p className="text-xs uppercase tracking-[0.32em] text-[#E04040] font-bold">Sala de ventas</p>
                </div>
                <h3 className="font-display text-3xl lg:text-4xl text-slate-900 leading-tight">Atención industrial con foco en obras.</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Agenda visitas técnicas, revisa alternativas de abastecimiento y coordina entregas escalonadas.
                </p>
                <ul className="space-y-4">
                  {[
                    {
                      icon: (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      ),
                      text: 'Ejecutivos dedicados para proyectos.',
                    },
                    {
                      icon: (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M20.59 13.41 11 3.83a2 2 0 0 0-1.41-.59H4a2 2 0 0 0-2 2v5.59a2 2 0 0 0 .59 1.41l9.59 9.59a2 2 0 0 0 2.82 0l5.59-5.59a2 2 0 0 0 0-2.82z" />
                          <circle cx="7.5" cy="7.5" r="1.5" />
                        </svg>
                      ),
                      text: 'Condiciones especiales por volumen.',
                    },
                    {
                      icon: (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M3 3v18h18" />
                          <path d="M7 14l4-4 3 3 5-6" />
                        </svg>
                      ),
                      text: 'Seguimiento postventa.',
                    },
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 group">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#E04040]/10 to-[#E04040]/5 border border-[#E04040]/20 text-base group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed pt-1.5">{item.text}</p>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B01010] to-[#D03030] px-6 py-3.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:from-[#D03030] hover:to-[#E04040] hover:shadow-2xl hover:scale-105 active:scale-95 border border-white/10"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Agendar visita</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-6 text-white shadow-[0_20px_50px_rgba(10,0,0,0.28)] md:p-8">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Destacados</p>
              <h2 className="font-display text-4xl text-white">Productos con entrega inmediata</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-white/70">
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">Más vendidos</span>
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">Obra gruesa</span>
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">Terminaciones</span>
            </div>
          </div>
        </div>
        <div className="mt-8">
          {cargando ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 text-sm text-slate-500">
              Cargando catalogo...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200/80 bg-rose-50/80 p-6 text-sm text-rose-700">
              No se pudo cargar el catalogo. Intenta nuevamente.
            </div>
          ) : featuredProducts.length > 0 ? (
            <ProductList products={featuredProducts} />
          ) : (
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 text-sm text-slate-500">
              No hay productos disponibles.
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b0b0b] via-[#2a1515] to-[#1b0b0b] p-10 text-white lg:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#E04040]/10 to-transparent rounded-full blur-3xl"></div>
          <div className="relative grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E04040]/20 to-[#E04040]/10 px-4 py-2 border border-[#E04040]/30">
                <span className="h-2 w-2 rounded-full bg-[#E04040] animate-pulse"></span>
                <p className="text-xs uppercase tracking-[0.32em] text-[#E04040] font-bold">Planificación</p>
              </div>
              <h3 className="font-display text-4xl lg:text-5xl leading-tight">Cotiza tu obra con un ejecutivo dedicado.</h3>
              <p className="text-base text-white/75 leading-relaxed max-w-xl">
                Levantamos el listado completo de materiales, programamos entregas por etapa y cuidamos tu presupuesto.
              </p>
              <Link
                to="/cotizar"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#B01010] to-[#D03030] px-6 py-3.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:from-[#D03030] hover:to-[#E04040] hover:shadow-2xl hover:scale-105 active:scale-95 border border-white/10"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Hablar con ventas</span>
              </Link>
            </div>
            <div className="grid gap-4 content-start">
              {[
                {
                  text: 'Gestión de stock para obras grandes.',
                  icon: (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )
                },
                {
                  text: 'Despacho con ventanas horarias.',
                  icon: (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  )
                },
                {
                  text: 'Seguimiento de pedidos en línea.',
                  icon: (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )
                }
              ].map((item, index) => (
                <div
                  key={item.text}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-5 transition-all duration-300 hover:border-[#E04040]/30 hover:bg-gradient-to-br hover:from-white/15 hover:to-white/10 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#E04040]/10 to-transparent rounded-full blur-2xl -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative flex items-start gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#E04040]/20 to-[#E04040]/10 border border-[#E04040]/30 text-white group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#E04040]/30 group-hover:to-[#E04040]/20 transition-all duration-300">
                      {item.icon}
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed pt-2">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b0b0b] via-[#2a1515] to-[#1b0b0b] p-10 text-white lg:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#E04040]/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-[#E04040]/5 to-transparent rounded-full blur-3xl"></div>

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between mb-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E04040]/20 to-[#E04040]/10 px-4 py-2 border border-[#E04040]/30">
                <span className="h-2 w-2 rounded-full bg-[#E04040] animate-pulse"></span>
                <p className="text-xs uppercase tracking-[0.32em] text-[#E04040] font-bold">Marcas</p>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl text-white leading-tight">Aliados que garantizan calidad</h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:from-[#E04040]/20 hover:to-[#E04040]/10 hover:border-[#E04040]/30 hover:scale-105 active:scale-95"
            >
              <span>Ver proveedores</span>
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="relative grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {brands.map((brand, index) => (
              <div
                key={brand.name}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-6 transition-all duration-300 hover:border-[#E04040]/30 hover:bg-gradient-to-br hover:from-white/15 hover:to-white/10 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#E04040]/10 to-transparent rounded-full blur-2xl -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative flex h-20 items-center justify-center sm:h-24">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-full w-full object-contain opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110 filter grayscale-[20%] group-hover:grayscale-0"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
