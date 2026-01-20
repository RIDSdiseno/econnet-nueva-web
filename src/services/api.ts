import type { Product } from '../data/products';

type RespuestaApi<T> = {
  ok: boolean;
  data?: T;
  message?: string;
  details?: unknown;
};

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://covasabackecomerce-production.up.railway.app/api';

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

// ==============================
// Auth token helpers (JWT)
// ==============================
// Guardamos el token en memoria (simple). Si quieres persistirlo, se puede usar localStorage.
const AUTH_TOKEN_KEY = 'covasa_auth_token';

const leerTokenStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const valor = window.localStorage.getItem(AUTH_TOKEN_KEY);
  return valor && valor.trim().length > 0 ? valor : null;
};

let AUTH_TOKEN: string | null = leerTokenStorage();

/**
 * Permite setear/eliminar token JWT desde el AuthContext.
 * Ej: setAuthToken(data.token)
 */
export const setAuthToken = (token: string | null) => {
  AUTH_TOKEN = token;
  if (typeof window === 'undefined') {
    return;
  }
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

const authHeaders = (): HeadersInit => {
  // Solo agrega Authorization si hay token
  return AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {};
};

// ==============================
// Base response parser
// ==============================
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

const parseResponseWithStatus = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json().catch(() => ({}))) as RespuestaApi<T>;

  if (!response.ok || !payload.ok) {
    const error = new Error(payload.message || 'Error de API');
    (error as { details?: unknown; status?: number }).details = payload.details;
    (error as { status?: number }).status = response.status;
    throw error;
  }

  if (payload.data === undefined) {
    throw new Error('Respuesta invalida del servidor');
  }

  return payload.data;
};

// ==============================
// Productos
// ==============================
export type ProductoCatalogo = {
  id: string;
  sku: string | null;
  nombre: string;
  descripcion: string;
  unidad: string;
  unidadMedida?: string;
  fotoUrl: string | null;
  imagenes?: string[];
  tipo: string;
  precioNeto: number;
  precioLista: number;
  precioGeneral: number;
  precioConDescuento: number;
  precioConDescto: number;
  stockDisponible: number;
};

const normalizarImagen = (fotoUrl: string | null) => {
  if (!fotoUrl) return undefined;
  if (/^https?:\/\//i.test(fotoUrl)) return fotoUrl;

  const base = API_ORIGIN || '';
  return `${base}${fotoUrl.startsWith('/') ? '' : '/'}${fotoUrl}`;
};

const normalizarImagenes = (imagenes?: string[], fotoUrl?: string | null) => {
  const normalizadas = (imagenes ?? [])
    .map((imagen) => normalizarImagen(imagen))
    .filter((imagen): imagen is string => Boolean(imagen));

  const principal = normalizarImagen(fotoUrl ?? null);
  if (principal && !normalizadas.includes(principal)) {
    normalizadas.unshift(principal);
  }
  return normalizadas;
};

const mapearProducto = (producto: ProductoCatalogo): Product => {
  const imagenes = normalizarImagenes(producto.imagenes, producto.fotoUrl);

  return {
    id: producto.id,
    name: producto.nombre,
    price: producto.precioNeto,
    description: producto.descripcion || producto.nombre,
    images: imagenes,
    image: imagenes[0] ?? normalizarImagen(producto.fotoUrl),
    unit: producto.unidad || producto.unidadMedida || 'unidad',
    category: producto.tipo || 'Producto',
    sku: producto.sku ?? undefined,
    stockDisponible: producto.stockDisponible,
  };
};

export const obtenerProductos = async (params?: { search?: string; limit?: number }): Promise<Product[]> => {
  const query = new URLSearchParams();
  const search = params?.search?.trim();

  if (search) query.set('search', search);
  if (params?.limit) query.set('limit', String(params.limit));

  const qs = query.toString();

  const response = await fetch(`${API_BASE_URL}/ecommerce/productos${qs ? `?${qs}` : ''}`, {
    headers: { Accept: 'application/json' },
  });

  const data = await parseResponse<ProductoCatalogo[]>(response);
  return data.map(mapearProducto);
};

// ==============================
// Usuarios / Auth
// ==============================
export type UsuarioEcommerce = {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  ecommerceClienteId?: string | null;
};

export type DireccionContacto = {
  id?: string;
  nombreContacto: string;
  telefono: string;
  email: string;
  direccion: string;
  comuna: string;
  ciudad?: string | null;
  region: string;
  notas?: string | null;
};

export const registrarUsuario = async (payload: {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/usuarios/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<{ token: string; usuario: UsuarioEcommerce }>(response);
};

export const loginUsuario = async (payload: { email: string; password: string }) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/usuarios/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<{
    token: string;
    usuario: UsuarioEcommerce;
    direccionPrincipal: DireccionContacto | null;
  }>(response);
};

/**
 * ✅ LOGIN MICROSOFT (esto es lo que te faltaba para que no salga rojo el import)
 * Backend: POST /api/ecommerce/usuarios/login/microsoft
 * Input: { idToken }
 * Output: { token, user, direccionPrincipal }
 */
export const loginMicrosoft = async (payload: { idToken: string }) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/usuarios/login/microsoft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<{
    token: string;
    user: UsuarioEcommerce;
    direccionPrincipal: DireccionContacto | null;
  }>(response);
};

