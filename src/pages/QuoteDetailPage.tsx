import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { eliminarCotizacion, obtenerCotizacionDetalle, obtenerProductoPorId } from '../services/api';
import { useQuoteHistory } from '../context/QuoteHistoryContext';
import { useAuth } from '../context/AuthContext';
import { covasaContact } from '../data/contact';
import { getProductImages } from '../utils/productImages';
import { fetchImageBytes, formatCurrencyCLP, formatDateCL, wrapText } from '../utils/pdf';

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
const LOGO_URL = (import.meta.env.VITE_PDF_LOGO_URL as string | undefined) ?? '/img/covasa_chile.png';
const PDF_VALIDITY_DAYS = Number(import.meta.env.VITE_PDF_QUOTE_VALIDITY_DAYS ?? '7');
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

const productImageCache = new Map<string, string | null>();
const productImagePromiseCache = new Map<string, Promise<string | null>>();

const resolveProductImage = async (productId: string) => {
  if (productImageCache.has(productId)) {
    return productImageCache.get(productId) ?? null;
  }
  const existingPromise = productImagePromiseCache.get(productId);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = (async () => {
    try {
      const product = await obtenerProductoPorId(productId);
      const images = getProductImages(product);
      const resolved = images[0] ?? product.image ?? null;
      productImageCache.set(productId, resolved);
      return resolved;
    } catch {
      productImageCache.set(productId, null);
      return null;
    } finally {
      productImagePromiseCache.delete(productId);
    }
  })();

  productImagePromiseCache.set(productId, promise);
  return promise;
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

      const uniqueProductIds = Array.from(
        new Set((detalleActual.items ?? []).map((item) => item.productoId).filter(Boolean))
      );
      const productImages = new Map<string, string | null>();
      const queue = [...uniqueProductIds];
      const workers = Array.from({ length: Math.min(4, queue.length) }, async () => {
        while (queue.length) {
          const nextId = queue.shift();
          if (!nextId) break;
          const image = await resolveProductImage(nextId);
          productImages.set(nextId, image);
        }
      });
      await Promise.all(workers);

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

      const embeddedImageCache = new Map<string, any>();
      const embedImageFromUrl = async (url: string) => {
        if (embeddedImageCache.has(url)) {
          return embeddedImageCache.get(url);
        }
        const payload = await fetchImageBytes(url);
        if (!payload) {
          embeddedImageCache.set(url, null);
          return null;
        }
        let image: any = null;
        try {
          if (payload.contentType?.includes('png')) {
            image = await doc.embedPng(payload.bytes);
          } else if (payload.contentType?.includes('jpeg') || payload.contentType?.includes('jpg')) {
            image = await doc.embedJpg(payload.bytes);
          } else {
            image = await doc.embedPng(payload.bytes);
          }
        } catch {
          try {
            image = await doc.embedJpg(payload.bytes);
          } catch {
            image = null;
          }
        }
        embeddedImageCache.set(url, image);
        return image;
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

        const title = 'Cotizacion';
        const titleSize = 18;
        const titleWidth = bold.widthOfTextAtSize(title, titleSize);
        page.drawText(title, {
          x: width - margin - titleWidth,
          y: top - titleSize,
          size: titleSize,
          font: bold,
          color: colors.primary,
        });

        const folio = `Folio: ${detalleActual.codigo || detalleActual.id}`;
        const folioSize = 10;
        const folioWidth = font.widthOfTextAtSize(folio, folioSize);
        page.drawText(folio, {
          x: width - margin - folioWidth,
          y: top - titleSize - 16,
          size: folioSize,
          font,
          color: colors.muted,
        });

        const fecha = `Fecha: ${formatDateCL(detalleActual.createdAt)}`;
        const fechaWidth = font.widthOfTextAtSize(fecha, folioSize);
        page.drawText(fecha, {
          x: width - margin - fechaWidth,
          y: top - titleSize - 30,
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

      const drawParagraph = (text: string, size = 10) => {
        const lines = wrapText(text, contentWidth, font, size);
        lines.forEach((line) => {
          ensureSpace(size + 4);
          page.drawText(line, {
            x: margin,
            y: cursorY - size,
            size,
            font,
            color: colors.text,
          });
          cursorY -= size + 4;
        });
        cursorY -= 4;
      };

      const tableColumns = [
        { key: 'image', label: 'Imagen', width: 52 },
        { key: 'producto', label: 'Producto', width: 220 },
        { key: 'sku', label: 'SKU', width: 70 },
        { key: 'cantidad', label: 'Cant.', width: 45 },
        { key: 'unitario', label: 'P. unitario', width: 70 },
        { key: 'subtotal', label: 'Subtotal', width: 74 },
      ];

      const tableXMap: Record<string, number> = {};
      let runningX = margin;
      tableColumns.forEach((col) => {
        tableXMap[col.key] = runningX;
        runningX += col.width;
      });

      const drawTableHeader = () => {
        const headerHeightPx = 20;
        ensureSpace(headerHeightPx + 4);
        const headerTop = cursorY;
        const headerBottom = cursorY - headerHeightPx;
        page.drawRectangle({
          x: margin,
          y: headerBottom,
          width: contentWidth,
          height: headerHeightPx,
          color: colors.headerFill,
        });
        let x = margin;
        const textY = headerBottom + 6;
        tableColumns.forEach((column) => {
          page.drawText(column.label, {
            x: x + 4,
            y: textY,
            size: 9,
            font: bold,
            color: colors.muted,
          });
          x += column.width;
        });
        cursorY = headerBottom - 6;
      };

      const drawAlignedText = (
        text: string,
        x: number,
        width: number,
        y: number,
        size: number,
        align: 'left' | 'center' | 'right'
      ) => {
        const textWidth = font.widthOfTextAtSize(text, size);
        let drawX = x + 4;
        if (align === 'right') {
          drawX = x + width - textWidth - 4;
        } else if (align === 'center') {
          drawX = x + (width - textWidth) / 2;
        }
        page.drawText(text, { x: drawX, y, size, font, color: colors.text });
      };

      const drawItemRow = async (item: (typeof detalleActual.items)[number]) => {
        const rowPadding = 6;
        const productText = item.observacion
          ? `${item.descripcionSnapshot} | Obs: ${item.observacion}`
          : item.descripcionSnapshot;
        const productLines = wrapText(productText, tableColumns[1].width - 8, font, 10);
        const lineHeight = 12;
        const textHeight = productLines.length * lineHeight;
        const imageBox = 40;
        const rowHeight = Math.max(textHeight, imageBox) + rowPadding * 2;

        if (ensureSpace(rowHeight + 4)) {
          drawTableHeader();
        }

        const rowTop = cursorY;
        const rowBottom = cursorY - rowHeight;

        const imageUrl = productImages.get(item.productoId) ?? null;
        const image = imageUrl ? await embedImageFromUrl(imageUrl) : null;
        const imageX = margin + (tableColumns[0].width - imageBox) / 2;
        const imageY = rowTop - rowPadding - imageBox;

        if (image) {
          const dims = image.scale(1);
          const scale = Math.min(imageBox / dims.width, imageBox / dims.height, 1);
          const drawWidth = dims.width * scale;
          const drawHeight = dims.height * scale;
          const drawX = margin + (tableColumns[0].width - drawWidth) / 2;
          const drawY = rowTop - rowPadding - drawHeight;
          page.drawImage(image, { x: drawX, y: drawY, width: drawWidth, height: drawHeight });
        } else {
          page.drawRectangle({
            x: imageX,
            y: imageY,
            width: imageBox,
            height: imageBox,
            borderColor: colors.line,
            borderWidth: 0.5,
          });
          const placeholder = 'Sin imagen';
          const placeholderSize = 7;
          const placeholderWidth = font.widthOfTextAtSize(placeholder, placeholderSize);
          page.drawText(placeholder, {
            x: imageX + (imageBox - placeholderWidth) / 2,
            y: imageY + imageBox / 2 - 4,
            size: placeholderSize,
            font,
            color: colors.muted,
          });
        }

        let textY = rowTop - rowPadding - 10;
        productLines.forEach((line) => {
          page.drawText(line, {
            x: tableXMap.producto + 4,
            y: textY,
            size: 10,
            font,
            color: colors.text,
          });
          textY -= lineHeight;
        });

        const sku = item.skuSnapshot || '-';
        drawAlignedText(sku, tableXMap.sku, tableColumns[2].width, rowTop - rowPadding - 10, 9, 'left');
        drawAlignedText(
          String(item.cantidad),
          tableXMap.cantidad,
          tableColumns[3].width,
          rowTop - rowPadding - 10,
          9,
          'center'
        );
        drawAlignedText(
          formatCurrencyCLP(item.precioUnitarioNetoSnapshot),
          tableXMap.unitario,
          tableColumns[4].width,
          rowTop - rowPadding - 10,
          9,
          'right'
        );
        drawAlignedText(
          formatCurrencyCLP(item.subtotalNetoSnapshot),
          tableXMap.subtotal,
          tableColumns[5].width,
          rowTop - rowPadding - 10,
          9,
          'right'
        );

        page.drawLine({
          start: { x: margin, y: rowBottom },
          end: { x: page.getSize().width - margin, y: rowBottom },
          thickness: 0.5,
          color: colors.line,
        });

        cursorY = rowBottom - 6;
      };

      drawHeader();
      drawFooter();

      drawSectionTitle('Cliente y cotizacion');
      drawKeyValueColumns(
        [
          { label: 'Contacto', value: detalleActual.nombreContacto },
          { label: 'Empresa', value: detalleActual.empresa ?? '' },
          { label: 'RUT', value: detalleActual.rut ?? '' },
          { label: 'Email', value: detalleActual.email ?? '' },
          { label: 'Telefono', value: detalleActual.telefono ?? '' },
        ],
        [
          { label: 'Folio', value: detalleActual.codigo || detalleActual.id },
          { label: 'Fecha', value: formatDateCL(detalleActual.createdAt) },
          { label: 'Estado', value: detalleActual.estado },
          {
            label: 'Valida',
            value: Number.isFinite(PDF_VALIDITY_DAYS) && PDF_VALIDITY_DAYS > 0 ? `${PDF_VALIDITY_DAYS} dias` : '',
          },
          { label: 'Total', value: formatCurrencyCLP(detalleActual.total) },
        ]
      );

      if (notas.length > 0) {
        drawSectionTitle('Observaciones');
        notas.forEach((nota) => {
          drawParagraph(`${nota.label}: ${nota.value}`);
        });
      }

      drawSectionTitle('Detalle de productos');
      if (!detalleActual.items?.length) {
        drawParagraph('No hay items registrados en la cotizacion.');
      } else {
        drawTableHeader();

        for (const item of detalleActual.items ?? []) {
          // eslint-disable-next-line no-await-in-loop
          await drawItemRow(item);
        }
      }

      ensureSpace(90);
      drawSectionTitle('Totales');
      const totalsWidth = 220;
      const totalsX = page.getSize().width - margin - totalsWidth;
      const totalLines = [
        { label: 'Subtotal neto', value: formatCurrencyCLP(detalleActual.subtotalNeto) },
        { label: 'IVA', value: formatCurrencyCLP(detalleActual.iva) },
        { label: 'Total', value: formatCurrencyCLP(detalleActual.total) },
      ];
      totalLines.forEach((line, index) => {
        const labelSize = 9;
        const valueSize = index === totalLines.length - 1 ? 11 : 10;
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
          font: index === totalLines.length - 1 ? bold : font,
          color: colors.text,
        });
        cursorY -= 16;
      });

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

  const handleRemove = async () => {
    if (!id) {
      return;
    }
    if (typeof window !== 'undefined' && !window.confirm('Quitar esta cotizacion de tu lista?')) {
      return;
    }
    setError(null);
    try {
      await eliminarCotizacion(id);
      removeQuote(id);
      navigate('/mis-cotizaciones');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo eliminar la cotizacion.';
      setError(mensaje);
    }
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
