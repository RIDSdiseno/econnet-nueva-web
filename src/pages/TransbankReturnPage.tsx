import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { useCart } from '../context/CartContext';
import { obtenerPagoRecibo, type PagoRecibo } from '../services/api';

type EstadoPago = 'cargando' | 'confirmado' | 'rechazado' | 'error';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const formatDateTime = (value?: string) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-CL');
};

const TransbankReturnPage = () => {
  const location = useLocation();
  const { clearCart } = useCart();
  const [estado, setEstado] = useState<EstadoPago>('cargando');
  const [mensaje, setMensaje] = useState('Procesando el pago con Transbank...');
  const [detalle, setDetalle] = useState<string | null>(null);
  const [recibo, setRecibo] = useState<PagoRecibo | null>(null);
  const [confirmacion, setConfirmacion] = useState<{ destino: string; titulo: string } | null>(null);

  const parametros = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      pagoId: params.get('pagoId') || '',
      estado: (params.get('estado') || '').toUpperCase(),
    };
  }, [location.search]);

  useEffect(() => {
    if (parametros.estado === 'CONFIRMADO') {
      setEstado('confirmado');
      setMensaje('Pago confirmado. Gracias por tu compra.');
      clearCart();
      return;
    }

    if (parametros.estado === 'RECHAZADO') {
      setEstado('rechazado');
      setMensaje('El pago fue rechazado o no pudo confirmarse.');
      return;
    }

    if (parametros.estado === 'ERROR') {
      setEstado('error');
      setMensaje('No pudimos confirmar el pago. Intenta nuevamente.');
      return;
    }

    setEstado('cargando');
    setMensaje('Confirmando tu pago con Transbank...');
  }, [parametros.estado, clearCart]);

  useEffect(() => {
    let activo = true;

    if (!parametros.pagoId) {
      setDetalle('No se pudo identificar el pago.');
      return;
    }

    obtenerPagoRecibo(parametros.pagoId)
      .then((data) => {
        if (!activo) return;
        setRecibo(data);
      })
      .catch((error) => {
        if (!activo) return;
        const texto = error instanceof Error ? error.message : 'No se pudo cargar el recibo.';
        setDetalle(texto);
      });

    return () => {
      activo = false;
    };
  }, [parametros.pagoId]);

  const estadoLabel =
    estado === 'confirmado'
      ? 'Pago confirmado'
      : estado === 'rechazado'
      ? 'Pago rechazado'
      : estado === 'error'
      ? 'Error de pago'
      : 'Procesando pago';

  const estadoClase =
    estado === 'confirmado'
      ? 'text-emerald-600'
      : estado === 'rechazado'
      ? 'text-amber-600'
      : estado === 'error'
      ? 'text-[#B01010]'
      : 'text-slate-500';

 const descargarComprobante = async () => {
  if (!recibo) return;

  try {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const lines: string[] = [
      `Pedido: ${recibo.pedido.codigo || recibo.pedido.id}`,
      `Estado pedido: ${recibo.pedido.estado}`,
      `Pago ID: ${recibo.pagoId}`,
      `Estado pago: ${recibo.estado}`,
      `Monto: ${formatCurrency(recibo.monto)}`,
      `Fecha y hora del pedido: ${formatDateTime(recibo.pedido.createdAt)}`,
      `Fecha y hora del pago: ${formatDateTime(recibo.createdAt)}`,
    ];

    if (recibo.transbank?.authorizationCode) lines.push(`Autorizacion: ${recibo.transbank.authorizationCode}`);
    if (recibo.transbank?.paymentTypeCode) lines.push(`Tipo de pago: ${recibo.transbank.paymentTypeCode}`);
    if (recibo.transbank?.cardNumber) lines.push(`Tarjeta: ${recibo.transbank.cardNumber}`);

    let y = page.getHeight() - 72;
    page.drawText('COMPROBANTE DE PAGO - TRANSBANK', { x: 72, y, size: 16, font: fontBold });

    y -= 32;
    for (const line of lines) {
      page.drawText(line, { x: 72, y, size: 11, font });
      y -= 18;
    }

    const pdfBytes = await doc.save(); // Uint8Array

    // ✅ FIX BlobPart estricto: ArrayBuffer "real"
    const ab = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);

    // ✅ No dependemos de tipos DOM: todo via any
    const g: any = globalThis as any;

    if (!g.Blob || !g.URL || typeof g.URL.createObjectURL !== 'function') {
      setDetalle('Tu entorno no soporta descarga de archivos (Blob/URL no disponible).');
      return;
    }

    const blob = new g.Blob([ab], { type: 'application/pdf' });
    const url = g.URL.createObjectURL(blob);
    const nombre = `comprobante-${recibo.pedido.codigo || recibo.pagoId}.pdf`;

    // ✅ Si no hay document, fallback abriendo el PDF en una pestaña
    if (!g.document || typeof g.document.createElement !== 'function') {
      g.open?.(url, '_blank');
      setTimeout(() => g.URL.revokeObjectURL(url), 1500);
      return;
    }

    const enlace = g.document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    enlace.rel = 'noopener';
    enlace.target = '_blank';

    // Asegura que funcione en todos los browsers
    g.document.body?.appendChild(enlace);
    enlace.click();
    enlace.remove?.();

    setTimeout(() => g.URL.revokeObjectURL(url), 1500);
  } catch (error) {
    const texto = error instanceof Error ? error.message : 'No se pudo generar el comprobante.';
    setDetalle(texto);
  }
};


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
          <h1 className="mt-3 font-display text-3xl text-slate-900">Pago Transbank</h1>
          <p className="mt-3 text-sm text-slate-600">{mensaje}</p>

          {detalle && <p className="mt-2 text-xs text-slate-500">{detalle}</p>}

          {recibo && (
            <div className="mt-6 grid gap-3 text-xs text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Pedido</p>
                <p className="mt-1 font-semibold text-slate-700">{recibo.pedido.codigo}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Monto</p>
                <p className="mt-1 font-semibold text-slate-700">{formatCurrency(recibo.monto)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Pago ID</p>
                <p className="mt-1 font-semibold text-slate-700">{recibo.pagoId}</p>
              </div>
              {recibo.transbank?.authorizationCode && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Autorizacion</p>
                  <p className="mt-1 font-semibold text-slate-700">{recibo.transbank.authorizationCode}</p>
                </div>
              )}
              {recibo.transbank?.paymentTypeCode && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Tipo de pago</p>
                  <p className="mt-1 font-semibold text-slate-700">{recibo.transbank.paymentTypeCode}</p>
                </div>
              )}
              {recibo.transbank?.cardNumber && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Tarjeta</p>
                  <p className="mt-1 font-semibold text-slate-700">{recibo.transbank.cardNumber}</p>
                </div>
              )}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Fecha pedido</p>
                <p className="mt-1 font-semibold text-slate-700">{formatDateTime(recibo.pedido.createdAt)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Fecha pago</p>
                <p className="mt-1 font-semibold text-slate-700">{formatDateTime(recibo.createdAt)}</p>
              </div>
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
            <button
              type="button"
              disabled={!recibo}
              onClick={() => void descargarComprobante()}
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Descargar comprobante PDF
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

export default TransbankReturnPage;
