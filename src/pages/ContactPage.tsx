import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { covasaContact } from '../data/contact';

type ContactDetail = {
  label: string;
  value: string;
  href?: string;
  icon: ReactNode;
};

const contactDetails: ContactDetail[] = [
  {
    label: 'Email',
    value: covasaContact.email,
    href: covasaContact.emailUrl,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M4 4h16v16H4z" />
        <path d="m22 6-10 7L2 6" />
      </svg>
    ),
  },
  {
    label: 'Direccion',
    value: covasaContact.address,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z" />
        <circle cx="12" cy="11" r="2" />
      </svg>
    ),
  },
  {
    label: 'Telefono fijo',
    value: covasaContact.phone,
    href: covasaContact.phoneUrl,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.31 1.7.57 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.09a2 2 0 0 1 2.11-.45c.8.26 1.64.45 2.5.57a2 2 0 0 1 1.72 1.98z" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    value: covasaContact.whatsapp,
    href: covasaContact.whatsappUrl,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const ContactPage = () => {
  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-8 text-white lg:p-12">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Contacto</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl">Contacto Covasa Chile</h1>
            <p className="max-w-2xl text-sm text-white/75">
              Canales directos para coordinar soporte tecnico y consultas de abastecimiento B2B.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="zoom-card space-y-6 rounded-3xl border border-[#F0E0E0] bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-[#B01010]">Contacto oficial</p>
              <h2 className="text-2xl font-semibold text-slate-900">Canales de contacto</h2>
              <p className="text-sm text-slate-600">
                Atendemos constructoras, empresas y obras con soporte en Santiago y regiones.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-700">
              {contactDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="flex gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F7EAEA] text-[#B01010]">
                    {detail.icon}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{detail.label}</p>
                    {detail.href ? (
                      <a
                        href={detail.href}
                        className="text-base font-semibold text-slate-900 transition hover:text-[#B01010]"
                      >
                        {detail.value}
                      </a>
                    ) : (
                      <p className="text-base font-semibold text-slate-900">{detail.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#F0E0E0] bg-[#F7EAEA] px-4 py-4 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-[0.25em] text-[#B01010]">Ubicacion</p>
              <p className="mt-2">Visitas y retiros con coordinacion previa.</p>
              <a
                href={covasaContact.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#B01010] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D03030]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z" />
                  <circle cx="12" cy="11" r="2" />
                </svg>
                Abrir en Google Maps
              </a>
            </div>
          </div>

          <div className="zoom-card space-y-6 rounded-3xl border border-[#F0E0E0] bg-white/80 p-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-[#B01010]">Atencion al cliente</p>
              <h3 className="text-xl font-semibold text-slate-900">Soporte B2B para obras y empresas</h3>
              <p className="text-sm text-slate-600">
                Equipo comercial y operativo enfocado en proyectos de construccion y compras por volumen.
              </p>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Horario de atencion</p>
                <p className="text-base font-semibold text-slate-900">
                  Lunes a viernes, horario de oficina (coordinacion previa para obras).
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Canales oficiales</p>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  <a
                    href={covasaContact.emailUrl}
                    className="block font-semibold text-slate-900 transition hover:text-[#B01010]"
                  >
                    Email: {covasaContact.email}
                  </a>
                  <a
                    href={covasaContact.phoneUrl}
                    className="block font-semibold text-slate-900 transition hover:text-[#B01010]"
                  >
                    Telefono: {covasaContact.phone}
                  </a>
                  <a
                    href={covasaContact.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block font-semibold text-slate-900 transition hover:text-[#B01010]"
                  >
                    WhatsApp: {covasaContact.whatsapp}
                  </a>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-[#F0E0E0] bg-[#F7EAEA] px-4 py-4 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-[0.25em] text-[#B01010]">Cotizaciones</p>
              <p className="mt-2">
                Si necesitas precios y disponibilidad, completa la solicitud de cotizacion.
              </p>
              <Link
                to="/cotizar"
                className="mt-4 inline-flex rounded-full bg-[#B01010] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D03030]"
              >
                Ir a cotizacion
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
