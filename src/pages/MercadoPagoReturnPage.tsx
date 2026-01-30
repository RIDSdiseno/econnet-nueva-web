import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { obtenerEstadoMercadoPago, type MercadoPagoEstado } from '../services/api';
import { uiLogger } from '../utils/logger';

type EstadoPago = 'cargando' | 'aprobado' | 'pendiente' | 'rechazado' | 'error';

type DatosMercadoPago = {
  status: string | null;
  paymentId: string | null;
  preferenceId: string | null;
  merchantOrderId: string | null;
  externalReference: string | null;
};

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const formatDateTime = (value?: string) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-CL');
};

const resolverEstadoDesdeResultado = (resultado?: string, status?: string | null): EstadoPago => {
  const slug = (resultado || '').toLowerCase();
  const rawStatus = (status || '').toLowerCase();

  if (slug === 'success') return 'aprobado';
  if (slug === 'pending') return 'pendiente';
  if (slug === 'failure') return 'rechazado';

  if (rawStatus === 'approved') return 'aprobado';
  if (rawStatus === 'pending' || rawStatus === 'in_process' || rawStatus === 'in_mediation') return 'pendiente';
  if (rawStatus === 'rejected' || rawStatus === 'cancelled' || rawStatus === 'charged_back') return 'rechazado';

  return 'error';
};

const resolverEstadoInterno = (estado?: string | null): EstadoPago => {
  const valor = (estado || '').toUpperCase();
  if (valor === 'CONFIRMADO') return 'aprobado';
  if (valor === 'PENDIENTE') return 'pendiente';
  if (valor === 'RECHAZADO') return 'rechazado';
  return 'error';
};

