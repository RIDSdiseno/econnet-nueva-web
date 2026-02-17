import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
// CORRECCIÓN: Importamos el nuevo nombre de la constante
import { econnetContact } from '../data/contact';

type ContactDetail = {
  label: string;
  value: string;
  href?: string;
  icon: ReactNode;
};

const contactDetails: ContactDetail[] = [
  {
    label: 'Email Corporativo',
    value: econnetContact.email,
    href: econnetContact.emailUrl,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: 'Centro de Experiencia',
    value: econnetContact.address,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
      </svg>
    ),
  },
  {
    label: 'Línea Directa',
    value: econnetContact.phone,
    href: econnetContact.phoneUrl,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.474-5.11-3.76-6.584-6.584l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp Business',
    value: econnetContact.whatsapp,
    href: econnetContact.whatsappUrl,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
];

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 font-inter">
      <div className="container mx-auto px-6">
        
        {/* HEADER DE CONTACTO */}
        <section className="mb-20">
          <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.02] p-10 md:p-16 shadow-2xl backdrop-blur-md">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/5 rounded-full blur-[100px]"></div>
            <div className="relative space-y-6 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-[10px] uppercase tracking-[0.5em] text-gold font-bold">
                Soporte de Élite
              </div>
              <h1 className="text-5xl md:text-7xl font-light tracking-tight italic">Conecta con <span className="text-gold font-normal">nosotros.</span></h1>
              <p className="text-white/40 font-light text-lg leading-relaxed">
                Asesoría técnica de alta fidelidad para la gestión de proyectos tecnológicos complejos.
              </p>
            </div>
          </div>
        </section>

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid gap-12 lg:grid-cols-2">
          
          <div className="space-y-8 p-10 rounded-[3rem] border border-white/5 bg-white/[0.01]">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-gold font-black">Oficial</h2>
            <div className="grid gap-4">
              {contactDetails.map((detail) => (
                <div key={detail.label} className="group flex items-center gap-6 p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:border-gold/30 transition-all duration-500">
                  <span className="h-12 w-12 flex items-center justify-center rounded-full bg-white/5 text-gold group-hover:bg-gold group-hover:text-black transition-all">
                    {detail.icon}
                  </span>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">{detail.label}</p>
                    {detail.href ? (
                      <a href={detail.href} className="text-lg font-light hover:text-gold transition-colors">{detail.value}</a>
                    ) : (
                      <p className="text-lg font-light">{detail.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.03] space-y-6">
              <p className="text-sm text-white/40 font-light italic">Visitas presenciales solo mediante agendamiento previo en nuestro centro de operaciones.</p>
              <a href={econnetContact.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-8 py-4 rounded-full bg-white text-black font-bold text-[10px] tracking-widest hover:bg-gold transition-all duration-500">
                VER UBICACIÓN
              </a>
            </div>
          </div>

          {/* PANEL DE PROYECTOS */}
          <div className="space-y-8 p-10 rounded-[3rem] border border-gold/10 bg-gradient-to-b from-gold/[0.03] to-transparent">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-gold font-black">Ecosistema B2B</h3>
            <div className="space-y-4">
              <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-3">Horario Corporativo</p>
                <p className="text-base font-light italic text-gold">Lunes a Viernes, 09:00 - 18:00 hrs.</p>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-gold text-black space-y-6 shadow-3xl shadow-gold/20">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Configuración de Hardware</p>
                <p className="text-sm font-medium leading-relaxed">
                  Para presupuestos detallados de infraestructura o compras por volumen, inicia una propuesta técnica formal.
                </p>
                <Link to="/cotizar" className="inline-block px-10 py-4 rounded-full bg-black text-white font-bold text-[10px] tracking-widest hover:bg-white hover:text-black transition-all duration-500">
                  INICIAR COTIZACIÓN
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;