/**
 * ✅ LOGIN GOOGLE
 * Backend: POST /api/ecommerce/usuarios/login/google
 * Input: { credential }
 * Output: { token, user, direccionPrincipal }
 */
export const loginGoogle = async (payload: { credential: string }) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/usuarios/login/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<{
    token: string;
    user: UsuarioEcommerce;
    direccionPrincipal: DireccionContacto | null;
  }>(response);
};

/**
 * (Opcional pero recomendado)
 * GET /api/ecommerce/usuarios/me (requiere Authorization Bearer)
 */
export const obtenerUsuarioActual = async () => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/usuarios/me`, {
    headers: {
      Accept: 'application/json',
      ...authHeaders(),
    },
  });

  return parseResponse<{ usuario: UsuarioEcommerce; direccionPrincipal: DireccionContacto | null }>(response);
};

// ==============================
// Clientes
// ==============================
export type ClientePerfil = {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccionPrincipal?: DireccionContacto | null;
};

export const obtenerCliente = async (ecommerceClienteId: string): Promise<ClientePerfil> => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/clientes/${ecommerceClienteId}`, {
    headers: {
      Accept: 'application/json',
      ...authHeaders(), // por si tu backend protege este endpoint
    },
  });

  return parseResponse<ClientePerfil>(response);
};

// ==============================
// Pedidos
// ==============================
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
  ecommerceClienteId?: string;
  usuarioId?: string;
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
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<{
    pedidoId: string;
    codigo: string;
    total: number;
  }>(response);
};