const MercadoPagoReturnPage = () => {
  const { clearCart } = useCart();
  const location = useLocation();
  const { resultado } = useParams<{ resultado?: string }>();
  const [estado, setEstado] = useState<EstadoPago>('cargando');
  const [mensaje, setMensaje] = useState('Confirmando tu pago con Mercado Pago...');
  const [detalle, setDetalle] = useState<string | null>(null);
  const [resumen, setResumen] = useState<MercadoPagoEstado | null>(null);
  const [confirmacion, setConfirmacion] = useState<{ destino: string; titulo: string } | null>(null);

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

  const estadoFallback = useMemo(
    () => resolverEstadoDesdeResultado(resultado, datos.status),
    [resultado, datos.status],
  );

  useEffect(() => {
    const identificador = datos.paymentId || datos.externalReference || datos.preferenceId;
    if (!identificador) {
      setEstado(estadoFallback);
      setMensaje(
        estadoFallback === 'aprobado'
          ? 'Pago aprobado. Gracias por tu compra.'
          : estadoFallback === 'pendiente'
          ? 'Pago pendiente. Te avisaremos cuando se confirme.'
          : estadoFallback === 'rechazado'
          ? 'El pago fue rechazado. Puedes intentarlo nuevamente.'
          : 'No pudimos validar el pago.',
      );
      if (estadoFallback === 'aprobado') {
        clearCart();
      }
      uiLogger.info('payment_return', {
        metodo: 'mercadopago',
        estado: estadoFallback,
        paymentId: datos.paymentId || null,
        preferenceId: datos.preferenceId || null,
        externalReference: datos.externalReference || null,
        status: datos.status || null,
      });
      return;
    }

    let activo = true;
    setEstado('cargando');
    setMensaje('Confirmando tu pago con Mercado Pago...');
    setDetalle(null);

    obtenerEstadoMercadoPago({
      paymentId: datos.paymentId,
      externalReference: datos.externalReference,
      preferenceId: datos.preferenceId,
    })
      .then((data) => {
        if (!activo) return;
        setResumen(data);
        const nuevoEstado = resolverEstadoInterno(data.estado);
        setEstado(nuevoEstado);
        setMensaje(
          nuevoEstado === 'aprobado'
            ? 'Pago aprobado. Gracias por tu compra.'
            : nuevoEstado === 'pendiente'
            ? 'Pago pendiente. Te avisaremos cuando se confirme.'
            : nuevoEstado === 'rechazado'
            ? 'El pago fue rechazado. Puedes intentarlo nuevamente.'
            : 'No pudimos validar el pago.',
        );
        if (nuevoEstado === 'aprobado') {
          clearCart();
        }
        uiLogger.info('payment_return', {
          metodo: 'mercadopago',
          estado: nuevoEstado,
          pagoId: data.pagoId,
          pedidoId: data.pedidoId,
          preferenceId: data.preferenceId ?? null,
          providerPaymentId: data.providerPaymentId ?? null,
          mpStatus: data.mpStatus ?? null,
        });
      })
      .catch((error) => {
        if (!activo) return;
        const texto = error instanceof Error ? error.message : 'No se pudo confirmar el pago.';
        setDetalle(texto);
        setEstado(estadoFallback);
        setMensaje(
          estadoFallback === 'aprobado'
            ? 'Pago aprobado. Gracias por tu compra.'
            : estadoFallback === 'pendiente'
            ? 'Pago pendiente. Te avisaremos cuando se confirme.'
            : estadoFallback === 'rechazado'
            ? 'El pago fue rechazado. Puedes intentarlo nuevamente.'
            : 'No pudimos validar el pago.',
        );
        uiLogger.warn('payment_return_error', {
          metodo: 'mercadopago',
          estado: estadoFallback,
          paymentId: datos.paymentId || null,
          preferenceId: datos.preferenceId || null,
          externalReference: datos.externalReference || null,
          message: texto,
        });
      });

    return () => {
      activo = false;
    };
  }, [
    clearCart,
    datos.externalReference,
    datos.paymentId,
    datos.preferenceId,
    estadoFallback,
  ]);

  const estadoLabel =
    estado === 'aprobado'
      ? 'Pago aprobado'
      : estado === 'pendiente'
      ? 'Pago pendiente'
      : estado === 'rechazado'
      ? 'Pago rechazado'
      : estado === 'error'
      ? 'Pago no confirmado'
      : 'Procesando pago';

  const estadoClase =
    estado === 'aprobado'
      ? 'text-emerald-600'
      : estado === 'pendiente'
      ? 'text-amber-600'
      : estado === 'rechazado'
      ? 'text-[#B01010]'
      : estado === 'error'
      ? 'text-slate-500'
      : 'text-slate-500';

  const solicitarRedireccion = (destino: string, titulo: string) => {
    setConfirmacion({ destino, titulo });
  };

  const confirmarRedireccion = () => {
    if (!confirmacion) return;
    const destino = confirmacion.destino;
    setConfirmacion(null);
    window.location.assign(destino);
  };

  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-8 shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
          <p className={`text-xs uppercase tracking-[0.32em] ${estadoClase}`}>{estadoLabel}</p>
          <h1 className="mt-3 font-display text-3xl text-slate-900">Pago Mercado Pago</h1>
          <p className="mt-3 text-sm text-slate-600">{mensaje}</p>

          {detalle && <p className="mt-2 text-xs text-slate-500">{detalle}</p>}

          {(resumen || datos.paymentId || datos.preferenceId || datos.externalReference) && (
            <div className="mt-6 grid gap-3 text-xs text-slate-600">
              {resumen?.pedidoCodigo && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Pedido</p>
                  <p className="mt-1 font-semibold text-slate-700">{resumen.pedidoCodigo}</p>
                </div>
              )}
              {resumen && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Monto</p>
                  <p className="mt-1 font-semibold text-slate-700">{formatCurrency(resumen.monto)}</p>
                </div>
              )}
              {resumen?.pagoId && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Pago ID</p>
                  <p className="mt-1 font-semibold text-slate-700">{resumen.pagoId}</p>
                </div>
              )}
              {(resumen?.providerPaymentId || datos.paymentId) && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Payment ID</p>
                  <p className="mt-1 font-semibold text-slate-700">
                    {resumen?.providerPaymentId || datos.paymentId}
                  </p>
                </div>
              )}
              {(resumen?.preferenceId || datos.preferenceId) && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Preference ID</p>
                  <p className="mt-1 font-semibold text-slate-700">
                    {resumen?.preferenceId || datos.preferenceId}
                  </p>
                </div>
              )}
              {(resumen?.externalReference || datos.externalReference) && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Referencia</p>
                  <p className="mt-1 font-semibold text-slate-700">
                    {resumen?.externalReference || datos.externalReference}
                  </p>
                </div>
              )}
              {resumen?.mpStatus && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Estado MP</p>
                  <p className="mt-1 font-semibold text-slate-700">{resumen.mpStatus}</p>
                </div>
              )}
              {resumen?.updatedAt && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Actualizado</p>
                  <p className="mt-1 font-semibold text-slate-700">{formatDateTime(resumen.updatedAt)}</p>
                </div>
              )}
              {datos.merchantOrderId && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Orden MP</p>
                  <p className="mt-1 font-semibold text-slate-700">{datos.merchantOrderId}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => solicitarRedireccion('/cart', 'Volver al carrito')}
              className="rounded-full border border-[#F0E0E0] px-6 py-3 text-sm font-semibold text-[#B01010] transition hover:bg-[#F7EAEA]"
            >
              Volver al carrito
            </button>
            <button
              type="button"
              onClick={() => solicitarRedireccion('/', 'Ir al inicio')}
              className="rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(176,16,16,0.3)] transition hover:bg-[#D03030]"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </section>

      {confirmacion && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="modal-panel w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,32,0.2)]">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Confirmacion</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{confirmacion.titulo}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Estas a punto de salir de esta pagina. Seras redirigido a{' '}
              <span className="font-semibold text-slate-800">{confirmacion.destino}</span>.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setConfirmacion(null)}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarRedireccion}
                className="flex-1 rounded-full bg-[#B01010] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#D03030]"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MercadoPagoReturnPage;
