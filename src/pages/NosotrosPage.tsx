import { teamMembers } from '../data/team';

const principles = [
  {
    title: 'Proposito claro',
    description: 'Asegurar materiales confiables para que cada obra avance sin pausas.',
  },
  {
    title: 'Acompanamiento experto',
    description: 'Guiamos decisiones tecnicas y coordinamos entregas por etapa.',
  },
  {
    title: 'Confianza operativa',
    description: 'Stock, logistica y seguimiento para cumplir lo prometido.',
  },
  {
    title: 'Cercania',
    description: 'Escuchamos a cada cliente para construir relaciones de largo plazo.',
  },
];

const avatarPalettes = [
  'from-[#B01010] to-[#D03030]',
  'from-[#1b0b0b] to-[#3a1010]',
  'from-[#7a1b1b] to-[#B01010]',
  'from-[#4a1a1a] to-[#7a1b1b]',
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const NosotrosPage = () => {
  return (
    <div className="space-y-16 pb-20">
      <section className="hero-surface text-white">
        <div className="absolute inset-0 hero-grid opacity-15"></div>
        <div className="relative container mx-auto px-4 py-16 lg:py-20">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/70">Nosotros</p>
            <h1 className="font-display text-4xl leading-none sm:text-5xl md:text-6xl">Personas detras de COVASA.</h1>
            <p className="text-lg text-white/80">
              Somos un equipo cercano que combina experiencia en obra, logistica y abastecimiento para proyectos que no
              pueden detenerse.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[#2a0d0d] bg-[#120606] p-6 text-white shadow-[0_18px_40px_rgba(10,0,0,0.35)]">
            <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Quienes somos</p>
            <h2 className="mt-3 font-display text-4xl text-white">Abastecimiento con foco humano.</h2>
            <p className="mt-4 text-sm text-white/75">
              En COVASA trabajamos con constructoras y maestros para asegurar materiales criticos en cada etapa. Nuestra
              mision es simplificar la compra de obra gruesa, terminaciones y ferreteria con un servicio consistente.
            </p>
            <p className="mt-3 text-sm text-white/75">
              Nos mueve la confianza, el compromiso tecnico y la coordinacion precisa entre equipos comerciales y
              logistica.
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
              <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Nuestro equipo</p>
              <h2 className="mt-3 font-display text-4xl text-white">Expertos en cada etapa del proyecto.</h2>
            </div>
            <p className="max-w-xl text-sm text-white/75">
              Conectamos compra, soporte tecnico y logistica para que las entregas se cumplan en tiempo y forma.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, index) => {
            const initials = getInitials(member.name);
            const palette = avatarPalettes[index % avatarPalettes.length];
            return (
              <article
                key={member.id}
                className="card-reveal rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)]"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${palette}`}>
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="h-full w-full rounded-2xl object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-white">{initials}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                    <p className="text-sm text-slate-500">{member.role}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-600">{member.bio}</p>

                {(member.email || member.linkedin) && (
                  <div className="mt-5 flex items-center gap-3">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-[#B01010] hover:text-[#B01010] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04040]"
                        aria-label={`Enviar correo a ${member.name}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M4 4h16v16H4z" />
                          <path d="m22 6-10 7L2 6" />
                        </svg>
                        Email
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-[#B01010] hover:text-[#B01010] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04040]"
                        aria-label={`Ver LinkedIn de ${member.name}`}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                          <path d="M4.98 3.5a2.5 2.5 0 1 0 .02 5 2.5 2.5 0 0 0-.02-5zM3 9h4v12H3zm7 0h3.8v1.7h.1c.5-.9 1.7-1.9 3.6-1.9 3.8 0 4.5 2.5 4.5 5.7V21h-4v-5.3c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-4z" />
                        </svg>
                        LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default NosotrosPage;