// ==============================
// Pagos
// ==============================
export const crearPagoMercadoPago = async (payload: { pedidoId: string }) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}/ecommerce/payments/mercadopago/preference`,
      requestOptions,
    );

    return await parseResponseWithStatus<{
      pagoId: string;
      preferenceId: string;
      initPoint: string;
      sandboxInitPoint?: string;
      redirectUrl: string;
    }>(response);
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status !== 404) {
      throw error;
    }
  }

  const legacyResponse = await fetch(`${API_BASE_URL}/ecommerce/payments/mercadopago`, requestOptions);

  return parseResponseWithStatus<{
    pagoId: string;
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint?: string;
    redirectUrl: string;
  }>(legacyResponse);
};

export type MercadoPagoEstado = {
  pagoId: string;
  pedidoId: string;
  pedidoCodigo: string | null;
  pedidoTotal: number;
  estado: string;
  monto: number;
  preferenceId: string | null;
  providerPaymentId: string | null;
  externalReference: string | null;
  mpStatus: string | null;
  mpStatusDetail: string | null;
  updatedAt: string;
};

export const obtenerEstadoMercadoPago = async (params: {
  paymentId?: string | null;
  externalReference?: string | null;
  preferenceId?: string | null;
}) => {
  const query = new URLSearchParams();
  if (params.paymentId) query.set('payment_id', params.paymentId);
  if (params.externalReference) query.set('external_reference', params.externalReference);
  if (params.preferenceId) query.set('preference_id', params.preferenceId);

  const response = await fetch(
    `${API_BASE_URL}/ecommerce/payments/mercadopago/status?${query.toString()}`,
    {
      headers: {
        Accept: 'application/json',
        ...authHeaders(),
      },
    },
  );

  return parseResponse<MercadoPagoEstado>(response);
};

export type StripeCreateIntentPayload = {
  orderId?: string;
  cotizacionId?: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  metadata?: Record<string, unknown>;
};

export type StripeCreateIntentResponse = {
  clientSecret: string;
  paymentIntentId?: string;
  pagoId?: string;
};

export const crearStripePaymentIntent = async (payload: StripeCreateIntentPayload) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/pagos/stripe/create-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<StripeCreateIntentResponse>(response);
};

export type StripeEstado = {
  pagoId: string;
  pedidoId?: string | null;
  pedidoCodigo?: string | null;
  cotizacionId?: string | null;
  cotizacionCodigo?: string | null;
  monto: number;
  moneda?: string | null;
  estado: string;
  providerPaymentId: string | null;
  externalReference: string | null;
  stripeStatus: string | null;
  stripeStatusDetail: string | null;
  updatedAt: string;
};

export const obtenerEstadoStripe = async (params: {
  pedidoId?: string | null;
  cotizacionId?: string | null;
  paymentIntentId?: string | null;
}) => {
  const query = new URLSearchParams();
  if (params.pedidoId) query.set('pedidoId', params.pedidoId);
  if (params.cotizacionId) query.set('cotizacionId', params.cotizacionId);
  if (params.paymentIntentId) query.set('payment_intent', params.paymentIntentId);

  const response = await fetch(`${API_BASE_URL}/ecommerce/pagos/stripe/status?${query.toString()}`, {
    headers: {
      Accept: 'application/json',
      ...authHeaders(),
    },
  });

  return parseResponse<StripeEstado>(response);
};

export const iniciarPagoTransbankFormulario = (pedidoId: string) => {
  if (typeof document === 'undefined') return;

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `${API_BASE_URL}/ecommerce/payments/transbank`;
  form.style.display = 'none';

  const inputPedido = document.createElement('input');
  inputPedido.type = 'hidden';
  inputPedido.name = 'pedidoId';
  inputPedido.value = pedidoId;

  form.appendChild(inputPedido);
  document.body.appendChild(form);
  form.submit();
};

export type PagoRecibo = {
  pagoId: string;
  metodo: string;
  estado: string;
  monto: number;
  createdAt: string;
  pedido: {
    id: string;
    codigo: string;
    total: number;
    estado: string;
    createdAt: string;
  };
  direccion: DireccionContacto | null;
  transbank?: {
    buyOrder: string;
    authorizationCode: string;
    paymentTypeCode: string;
    installmentsNumber: number | null;
    cardNumber?: string;
    transactionDate?: string | null;
  } | null;
};

export const obtenerPagoRecibo = async (pagoId: string) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/payments/${pagoId}`, {
    headers: {
      Accept: 'application/json',
      ...authHeaders(),
    },
  });

  return parseResponse<PagoRecibo>(response);
};

export type PagoProveedor = {
  metodo: string;
  referencia?: string | null;
  transbank?: {
    buyOrder: string;
    authorizationCode: string;
    paymentTypeCode: string;
    installmentsNumber: number | null;
    cardNumber?: string;
    transactionDate?: string | null;
  } | null;
};

export type PagoListado = {
  pagoId: string;
  metodo: string;
  estado: string;
  monto: number;
  moneda?: string | null;
  createdAt: string;
  updatedAt: string;
  pedido?: {
    id: string;
    codigo?: string | null;
    total: number;
    estado: string;
    createdAt: string;
  } | null;
  cotizacion?: {
    id: string;
    codigo?: string | null;
    total: number;
    estado: string;
    createdAt: string;
  } | null;
  proveedor: PagoProveedor;
};

