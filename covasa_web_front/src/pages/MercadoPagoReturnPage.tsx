import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

type EstadoPago = 'aprobado' | 'pendiente' | 'rechazado' | 'error';

type DatosMercadoPago = {
  status: string | null;
  paymentId: string | null;
  preferenceId: string | null;
  merchantOrderId: string | null;
  externalReference: string | null;
};

const resolverEstado = (status: string | null): EstadoPago => {
  if (!status) {
    return 'error';
  }

  if (status === 'approved') {
    return 'aprobado';
  }

  if (status === 'pending' || status === 'in_process' || status === 'in_mediation') {
    return 'pendiente';
  }

  return 'rechazado';
};

const MercadoPagoReturnPage = () => {
  const location = useLocation();
  const { clearCart } = useCart();
  const [estado, setEstado] = useState<EstadoPago>('pendiente');

  const datos = useMemo<DatosMercadoPago>(() => {
    const params = new URLSearchParams(location.search);
    return {
      status: params.get('status'),
      paymentId: params.get('payment_id'),
      preferenceId: params.get('preference_id'),
      merchantOrderId: params.get('merchant_order_id'),
      externalReference: params.get('external_reference'),
    };
  }, [location.search]);

  useEffect(() => {
    const nuevoEstado = resolverEstado(datos.status);
    setEstado(nuevoEstado);
    if (nuevoEstado === 'aprobado') {
      clearCart();
    }
  }, [datos.status, clearCart]);

  const mensaje =
    estado === 'aprobado'
      ? 'Pago aprobado. Gracias por tu compra.'
      : estado === 'pendiente'
      ? 'Pago pendiente. Te avisaremos cuando se confirme.'
      : estado === 'rechazado'
      ? 'El pago fue rechazado. Puedes intentarlo nuevamente.'
      : 'No pudimos validar el pago.';

  const estadoLabel =
    estado === 'aprobado'
      ? 'Pago aprobado'
      : estado === 'pendiente'
      ? 'Pago pendiente'
      : estado === 'rechazado'
      ? 'Pago rechazado'
      : 'Pago no confirmado';

  const estadoClase =
    estado === 'aprobado'
      ? 'text-emerald-600'
      : estado === 'pendiente'
      ? 'text-amber-600'
      : estado === 'rechazado'
      ? 'text-[#B01010]'
      : 'text-slate-500';

  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-8 shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
          <p className={`text-xs uppercase tracking-[0.32em] ${estadoClase}`}>{estadoLabel}</p>
          <h1 className="mt-3 font-display text-3xl text-slate-900">Pago Mercado Pago</h1>
          <p className="mt-3 text-sm text-slate-600">{mensaje}</p>

          <div className="mt-6 grid gap-3 text-xs text-slate-600">
            {datos.paymentId && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Payment ID</p>
                <p className="mt-1 font-semibold text-slate-700">{datos.paymentId}</p>
              </div>
            )}
            {datos.preferenceId && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Preference ID</p>
                <p className="mt-1 font-semibold text-slate-700">{datos.preferenceId}</p>
              </div>
            )}
            {datos.merchantOrderId && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Orden Mercado Pago</p>
                <p className="mt-1 font-semibold text-slate-700">{datos.merchantOrderId}</p>
              </div>
            )}
            {datos.externalReference && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Referencia</p>
                <p className="mt-1 font-semibold text-slate-700">{datos.externalReference}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/cart"
              className="rounded-full border border-[#F0E0E0] px-6 py-3 text-sm font-semibold text-[#B01010] transition hover:bg-[#F7EAEA]"
            >
              Volver al carrito
            </Link>
            <Link
              to="/"
              className="rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(176,16,16,0.3)] transition hover:bg-[#D03030]"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MercadoPagoReturnPage;
