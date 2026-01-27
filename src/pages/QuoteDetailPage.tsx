import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PDFDocument, StandardFonts, rgb, type Color, type PDFFont } from 'pdf-lib';
import { obtenerCotizacionDetalle } from '../services/api';
import { useQuoteHistory } from '../context/QuoteHistoryContext';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Por confirmar';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Por confirmar';
  return date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
};

const parseObservaciones = (value?: string | null) => {
  if (!value) return {};
  try {
    return JSON.parse(value) as Record<string, string>;
  } catch {
    return { observaciones: value };
  }
};

const wrapText = (text: string, maxWidth: number, font: PDFFont, size: number) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth) {
      if (current) {
        lines.push(current);
      }
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines;
};

const QuoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { quotes, upsertQuote, removeQuote } = useQuoteHistory();
  const summary = quotes.find((quote) => quote.id === id && quote.ownerId === user?.id);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // BUGFIX: no hacemos GET automatico al entrar.
  // Solo descargamos cuando el usuario lo solicita.
  useEffect(() => {
    if (!id) {
      setError('No se encontro la cotizacion.');
    }
  }, [id]);

  const descargarPdf = async () => {
    if (downloading) {
      return;
    }
    if (!id) {
      setError('No se encontro la cotizacion.');
      return;
    }
    setDownloading(true);
    setError(null);
    try {
      const detalleActual = await obtenerCotizacionDetalle(id, { force: true });
      upsertQuote({
        id: detalleActual.id,
        ownerId: user?.id ?? null,
        codigo: detalleActual.codigo,
        total: detalleActual.total,
        estado: detalleActual.estado,
        createdAt: detalleActual.createdAt,
        nombreContacto: detalleActual.nombreContacto,
        itemsCount: detalleActual.items?.length ?? 0,
      });

      const observaciones = parseObservaciones(detalleActual.observaciones);
      const notas = [
        { label: 'Direccion', value: observaciones.direccion },
        { label: 'Tipo de obra', value: observaciones.tipoObra },
        { label: 'Comuna o region', value: observaciones.comunaRegion },
        { label: 'Ubicacion', value: observaciones.ubicacion },
        { label: 'Detalle adicional', value: observaciones.detalleAdicional },
        { label: 'Mensaje', value: observaciones.mensaje ?? observaciones.observaciones },
      ].filter((item) => item.value);

      const doc = await PDFDocument.create();
      const pageSize: [number, number] = [595.28, 841.89];
      let page = doc.addPage(pageSize);
      const { width, height } = page.getSize();
      const margin = 48;
      let y = height - margin;

      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);

      const ensureSpace = (space: number) => {
        if (y - space < margin) {
          page = doc.addPage(pageSize);
          y = height - margin;
        }
      };

      const drawText = (text: string, options?: { size?: number; font?: PDFFont; color?: Color }) => {
        const size = options?.size ?? 11;
        const currentFont = options?.font ?? font;
        const color = options?.color ?? rgb(0.15, 0.15, 0.15);
        ensureSpace(size + 6);
        page.drawText(text, { x: margin, y, size, font: currentFont, color });
        y -= size + 6;
      };

      drawText('COVASA', { size: 18, font: bold, color: rgb(0.69, 0.06, 0.06) });
      drawText('Cotizacion', { size: 16, font: bold });
      drawText(`Codigo: ${detalleActual.codigo || detalleActual.id}`, { size: 11 });
      drawText(`Fecha: ${formatDateTime(detalleActual.createdAt)}`, { size: 11 });
      drawText(`Estado: ${detalleActual.estado}`, { size: 11 });
      drawText(`Total: ${formatCurrency(detalleActual.total)}`, { size: 12, font: bold });

      y -= 6;
      drawText('Contacto', { size: 13, font: bold });
      drawText(`Nombre: ${detalleActual.nombreContacto}`);
      if (detalleActual.empresa) drawText(`Empresa: ${detalleActual.empresa}`);
      if (detalleActual.rut) drawText(`RUT: ${detalleActual.rut}`);
      if (detalleActual.email) drawText(`Email: ${detalleActual.email}`);
      if (detalleActual.telefono) drawText(`Telefono: ${detalleActual.telefono}`);

      if (notas.length > 0) {
        y -= 6;
        drawText('Observaciones', { size: 13, font: bold });
        notas.forEach((nota) => {
          const line = `${nota.label}: ${nota.value}`;
          const lines = wrapText(line, width - margin * 2, font, 11);
          lines.forEach((textLine) => drawText(textLine));
        });
      }

      y -= 6;
      drawText('Items', { size: 13, font: bold });

      detalleActual.items?.forEach((item, index) => {
        const header = `${index + 1}. ${item.descripcionSnapshot} (${item.cantidad} ${item.unidadSnapshot ?? 'unidad'})`;
        const headerLines = wrapText(header, width - margin * 2, font, 11);
        headerLines.forEach((line) => drawText(line));
        if (item.skuSnapshot) {
          drawText(`SKU: ${item.skuSnapshot}`, { size: 10 });
        }
        drawText(`Neto unitario: ${formatCurrency(item.precioUnitarioNetoSnapshot)} | Total: ${formatCurrency(item.totalSnapshot)}`, {
          size: 10,
        });
        if (item.observacion) {
          const obsLines = wrapText(`Observacion: ${item.observacion}`, width - margin * 2, font, 10);
          obsLines.forEach((line) => drawText(line, { size: 10 }));
        }
        y -= 4;
      });

      y -= 6;
      drawText('Totales', { size: 13, font: bold });
      drawText(`Subtotal neto: ${formatCurrency(detalleActual.subtotalNeto)}`);
      drawText(`IVA: ${formatCurrency(detalleActual.iva)}`);
      drawText(`Total: ${formatCurrency(detalleActual.total)}`, { font: bold });

      const bytes = await doc.save();
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotizacion-${detalleActual.codigo || detalleActual.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo descargar la cotizacion.';
      setError(mensaje);
    } finally {
      setDownloading(false);
    }
  };

  const handleRetry = () => {
    void descargarPdf();
  };

  const handleRemove = () => {
    if (!id) {
      return;
    }
    if (typeof window !== 'undefined' && !window.confirm('Quitar esta cotizacion de tu lista?')) {
      return;
    }
    removeQuote(id);
    navigate('/mis-cotizaciones');
  };

  const codigo = summary?.codigo || id || '---';
  const total = summary?.total ?? 0;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-10 text-center shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
          <p className="text-xs uppercase tracking-[0.32em] text-[#B01010]">Detalle de cotización</p>
          <h1 className="mt-3 font-display text-3xl text-slate-900">Inicia sesión</h1>
          <p className="mt-3 text-sm text-slate-600">
            Debes iniciar sesión para ver esta cotización.
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
            <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Detalle de cotizacion</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl">{codigo}</h1>
            <p className="max-w-2xl text-sm text-white/75">
              Consulta los datos de tu solicitud y descarga la cotizacion en PDF.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/mis-cotizaciones"
              className="rounded-full border border-[#F0E0E0] px-5 py-2.5 text-sm font-semibold text-[#B01010] transition hover:bg-[#F7EAEA]"
            >
              Volver
            </Link>
            <button
              type="button"
              onClick={descargarPdf}
              disabled={downloading}
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(16,185,129,0.35)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? 'Generando PDF...' : 'Descargar PDF'}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-full border border-[#F0E0E0] px-5 py-2.5 text-sm font-semibold text-[#B01010] transition hover:bg-[#F7EAEA]"
            >
              Eliminar de mis cotizaciones
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Total</p>
            <p className="mt-1 font-semibold text-slate-900">{formatCurrency(total)}</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-[#F0E0E0] bg-[#F7EAEA] px-4 py-3 text-sm text-[#B01010]">
            <p>{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 rounded-full border border-[#F0E0E0] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B01010] transition hover:bg-[#F7EAEA]"
            >
              Reintentar descarga
            </button>
          </div>
        )}

        {!error && summary?.createdAt && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-[0_18px_40px_rgba(15,23,32,0.08)]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fecha</p>
            <p className="mt-1 font-semibold text-slate-900">{formatDateTime(summary.createdAt)}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default QuoteDetailPage;
