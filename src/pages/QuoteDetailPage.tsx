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
      const margin = 28;
      const headerHeight = 110;
      const footerHeight = 60;
      const contentWidth = pageSize[0] - margin * 2;
      const contentBottom = margin + footerHeight + 10;
      const contentTop = pageSize[1] - margin - headerHeight;

      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      const colors = {
        primary: rgb(0.69, 0.06, 0.06),
        text: rgb(0.12, 0.12, 0.12),
        muted: rgb(0.42, 0.42, 0.42),
        line: rgb(0.88, 0.88, 0.88),
        headerFill: rgb(0.96, 0.96, 0.96),
        rowFill: rgb(0.985, 0.985, 0.985),
        softFill: rgb(0.99, 0.99, 0.99),
      };

      const embeddedImageCache = new Map<string, any>();
      const embedImageFromUrl = async (url: string) => {
        if (embeddedImageCache.has(url)) {
          return embeddedImageCache.get(url);
        }
        const payload = await fetchImageBytes(url, { maxBytes: 1_500_000, timeoutMs: 7000 });
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
        const headerBottom = top - headerHeight;

        if (logoImage) {
          const dims = logoImage.scale(1);
          const maxWidth = 170;
          const maxHeight = 60;
          const scale = Math.min(maxWidth / dims.width, maxHeight / dims.height, 1);
          const logoWidth = dims.width * scale;
          const logoHeight = dims.height * scale;
          page.drawImage(logoImage, {
            x: margin,
            y: top - 12 - logoHeight,
            width: logoWidth,
            height: logoHeight,
          });
        } else {
          page.drawText(COMPANY_NAME, {
            x: margin,
            y: top - 28,
            size: 18,
            font: bold,
            color: colors.primary,
          });
        }

        const boxWidth = 190;
        const boxHeight = 60;
        const boxX = width - margin - boxWidth;
        const boxY = top - boxHeight - 10;
        page.drawRectangle({
          x: boxX,
          y: boxY,
          width: boxWidth,
          height: boxHeight,
          borderColor: colors.line,
          borderWidth: 1,
          color: colors.headerFill,
        });

        page.drawText('COTIZACION', {
          x: boxX + 10,
          y: boxY + boxHeight - 20,
          size: 14,
          font: bold,
          color: colors.primary,
        });
        page.drawText(`Folio: ${detalleActual.codigo || detalleActual.id}`, {
          x: boxX + 10,
          y: boxY + boxHeight - 36,
          size: 9,
          font,
          color: colors.text,
        });
        page.drawText(`Fecha: ${formatDateCL(detalleActual.createdAt)}`, {
          x: boxX + 10,
          y: boxY + 12,
          size: 9,
          font,
          color: colors.text,
        });

        page.drawLine({
          start: { x: margin, y: headerBottom + 6 },
          end: { x: width - margin, y: headerBottom + 6 },
          thickness: 0.6,
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
        ensureSpace(24);
        const size = 11;
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
          thickness: 0.6,
          color: colors.line,
        });
        cursorY -= 10;
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

      const safeText = (value?: string | number | null) => {
        if (value === undefined || value === null) return '-';
        const text = String(value).trim();
        return text ? text : '-';
      };

      const buildLines = (lines: string[], width: number, size: number) => {
        const output: string[] = [];
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed) {
            output.push('');
            return;
          }
          output.push(...wrapText(trimmed, width, font, size));
        });
        return output;
      };

      const drawInfoTable = (
        rows: Array<{ left: { label: string; value?: string | null }; right: { label: string; value?: string | null } }>
      ) => {
        const colWidth = contentWidth / 2;
        const padding = 6;
        const labelSize = 8;
        const valueSize = 10;
        const lineHeight = 12;
        const prepared = rows.map((row) => {
          const leftValue = safeText(row.left.value);
          const rightValue = safeText(row.right.value);
          const leftLines = wrapText(leftValue, colWidth - padding * 2, font, valueSize);
          const rightLines = wrapText(rightValue, colWidth - padding * 2, font, valueSize);
          const maxLines = Math.max(leftLines.length || 1, rightLines.length || 1);
          const rowHeight = padding * 2 + labelSize + 4 + maxLines * lineHeight;
          return { row, leftLines, rightLines, rowHeight };
        });
        const totalHeight = prepared.reduce((sum, row) => sum + row.rowHeight, 0);
        ensureSpace(totalHeight + 6);

        let y = cursorY;
        prepared.forEach((entry) => {
          const rowTop = y;
          const rowBottom = y - entry.rowHeight;
          page.drawRectangle({
            x: margin,
            y: rowBottom,
            width: contentWidth,
            height: entry.rowHeight,
            borderColor: colors.line,
            borderWidth: 0.6,
          });
          page.drawLine({
            start: { x: margin + colWidth, y: rowBottom },
            end: { x: margin + colWidth, y: rowTop },
            thickness: 0.6,
            color: colors.line,
          });

          const leftLabelY = rowTop - padding - labelSize;
          page.drawText(entry.row.left.label.toUpperCase(), {
            x: margin + padding,
            y: leftLabelY,
            size: labelSize,
            font,
            color: colors.muted,
          });
          const rightLabelY = rowTop - padding - labelSize;
          page.drawText(entry.row.right.label.toUpperCase(), {
            x: margin + colWidth + padding,
            y: rightLabelY,
            size: labelSize,
            font,
            color: colors.muted,
          });

          const leftStartY = leftLabelY - 4 - valueSize;
          entry.leftLines.forEach((line, index) => {
            page.drawText(line, {
              x: margin + padding,
              y: leftStartY - index * lineHeight,
              size: valueSize,
              font,
              color: colors.text,
            });
          });
          const rightStartY = rightLabelY - 4 - valueSize;
          entry.rightLines.forEach((line, index) => {
            page.drawText(line, {
              x: margin + colWidth + padding,
              y: rightStartY - index * lineHeight,
              size: valueSize,
              font,
              color: colors.text,
            });
          });

          y = rowBottom;
        });
        cursorY = y - 12;
      };

      const drawBoxedTextBlock = (
        title: string,
        lines: string[],
        options?: { size?: number; padding?: number }
      ) => {
        if (lines.length === 0) return;
        const size = options?.size ?? 9;
        const padding = options?.padding ?? 8;
        const lineHeight = size + 3;
        const contentLines = buildLines(lines, contentWidth - padding * 2, size);
        const textHeight = contentLines.length * lineHeight;
        const boxHeight = padding * 2 + textHeight + size + 6;
        ensureSpace(boxHeight + 8);
        const boxTop = cursorY;
        const boxBottom = cursorY - boxHeight;

        page.drawRectangle({
          x: margin,
          y: boxBottom,
          width: contentWidth,
          height: boxHeight,
          borderColor: colors.line,
          borderWidth: 0.6,
          color: colors.softFill,
        });

        page.drawText(title, {
          x: margin + padding,
          y: boxTop - padding - size,
          size,
          font: bold,
          color: colors.primary,
        });

        let textY = boxTop - padding - size - 6 - size;
        contentLines.forEach((line) => {
          if (!line) {
            textY -= lineHeight;
            return;
          }
          page.drawText(line, {
            x: margin + padding,
            y: textY,
            size,
            font,
            color: colors.text,
          });
          textY -= lineHeight;
        });

        cursorY = boxBottom - 12;
      };

      const tableColumns = [
        { key: 'item', label: 'ITEM', width: 28, align: 'center' as const },
        { key: 'image', label: 'IMAGEN', width: 52, align: 'center' as const },
        { key: 'descripcion', label: 'DESCRIPCION', width: 220, align: 'left' as const },
        { key: 'cantidad', label: 'CANT.', width: 50, align: 'center' as const },
        { key: 'unidad', label: 'UNID.', width: 50, align: 'center' as const },
        { key: 'unitario', label: 'P. UNIT.', width: 70, align: 'right' as const },
        { key: 'total', label: 'TOTAL', width: 69, align: 'right' as const },
      ];

      const tableXMap: Record<string, number> = {};
      let runningX = margin;
      tableColumns.forEach((col) => {
        tableXMap[col.key] = runningX;
        runningX += col.width;
      });

      const drawTableHeader = () => {
        const headerHeightPx = 22;
        ensureSpace(headerHeightPx + 6);
        const headerTop = cursorY;
        const headerBottom = cursorY - headerHeightPx;
        page.drawRectangle({
          x: margin,
          y: headerBottom,
          width: contentWidth,
          height: headerHeightPx,
          color: colors.headerFill,
          borderColor: colors.line,
          borderWidth: 0.6,
        });
        let x = margin;
        const textY = headerTop - 15;
        tableColumns.forEach((column, index) => {
          page.drawText(column.label, {
            x: x + 4,
            y: textY,
            size: 8.5,
            font: bold,
            color: colors.muted,
          });
          if (index < tableColumns.length - 1) {
            page.drawLine({
              start: { x: x + column.width, y: headerBottom },
              end: { x: x + column.width, y: headerTop },
              thickness: 0.6,
              color: colors.line,
            });
          }
          x += column.width;
        });
        cursorY = headerBottom;
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

      const drawItemRow = async (item: (typeof detalleActual.items)[number], index: number) => {
        const rowPadding = 6;
        const imageBox = 44;
        const descWidth = tableColumns[2].width - 8;
        const descSize = 9;
        const descLineHeight = 11;
        const skuText = item.skuSnapshot ? `SKU: ${item.skuSnapshot}` : '';
        const obsText = item.observacion ? `Obs: ${item.observacion}` : '';
        const productText = [item.descripcionSnapshot, skuText, obsText].filter(Boolean).join('\n');
        const productLines = wrapText(productText || '-', descWidth, font, descSize);
        const textHeight = productLines.length * descLineHeight;
        const rowHeight = Math.max(textHeight, imageBox) + rowPadding * 2;

        if (ensureSpace(rowHeight + 6)) {
          drawTableHeader();
        }

        const rowTop = cursorY;
        const rowBottom = cursorY - rowHeight;

        if (index % 2 === 0) {
          page.drawRectangle({
            x: margin,
            y: rowBottom,
            width: contentWidth,
            height: rowHeight,
            color: colors.rowFill,
          });
        }
        page.drawRectangle({
          x: margin,
          y: rowBottom,
          width: contentWidth,
          height: rowHeight,
          borderColor: colors.line,
          borderWidth: 0.6,
        });

        let dividerX = margin;
        tableColumns.slice(0, -1).forEach((col) => {
          dividerX += col.width;
          page.drawLine({
            start: { x: dividerX, y: rowBottom },
            end: { x: dividerX, y: rowTop },
            thickness: 0.6,
            color: colors.line,
          });
        });

        const imageUrl = productImages.get(item.productoId) ?? null;
        const image = imageUrl ? await embedImageFromUrl(imageUrl) : null;
        const imageX = tableXMap.image + (tableColumns[1].width - imageBox) / 2;
        const imageY = rowBottom + (rowHeight - imageBox) / 2;

        if (image) {
          const dims = image.scale(1);
          const scale = Math.min(imageBox / dims.width, imageBox / dims.height, 1);
          const drawWidth = dims.width * scale;
          const drawHeight = dims.height * scale;
          const drawX = tableXMap.image + (tableColumns[1].width - drawWidth) / 2;
          const drawY = rowBottom + (rowHeight - drawHeight) / 2;
          page.drawImage(image, { x: drawX, y: drawY, width: drawWidth, height: drawHeight });
        } else {
          page.drawRectangle({
            x: imageX,
            y: imageY,
            width: imageBox,
            height: imageBox,
            borderColor: colors.line,
            borderWidth: 0.6,
          });
          const placeholder = 'Sin imagen';
          const placeholderSize = 7;
          const placeholderWidth = font.widthOfTextAtSize(placeholder, placeholderSize);
          page.drawText(placeholder, {
            x: imageX + (imageBox - placeholderWidth) / 2,
            y: imageY + imageBox / 2 - 3,
            size: placeholderSize,
            font,
            color: colors.muted,
          });
        }

        let textY = rowTop - rowPadding - descSize;
        productLines.forEach((line) => {
          page.drawText(line, {
            x: tableXMap.descripcion + 4,
            y: textY,
            size: descSize,
            font,
            color: colors.text,
          });
          textY -= descLineHeight;
        });

        const centerY = rowBottom + (rowHeight - descSize) / 2;
        drawAlignedText(String(index + 1), tableXMap.item, tableColumns[0].width, centerY, 9, 'center');
        drawAlignedText(
          String(item.cantidad),
          tableXMap.cantidad,
          tableColumns[3].width,
          centerY,
          9,
          'center'
        );
        drawAlignedText(
          safeText(item.unidadSnapshot ?? '-'),
          tableXMap.unidad,
          tableColumns[4].width,
          centerY,
          9,
          'center'
        );
        drawAlignedText(
          formatCurrencyCLP(item.precioUnitarioNetoSnapshot),
          tableXMap.unitario,
          tableColumns[5].width,
          centerY,
          9,
          'right'
        );
        drawAlignedText(
          formatCurrencyCLP(item.subtotalNetoSnapshot),
          tableXMap.total,
          tableColumns[6].width,
          centerY,
          9,
          'right'
        );

        cursorY = rowBottom - 6;
      };

      drawHeader();
      drawFooter();

      const observacionesDireccion =
        observaciones.direccion ?? observaciones.direccionDespacho ?? observaciones.ubicacion ?? '';
      const observacionesComuna =
        observaciones.comunaRegion ?? observaciones.comuna ?? observaciones.region ?? '';
      const validezLabel =
        Number.isFinite(PDF_VALIDITY_DAYS) && PDF_VALIDITY_DAYS > 0 ? `${PDF_VALIDITY_DAYS} dias` : '-';
      const clienteNombre = detalleActual.empresa?.trim() || detalleActual.nombreContacto;

      drawSectionTitle('Datos del cliente');
      drawInfoTable([
        {
          left: { label: 'Cliente', value: clienteNombre },
          right: { label: 'RUT', value: detalleActual.rut ?? '' },
        },
        {
          left: { label: 'Telefono', value: detalleActual.telefono ?? '' },
          right: { label: 'Email', value: detalleActual.email ?? '' },
        },
        {
          left: { label: 'Direccion', value: observacionesDireccion || '-' },
          right: { label: 'Ciudad / Comuna', value: observacionesComuna || '-' },
        },
        {
          left: { label: 'Fecha emision', value: formatDateCL(detalleActual.createdAt) },
          right: { label: 'Validez', value: validezLabel },
        },
      ]);

      drawSectionTitle('Detalle de productos');
      if (!detalleActual.items?.length) {
        drawParagraph('No hay items registrados en la cotizacion.');
      } else {
        drawTableHeader();
        let index = 0;
        for (const item of detalleActual.items ?? []) {
          // eslint-disable-next-line no-await-in-loop
          await drawItemRow(item, index);
          index += 1;
        }
      }

      const totalsWidth = 220;
      const totalLines = [
        { label: 'Subtotal neto', value: formatCurrencyCLP(detalleActual.subtotalNeto) },
        { label: 'IVA', value: formatCurrencyCLP(detalleActual.iva) },
        { label: 'TOTAL', value: formatCurrencyCLP(detalleActual.total) },
      ];
      const totalsHeight = totalLines.length * 18 + 28;
      ensureSpace(totalsHeight + 8);
      const totalsX = page.getSize().width - margin - totalsWidth;
      const totalsTop = cursorY;
      const totalsBottom = totalsTop - totalsHeight;

      page.drawRectangle({
        x: totalsX,
        y: totalsBottom,
        width: totalsWidth,
        height: totalsHeight,
        borderColor: colors.line,
        borderWidth: 0.8,
        color: colors.headerFill,
      });
      page.drawText('Totales', {
        x: totalsX + 10,
        y: totalsTop - 16,
        size: 10,
        font: bold,
        color: colors.primary,
      });
      let totalsY = totalsTop - 30;
      totalLines.forEach((line) => {
        page.drawText(line.label, {
          x: totalsX + 10,
          y: totalsY,
          size: 9,
          font,
          color: colors.muted,
        });
        const valueWidth = bold.widthOfTextAtSize(line.value, 10);
        page.drawText(line.value, {
          x: totalsX + totalsWidth - valueWidth - 10,
          y: totalsY,
          size: line.label === 'TOTAL' ? 11 : 10,
          font: line.label === 'TOTAL' ? bold : font,
          color: colors.text,
        });
        totalsY -= 16;
      });
      cursorY = totalsBottom - 12;

      const quoteNotesEnv = (import.meta.env.VITE_PDF_QUOTE_CONDITIONS as string | undefined) ?? '';
      const observationsLines = notas.map((nota) => `${nota.label}: ${nota.value}`);
      const conditionsLines = quoteNotesEnv
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      const notesBlockLines =
        observationsLines.length && conditionsLines.length
          ? [...observationsLines, '', ...conditionsLines]
          : observationsLines.length
          ? observationsLines
          : conditionsLines;

      drawBoxedTextBlock('Observaciones y condiciones', notesBlockLines, { size: 9 });

      const companyLines = [
        COMPANY_NAME,
        COMPANY_RUT ? `RUT ${COMPANY_RUT}` : '',
        COMPANY_ADDRESS,
        COMPANY_PHONE,
        COMPANY_EMAIL,
        COMPANY_WEBSITE,
      ].filter(Boolean);
      drawBoxedTextBlock('Datos de la empresa', companyLines, { size: 9 });

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
