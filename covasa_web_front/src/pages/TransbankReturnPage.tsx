import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { obtenerPagoRecibo, type PagoRecibo } from '../services/api';

type EstadoPago = 'cargando' | 'confirmado' | 'rechazado' | 'error';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const TransbankReturnPage = () => {
  const location = useLocation();
  const { clearCart } = useCart();
  const [estado, setEstado] = useState<EstadoPago>('cargando');
  const [mensaje, setMensaje] = useState('Procesando el pago con Transbank...');
  const [detalle, setDetalle] = useState<string | null>(null);
  const [recibo, setRecibo] = useState<PagoRecibo | null>(null);

  const parametros = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      pagoId: params.get('pagoId') || '',
      estado: (params.get('estado') || '').toUpperCase(),
    };
  }, [location.search]);

  useEffect(() => {
    if (parametros.estado === 'CONFIRMADO') {
      setEstado('confirmado');
      setMensaje('Pago confirmado. Gracias por tu compra.');
      clearCart();
      return;
    }

    if (parametros.estado === 'RECHAZADO') {
      setEstado('rechazado');
      setMensaje('El pago fue rechazado o no pudo confirmarse.');
      return;
    }

    if (parametros.estado === 'ERROR') {
      setEstado('error');
      setMensaje('No pudimos confirmar el pago. Intenta nuevamente.');
      return;
    }

    setEstado('cargando');
    setMensaje('Confirmando tu pago con Transbank...');
  }, [parametros.estado, clearCart]);

  useEffect(() => {
    let activo = true;

    if (!parametros.pagoId) {
      setDetalle('No se pudo identificar el pago.');
      return;
    }

    obtenerPagoRecibo(parametros.pagoId)
      .then((data) => {
        if (!activo) {
          return;
        }
        setRecibo(data);
      })
      .catch((error) => {
        if (!activo) {
          return;
        }
        const texto = error instanceof Error ? error.message : 'No se pudo cargar el recibo.';
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
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/cart"
              className="rounded-full border border-[#F0E0E0] px-6 py-3 text-sm font-semibold text-[#B01010] transition hover:bg-[#F7EAEA]"
            >
              Volver al carrito
            </Link>
            <Link
              to="/"
              className="rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(176,16,16,0.3)] transition hover:bg-[#D03030]"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TransbankReturnPage;
