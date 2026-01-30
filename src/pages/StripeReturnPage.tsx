import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { descargarReciboPdf, obtenerEstadoStripe, type StripeEstado } from '../services/api';
import { uiLogger } from '../utils/logger';

type EstadoPago = 'cargando' | 'aprobado' | 'pendiente' | 'rechazado' | 'error';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const formatDateTime = (value?: string) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-CL');
};

const resolverEstadoDesdeResultado = (resultado?: string): EstadoPago => {
  const slug = (resultado || '').toLowerCase();
  if (slug === 'success') return 'aprobado';
  if (slug === 'pending') return 'pendiente';
  if (slug === 'failure') return 'rechazado';
  return 'error';
};

const resolverEstadoInterno = (estado?: string | null): EstadoPago => {
  const valor = (estado || '').toUpperCase();
  if (valor === 'CONFIRMADO') return 'aprobado';
  if (valor === 'PENDIENTE') return 'pendiente';
  if (valor === 'RECHAZADO') return 'rechazado';
  return 'error';
};

const resolverMensajeEstado = (estado: EstadoPago) => {
  if (estado === 'aprobado') return 'Pago confirmado. Dirigirse a pagos para ver el detalle.';
  if (estado === 'pendiente') return 'Pago pendiente. Te avisaremos cuando se confirme.';
  if (estado === 'rechazado') return 'El pago fue rechazado. Puedes intentarlo nuevamente.';
  if (estado === 'error') return 'No pudimos validar el pago.';
  return 'Confirmando tu pago con Stripe...';
};

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 15;

