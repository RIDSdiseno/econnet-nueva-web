import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PDFDocument, StandardFonts, rgb, type Color, type PDFFont } from 'pdf-lib';
import { obtenerCotizacionDetalle, type CotizacionDetalle } from '../services/api';
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
  const [detalle, setDetalle] = useState<CotizacionDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [refetchIndex, setRefetchIndex] = useState(0);

  // DIAGNOSTICO (Fase 1): el GET a /api/ecommerce/cotizaciones/:id se dispara aqui (obtenerCotizacionDetalle).
  // CAUSA: el efecto se re-ejecutaba con demasiada frecuencia y el backend respondia 304 sin body,
  // generando loop y flicker. Se corrige con deps estables, dedupe/cache en API y refetch manual.
  // BUGFIX: prevent duplicate fetches (StrictMode/double render) and only refetch on id change or user action.
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    if (!id) {
      setError('No se encontro la cotizacion.');
      setLoading(false);
      return;
    }

    let activo = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    obtenerCotizacionDetalle(id, { signal: controller.signal, force: refetchIndex > 0 })
      .then((data) => {
        if (!activo) {
          return;
        }
        setDetalle(data);
        upsertQuote({
          id: data.id,
          ownerId: user?.id ?? null,
          codigo: data.codigo,
          total: data.total,
          estado: data.estado,
          createdAt: data.createdAt,
          nombreContacto: data.nombreContacto,
          itemsCount: data.items?.length ?? 0,
        });
      })
      .catch((err) => {
        if (!activo) {
          return;
        }
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        const mensaje = err instanceof Error ? err.message : 'No se pudo cargar el detalle de la cotizacion.';
        setError(mensaje);
      })
      .finally(() => {
        if (activo) {
          setLoading(false);
        }
      });

    return () => {
      activo = false;
      controller.abort();
    };
  }, [id, refetchIndex, isAuthenticated, upsertQuote, user?.id]);

  const handleRetry = () => setRefetchIndex((prev) => prev + 1);

  const observaciones = useMemo(() => parseObservaciones(detalle?.observaciones), [detalle?.observaciones]);

  const notas = [
    { label: 'Direccion', value: observaciones.direccion },
    { label: 'Tipo de obra', value: observaciones.tipoObra },
    { label: 'Comuna o region', value: observaciones.comunaRegion },
    { label: 'Ubicacion', value: observaciones.ubicacion },
    { label: 'Detalle adicional', value: observaciones.detalleAdicional },
    { label: 'Mensaje', value: observaciones.mensaje ?? observaciones.observaciones },
  ].filter((item) => item.value);

  const descargarPdf = async () => {
    if (!detalle) {
      return;
    }

    setDownloading(true);
    try {
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
      drawText(`Codigo: ${detalle.codigo || detalle.id}`, { size: 11 });
      drawText(`Fecha: ${formatDateTime(detalle.createdAt)}`, { size: 11 });
      drawText(`Estado: ${detalle.estado}`, { size: 11 });
      drawText(`Total: ${formatCurrency(detalle.total)}`, { size: 12, font: bold });

      y -= 6;
      drawText('Contacto', { size: 13, font: bold });
      drawText(`Nombre: ${detalle.nombreContacto}`);
      if (detalle.empresa) drawText(`Empresa: ${detalle.empresa}`);
      if (detalle.rut) drawText(`RUT: ${detalle.rut}`);
      if (detalle.email) drawText(`Email: ${detalle.email}`);
      if (detalle.telefono) drawText(`Telefono: ${detalle.telefono}`);

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

      detalle.items?.forEach((item, index) => {
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
      drawText(`Subtotal neto: ${formatCurrency(detalle.subtotalNeto)}`);
      drawText(`IVA: ${formatCurrency(detalle.iva)}`);
      drawText(`Total: ${formatCurrency(detalle.total)}`, { font: bold });

      const bytes = await doc.save();
      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotizacion-${detalle.codigo || detalle.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
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

  const codigo = detalle?.codigo || summary?.codigo || id || '---';
  const total = detalle?.total ?? summary?.total ?? 0;

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
              onClick={handleRetry}
              disabled={loading}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button
              type="button"
              onClick={descargarPdf}
              disabled={!detalle || downloading}
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

        {loading && !detalle && (
          <p className="mt-6 text-sm text-slate-500">Cargando detalle de la cotizacion...</p>
        )}
        {loading && detalle && (
          <p className="mt-6 text-sm text-slate-500">Actualizando detalle de la cotizacion...</p>
        )}
        {error && (
          <div className="mt-6 rounded-2xl border border-[#F0E0E0] bg-[#F7EAEA] px-4 py-3 text-sm text-[#B01010]">
            <p>{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 rounded-full border border-[#F0E0E0] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B01010] transition hover:bg-[#F7EAEA]"
            >
              Reintentar
            </button>
          </div>
        )}

        {detalle && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="zoom-card space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Codigo</p>
                  <p className="mt-1 font-semibold text-slate-900">{detalle.codigo || detalle.id}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Fecha</p>
                  <p className="mt-1 font-semibold text-slate-900">{formatDateTime(detalle.createdAt)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Estado</p>
                  <p className="mt-1 font-semibold text-slate-900">{detalle.estado}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Contacto</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Nombre</p>
                    <p className="mt-1 font-semibold text-slate-900">{detalle.nombreContacto}</p>
                  </div>
                  {detalle.empresa && (
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Empresa</p>
                      <p className="mt-1 font-semibold text-slate-900">{detalle.empresa}</p>
                    </div>
                  )}
                  {detalle.email && (
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Email</p>
                      <p className="mt-1 font-semibold text-slate-900">{detalle.email}</p>
                    </div>
                  )}
                  {detalle.telefono && (
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Telefono</p>
                      <p className="mt-1 font-semibold text-slate-900">{detalle.telefono}</p>
                    </div>
                  )}
                  {detalle.rut && (
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">RUT</p>
                      <p className="mt-1 font-semibold text-slate-900">{detalle.rut}</p>
                    </div>
                  )}
                </div>
              </div>

              {notas.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Observaciones</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    {notas.map((nota) => (
                      <div key={nota.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">{nota.label}</p>
                        <p className="mt-1 font-semibold text-slate-900">{nota.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="zoom-card space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Items</p>
              {detalle.items?.length ? (
                <div className="space-y-3">
                  {detalle.items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                      <p className="text-sm font-semibold text-slate-900">{item.descripcionSnapshot}</p>
                      <p className="text-xs text-slate-500">
                        {item.cantidad} {item.unidadSnapshot ?? 'unidad'} - {formatCurrency(item.precioUnitarioNetoSnapshot)}
                      </p>
                      {item.skuSnapshot && <p className="text-xs text-slate-400">SKU {item.skuSnapshot}</p>}
                      {item.observacion && <p className="text-xs text-slate-600">Obs: {item.observacion}</p>}
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        Total item: {formatCurrency(item.totalSnapshot)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No hay items registrados.</p>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Subtotal neto</p>
                <p className="mt-1 font-semibold text-slate-900">{formatCurrency(detalle.subtotalNeto)}</p>
                <p className="mt-3 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">IVA</p>
                <p className="mt-1 font-semibold text-slate-900">{formatCurrency(detalle.iva)}</p>
                <p className="mt-3 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Total</p>
                <p className="mt-1 text-lg font-semibold text-[#B01010]">{formatCurrency(detalle.total)}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !detalle && summary && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
            <p className="font-semibold text-slate-900">Resumen disponible</p>
            <p className="mt-2">No pudimos cargar el detalle, pero la cotizacion sigue guardada.</p>
            <p className="mt-2">Fecha: {formatDateTime(summary.createdAt)}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default QuoteDetailPage;
