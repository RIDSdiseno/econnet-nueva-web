import { useEffect, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Elements, PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type PaymentRequest } from '@stripe/stripe-js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  crearApplePayDevIntent,
  crearPagoMercadoPago,
  crearPedido,
  iniciarPagoTransbankFormulario,
  obtenerCliente,
} from '../services/api';

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

type MetodoPago = 'transbank' | 'mercadopago' | 'applepay-dev' | null;

type ApplePayPanelProps = {
  total: number;
  clientSecret: string;
  onDisponible: (disponible: boolean) => void;
  onSuccess: () => void;
  onError: (mensaje: string) => void;
  onCancel: () => void;
};

const ECOMMERCE_CLIENTE_ID_KEY = 'covasa_ecommerce_cliente_id';
const LEGACY_CLIENTE_ID_KEY = 'covasa_cliente_id';
const normalizarEnvValor = (value?: string) => (value ?? '').trim().replace(/^['"]|['"]$/g, '');
const applePayDevFlag = normalizarEnvValor(
  import.meta.env.VITE_APPLEPAY_DEV_ENABLED as string | undefined,
).toLowerCase();
const applePayDevFlagEnabled = applePayDevFlag === 'true' || applePayDevFlag === '1' || applePayDevFlag === 'yes';
const stripePublishableKey = normalizarEnvValor(
  (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST as string | undefined) ??
    (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined),
);
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

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

const ApplePayDevPanel = ({
  total,
  clientSecret,
  onDisponible,
  onSuccess,
  onError,
  onCancel,
}: ApplePayPanelProps) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

  useEffect(() => {
    if (!stripe || total <= 0 || !clientSecret) {
      setPaymentRequest(null);
      return;
    }

    let activo = true;
    const request = stripe.paymentRequest({
      country: 'CL',
      currency: 'clp',
      total: { label: 'Total', amount: total },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    const handlePaymentMethod = async (event: any) => {
      if (!stripe) {
        event.complete('fail');
        onError('Stripe no disponible para Apple Pay.');
        return;
      }

      try {
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: event.paymentMethod.id },
          { handleActions: false }
        );

        if (error || !paymentIntent) {
          event.complete('fail');
          onError('No se pudo procesar el pago.');
          return;
        }

        event.complete('success');

        let intentFinal = paymentIntent;
        if (paymentIntent.status === 'requires_action') {
          const { error: actionError, paymentIntent: actionIntent } =
            await stripe.confirmCardPayment(clientSecret);

          if (actionError || !actionIntent) {
            onError('No se pudo completar el pago.');
            return;
          }
          intentFinal = actionIntent;
        }

        if (intentFinal.status === 'succeeded') {
          onSuccess();
          return;
        }

        onError('Pago no completado.');
      } catch {
        event.complete('fail');
        onError('No se pudo procesar el pago.');
      }
    };

    const handleCancel = () => {
      if (activo) {
        onCancel();
      }
    };

    request.on('paymentmethod', handlePaymentMethod);
    request.on('cancel', handleCancel);

    request.canMakePayment().then((result) => {
      if (!activo) {
        return;
      }
      const disponible = Boolean(result?.applePay);
      onDisponible(disponible);
      setPaymentRequest(disponible ? request : null);
    });

    return () => {
      activo = false;
      (request as unknown as { off?: (event: string, handler: (event?: unknown) => void) => void }).off?.(
        'paymentmethod',
        handlePaymentMethod
      );
      (request as unknown as { off?: (event: string, handler: (event?: unknown) => void) => void }).off?.(
        'cancel',
        handleCancel
      );
    };
  }, [stripe, total, clientSecret, onDisponible, onSuccess, onError, onCancel]);

  if (!paymentRequest) {
    return null;
  }

  return (
    <PaymentRequestButtonElement
      options={{
        paymentRequest,
        style: {
          paymentRequestButton: {
            type: 'default',
            theme: 'dark',
            height: '44px',
          },
        },
      }}
    />
  );
};

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items, totalQuantity, updateQuantity, removeItem, clearCart } = useCart();
  const applePayDevEnabled = applePayDevFlagEnabled && import.meta.env.MODE !== 'production';
  const applePayKeyDisponible = Boolean(stripePublishableKey);
  const stripeDevDisponible = applePayDevEnabled && applePayKeyDisponible && Boolean(stripePromise);
  const [despacho, setDespacho] = useState<DespachoForm>(despachoInicial);
  const [errores, setErrores] = useState<ErroresDespacho>({});
  const [pagoError, setPagoError] = useState<string | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(null);
  const [applePayDisponible, setApplePayDisponible] = useState<boolean | null>(null);
  const [applePayDisponiblePanel, setApplePayDisponiblePanel] = useState<boolean | null>(null);
  const [applePayPedidoId, setApplePayPedidoId] = useState<string | null>(null);
  const [applePayTotal, setApplePayTotal] = useState<number | null>(null);
  const [applePayClientSecret, setApplePayClientSecret] = useState<string | null>(null);
  const [applePayPanelVisible, setApplePayPanelVisible] = useState(false);
  const [applePayCargando, setApplePayCargando] = useState(false);
  const [applePayError, setApplePayError] = useState<string | null>(null);
  const [applePayMensaje, setApplePayMensaje] = useState<string | null>(null);
  const [applePayExito, setApplePayExito] = useState(false);
  const [ecommerceClienteId, setEcommerceClienteId] = useState<string | null>(() =>
    user?.ecommerceClienteId ?? obtenerClienteIdInicial()
  );
  const [clienteCargando, setClienteCargando] = useState(false);
  const [clienteError, setClienteError] = useState<string | null>(null);

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
  const applePayBotonDeshabilitado =
    !stripeDevDisponible || Boolean(metodoPago) || applePayCargando;

  const asignarSiVacio = (actual: string, nuevo?: string | null) =>
    limpiarTexto(actual) ? actual : nuevo ?? actual;

  useEffect(() => {
    if (!stripeDevDisponible || totalWithIva <= 0 || !stripePromise) {
      setApplePayDisponible(false);
      return;
    }

    let activo = true;

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
        setApplePayDisponible(Boolean(result?.applePay));
      })
      .catch(() => {
        if (activo) {
          setApplePayDisponible(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [stripeDevDisponible, totalWithIva]);

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
      setPagoError('Debes iniciar sesion para continuar con el pago.');
      navigate('/login');
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
      cantidad: item.quantity,
    })),
  });

  const manejarApplePayDisponible = (disponible: boolean) => {
    setApplePayDisponiblePanel(disponible);
    if (!disponible) {
      setApplePayError('Apple Pay no disponible en este navegador/dispositivo.');
      setMetodoPago(null);
      return;
    }
    setApplePayError(null);
  };

  const manejarApplePaySuccess = () => {
    setApplePayExito(true);
    setApplePayMensaje('Pago aprobado (DEV).');
  };

  const manejarApplePayError = (mensaje: string) => {
    setApplePayError(mensaje);
    setMetodoPago(null);
  };

  const manejarApplePayCancel = () => {
    setApplePayMensaje('Apple Pay cancelado.');
    setMetodoPago(null);
  };

  const iniciarApplePayDev = async () => {
    if (!applePayDevEnabled) {
      return;
    }

    setApplePayError(null);
    setApplePayMensaje(null);
    setApplePayDisponiblePanel(null);
    setApplePayExito(false);

    if (!stripeDevDisponible) {
      setApplePayPanelVisible(true);
      setApplePayError('Configura la llave publishable de Stripe para Apple Pay.');
      return;
    }

    if (applePayDisponible === false) {
      setApplePayPanelVisible(true);
      setApplePayError('Apple Pay no disponible en este navegador/dispositivo.');
      return;
    }

    if (!validarAntesDePagar()) {
      return;
    }

    if (!user?.id) {
      setApplePayError('Debes iniciar sesion para continuar con Apple Pay.');
      return;
    }

    setApplePayPanelVisible(true);
    setApplePayCargando(true);
    setMetodoPago('applepay-dev');

    try {
      let pedidoId = applePayPedidoId;
      let total = applePayTotal;

      if (!pedidoId || !total) {
        const pedido = await crearPedido(construirPedidoPayload());
        pedidoId = pedido.pedidoId;
        total = pedido.total;
        setApplePayPedidoId(pedidoId);
        setApplePayTotal(total);
      }

      const intent = await crearApplePayDevIntent({ orderId: pedidoId, usuarioId: user.id });
      setApplePayClientSecret(intent.clientSecret);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo iniciar Apple Pay.';
      setApplePayError(mensaje);
      setMetodoPago(null);
    } finally {
      setApplePayCargando(false);
    }
  };

  const iniciarPagoTransbank = async () => {
    if (!validarAntesDePagar()) {
      return;
    }

    setApplePayPanelVisible(false);
    setApplePayError(null);
    setApplePayMensaje(null);
    setMetodoPago('transbank');

    try {
      const pedido = await crearPedido(construirPedidoPayload());
      iniciarPagoTransbankFormulario(pedido.pedidoId);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo iniciar el pago.';
      setPagoError(mensaje);
      setMetodoPago(null);
    }
  };

  const iniciarPagoMercadoPago = async () => {
    if (!validarAntesDePagar()) {
      return;
    }

    setApplePayPanelVisible(false);
    setApplePayError(null);
    setApplePayMensaje(null);
    setMetodoPago('mercadopago');

    try {
      const pedido = await crearPedido(construirPedidoPayload());
      const pago = await crearPagoMercadoPago({ pedidoId: pedido.pedidoId });
      window.location.href = pago.redirectUrl;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo iniciar el pago.';
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
                key={item.productId}
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
                        onChange={(event) => updateQuantity(item.productId, Number(event.target.value))}
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
                      onClick={() => removeItem(item.productId)}
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

              <div className="flex flex-col gap-6 rounded-3xl border border-[#F0E0E0] bg-white/80 p-6">
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
                    {applePayDevEnabled && (
                      <button
                        type="button"
                        onClick={iniciarApplePayDev}
                        disabled={applePayBotonDeshabilitado}
                        aria-label="Pagar con Apple Pay (DEV)"
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                          <path d="M16.365 1.43c0 1.14-.43 2.22-1.2 3.03-.87.9-2.31 1.6-3.63 1.49-.14-1.15.36-2.31 1.16-3.15.84-.9 2.28-1.58 3.67-1.37z" />
                          <path d="M12.12 5.05c1.74 0 2.5-.93 4.67-.93 2.17 0 3.26 1.2 3.26 1.2-1.24.76-2.1 2.18-2.1 3.86 0 2.1 1.5 3.18 2.1 3.54-.42 1.2-1.3 2.42-2.24 3.34-.86.84-1.74 1.42-3.03 1.42-1.27 0-1.68-.38-3.17-.38-1.5 0-2.02.4-3.18.4-1.2 0-2.06-.63-2.92-1.55-1.88-2-3.32-5.68-1.37-8.2.96-1.22 2.7-2.02 4.58-2.02 1.16 0 2.13.4 2.9.4z" />
                        </svg>
                        {applePayCargando ? 'Preparando...' : 'Apple Pay (DEV)'}
                      </button>
                    )}
                  </div>
                  {applePayDevEnabled && !applePayKeyDisponible && (
                    <p className="text-xs text-[#B01010]">
                      Configura `VITE_STRIPE_PUBLISHABLE_KEY_TEST` para habilitar Apple Pay (DEV).
                    </p>
                  )}
                  {applePayDevEnabled && applePayKeyDisponible && applePayDisponible === false && (
                    <p className="text-xs text-slate-500">
                      Apple Pay no disponible en este navegador/dispositivo.
                    </p>
                  )}
                  {applePayDevEnabled && applePayKeyDisponible && applePayDisponible === null && (
                    <p className="text-xs text-slate-500">Verificando disponibilidad de Apple Pay...</p>
                  )}
                  {applePayDevEnabled && applePayPanelVisible && (
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
                      <div className="flex flex-col gap-3">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                          Apple Pay (DEV)
                        </p>
                        {applePayCargando && (
                          <p className="text-xs text-slate-500">Preparando Apple Pay con Stripe...</p>
                        )}
                        {!stripeDevDisponible && (
                          <p className="text-xs text-[#B01010]">
                            Falta configurar `VITE_STRIPE_PUBLISHABLE_KEY_TEST`.
                          </p>
                        )}
                        {stripeDevDisponible && applePayClientSecret && applePayTotal ? (
                          <Elements stripe={stripePromise}>
                            <ApplePayDevPanel
                              total={applePayTotal}
                              clientSecret={applePayClientSecret}
                              onDisponible={manejarApplePayDisponible}
                              onSuccess={manejarApplePaySuccess}
                              onError={manejarApplePayError}
                              onCancel={manejarApplePayCancel}
                            />
                          </Elements>
                        ) : null}
                        {applePayDisponiblePanel === false && (
                          <p className="text-xs text-[#B01010]">
                            Apple Pay no disponible en este navegador/dispositivo.
                          </p>
                        )}
                        {applePayExito && (
                          <p className="text-xs text-emerald-600">Pago aprobado (DEV).</p>
                        )}
                        {applePayMensaje && <p className="text-xs text-slate-600">{applePayMensaje}</p>}
                        {applePayError && <p className="text-xs text-[#B01010]">{applePayError}</p>}
                      </div>
                    </div>
                  )}
                  {pagoError && <p className="text-xs text-[#B01010]">{pagoError}</p>}
                  <p className="text-xs text-slate-500">
                    Apple Pay (DEV) usa Stripe en modo test. Mercado Pago y Transbank inician el pago real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CartPage;
