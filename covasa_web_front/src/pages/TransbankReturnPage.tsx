import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { confirmarPagoTransbank } from '../services/api';

type EstadoPago = 'cargando' | 'confirmado' | 'rechazado' | 'error';

type ResultadoPago = {
  pagoId: string;
  estado: string;
  transbank: unknown;
};

const TransbankReturnPage = () => {
  const location = useLocation();
  const { clearCart } = useCart();
  const [estado, setEstado] = useState<EstadoPago>('cargando');
  const [mensaje, setMensaje] = useState('Confirmando tu pago con Transbank...');
  const [detalle, setDetalle] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoPago | null>(null);

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('token_ws') || params.get('token') || '';
  }, [location.search]);

  useEffect(() => {
    let activo = true;

    const confirmar = async () => {
      if (!token) {
        setEstado('error');
        setMensaje('No se recibio el token de Transbank.');
        return;
      }

      try {
        const data = await confirmarPagoTransbank(token);
        if (!activo) {
          return;
        }

        setResultado(data);
        if (data.estado === 'CONFIRMADO') {
          setEstado('confirmado');
          setMensaje('Pago confirmado. Gracias por tu compra.');
          clearCart();
        } else {
          setEstado('rechazado');
          setMensaje('El pago fue rechazado o no pudo confirmarse.');
        }
      } catch (error) {
        if (!activo) {
          return;
        }
        const texto = error instanceof Error ? error.message : 'No se pudo confirmar el pago.';
        setEstado('error');
        setMensaje('No se pudo confirmar el pago.');
        setDetalle(texto);
      }
    };

    confirmar();

    return () => {
      activo = false;
    };
  }, [token, clearCart]);

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

          {resultado && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Referencia</p>
              <p className="mt-1 font-semibold text-slate-700">{resultado.pagoId}</p>
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

          {token && (
            <p className="mt-4 text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">Token {token}</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default TransbankReturnPage;
