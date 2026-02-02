import type { PDFFont } from 'pdf-lib';

export type ImageBytesPayload = {
  bytes: Uint8Array;
  contentType?: string | null;
};

const IMAGE_CACHE = new Map<string, ImageBytesPayload | null>();

export const fetchImageBytes = async (
  url: string,
  options?: { maxBytes?: number; timeoutMs?: number },
): Promise<ImageBytesPayload | null> => {
  if (!url) return null;
  if (IMAGE_CACHE.has(url)) {
    return IMAGE_CACHE.get(url) ?? null;
  }

  const maxBytes = options?.maxBytes ?? 1_500_000;
  const timeoutMs = options?.timeoutMs ?? 7000;

  try {
    const controller = new AbortController();
    const timeout = (typeof window !== 'undefined' ? window.setTimeout : setTimeout)(
      () => controller.abort(),
      timeoutMs,
    );

    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'force-cache',
      mode: 'cors',
    });

    (typeof window !== 'undefined' ? window.clearTimeout : clearTimeout)(timeout);

    if (!response.ok) {
      IMAGE_CACHE.set(url, null);
      return null;
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && Number(contentLength) > maxBytes) {
      IMAGE_CACHE.set(url, null);
      return null;
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > maxBytes) {
      IMAGE_CACHE.set(url, null);
      return null;
    }

    const payload: ImageBytesPayload = {
      bytes: new Uint8Array(buffer),
      contentType: response.headers.get('content-type'),
    };
    IMAGE_CACHE.set(url, payload);
    return payload;
  } catch {
    IMAGE_CACHE.set(url, null);
    return null;
  }
};

export const formatCurrencyCLP = (value?: number | null): string => {
  const safeValue = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return `CLP ${safeValue.toLocaleString('es-CL')}`;
};

export const formatDateCL = (value?: string | number | Date | null): string => {
  if (!value) return 'Sin fecha';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const splitLongWord = (word: string, maxWidth: number, font: PDFFont, size: number): string[] => {
  const parts: string[] = [];
  let current = '';
  let currentWidth = 0;

  for (const char of word) {
    const charWidth = font.widthOfTextAtSize(char, size);
    if (current && currentWidth + charWidth > maxWidth) {
      parts.push(current);
      current = char;
      currentWidth = charWidth;
      continue;
    }
    current += char;
    currentWidth += charWidth;
  }

  if (current) {
    parts.push(current);
  }

  return parts;
};

export const wrapText = (text: string, maxWidth: number, font: PDFFont, size: number): string[] => {
  if (!text) return [];
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    return [text];
  }

  const lines: string[] = [];
  const paragraphs = String(text).split(/\r?\n/);
  const spaceWidth = font.widthOfTextAtSize(' ', size);

  paragraphs.forEach((paragraph, index) => {
    const words = paragraph.split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      if (index < paragraphs.length - 1) {
        lines.push('');
      }
      return;
    }

    let current = '';
    let currentWidth = 0;

    for (const word of words) {
      const wordWidth = font.widthOfTextAtSize(word, size);

      if (!current) {
        if (wordWidth <= maxWidth) {
          current = word;
          currentWidth = wordWidth;
        } else {
          lines.push(...splitLongWord(word, maxWidth, font, size));
        }
        continue;
      }

      const nextWidth = currentWidth + spaceWidth + wordWidth;
      if (nextWidth <= maxWidth) {
        current = `${current} ${word}`;
        currentWidth = nextWidth;
      } else {
        lines.push(current);
        if (wordWidth <= maxWidth) {
          current = word;
          currentWidth = wordWidth;
        } else {
          lines.push(...splitLongWord(word, maxWidth, font, size));
          current = '';
          currentWidth = 0;
        }
      }
    }

    if (current) {
      lines.push(current);
    }

    if (index < paragraphs.length - 1) {
      lines.push('');
    }
  });

  return lines;
};
