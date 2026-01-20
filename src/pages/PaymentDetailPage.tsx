import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { descargarReciboPdf, obtenerPagoDetalle, type PagoDetalle } from '../services/api';

type EstadoDetalle = 'cargando' | 'listo' | 'error';

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

const resolverMetodoPago = (pago: PagoDetalle) => {
  if (pago.metodo === 'STRIPE') {
    return 'Stripe';
  }
  if (pago.metodo === 'OTRO' && pago.proveedor?.referencia?.startsWith('pi_')) {
    return 'Stripe';
  }
  return pago.metodo.replace(/_/g, ' ');
};

const PaymentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [detalle, setDetalle] = useState<PagoDetalle | null>(null);
  const [estado, setEstado] = useState<EstadoDetalle>('cargando');
  const [error, setError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfCargando, setPdfCargando] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !id) {
      setEstado('error');
      return;
    }

    let activo = true;
    setEstado('cargando');
    setError(null);

    obtenerPagoDetalle(id)
      .then((data) => {
        if (!activo) return;
        setDetalle(data);
        setEstado('listo');
      })
      .catch((err) => {
        if (!activo) return;
        const mensaje = err instanceof Error ? err.message : 'No se pudo cargar el pago.';
        setError(mensaje);
        setEstado('error');
      });

    return () => {
      activo = false;
    };
  }, [id, isAuthenticated]);

  const descargarPdf = async () => {
    if (!id) return;
    setPdfError(null);
    setPdfCargando(true);
    try {
      const blob = await descargarReciboPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo-${detalle?.pedido?.codigo || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo descargar el recibo.';
      setPdfError(mensaje);
    } finally {
      setPdfCargando(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-10 text-center shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
          <p className="text-xs uppercase tracking-[0.32em] text-[#B01010]">Detalle de pago</p>
          <h1 className="mt-3 font-display text-3xl text-slate-900">Inicia sesion</h1>
          <p className="mt-3 text-sm text-slate-600">
            Debes iniciar sesion para ver los detalles de este pago.
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

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-10 text-center shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
          <p className="text-sm text-[#B01010]">No se encontro el pago solicitado.</p>
        </div>
      </div>
    );
  }

  if (estado === 'cargando') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 text-center shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
          <p className="text-sm text-slate-600">Cargando detalle del pago...</p>
        </div>
      </div>
    );
  }

  if (estado === 'error' || !detalle) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-10 text-center shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
          <p className="text-sm text-[#B01010]">{error || 'No se pudo cargar el pago.'}</p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/mis-pagos"
              className="rounded-full border border-[#F0E0E0] px-6 py-3 text-sm font-semibold text-[#B01010] transition hover:bg-[#F7EAEA]"
            >
              Volver a mis pagos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const referencia = detalle.proveedor?.referencia ?? null;
  const mostrarReferencia =
    referencia != null && detalle.metodo !== 'STRIPE' && !referencia.startsWith('pi_');

  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-8 shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
          <p className={`text-xs uppercase tracking-[0.32em] ${estadoColor(detalle.estado)}`}>
            {estadoLabel(detalle.estado)}
          </p>
          <h1 className="mt-3 font-display text-3xl text-slate-900">Detalle de pago</h1>
          <p className="mt-3 text-sm text-slate-600">
            Pago ID: <span className="font-semibold text-slate-800">{detalle.pagoId}</span>
          </p>

          <div className="mt-6 grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Pedido</p>
              <p className="mt-1 font-semibold text-slate-700">
                {detalle.pedido?.codigo || detalle.pedido?.id || 'Sin pedido'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Metodo</p>
              <p className="mt-1 font-semibold text-slate-700">{resolverMetodoPago(detalle)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Monto</p>
              <p className="mt-1 font-semibold text-slate-700">{formatCurrency(detalle.monto)}</p>
            </div>
            {mostrarReferencia && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Referencia</p>
                <p className="mt-1 font-semibold text-slate-700">{referencia}</p>
              </div>
            )}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Creado</p>
              <p className="mt-1 font-semibold text-slate-700">{formatDateTime(detalle.createdAt)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Actualizado</p>
              <p className="mt-1 font-semibold text-slate-700">{formatDateTime(detalle.updatedAt)}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={descargarPdf}
              disabled={pdfCargando}
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pdfCargando ? 'Descargando recibo...' : 'Descargar recibo PDF'}
            </button>
            <Link
              to="/mis-pagos"
              className="rounded-full border border-[#F0E0E0] px-6 py-3 text-sm font-semibold text-[#B01010] transition hover:bg-[#F7EAEA]"
            >
              Volver a mis pagos
            </Link>
          </div>
          {pdfError && <p className="mt-2 text-xs text-[#B01010]">{pdfError}</p>}
        </div>
      </section>

      {detalle.pedido && (
        <section className="container mx-auto px-4">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
            <h2 className="text-xl font-semibold text-slate-900">Detalle del pedido</h2>
            <p className="mt-2 text-sm text-slate-600">
              Estado: <span className="font-semibold">{detalle.pedido.estado}</span>
            </p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Subtotal</p>
                <p className="mt-1 font-semibold text-slate-700">{formatCurrency(detalle.pedido.subtotalNeto || 0)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">IVA</p>
                <p className="mt-1 font-semibold text-slate-700">{formatCurrency(detalle.pedido.iva || 0)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Total</p>
                <p className="mt-1 font-semibold text-slate-700">{formatCurrency(detalle.pedido.total)}</p>
              </div>
            </div>

            {detalle.pedido.direccion && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Direccion de despacho</p>
                <p className="mt-2 font-semibold">{detalle.pedido.direccion.nombreContacto}</p>
                <p>{detalle.pedido.direccion.direccion}</p>
                <p>
                  {detalle.pedido.direccion.comuna}
                  {detalle.pedido.direccion.ciudad ? `, ${detalle.pedido.direccion.ciudad}` : ''}
                </p>
                <p>{detalle.pedido.direccion.region}</p>
                {detalle.pedido.direccion.telefono && <p>Tel: {detalle.pedido.direccion.telefono}</p>}
                {detalle.pedido.direccion.email && <p>Email: {detalle.pedido.direccion.email}</p>}
              </div>
            )}

            {detalle.pedido.items.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Items</p>
                {detalle.pedido.items.map((item, index) => (
                  <div
                    key={`${item.descripcionSnapshot}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
                  >
                    <p className="font-semibold text-slate-900">{item.descripcionSnapshot}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>Cantidad: {item.cantidad}</span>
                      <span>Total: {formatCurrency(item.totalSnapshot)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default PaymentDetailPage;
