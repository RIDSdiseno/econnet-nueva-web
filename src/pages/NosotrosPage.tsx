const principles = [
  {
    title: 'Soluciones integrales',
    description: 'Integramos productos, logistica y soporte tecnico para obras exigentes.',
  },
  {
    title: 'Abastecimiento confiable',
    description: 'Planificamos stock y reposicion para evitar detenciones en obra.',
  },
  {
    title: 'Logistica y despacho',
    description: 'Coordinamos entregas por etapa con foco en cumplimiento y seguridad.',
  },
  {
    title: 'Enfoque B2B',
    description: 'Atendemos empresas y constructoras con procesos claros y atencion dedicada.',
  },
];

const commitments = [
  {
    title: 'Abastecimiento por proyecto',
    description: 'Gestionamos compras por volumen y entregas programadas para obras civiles e industriales.',
  },
  {
    title: 'Soporte tecnico en terreno',
    description: 'Acompanamos especificaciones y resolvemos dudas operativas en cada etapa.',
  },
  {
    title: 'Logistica coordinada',
    description: 'Alineamos bodegas, rutas y cronogramas para cumplir ventanas de descarga.',
  },
];

const NosotrosPage = () => {
  return (
    <div className="space-y-16 pb-20">
      <section className="hero-surface text-white">
        <div className="absolute inset-0 hero-grid opacity-15"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-20">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/70">Nosotros</p>
            <h1 className="font-display text-4xl leading-none sm:text-5xl md:text-6xl">
              Soluciones integrales para la construccion.
            </h1>
            <p className="text-lg text-white/80">
              Covasa Chile es una empresa especializada en soluciones integrales para la construccion, abasteciendo
              proyectos de obras civiles, industriales y comerciales con productos, logistica y soporte tecnico
              confiable.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[#2a0d0d] bg-[#120606] p-6 text-white shadow-[0_18px_40px_rgba(10,0,0,0.35)]">
            <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Quienes somos</p>
            <h2 className="mt-3 font-display text-4xl text-white">Abastecimiento confiable para la construccion.</h2>
            <p className="mt-4 text-sm text-white/75">
              Trabajamos con empresas, constructoras y mandantes para asegurar soluciones integrales de suministro,
              logistica y despacho en cada etapa de obra.
            </p>
            <p className="mt-3 text-sm text-white/75">
              Nuestro enfoque B2B combina soporte tecnico en terreno con coordinacion precisa entre compras y
              operacion.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {principles.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,32,0.08)]"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.title}</p>
                <p className="mt-3 text-sm font-semibold text-slate-900">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="rounded-3xl border border-[#2a0d0d] bg-[#120606] p-6 text-white shadow-[0_18px_40px_rgba(10,0,0,0.35)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Compromiso operativo</p>
              <h2 className="mt-3 font-display text-4xl text-white">
                Comprometidos con la eficiencia, la calidad y el cumplimiento en cada proyecto.
              </h2>
            </div>
            <p className="max-w-xl text-sm text-white/75">
              Alineamos abastecimiento, logistica y soporte tecnico para mantener continuidad en obra.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {commitments.map((item) => (
            <article
              key={item.title}
              className="card-reveal rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.title}</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default NosotrosPage;
