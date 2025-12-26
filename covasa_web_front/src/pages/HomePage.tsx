import { Link } from 'react-router-dom';
import ProductList from '../components/ProductList';
import { products } from '../data/products';

const categories = [
  {
    title: 'Obra gruesa',
    description: 'Cemento, ladrillos, morteros y cal para estructuras sólidas.',
    stat: '120+ SKU',
    accent: 'bg-[#F0E0E0] text-[#B01010]',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="3" y="6" width="8" height="4" rx="1" />
        <rect x="13" y="6" width="8" height="4" rx="1" />
        <rect x="3" y="13" width="8" height="4" rx="1" />
        <rect x="13" y="13" width="8" height="4" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Áridos y hormigón',
    description: 'Arena, gravilla y mezclas controladas para rendimiento estable.',
    stat: '60+ SKU',
    accent: 'bg-[#F7EAEA] text-[#C02020]',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <circle cx="7" cy="15" r="3" />
        <circle cx="15" cy="16" r="3" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Fierro y mallas',
    description: 'Refuerzo estructural, perfiles y mallas electrosoldadas.',
    stat: '80+ SKU',
    accent: 'bg-[#EFE6E6] text-[#A01010]',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <path d="M8 6v12M16 6v12" />
      </svg>
    ),
  },
  {
    title: 'Tabiquería y cielos',
    description: 'Yeso-cartón, perfilería y soluciones de terminación.',
    stat: '90+ SKU',
    accent: 'bg-[#F5DADA] text-[#D03030]',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M9 4v16M15 4v16" />
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

const brands = ['Melón', 'Sika', 'Bosch', 'Ceresita', 'Arauco', 'Volcán'];

const HomePage = () => {
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="space-y-20 pb-20">
      <section className="hero-surface text-white">
        <div className="absolute inset-0 hero-grid opacity-20"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="fade-up space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em]">
                <span className="h-2 w-2 rounded-full bg-[#E04040]"></span>
                Centro de materiales y ferretería
              </div>
              <h1 className="font-display text-5xl leading-none md:text-6xl">
                Todo para construir sin quiebres de stock.
              </h1>
              <p className="text-lg text-white/80">
                Abastecemos obras con logística precisa, asesoría técnica y precios mayoristas en los materiales clave.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(176,16,16,0.3)] transition hover:bg-[#D03030]"
                >
                  Cotizar proyecto
                </Link>
                <Link
                  to="/products"
                  className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Ver catálogo
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                    <p className="text-2xl font-semibold text-white">{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:items-start">
              <div className="glass-panel fade-up rounded-3xl p-6 shadow-lift" style={{ animationDelay: '120ms' }}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {heroHighlights.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/60 bg-white/90 p-4">
                      <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-2 text-xs text-slate-500">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="float-slow hidden self-start rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm text-white/80 shadow-lg lg:inline-flex lg:flex-col">
                <p className="text-xl font-semibold text-white">10+</p>
                <p className="text-xs uppercase tracking-[0.3em]">Años en obra</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Categorías</p>
            <h2 className="font-display text-4xl text-slate-900">Abastecimiento completo para la obra</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-[#B01010] transition hover:text-[#D03030]">
            Explorar catálogo completo
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <div
              key={category.title}
              className="fade-up group rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)]"
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

      <section className="bg-white/80 py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Servicios</p>
              <h2 className="font-display text-4xl text-slate-900">Logística y soporte para cada etapa</h2>
              <p className="text-sm text-slate-600">
                Nuestro equipo acompaña desde la planificación hasta la entrega en obra. Coordinamos stock, despacho y
                asesoría para mantener tu cronograma.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {serviceCards.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-slate-200/80 bg-white p-4">
                    <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-xs text-slate-500">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-[#1b0b0b] p-8 text-white shadow-lift">
              <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Sala de ventas</p>
              <h3 className="mt-4 font-display text-3xl">Atención industrial con foco en obras.</h3>
              <p className="mt-4 text-sm text-white/70">
                Agenda visitas técnicas, revisa alternativas de abastecimiento y coordina entregas escalonadas.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-white/80">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#E04040]"></span>
                  Ejecutivos dedicados para proyectos.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#E04040]"></span>
                  Condiciones especiales por volumen.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#E04040]"></span>
                  Seguimiento postventa.
                </li>
              </ul>
              <Link
                to="/contact"
                className="mt-6 inline-flex rounded-full bg-[#B01010] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D03030]"
              >
                Agendar visita
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Destacados</p>
            <h2 className="font-display text-4xl text-slate-900">Productos con entrega inmediata</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            <span className="rounded-full border border-slate-200 px-3 py-1">Más vendidos</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">Obra gruesa</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">Terminaciones</span>
          </div>
        </div>
        <div className="mt-8">
          <ProductList products={featuredProducts} />
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-8 text-white lg:p-12">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Planificación</p>
              <h3 className="mt-4 font-display text-4xl">Cotiza tu obra con un ejecutivo dedicado.</h3>
              <p className="mt-4 text-sm text-white/70">
                Levantamos el listado completo de materiales, programamos entregas por etapa y cuidamos tu presupuesto.
              </p>
              <Link
                to="/contact"
                className="mt-6 inline-flex rounded-full bg-[#B01010] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D03030]"
              >
                Hablar con ventas
              </Link>
            </div>
            <div className="grid gap-4">
              {[
                'Gestión de stock para obras grandes.',
                'Despacho con ventanas horarias.',
                'Seguimiento de pedidos en línea.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Marcas</p>
            <h2 className="font-display text-3xl text-slate-900">Aliados que garantizan calidad</h2>
          </div>
          <Link to="/products" className="text-sm font-semibold text-[#B01010] transition hover:text-[#D03030]">
            Ver proveedores
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((brand) => (
            <div
              key={brand}
              className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-4 py-6 text-xs uppercase tracking-[0.3em] text-slate-500"
            >
              {brand}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