export const listarMisPagos = async () => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/pagos/mis-pagos`, {
    headers: {
      Accept: 'application/json',
      ...authHeaders(),
    },
  });

  return parseResponse<PagoListado[]>(response);
};

export type PagoDetalle = {
  pagoId: string;
  metodo: string;
  estado: string;
  monto: number;
  moneda?: string | null;
  createdAt: string;
  updatedAt: string;
  proveedor: PagoProveedor;
  pedido?: {
    id: string;
    codigo?: string | null;
    total: number;
    subtotalNeto?: number;
    iva?: number;
    estado: string;
    createdAt: string;
    direccion?: DireccionContacto | null;
    items: Array<{
      descripcionSnapshot: string;
      cantidad: number;
      precioUnitarioNetoSnapshot: number;
      subtotalNetoSnapshot: number;
      ivaPctSnapshot: number;
      ivaMontoSnapshot: number;
      totalSnapshot: number;
    }>;
  } | null;
  cotizacion?: {
    id: string;
    codigo?: string | null;
    total: number;
    subtotalNeto?: number;
    iva?: number;
    estado: string;
    createdAt: string;
    contacto?: {
      nombreContacto?: string | null;
      email?: string | null;
      telefono?: string | null;
      empresa?: string | null;
      rut?: string | null;
      direccion?: string | null;
    } | null;
    items: Array<{
      descripcionSnapshot: string;
      cantidad: number;
      precioUnitarioNetoSnapshot: number;
      subtotalNetoSnapshot: number;
      ivaPctSnapshot: number;
      ivaMontoSnapshot: number;
      totalSnapshot: number;
    }>;
  } | null;
};

export const obtenerPagoDetalle = async (pagoId: string) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/pagos/mis-pagos/${pagoId}`, {
    headers: {
      Accept: 'application/json',
      ...authHeaders(),
    },
  });

  return parseResponse<PagoDetalle>(response);
};

export const descargarReciboPdf = async (pagoId: string) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/pagos/mis-pagos/${pagoId}/recibo.pdf`, {
    headers: {
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as RespuestaApi<unknown>;
    throw new Error(payload.message || 'No se pudo descargar el recibo.');
  }

  return response.blob();
};

// ==============================
// Cotizaciones
// ==============================
export type CotizacionContactoPayload = {
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  empresa?: string | null;
  rut?: string | null;
  direccion?: string | null;
  mensaje?: string | null;
  tipoObra?: string | null;
  ubicacion?: string | null;
};

export type CotizacionItemPayload = {
  productoId: string;
  cantidad: number;
  observacion?: string | null;
};

export type CotizacionPayload = {
  contacto: CotizacionContactoPayload;
  items: CotizacionItemPayload[];
  origen: string;
  metadata?: {
    userAgent?: string | null;
    utm?: Record<string, unknown> | null;
  } | null;
};

export type CotizacionDetalleItem = {
  id: string;
  productoId: string;
  descripcionSnapshot: string;
  unidadSnapshot?: string | null;
  skuSnapshot?: string | null;
  cantidad: number;
  precioUnitarioNetoSnapshot: number;
  subtotalNetoSnapshot: number;
  ivaPctSnapshot: number;
  ivaMontoSnapshot: number;
  totalSnapshot: number;
  observacion?: string | null;
};

export type CotizacionDetalle = {
  id: string;
  codigo: string;
  origen?: string | null;
  estado: string;
  createdAt: string;
  nombreContacto: string;
  email?: string | null;
  telefono?: string | null;
  empresa?: string | null;
  rut?: string | null;
  observaciones?: string | null;
  subtotalNeto: number;
  iva: number;
  total: number;
  items: CotizacionDetalleItem[];
};

export const crearCotizacion = async (payload: CotizacionPayload) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/cotizaciones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<{
    id: string;
    codigo: string;
    total: number;
    estado: string;
    createdAt?: string;
  }>(response);
};

export const obtenerCotizacionDetalle = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/ecommerce/cotizaciones/${id}`, {
    headers: {
      Accept: 'application/json',
      ...authHeaders(),
    },
  });

  return parseResponse<CotizacionDetalle>(response);
};
