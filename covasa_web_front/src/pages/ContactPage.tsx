import { Link } from 'react-router-dom';

const ContactPage = () => {
  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-8 text-white lg:p-12">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Contacto</p>
            <h1 className="font-display text-4xl lg:text-5xl">Contacto Covasa Chile</h1>
            <p className="max-w-2xl text-sm text-white/75">
              Canales directos para coordinar visitas, soporte tecnico y consultas sobre materiales de construccion.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6 rounded-3xl border border-[#F0E0E0] bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-[#B01010]">Covasa Chile</p>
              <h2 className="text-2xl font-semibold text-slate-900">Canales de contacto</h2>
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
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Correo electronico</p>
                <p className="text-base font-semibold text-slate-900">ventas@covasa.cl</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Horario</p>
                <p className="text-base font-semibold text-slate-900">Lun a Sab 08:30 - 18:30</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Direccion</p>
                <p className="text-base font-semibold text-slate-900">Av. Principal 1234, Santiago</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-3xl border border-[#F0E0E0] bg-white/80 p-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-[#B01010]">Incluye</p>
              <h3 className="text-xl font-semibold text-slate-900">Soporte especializado</h3>
              <p className="text-sm text-slate-600">
                Equipo comercial con foco en obra gruesa, terminaciones y ferreteria para proyectos en crecimiento.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>Asesoria tecnica para partidas de obra.</li>
              <li>Stock reservado y entregas programadas.</li>
              <li>Condiciones especiales por volumen.</li>
            </ul>
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
