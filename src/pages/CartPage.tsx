import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  crearStripePaymentIntent,
  crearPagoMercadoPago,
  crearPedido,
  iniciarPagoTransbankFormulario,
  obtenerCliente,
} from '../services/api';
import { uiLogger } from '../utils/logger';

type DespachoForm = {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  region: string;
  notas: string;
};

type ErroresDespacho = Partial<Record<keyof DespachoForm, string>>;

type MetodoPago = 'transbank' | 'mercadopago' | 'stripe' | null;

type StripeResultado = 'success' | 'pending' | 'failure';

type StripeCheckoutProps = {
  onResultado: (resultado: StripeResultado, status: string, paymentIntentId?: string) => void;
  onError: (mensaje: string) => void;
  returnUrl: string;
  disabled?: boolean;
};

const ECOMMERCE_CLIENTE_ID_KEY = 'covasa_ecommerce_cliente_id';
const LEGACY_CLIENTE_ID_KEY = 'covasa_cliente_id';
const normalizarEnvValor = (value?: string) => (value ?? '').trim().replace(/^['"]|['"]$/g, '');
const stripePublishableKey = normalizarEnvValor(
  (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined) ??
    (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST as string | undefined),
);
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
const mostrarMercadoPago = false;
const mostrarStripe = false;

const obtenerClienteIdInicial = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return (
    window.localStorage.getItem(ECOMMERCE_CLIENTE_ID_KEY) ??
    window.localStorage.getItem(LEGACY_CLIENTE_ID_KEY)
  );
};

const despachoInicial: DespachoForm = {
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  comuna: '',
  ciudad: '',
  region: '',
  notas: '',
};

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const limpiarTexto = (value: string) => value.trim();

const limpiarOpcional = (value: string) => {
  const limpio = limpiarTexto(value);
  return limpio ? limpio : undefined;
};

const construirDespachoPayload = (form: DespachoForm) => ({
  nombre: limpiarOpcional(form.nombre),
  telefono: limpiarOpcional(form.telefono),
  email: limpiarOpcional(form.email),
  direccion: limpiarOpcional(form.direccion),
  comuna: limpiarOpcional(form.comuna),
  ciudad: limpiarOpcional(form.ciudad),
  region: limpiarOpcional(form.region),
  notas: limpiarOpcional(form.notas),
});

const validarDespacho = (form: DespachoForm) => {
  const errores: ErroresDespacho = {};
  const email = limpiarTexto(form.email);
  const telefono = limpiarTexto(form.telefono);

  if (!limpiarTexto(form.nombre)) {
    errores.nombre = 'Ingresa el nombre de contacto.';
  }

  if (!email) {
    errores.email = 'Ingresa un email valido.';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errores.email = 'Formato de email invalido.';
  }

  if (!telefono) {
    errores.telefono = 'Ingresa un telefono de contacto.';
  } else if (telefono.length < 6) {
    errores.telefono = 'El telefono debe tener al menos 6 digitos.';
  }

  if (!limpiarTexto(form.direccion)) {
    errores.direccion = 'Ingresa la direccion de despacho.';
  }

  if (!limpiarTexto(form.comuna)) {
    errores.comuna = 'Ingresa la comuna.';
  }

  if (!limpiarTexto(form.region)) {
    errores.region = 'Ingresa la region.';
  }

  return errores;
};

const claseInput = (error?: string) =>
  `rounded-2xl border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 ${
    error ? 'border-[#B01010] focus:ring-[#B01010]' : 'border-slate-200 focus:ring-[#E04040]'
  }`;

const StripeCheckoutForm = ({ onResultado, onError, returnUrl, disabled }: StripeCheckoutProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [procesando, setProcesando] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements || disabled) {
      return;
    }
    setProcesando(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'No se pudo procesar el pago.');
        return;
      }

      if (!paymentIntent) {
        onError('No se pudo procesar el pago.');
        return;
      }

      const status = paymentIntent.status;
      if (status === 'succeeded') {
        onResultado('success', status, paymentIntent.id);
        return;
      }

      if (status === 'processing' || status === 'requires_action') {
        onResultado('pending', status, paymentIntent.id);
        return;
      }

      onError('El pago fue rechazado.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      <button
        type="submit"
        disabled={!stripe || !elements || procesando || disabled}
        className="w-full rounded-full bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.25)] transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {procesando ? 'Procesando pago...' : 'Pagar con Stripe'}
      </button>
    </form>
  );
};

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items, totalQuantity, updateQuantity, removeItem, clearCart } = useCart();
  const stripeKeyDisponible = Boolean(stripePublishableKey);
  const [despacho, setDespacho] = useState<DespachoForm>(despachoInicial);
  const [errores, setErrores] = useState<ErroresDespacho>({});
  const [pagoError, setPagoError] = useState<string | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(null);
  const stripeDisponible = Boolean(stripePromise);
  const [stripeApplePayDisponible, setStripeApplePayDisponible] = useState<boolean | null>(null);
  const [stripePedidoId, setStripePedidoId] = useState<string | null>(null);
  const [stripeTotal, setStripeTotal] = useState<number | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState<string | null>(null);
  const [stripeModalVisible, setStripeModalVisible] = useState(false);
  const [stripeCargando, setStripeCargando] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripeMensaje, setStripeMensaje] = useState<string | null>(null);
  const [stripeExito, setStripeExito] = useState(false);
  const [ecommerceClienteId, setEcommerceClienteId] = useState<string | null>(() =>
    user?.ecommerceClienteId ?? obtenerClienteIdInicial()
  );
  const [clienteCargando, setClienteCargando] = useState(false);
  const [clienteError, setClienteError] = useState<string | null>(null);
  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);

  useEffect(() => {
    if (user?.ecommerceClienteId) {
      setEcommerceClienteId(user.ecommerceClienteId);
      return;
    }

    if (!user) {
      setEcommerceClienteId(obtenerClienteIdInicial());
    }
  }, [user, user?.ecommerceClienteId]);

  useEffect(() => {
    if (!user?.direccionPrincipal) {
      return;
    }

    const direccion = user.direccionPrincipal;
    setDespacho((prev) => ({
      ...prev,
      nombre: asignarSiVacio(prev.nombre, direccion.nombreContacto),
      telefono: asignarSiVacio(prev.telefono, direccion.telefono),
      email: asignarSiVacio(prev.email, direccion.email),
      direccion: asignarSiVacio(prev.direccion, direccion.direccion),
      comuna: asignarSiVacio(prev.comuna, direccion.comuna),
      ciudad: asignarSiVacio(prev.ciudad, direccion.ciudad ?? undefined),
      region: asignarSiVacio(prev.region, direccion.region),
      notas: asignarSiVacio(prev.notas, direccion.notas ?? undefined),
    }));
  }, [user?.direccionPrincipal]);

  const totalNet = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const taxRate = 0.19;
  const ivaAmount = Math.round(totalNet * taxRate);
  const totalWithIva = totalNet + ivaAmount;
  const stripeBotonDeshabilitado = !stripeDisponible || Boolean(metodoPago) || stripeCargando;
  const construirStripeQuery = (paymentIntentId?: string | null) => {
    const params = new URLSearchParams();
    if (stripePedidoId) {
      params.set('pedidoId', stripePedidoId);
    }
    if (paymentIntentId) {
      params.set('payment_intent', paymentIntentId);
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  const construirStripePath = (resultado: StripeResultado, paymentIntentId?: string | null) =>
    `/pago/stripe/${resultado}${construirStripeQuery(paymentIntentId)}`;

  const construirStripeReturnUrl = (resultado: StripeResultado, paymentIntentId?: string | null) => {
    const path = construirStripePath(resultado, paymentIntentId);
    if (typeof window === 'undefined') {
      return path;
    }
    return `${window.location.origin}${path}`;
  };

  const stripeReturnUrl = construirStripeReturnUrl('pending', stripePaymentIntentId);

  const asignarSiVacio = (actual: string, nuevo?: string | null) =>
    limpiarTexto(actual) ? actual : nuevo ?? actual;

  useEffect(() => {
    if (!stripeDisponible || totalWithIva <= 0 || !stripePromise) {
      setStripeApplePayDisponible(false);
      return;
    }

    let activo = true;
    setStripeApplePayDisponible(null);

    stripePromise
      .then((stripe) => {
        if (!stripe || !activo) {
          return null;
        }
        const request = stripe.paymentRequest({
          country: 'CL',
          currency: 'clp',
          total: { label: 'Total', amount: totalWithIva },
          requestPayerName: true,
          requestPayerEmail: true,
        });
        return request.canMakePayment();
      })
      .then((result) => {
        if (!activo) {
          return;
        }
        setStripeApplePayDisponible(Boolean(result?.applePay));
      })
      .catch(() => {
        if (activo) {
          setStripeApplePayDisponible(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [stripeDisponible, totalWithIva, stripePromise]);

  useEffect(() => {
    if (!ecommerceClienteId) {
      return;
    }

    setClienteCargando(true);
    setClienteError(null);

    obtenerCliente(ecommerceClienteId)
      .then((cliente) => {
        const direccionPrincipal = cliente.direccionPrincipal;
        const nombreContacto = direccionPrincipal?.nombreContacto || cliente.nombre;
        setDespacho((prev) => ({
          ...prev,
          nombre: asignarSiVacio(prev.nombre, nombreContacto),
          telefono: asignarSiVacio(prev.telefono, direccionPrincipal?.telefono || cliente.telefono),
          email: asignarSiVacio(prev.email, direccionPrincipal?.email || cliente.email),
          direccion: asignarSiVacio(prev.direccion, direccionPrincipal?.direccion),
          comuna: asignarSiVacio(prev.comuna, direccionPrincipal?.comuna),
          ciudad: asignarSiVacio(prev.ciudad, direccionPrincipal?.ciudad ?? undefined),
          region: asignarSiVacio(prev.region, direccionPrincipal?.region),
          notas: asignarSiVacio(prev.notas, direccionPrincipal?.notas ?? undefined),
        }));
        setErrores({});
      })
      .catch(() => {
        setClienteError('No se pudieron cargar los datos del cliente.');
      })
      .finally(() => {
        setClienteCargando(false);
      });
  }, [ecommerceClienteId]);

  const actualizarCampo =
    (campo: keyof DespachoForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setDespacho((prev) => ({
        ...prev,
        [campo]: value,
      }));
      setPagoError(null);
      if (errores[campo]) {
        setErrores((prev) => ({
          ...prev,
          [campo]: undefined,
        }));
      }
    };

  const validarAntesDePagar = () => {
    if (metodoPago) {
      return false;
    }

    if (!isAuthenticated) {
      setMostrarModalLogin(true);
      return false;
    }

    if (clienteCargando) {
      setPagoError('Estamos cargando tus datos. Intenta nuevamente en unos segundos.');
      return false;
    }

    if (items.length === 0) {
      setPagoError('Tu carrito esta vacio. Agrega productos antes de pagar.');
      return false;
    }

    const nuevosErrores = validarDespacho(despacho);
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setPagoError('Revisa los campos marcados.');
      return false;
    }

    setErrores({});
    setPagoError(null);
    return true;
  };

  const construirPedidoPayload = () => ({
    ecommerceClienteId: ecommerceClienteId ?? undefined,
    usuarioId: user?.id ?? undefined,
    despacho: construirDespachoPayload(despacho),
    items: items.map((item) => ({
      productoId: String(item.productId),
      varianteId: item.varianteId ?? undefined,
      cantidad: item.quantity,
    })),
  });

  const navegarResultadoStripe = (resultado: StripeResultado, paymentIntentId?: string | null) => {
    const intentId = paymentIntentId ?? stripePaymentIntentId ?? null;
    if (!stripePedidoId && !intentId) {
      setStripeError('No se pudo identificar el pedido.');
      setMetodoPago(null);
      return;
    }

    navigate(construirStripePath(resultado, intentId));
  };

  const manejarStripeResultado = (resultado: StripeResultado, status: string, paymentIntentId?: string) => {
    const intentId = paymentIntentId ?? null;
    setStripePaymentIntentId(intentId);
    uiLogger.info('stripe_result', {
      resultado,
      status,
      pedidoId: stripePedidoId ?? null,
      paymentIntentId: intentId,
    });

    if (resultado === 'success') {
      setStripeMensaje('Pago confirmado.');
      setStripeExito(true);
      setStripeModalVisible(false);
      return;
    }

    if (resultado === 'pending') {
      setStripeMensaje(`Pago en proceso (${status}).`);
      navegarResultadoStripe('pending', intentId);
      return;
    }
  };

  const manejarStripeError = (mensaje: string) => {
    uiLogger.error('stripe_checkout_error', { message: mensaje, pedidoId: stripePedidoId ?? null });
    setStripeError(mensaje);
  };

  const cerrarStripeModal = () => {
    setStripeModalVisible(false);
    setStripeError(null);
    setStripeMensaje(null);
    setMetodoPago(null);
  };

  const confirmarStripeExito = () => {
    setStripeExito(false);
    setMetodoPago(null);
    navegarResultadoStripe('success', stripePaymentIntentId);
  };

  const iniciarPagoStripe = async () => {
    setStripeError(null);
    setStripeMensaje(null);
    setStripeExito(false);
    setStripePaymentIntentId(null);
    uiLogger.info('checkout_start', {
      metodo: 'stripe',
      itemsCount: items.length,
      total: totalWithIva,
      userId: user?.id ?? null,
    });

    if (!stripeKeyDisponible || !stripePromise) {
      setStripeModalVisible(true);
      setStripeError('Configura la llave publishable de Stripe para habilitar el pago.');
      return;
    }

    if (!validarAntesDePagar()) {
      return;
    }

    setStripeModalVisible(true);
    setStripeCargando(true);
    setMetodoPago('stripe');

    try {
      let pedidoId = stripePedidoId;
      let total = stripeTotal;

      if (!pedidoId || !total) {
        const pedido = await crearPedido(construirPedidoPayload());
        pedidoId = pedido.pedidoId;
        total = pedido.total;
        setStripePedidoId(pedidoId);
        setStripeTotal(total);
        uiLogger.info('checkout_order_created', {
          metodo: 'stripe',
          pedidoId,
          total,
        });
      }

      if (!stripeClientSecret && pedidoId && total) {
        const intent = await crearStripePaymentIntent({
          orderId: pedidoId,
          amount: total,
          currency: 'clp',
          customerEmail: limpiarTexto(despacho.email) || undefined,
          metadata: { origen: 'checkout' },
        });
        setStripeClientSecret(intent.clientSecret);
        setStripePaymentIntentId(intent.paymentIntentId ?? null);
        uiLogger.info('stripe_intent_created', {
          pedidoId,
          paymentIntentId: intent.paymentIntentId ?? null,
          total,
        });
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo iniciar el pago con Stripe.';
      uiLogger.error('stripe_intent_error', { message: mensaje });
      setStripeError(mensaje);
      setMetodoPago(null);
    } finally {
      setStripeCargando(false);
    }
  };

  const iniciarPagoTransbank = async () => {
    if (!validarAntesDePagar()) {
      return;
    }

    setStripeModalVisible(false);
    setStripeError(null);
    setStripeMensaje(null);
    setMetodoPago('transbank');
    uiLogger.info('checkout_start', {
      metodo: 'transbank',
      itemsCount: items.length,
      total: totalWithIva,
      userId: user?.id ?? null,
    });

    try {
      const pedido = await crearPedido(construirPedidoPayload());
      uiLogger.info('checkout_order_created', {
        metodo: 'transbank',
        pedidoId: pedido.pedidoId,
        total: pedido.total,
      });
      uiLogger.info('payment_redirect', {
        metodo: 'transbank',
        pedidoId: pedido.pedidoId,
      });
      iniciarPagoTransbankFormulario(pedido.pedidoId);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo iniciar el pago.';
      uiLogger.error('payment_start_error', { metodo: 'transbank', message: mensaje });
      setPagoError(mensaje);
      setMetodoPago(null);
    }
  };

  const iniciarPagoMercadoPago = async () => {
    if (!validarAntesDePagar()) {
      return;
    }

    setStripeModalVisible(false);
    setStripeError(null);
    setStripeMensaje(null);
    setMetodoPago('mercadopago');
    uiLogger.info('checkout_start', {
      metodo: 'mercadopago',
      itemsCount: items.length,
      total: totalWithIva,
      userId: user?.id ?? null,
    });

    try {
      const pedido = await crearPedido(construirPedidoPayload());
      const pago = await crearPagoMercadoPago({ pedidoId: pedido.pedidoId });
      uiLogger.info('checkout_order_created', {
        metodo: 'mercadopago',
        pedidoId: pedido.pedidoId,
        total: pedido.total,
      });
      uiLogger.info('payment_redirect', {
        metodo: 'mercadopago',
        pedidoId: pedido.pedidoId,
        pagoId: pago.pagoId,
        preferenceId: pago.preferenceId,
      });
      window.location.href = pago.redirectUrl;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo iniciar el pago.';
      uiLogger.error('payment_start_error', { metodo: 'mercadopago', message: mensaje });
      setPagoError(mensaje);
      setMetodoPago(null);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-6 text-white shadow-[0_20px_50px_rgba(10,0,0,0.28)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Carrito</p>
              <h1 className="font-display text-3xl text-white sm:text-4xl">Carrito de compras</h1>
              <p className="text-sm text-white/75">
                Revisa los materiales agregados desde tu cotizacion y ajusta cantidades.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs uppercase tracking-[0.25em] text-white/80">
              {totalQuantity} items
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">Tu carrito esta vacio.</p>
            <p className="mt-2 text-sm text-slate-600">
              Agrega productos desde la cotizacion o el catalogo.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/products"
                className="rounded-full border border-[#F0E0E0] px-6 py-3 text-sm font-semibold text-[#B01010] transition hover:bg-[#F7EAEA]"
              >
                Ver productos
              </Link>
              <Link
                to="/cotizar"
                className="rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(176,16,16,0.3)] transition hover:bg-[#D03030]"
              >
                Cotizar materiales
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.varianteId ? `${item.productId}::${item.varianteId}` : item.productId}
                className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)]"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {item.image && (
                      <div className="flex h-20 w-24 items-center justify-center rounded-2xl border border-[#F0E0E0] bg-white/80 p-3">
                        <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.unit}</p>
                      <h3 className="text-xl font-semibold text-slate-900">{item.name}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold text-slate-600">
                      Cantidad
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={item.quantity}
                        onChange={(event) => updateQuantity(item.productId, Number(event.target.value), item.varianteId)}
                        className="rounded-2xl border border-slate-200 bg-white w-full px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E04040]"
                      />
                    </label>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Neto unitario</p>
                      <p className="text-base font-semibold text-slate-900">{formatCurrency(item.unitPrice)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Neto total</p>
                      <p className="text-base font-semibold text-slate-900">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.varianteId)}
                      className="rounded-full border border-[#F0E0E0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B01010] transition hover:bg-[#F7EAEA]"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-[#F0E0E0] bg-white/80 p-6">
                <div className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Datos de despacho</p>
                  <h2 className="text-xl font-semibold text-slate-900">Direccion y contacto</h2>
                  <p className="text-sm text-slate-600">
                    Si tienes cuenta, tus datos se cargan automaticamente.
                  </p>
                  {clienteCargando && (
                    <p className="text-xs text-slate-500">Cargando datos del cliente...</p>
                  )}
                  {clienteError && <p className="text-xs text-[#B01010]">{clienteError}</p>}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                    Nombre y apellido *
                    <input
                      type="text"
                      value={despacho.nombre}
                      onChange={actualizarCampo('nombre')}
                      aria-invalid={Boolean(errores.nombre)}
                      className={claseInput(errores.nombre)}
                    />
                    {errores.nombre && <span className="text-[0.65rem] text-[#B01010]">{errores.nombre}</span>}
                  </label>
                  <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                    Telefono *
                    <input
                      type="tel"
                      value={despacho.telefono}
                      onChange={actualizarCampo('telefono')}
                      aria-invalid={Boolean(errores.telefono)}
                      className={claseInput(errores.telefono)}
                    />
                    {errores.telefono && <span className="text-[0.65rem] text-[#B01010]">{errores.telefono}</span>}
                  </label>
                  <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600 sm:col-span-2">
                    Email *
                    <input
                      type="email"
                      value={despacho.email}
                      onChange={actualizarCampo('email')}
                      aria-invalid={Boolean(errores.email)}
                      className={claseInput(errores.email)}
                    />
                    {errores.email && <span className="text-[0.65rem] text-[#B01010]">{errores.email}</span>}
                  </label>
                  <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600 sm:col-span-2">
                    Direccion *
                    <input
                      type="text"
                      value={despacho.direccion}
                      onChange={actualizarCampo('direccion')}
                      aria-invalid={Boolean(errores.direccion)}
                      className={claseInput(errores.direccion)}
                    />
                    {errores.direccion && (
                      <span className="text-[0.65rem] text-[#B01010]">{errores.direccion}</span>
                    )}
                  </label>
                  <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                    Comuna *
                    <input
                      type="text"
                      value={despacho.comuna}
                      onChange={actualizarCampo('comuna')}
                      aria-invalid={Boolean(errores.comuna)}
                      className={claseInput(errores.comuna)}
                    />
                    {errores.comuna && <span className="text-[0.65rem] text-[#B01010]">{errores.comuna}</span>}
                  </label>
                  <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                    Ciudad
                    <input
                      type="text"
                      value={despacho.ciudad}
                      onChange={actualizarCampo('ciudad')}
                      className={claseInput()}
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                    Region *
                    <input
                      type="text"
                      value={despacho.region}
                      onChange={actualizarCampo('region')}
                      aria-invalid={Boolean(errores.region)}
                      className={claseInput(errores.region)}
                    />
                    {errores.region && <span className="text-[0.65rem] text-[#B01010]">{errores.region}</span>}
                  </label>
                  <label className="flex flex-col gap-2 text-xs font-semibold text-slate-600 sm:col-span-2">
                    Notas adicionales
                    <textarea
                      rows={3}
                      value={despacho.notas}
                      onChange={actualizarCampo('notas')}
                      className={claseInput()}
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-6 rounded-3xl border border-[#F0E0E0] bg-white/80 p-6 md:sticky md:top-24 md:self-start">
                <div className="flex flex-col gap-4">
                  <div className="space-y-3 text-sm text-slate-600">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Subtotal neto</p>
                      <p className="text-lg font-semibold text-slate-900">{formatCurrency(totalNet)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">IVA 19%</p>
                      <p className="text-lg font-semibold text-slate-900">{formatCurrency(ivaAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Total con IVA</p>
                      <p className="text-2xl font-semibold text-[#B01010]">{formatCurrency(totalWithIva)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="rounded-full border border-[#F0E0E0] px-6 py-3 text-sm font-semibold text-[#B01010] transition hover:bg-[#F7EAEA]"
                  >
                    Vaciar carrito
                  </button>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#F0E0E0] pt-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Pagar con</p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {mostrarMercadoPago && (
                      <button
                        type="button"
                        onClick={iniciarPagoMercadoPago}
                        disabled={Boolean(metodoPago)}
                        aria-label="Pagar con Mercado Pago"
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#009ee3] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(0,158,227,0.25)] transition hover:bg-[#007fc2] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                          <path d="M12.02 5.5c-3.7 0-6.7 1.78-6.7 4.05 0 2.25 2.99 4.05 6.7 4.05 1.2 0 2.35-.2 3.34-.57.24.5.71 1.62 1.9 1.9.45.1.92.06 1.35-.1.37-.13.72-.35.98-.65.44-.53.64-1.18.64-2.04 0-2.27-3-4.64-8.21-4.64z" />
                          <path d="M15.8 11.62c-.25-.56-.76-1.14-1.62-1.14-1.08 0-1.91.75-2.44 1.26-.3.3-.6.57-.95.74-.4.2-.8.25-1.2.16-.51-.1-.99-.43-1.2-.7l.62-.48c.13.17.4.38.74.45.23.05.45.02.69-.1.27-.14.52-.38.78-.64.6-.58 1.52-1.5 2.96-1.5 1.27 0 2.03.82 2.33 1.48l-.71.47z" />
                        </svg>
                        {metodoPago === 'mercadopago' ? 'Redirigiendo...' : 'Mercado Pago'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={iniciarPagoTransbank}
                      disabled={Boolean(metodoPago)}
                      aria-label="Pagar con Transbank"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(176,16,16,0.25)] transition hover:bg-[#D03030] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M3 9h18" />
                        <path d="M7 15h6" />
                      </svg>
                      {metodoPago === 'transbank' ? 'Redirigiendo...' : 'Transbank'}
                    </button>
                    {mostrarStripe && (
                      <button
                        type="button"
                        onClick={iniciarPagoStripe}
                        disabled={stripeBotonDeshabilitado}
                        aria-label="Pagar con Stripe"
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.25)] transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <rect x="3" y="6" width="18" height="12" rx="2" />
                          <path d="M3 10h18" />
                          <path d="M7 14h4" />
                        </svg>
                        {stripeCargando ? 'Preparando...' : 'Stripe (Tarjeta / Apple Pay)'}
                      </button>
                    )}
                  </div>
                  {mostrarStripe && !stripeKeyDisponible && (
                    <p className="text-xs text-[#B01010]">
                      Configura `VITE_STRIPE_PUBLISHABLE_KEY` para habilitar Stripe.
                    </p>
                  )}
                  {mostrarStripe && stripeKeyDisponible && stripeApplePayDisponible === false && (
                    <p className="text-xs text-slate-500">
                      Apple Pay disponible solo en Safari/iPhone/Mac. Puedes pagar con tarjeta.
                    </p>
                  )}
                  {mostrarStripe && stripeKeyDisponible && stripeApplePayDisponible === null && (
                    <p className="text-xs text-slate-500">Verificando disponibilidad de Apple Pay...</p>
                  )}
                  {mostrarStripe && stripeModalVisible && (
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                            Stripe (Tarjeta / Apple Pay)
                          </p>
                          <button
                            type="button"
                            onClick={cerrarStripeModal}
                            className="rounded-full border border-slate-200 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:bg-slate-50"
                          >
                            Cerrar
                          </button>
                        </div>
                        {stripeCargando && (
                          <p className="text-xs text-slate-500">Preparando pago con Stripe...</p>
                        )}
                        {!stripeDisponible && (
                          <p className="text-xs text-[#B01010]">
                            Falta configurar `VITE_STRIPE_PUBLISHABLE_KEY`.
                          </p>
                        )}
                        {stripeDisponible && stripeClientSecret && stripePromise ? (
                          <Elements
                            stripe={stripePromise}
                            options={{
                              clientSecret: stripeClientSecret,
                              appearance: {
                                theme: 'stripe',
                                variables: { colorPrimary: '#B01010' },
                              },
                            }}
                          >
                            <StripeCheckoutForm
                              onResultado={manejarStripeResultado}
                              onError={manejarStripeError}
                              returnUrl={stripeReturnUrl}
                              disabled={stripeCargando}
                            />
                          </Elements>
                        ) : null}
                        {stripeMensaje && <p className="text-xs text-slate-600">{stripeMensaje}</p>}
                        {stripeError && <p className="text-xs text-[#B01010]">{stripeError}</p>}
                      </div>
                    </div>
                  )}
                  {pagoError && <p className="text-xs text-[#B01010]">{pagoError}</p>}
                  {mostrarStripe && (
                    <p className="text-xs text-slate-500">
                      Stripe permite pagar con tarjeta y Apple Pay cuando esta disponible en el navegador.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {stripeExito && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 px-4">
          <div className="modal-panel w-full max-w-md rounded-3xl border border-emerald-200/70 bg-white p-6 shadow-[0_20px_50px_rgba(6,95,70,0.25)]">
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-500">Pago confirmado</p>
            <h2 className="mt-2 text-2xl font-semibold text-emerald-900">Pago confirmado</h2>
            <p className="mt-2 text-sm text-emerald-800/80">
              Tu pago fue aprobado. Seras redirigido a la pagina de exito.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={confirmarStripeExito}
                className="flex-1 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(16,185,129,0.35)] transition hover:bg-emerald-700"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalLogin && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-[#1b0b0b]/40 px-4">
          <div className="modal-panel w-full max-w-md rounded-3xl border border-[#F0E0E0] bg-white p-6 shadow-[0_20px_50px_rgba(176,16,16,0.15)]">
            <div className="flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F7EAEA]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-[#B01010]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-center text-xs uppercase tracking-[0.32em] text-[#B01010]">
              Inicio de sesion requerido
            </p>
            <h2 className="mt-2 text-center text-2xl font-semibold text-slate-900">
              Debes iniciar sesion
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Para continuar con el pago necesitas tener una cuenta e iniciar sesion.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setMostrarModalLogin(false)}
                className="flex-1 rounded-full border border-[#F0E0E0] px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarModalLogin(false);
                  navigate('/login');
                }}
                className="flex-1 rounded-full bg-[#B01010] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(176,16,16,0.3)] transition hover:bg-[#D03030]"
              >
                Iniciar sesion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
