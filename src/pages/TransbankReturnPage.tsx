import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { useCart } from '../context/CartContext';
import { obtenerPagoRecibo, type PagoRecibo, verificarSesion } from '../services/api';
import { covasaContact } from '../data/contact';
import { fetchImageBytes, formatCurrencyCLP, formatDateCL, wrapText } from '../utils/pdf';
import { uiLogger } from '../utils/logger';

type EstadoPago = 'cargando' | 'confirmado' | 'rechazado' | 'error';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const formatDateTime = (value?: string) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-CL');
};

const LOGO_URL = (import.meta.env.VITE_PDF_LOGO_URL as string | undefined) ?? '/img/covasa_chile.png';
const COMPANY_NAME = (import.meta.env.VITE_PDF_COMPANY_NAME as string | undefined) ?? 'COVASA';
const COMPANY_RUT = (import.meta.env.VITE_PDF_COMPANY_RUT as string | undefined) ?? '';
const COMPANY_ADDRESS =
  (import.meta.env.VITE_PDF_COMPANY_ADDRESS as string | undefined) ?? covasaContact.address;
const COMPANY_PHONE =
  (import.meta.env.VITE_PDF_COMPANY_PHONE as string | undefined) ?? covasaContact.phone;
const COMPANY_EMAIL =
  (import.meta.env.VITE_PDF_COMPANY_EMAIL as string | undefined) ?? covasaContact.email;
