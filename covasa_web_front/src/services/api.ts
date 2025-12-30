import type { Product } from '../data/products';

type RespuestaApi<T> = {
  ok: boolean;
  data?: T;
  message?: string;
  details?: unknown;
};

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000/api';

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json().catch(() => ({}))) as RespuestaApi<T>;

  if (!response.ok || !payload.ok) {
    const error = new Error(payload.message || 'Error de API');
    (error as { details?: unknown }).details = payload.details;
    throw error;
  }

  if (payload.data === undefined) {
    throw new Error('Respuesta invalida del servidor');
  }

  return payload.data;
};

export type ProductoCatalogo = {
  id: string;
  sku: string | null;
  nombre: string;
  descripcion: string;
  unidad: string;
  unidadMedida?: string;
  fotoUrl: string | null;
  tipo: string;
  precioNeto: number;
  precioLista: number;
  precioGeneral: number;
  precioConDescuento: number;
  precioConDescto: number;
  stockDisponible: number;
};

const normalizarImagen = (fotoUrl: string | null) => {
  if (!fotoUrl) {
    return undefined;
  }
  if (/^https?:\/\//i.test(fotoUrl)) {
    return fotoUrl;
  }
  const base = API_ORIGIN || '';
  return `${base}${fotoUrl.startsWith('/') ? '' : '/'}${fotoUrl}`;
};

const mapearProducto = (producto: ProductoCatalogo): Product => ({
  id: producto.id,
  name: producto.nombre,
  price: producto.precioNeto,
  description: producto.descripcion || producto.nombre,
  images: [],
  image: normalizarImagen(producto.fotoUrl),
  unit: producto.unidad || producto.unidadMedida || 'unidad',
  category: producto.tipo || 'Producto',
  sku: producto.sku ?? undefined,
  stockDisponible: producto.stockDisponible,
});

export const obtenerProductos = async (): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/productos`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await parseResponse<ProductoCatalogo[]>(response);
  return data.map(mapearProducto);
};

export type ClientePerfil = {
  id: string;
  nombre: string;
  personaContacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
};

export const obtenerCliente = async (clienteId: string): Promise<ClientePerfil> => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/clientes/${clienteId}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  return parseResponse<ClientePerfil>(response);
};

export type DespachoPayload = {
  nombre?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
  notas?: string;
};

export type PedidoPayload = {
  clienteId?: string;
  despacho?: DespachoPayload;
  items: Array<{
    productoId: string | number;
    cantidad: number;
  }>;
};

export const crearPedido = async (payload: PedidoPayload) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<{
    pedidoId: string;
    codigo: string;
    total: number;
  }>(response);
};

export const crearPagoMercadoPago = async (payload: { pedidoId: string }) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/payments/mercadopago`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<{
    pagoId: string;
    preferenceId: string;
    initPoint: string;
    redirectUrl: string;
  }>(response);
};

export const crearPagoTransbank = async (payload: { pedidoId: string; returnUrl?: string }) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/payments/transbank`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<{
    pagoId: string;
    token: string;
    url: string;
    redirectUrl: string;
    monto: number;
  }>(response);
};

export const confirmarPagoTransbank = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/payments/transbank/commit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  return parseResponse<{
    pagoId: string;
    estado: string;
    transbank: unknown;
  }>(response);
};
