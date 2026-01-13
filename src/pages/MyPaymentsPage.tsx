import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarMisPagos, type PagoListado } from '../services/api';

type EstadoListado = 'idle' | 'cargando' | 'error';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Por confirmar';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
};

const estadoLabel = (estado?: string | null) => {
  if (!estado) return 'PENDIENTE';
  return estado.replace(/_/g, ' ');
};

const estadoColor = (estado?: string | null) => {
  if (!estado) return 'text-amber-600';
  if (estado === 'CONFIRMADO') return 'text-emerald-600';
  if (estado === 'RECHAZADO') return 'text-[#B01010]';
  if (estado === 'PENDIENTE') return 'text-amber-600';
  return 'text-slate-500';
};

const resolverMetodoPago = (pago: PagoListado) => {
  if (pago.metodo === 'STRIPE') {
    return 'Stripe';
  }
  if (pago.metodo === 'OTRO' && pago.proveedor?.referencia?.startsWith('pi_')) {
    return 'Stripe';
  }
  return pago.metodo.replace(/_/g, ' ');
};

const MyPaymentsPage = () => {
  const { isAuthenticated } = useAuth();
  const [pagos, setPagos] = useState<PagoListado[]>([]);
  const [estado, setEstado] = useState<EstadoListado>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let activo = true;
    setEstado('cargando');
    setError(null);

    listarMisPagos()
      .then((data) => {
        if (!activo) return;
        setPagos(data);
        setEstado('idle');
      })
      .catch((err) => {
        if (!activo) return;
        const mensaje = err instanceof Error ? err.message : 'No se pudieron cargar tus pagos.';
        setError(mensaje);
        setEstado('error');
      });

    return () => {
      activo = false;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-10 text-center shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
          <p className="text-xs uppercase tracking-[0.32em] text-[#B01010]">Mis pagos</p>
          <h1 className="mt-3 font-display text-3xl text-slate-900">Inicia sesion</h1>
          <p className="mt-3 text-sm text-slate-600">
            Necesitas una cuenta para revisar tus pagos y descargar recibos.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/login"
              className="rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(176,16,16,0.3)] transition hover:bg-[#D03030]"
            >
              Ir a login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-8 text-white lg:p-12">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Mis pagos</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl">Historial de compras</h1>
            <p className="max-w-2xl text-sm text-white/75">
              Revisa el estado de tus pagos y descarga comprobantes cuando lo necesites.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        {estado === 'cargando' && (
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
            <p className="text-sm text-slate-600">Cargando tus pagos...</p>
          </div>
        )}

        {estado === 'error' && (
          <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-8 text-center shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
            <p className="text-sm text-[#B01010]">{error}</p>
          </div>
        )}

        {estado === 'idle' && pagos.length === 0 && (
          <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-8 text-center shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
            <p className="text-lg font-semibold text-slate-900">Aun no registras pagos.</p>
            <p className="mt-2 text-sm text-slate-600">Cuando completes una compra, aparecera aqui.</p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/products"
                className="rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(176,16,16,0.3)] transition hover:bg-[#D03030]"
              >
                Ver productos
              </Link>
            </div>
          </div>
        )}

        {estado === 'idle' && pagos.length > 0 && (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{pagos.length} pagos</p>

            {pagos.map((pago) => (
              <div
                key={pago.pagoId}
                className="zoom-card rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className={`text-xs uppercase tracking-[0.25em] ${estadoColor(pago.estado)}`}>
                      {estadoLabel(pago.estado)}
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {pago.pedido?.codigo || pago.pedido?.id || pago.pagoId}
                    </h2>
                    <p className="text-sm text-slate-600">{formatDateTime(pago.createdAt)}</p>
                    <p className="text-sm text-slate-600">Metodo: {resolverMetodoPago(pago)}</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Total</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatCurrency(pago.monto)}</p>
                    </div>
                    <Link
                      to={`/mis-pagos/${pago.pagoId}`}
                      className="rounded-full bg-[#B01010] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(176,16,16,0.25)] transition hover:bg-[#D03030]"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyPaymentsPage;