const COMPANY_WEBSITE =
  (import.meta.env.VITE_PDF_COMPANY_WEBSITE as string | undefined) ?? 'www.covasachile.cl';

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
      pedidoId: params.get('pedidoId') || '',
      estado: (params.get('estado') || '').toUpperCase(),
      status: (params.get('status') || '').toLowerCase(),
      tbkStatus: (params.get('tbkStatus') || '').toUpperCase(),
    };
  }, [location.search]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const hasToken = Boolean(window.localStorage.getItem('covasa_auth_token'));
    const hasUser = Boolean(window.localStorage.getItem('covasa_user'));
    uiLogger.debug('payment_return_auth_state', {
      metodo: 'transbank',
      hasToken,
      hasUser,
      origin: window.location.origin,
      path: window.location.pathname,
    });

    verificarSesion()
      .then((status) => {
        uiLogger.debug('payment_return_me_status', {
          metodo: 'transbank',
          ok: status.ok,
          status: status.status,
        });
      })
      .catch((error) => {
        const texto = error instanceof Error ? error.message : 'No se pudo validar la sesion.';
        uiLogger.warn('payment_return_me_error', { metodo: 'transbank', message: texto });
      });
  }, []);

  useEffect(() => {
    const estadoNormalizado =
      parametros.status === 'success'
        ? 'CONFIRMADO'
        : parametros.status === 'failed'
        ? 'RECHAZADO'
        : parametros.tbkStatus === 'AUTHORIZED'
        ? 'CONFIRMADO'
        : parametros.tbkStatus
        ? 'RECHAZADO'
        : parametros.estado;

    if (estadoNormalizado === 'CONFIRMADO') {
      setEstado('confirmado');
      setMensaje('Pago confirmado. Gracias por tu compra.');
      clearCart();
      uiLogger.info('payment_return', {
        metodo: 'transbank',
        estado: 'confirmado',
        pagoId: parametros.pagoId || null,
        pedidoId: parametros.pedidoId || null,
        status: parametros.status || null,
        tbkStatus: parametros.tbkStatus || null,
      });
      return;
    }

    if (estadoNormalizado === 'RECHAZADO') {
      setEstado('rechazado');
      setMensaje('El pago fue rechazado o no pudo confirmarse.');
      uiLogger.info('payment_return', {
        metodo: 'transbank',
        estado: 'rechazado',
        pagoId: parametros.pagoId || null,
        pedidoId: parametros.pedidoId || null,
        status: parametros.status || null,
        tbkStatus: parametros.tbkStatus || null,
      });
      return;
    }

    if (estadoNormalizado === 'ERROR') {
      setEstado('error');
      setMensaje('No pudimos confirmar el pago. Intenta nuevamente.');
      uiLogger.warn('payment_return_error', {
        metodo: 'transbank',
        pagoId: parametros.pagoId || null,
        pedidoId: parametros.pedidoId || null,
        status: parametros.status || null,
        tbkStatus: parametros.tbkStatus || null,
      });
      return;
    }

    setEstado('cargando');
    setMensaje('Confirmando tu pago con Transbank...');
  }, [
    parametros.estado,
    parametros.pagoId,
    parametros.pedidoId,
    parametros.status,
    parametros.tbkStatus,
    clearCart,
  ]);

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
        uiLogger.warn('payment_receipt_error', {
          metodo: 'transbank',
          pagoId: parametros.pagoId,
          message: texto,
        });
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
    const pageSize: [number, number] = [595.28, 841.89];
    const margin = 32;
    const headerHeight = 72;
    const footerHeight = 60;
    const contentWidth = pageSize[0] - margin * 2;
    const contentBottom = margin + footerHeight + 8;
    const contentTop = pageSize[1] - margin - headerHeight;

    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const colors = {
      primary: rgb(0.69, 0.06, 0.06),
      text: rgb(0.12, 0.12, 0.12),
      muted: rgb(0.45, 0.45, 0.45),
      line: rgb(0.9, 0.9, 0.9),
      headerFill: rgb(0.96, 0.96, 0.96),
    };

    const embedImageFromUrl = async (url: string) => {
      const payload = await fetchImageBytes(url);
      if (!payload) return null;
      try {
        if (payload.contentType?.includes('png')) {
          return await doc.embedPng(payload.bytes);
        }
        if (payload.contentType?.includes('jpeg') || payload.contentType?.includes('jpg')) {
          return await doc.embedJpg(payload.bytes);
        }
        return await doc.embedPng(payload.bytes);
      } catch {
        try {
          return await doc.embedJpg(payload.bytes);
        } catch {
          return null;
        }
      }
    };

    const logoImage = await embedImageFromUrl(LOGO_URL);

    let page = doc.addPage(pageSize);
    let pageNumber = 1;
    let cursorY = contentTop;

    const drawHeader = () => {
      const { width, height } = page.getSize();
      const top = height - margin;

      if (logoImage) {
        const dims = logoImage.scale(1);
        const maxHeight = 40;
        const scale = Math.min(maxHeight / dims.height, 1);
        const logoWidth = dims.width * scale;
        const logoHeight = dims.height * scale;
        page.drawImage(logoImage, {
          x: margin,
          y: top - logoHeight,
          width: logoWidth,
          height: logoHeight,
        });
      } else {
        page.drawText(COMPANY_NAME, {
          x: margin,
          y: top - 18,
          size: 16,
          font: bold,
          color: colors.primary,
        });
      }

      const title = 'Recibo de Pago';
      const titleSize = 18;
      const titleWidth = bold.widthOfTextAtSize(title, titleSize);
      page.drawText(title, {
        x: width - margin - titleWidth,
        y: top - titleSize,
        size: titleSize,
        font: bold,
        color: colors.primary,
      });

      const folio = `Folio: ${recibo.pagoId}`;
      const folioSize = 10;
      const folioWidth = font.widthOfTextAtSize(folio, folioSize);
      page.drawText(folio, {
        x: width - margin - folioWidth,
        y: top - titleSize - 16,
        size: folioSize,
        font,
        color: colors.muted,
      });

      page.drawLine({
        start: { x: margin, y: top - headerHeight + 8 },
        end: { x: width - margin, y: top - headerHeight + 8 },
        thickness: 0.5,
        color: colors.line,
      });
    };

    const drawFooter = () => {
      const { width } = page.getSize();
      const footerTop = margin + footerHeight;

      page.drawLine({
        start: { x: margin, y: footerTop },
        end: { x: width - margin, y: footerTop },
        thickness: 0.5,
        color: colors.line,
      });

      const footerParts = [
        COMPANY_NAME,
        COMPANY_RUT ? `RUT ${COMPANY_RUT}` : '',
        COMPANY_ADDRESS,
        COMPANY_PHONE,
        COMPANY_EMAIL,
        COMPANY_WEBSITE,
      ].filter(Boolean);
      const footerText = footerParts.join(' | ');
      const footerSize = 8;
      page.drawText(footerText, {
        x: margin,
        y: footerTop - 14,
        size: footerSize,
        font,
        color: colors.muted,
      });

      const pageLabel = `Pagina ${pageNumber}`;
      const pageLabelWidth = font.widthOfTextAtSize(pageLabel, footerSize);
      page.drawText(pageLabel, {
        x: width - margin - pageLabelWidth,
        y: footerTop - 14,
        size: footerSize,
        font,
        color: colors.muted,
      });
    };

    const addPage = () => {
      page = doc.addPage(pageSize);
      pageNumber += 1;
      drawHeader();
      drawFooter();
      cursorY = contentTop;
    };

    const ensureSpace = (height: number) => {
      if (cursorY - height < contentBottom) {
        addPage();
        return true;
      }
      return false;
    };

    const drawSectionTitle = (title: string) => {
      ensureSpace(26);
      const size = 12;
      page.drawText(title, {
        x: margin,
        y: cursorY - size,
        size,
        font: bold,
        color: colors.primary,
      });
      cursorY -= size + 6;
      page.drawLine({
        start: { x: margin, y: cursorY },
        end: { x: page.getSize().width - margin, y: cursorY },
        thickness: 0.5,
        color: colors.line,
      });
      cursorY -= 12;
    };

    const drawKeyValueColumn = (
      items: Array<{ label: string; value?: string | null }>,
      x: number,
      startY: number,
      width: number
    ) => {
      let y = startY;
      const labelSize = 8;
      const valueSize = 10;
      items.forEach((item) => {
        const value = (item.value ?? '').trim();
        if (!value) return;
        y -= labelSize;
        page.drawText(item.label.toUpperCase(), { x, y, size: labelSize, font, color: colors.muted });
        y -= 2;
        const lines = wrapText(value, width, font, valueSize);
        lines.forEach((line) => {
          y -= valueSize;
          page.drawText(line, { x, y, size: valueSize, font, color: colors.text });
          y -= 2;
        });
        y -= 6;
      });
      return y;
    };

    const drawKeyValueColumns = (
      left: Array<{ label: string; value?: string | null }>,
      right: Array<{ label: string; value?: string | null }>
    ) => {
      const colGap = 16;
      const colWidth = (contentWidth - colGap) / 2;
      const estimated = Math.max(left.length, right.length) * 22 + 10;
      ensureSpace(estimated);
      const startY = cursorY;
      const leftEnd = drawKeyValueColumn(left, margin, startY, colWidth);
      const rightEnd = drawKeyValueColumn(right, margin + colWidth + colGap, startY, colWidth);
      cursorY = Math.min(leftEnd, rightEnd) - 4;
    };

    drawHeader();
    drawFooter();

    const direccionLine = recibo.direccion
      ? [recibo.direccion.direccion, recibo.direccion.comuna, recibo.direccion.region]
          .filter(Boolean)
          .join(', ')
      : '';

    drawSectionTitle('Cliente y pedido');
    drawKeyValueColumns(
      [
        { label: 'Contacto', value: recibo.direccion?.nombreContacto ?? '' },
        { label: 'Email', value: recibo.direccion?.email ?? '' },
        { label: 'Telefono', value: recibo.direccion?.telefono ?? '' },
        { label: 'Direccion', value: direccionLine },
      ],
      [
        { label: 'Pedido', value: recibo.pedido.codigo || recibo.pedido.id },
        { label: 'Estado pedido', value: recibo.pedido.estado },
        { label: 'Fecha pedido', value: formatDateCL(recibo.pedido.createdAt) },
      ]
    );

    const transLeft = [
      { label: 'Pago ID', value: recibo.pagoId },
      { label: 'Estado pago', value: recibo.estado },
      { label: 'Metodo', value: recibo.metodo },
    ];
    if (recibo.transbank?.authorizationCode) {
      transLeft.push({ label: 'Autorizacion', value: recibo.transbank.authorizationCode });
    }
    if (recibo.transbank?.paymentTypeCode) {
      transLeft.push({ label: 'Tipo de pago', value: recibo.transbank.paymentTypeCode });
    }
    if (recibo.transbank?.cardNumber) {
      transLeft.push({ label: 'Tarjeta', value: recibo.transbank.cardNumber });
    }

    const transRight = [
      { label: 'Monto', value: formatCurrencyCLP(recibo.monto) },
      { label: 'Fecha pago', value: formatDateCL(recibo.createdAt) },
    ];
    if (recibo.transbank?.transactionDate) {
      transRight.push({ label: 'Fecha Transbank', value: formatDateCL(recibo.transbank.transactionDate) });
    }

    drawSectionTitle('Transaccion');
    drawKeyValueColumns(transLeft, transRight);

    ensureSpace(60);
    drawSectionTitle('Resumen');
    const totalsWidth = 220;
    const totalsX = page.getSize().width - margin - totalsWidth;
    const totalLines = [{ label: 'Total', value: formatCurrencyCLP(recibo.monto) }];
    totalLines.forEach((line) => {
      const labelSize = 9;
      const valueSize = 11;
      const labelWidth = totalsWidth * 0.55;
      page.drawText(line.label, {
        x: totalsX,
        y: cursorY - valueSize,
        size: labelSize,
        font,
        color: colors.muted,
      });
      const valueWidth = bold.widthOfTextAtSize(line.value, valueSize);
      page.drawText(line.value, {
        x: totalsX + totalsWidth - valueWidth,
        y: cursorY - valueSize,
        size: valueSize,
        font: bold,
        color: colors.text,
      });
      cursorY -= 18;
    });

    const pdfBytes = await doc.save(); // Uint8Array

    // FIX BlobPart estricto: ArrayBuffer real
    const ab = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);

    // No dependemos de tipos DOM: todo via any
    const g: any = globalThis as any;

    if (!g.Blob || !g.URL || typeof g.URL.createObjectURL !== 'function') {
      setDetalle('Tu entorno no soporta descarga de archivos (Blob/URL no disponible).');
      return;
    }

    const blob = new g.Blob([ab], { type: 'application/pdf' });
    const url = g.URL.createObjectURL(blob);
    const nombre = `comprobante-${recibo.pedido.codigo || recibo.pagoId}.pdf`;

    // Si no hay document, fallback abriendo el PDF en una pestana
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