const StripeReturnPage = () => {
  const { clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { resultado } = useParams<{ resultado?: string }>();
  const location = useLocation();
  const [estado, setEstado] = useState<EstadoPago>('cargando');
  const [mensaje, setMensaje] = useState('Confirmando tu pago con Stripe...');
  const [detalle, setDetalle] = useState<string | null>(null);
  const [resumen, setResumen] = useState<StripeEstado | null>(null);
  const [confirmacion, setConfirmacion] = useState<{ destino: string; titulo: string } | null>(
    null,
  );
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfCargando, setPdfCargando] = useState(false);
  const ultimaClaveRef = useRef<string | null>(null);

  const params = useMemo(() => {
    const search = new URLSearchParams(location.search);
    return {
      pedidoId: search.get('pedidoId'),
      cotizacionId: search.get('cotizacionId'),
      paymentIntentId: search.get('payment_intent'),
    };
  }, [location.search]);

  const estadoFallback = useMemo(
    () => resolverEstadoDesdeResultado(resultado),
    [resultado],
  );
  const esRutaExito = estadoFallback === 'aprobado';

  useEffect(() => {
    if (!params.pedidoId && !params.cotizacionId && !params.paymentIntentId) {
      setEstado(estadoFallback);
      setMensaje(resolverMensajeEstado(estadoFallback));
      if (estadoFallback === 'aprobado') {
        clearCart();
      }
      uiLogger.info('payment_return', {
        metodo: 'stripe',
        estado: estadoFallback,
        pedidoId: params.pedidoId ?? null,
        cotizacionId: params.cotizacionId ?? null,
        paymentIntentId: params.paymentIntentId ?? null,
      });
      return;
    }

    const clave = `${params.pedidoId ?? ''}|${params.cotizacionId ?? ''}|${params.paymentIntentId ?? ''}`;
    if (ultimaClaveRef.current === clave) {
      return;
    }
    ultimaClaveRef.current = clave;

    let activo = true;
    let intentos = 0;
    let timer: number | undefined;
    if (esRutaExito) {
      setEstado('aprobado');
      setMensaje('Pago confirmado. Dirigirse a pagos para ver el detalle.');
      clearCart();
      uiLogger.info('payment_return', {
        metodo: 'stripe',
        estado: 'aprobado',
        pedidoId: params.pedidoId ?? null,
        cotizacionId: params.cotizacionId ?? null,
        paymentIntentId: params.paymentIntentId ?? null,
      });
    } else {
      setEstado('cargando');
      setMensaje('Confirmando tu pago con Stripe...');
    }
    setDetalle(null);

    const consultarEstado = async () => {
      try {
        const data = await obtenerEstadoStripe({
          pedidoId: params.pedidoId,
          cotizacionId: params.cotizacionId,
          paymentIntentId: params.paymentIntentId,
        });
        if (!activo) return;
        setResumen(data);
        const nuevoEstado = resolverEstadoInterno(data.estado);
        setEstado(nuevoEstado);
        setMensaje(resolverMensajeEstado(nuevoEstado));
        if (nuevoEstado === 'aprobado') {
          clearCart();
          uiLogger.info('payment_return', {
            metodo: 'stripe',
            estado: nuevoEstado,
            pagoId: data.pagoId,
            pedidoId: data.pedidoId ?? null,
            paymentIntentId: data.providerPaymentId ?? null,
            stripeStatus: data.stripeStatus ?? null,
          });
          return;
        }
        if (nuevoEstado === 'rechazado') {
          uiLogger.info('payment_return', {
            metodo: 'stripe',
            estado: nuevoEstado,
            pagoId: data.pagoId,
            pedidoId: data.pedidoId ?? null,
            paymentIntentId: data.providerPaymentId ?? null,
            stripeStatus: data.stripeStatus ?? null,
          });
          return;
        }
      } catch (error) {
        if (!activo) return;
        const texto = error instanceof Error ? error.message : 'No se pudo confirmar el pago.';
        setDetalle(texto);
        uiLogger.warn('payment_return_error', {
          metodo: 'stripe',
          pedidoId: params.pedidoId ?? null,
          paymentIntentId: params.paymentIntentId ?? null,
          message: texto,
        });
      }

      intentos += 1;
      if (intentos >= MAX_POLL_ATTEMPTS) {
        if (!activo) return;
        setEstado(estadoFallback);
        setMensaje(resolverMensajeEstado(estadoFallback));
        if (estadoFallback === 'aprobado') {
          clearCart();
        }
        uiLogger.info('payment_return', {
          metodo: 'stripe',
          estado: estadoFallback,
          pedidoId: params.pedidoId ?? null,
          cotizacionId: params.cotizacionId ?? null,
          paymentIntentId: params.paymentIntentId ?? null,
        });
        return;
      }

      timer = window.setTimeout(consultarEstado, POLL_INTERVAL_MS);
    };

    consultarEstado();

    return () => {
      activo = false;
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [clearCart, params.pedidoId, params.cotizacionId, params.paymentIntentId, estadoFallback, esRutaExito]);

  const descargarPdf = async () => {
    if (!resumen?.pagoId) {
      setPdfError('No se pudo identificar el pago.');
      return;
    }

    if (!isAuthenticated) {
      setPdfError('Inicia sesion para descargar el recibo.');
      return;
    }

    setPdfError(null);
    setPdfCargando(true);
    try {
      const blob = await descargarReciboPdf(resumen.pagoId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo-${resumen.pagoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo descargar el recibo.';
      setPdfError(mensaje);
    } finally {
      setPdfCargando(false);
    }
  };

  const estadoLabel =
    estado === 'aprobado'
      ? 'Pago aprobado'
      : estado === 'pendiente'
      ? 'Pago pendiente'
      : estado === 'rechazado'
      ? 'Pago rechazado'
      : estado === 'error'
      ? 'Pago no confirmado'
      : esRutaExito
      ? 'Pago aprobado'
      : 'Procesando pago';

  const estadoClase =
    estado === 'aprobado'
      ? 'text-emerald-600'
      : estado === 'pendiente'
      ? 'text-amber-600'
      : estado === 'rechazado'
      ? 'text-[#B01010]'
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
          <h1 className="mt-3 font-display text-3xl text-slate-900">Pago Stripe</h1>
          <p className="mt-3 text-sm text-slate-600">{mensaje}</p>

          {detalle && <p className="mt-2 text-xs text-slate-500">{detalle}</p>}

          {(resumen || params.pedidoId || params.cotizacionId || params.paymentIntentId) && (
            <div className="mt-6 grid gap-3 text-xs text-slate-600">
              {resumen?.pedidoCodigo && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Pedido</p>
                  <p className="mt-1 font-semibold text-slate-700">{resumen.pedidoCodigo}</p>
                </div>
              )}
              {!resumen?.pedidoCodigo && resumen?.cotizacionCodigo && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Cotizacion</p>
                  <p className="mt-1 font-semibold text-slate-700">{resumen.cotizacionCodigo}</p>
                </div>
              )}
              {resumen && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Monto</p>
                  <p className="mt-1 font-semibold text-slate-700">{formatCurrency(resumen.monto)}</p>
                </div>
              )}
              {resumen?.stripeStatus && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Estado Stripe</p>
                  <p className="mt-1 font-semibold text-slate-700">{resumen.stripeStatus}</p>
                </div>
              )}
              {resumen?.updatedAt && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Actualizado</p>
                  <p className="mt-1 font-semibold text-slate-700">{formatDateTime(resumen.updatedAt)}</p>
                </div>
              )}
            </div>
          )}

          {resumen?.pagoId && (
            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={descargarPdf}
                disabled={pdfCargando}
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {pdfCargando ? 'Descargando recibo...' : 'Descargar recibo PDF'}
              </button>
              {pdfError && <p className="text-xs text-[#B01010]">{pdfError}</p>}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {(estado === 'aprobado' || esRutaExito) && (
              <button
                type="button"
                onClick={() => solicitarRedireccion('/mis-pagos', 'Dirigirse a pagos')}
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Dirigirse a pagos
              </button>
            )}
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

export default StripeReturnPage;
