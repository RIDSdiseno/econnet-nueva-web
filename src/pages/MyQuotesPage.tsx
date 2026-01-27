import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuoteHistory } from '../context/QuoteHistoryContext';
import { eliminarCotizacion, listarMisCotizaciones, type CotizacionResumen } from '../services/api';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Por confirmar';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Por confirmar';
  return date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
};

const estadoLabel = (estado?: string | null) => {
  if (!estado) return 'NUEVA';
  return estado.replace(/_/g, ' ');
};

const estadoColor = (estado?: string | null) => {
  if (!estado) return 'text-emerald-600';
  if (estado === 'PAGADA') return 'text-emerald-600';
  if (estado === 'RESPONDIDA') return 'text-emerald-600';
  if (estado === 'EN_REVISION') return 'text-amber-600';
  if (estado === 'CERRADA') return 'text-slate-500';
  return 'text-emerald-600';
};

const MyQuotesPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { quotes, removeQuote, clearQuotes, upsertQuote } = useQuoteHistory();
  const userId = user?.id ?? null;
  const userQuotes = userId ? quotes.filter((quote) => quote.ownerId === userId) : [];
  const [estado, setEstado] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [remoteQuotes, setRemoteQuotes] = useState<CotizacionResumen[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return;
    }

    let isActive = true;
    setEstado('loading');
    setError(null);
    setRemoteQuotes([]);

    listarMisCotizaciones()
      .then((data) => {
        if (!isActive) return;
        setRemoteQuotes(data);
        data.forEach((quote) => {
          upsertQuote({
            id: quote.id,
            ownerId: userId,
            codigo: quote.codigo ?? null,
            total: quote.total,
            estado: quote.estado ?? null,
            createdAt: quote.createdAt ?? null,
            nombreContacto: quote.nombreContacto ?? null,
            itemsCount: quote.itemsCount ?? null,
          });
        });
        setEstado('idle');
      })
      .catch((err) => {
        if (!isActive) return;
        const mensaje = err instanceof Error ? err.message : 'No se pudieron cargar tus cotizaciones.';
        setError(mensaje);
        setEstado('error');
      });

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, upsertQuote, userId]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-10 text-center shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
          <p className="text-xs uppercase tracking-[0.32em] text-[#B01010]">Mis cotizaciones</p>
          <h1 className="mt-3 font-display text-3xl text-slate-900">Inicia sesión</h1>
          <p className="mt-3 text-sm text-slate-600">
            Debes iniciar sesión para ver tus cotizaciones.
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

  const handleRemove = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Quitar esta cotizacion de tu lista?')) {
      return;
    }
    setDeletingId(id);
    setError(null);
    try {
      await eliminarCotizacion(id);
      setRemoteQuotes((prev) => prev.filter((quote) => quote.id !== id));
      removeQuote(id);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo eliminar la cotizacion.';
      setError(mensaje);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClear = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Eliminar todas tus cotizaciones guardadas?')) {
      return;
    }
    if (remoteQuotes.length === 0) {
      if (userId) {
        userQuotes.forEach((quote) => removeQuote(quote.id));
        return;
      }
      clearQuotes();
      return;
    }

    setDeletingId('ALL');
    setError(null);
    const resultados = await Promise.allSettled(
      remoteQuotes.map((quote) => eliminarCotizacion(quote.id))
    );
    const huboError = resultados.some((resultado) => resultado.status === 'rejected');
    if (huboError) {
      setError('Algunas cotizaciones no se pudieron eliminar. Intenta nuevamente.');
    } else {
      setRemoteQuotes([]);
    }
    remoteQuotes.forEach((quote) => removeQuote(quote.id));
    setDeletingId(null);
  };

  const quotesToShow = estado === 'error' ? userQuotes : remoteQuotes;

  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-8 text-white lg:p-12">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Mis cotizaciones</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl">Tus solicitudes recientes</h1>
            <p className="max-w-2xl text-sm text-white/75">
              Revisa las cotizaciones asociadas a tu cuenta.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        {error && (
          <div className="mb-6 rounded-2xl border border-[#F0E0E0] bg-[#F7EAEA] px-4 py-3 text-sm text-[#B01010]">
            {error}
          </div>
        )}
        {estado === 'loading' && remoteQuotes.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 text-center text-sm text-slate-600 shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
            Cargando cotizaciones...
          </div>
        ) : quotesToShow.length === 0 ? (
          <div className="rounded-3xl border border-[#F0E0E0] bg-white/90 p-8 text-center shadow-[0_20px_50px_rgba(15,23,32,0.08)]">
            <p className="text-lg font-semibold text-slate-900">Aun no tienes cotizaciones guardadas.</p>
            <p className="mt-2 text-sm text-slate-600">
              Cuando envies una solicitud, aparecera aqui para consultarla.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/cotizar"
                className="rounded-full bg-[#B01010] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(176,16,16,0.3)] transition hover:bg-[#D03030]"
              >
                Crear cotizacion
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {quotesToShow.length} cotizaciones
              </p>
              <button
                type="button"
                onClick={handleClear}
                disabled={deletingId === 'ALL'}
                className="rounded-full border border-[#F0E0E0] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B01010] transition hover:bg-[#F7EAEA] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === 'ALL' ? 'Eliminando...' : 'Limpiar historial'}
              </button>
            </div>

            {quotesToShow.map((quote) => (
              <div
                key={quote.id}
                className="zoom-card rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,32,0.08)]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className={`text-xs uppercase tracking-[0.25em] ${estadoColor(quote.estado)}`}>
                      {estadoLabel(quote.estado)}
                    </p>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {quote.codigo || quote.id}
                    </h2>
                    <p className="text-sm text-slate-600">{formatDateTime(quote.createdAt)}</p>
                    {quote.nombreContacto && (
                      <p className="text-sm text-slate-600">Contacto: {quote.nombreContacto}</p>
                    )}
                    {typeof quote.itemsCount === 'number' && (
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {quote.itemsCount} items solicitados
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">Total</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatCurrency(quote.total)}</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link
                        to={`/mis-cotizaciones/${quote.id}`}
                        className="rounded-full bg-[#B01010] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(176,16,16,0.25)] transition hover:bg-[#D03030]"
                      >
                        Ver detalle
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemove(quote.id)}
                        disabled={deletingId === quote.id}
                        className="rounded-full border border-[#F0E0E0] px-5 py-2.5 text-sm font-semibold text-[#B01010] transition hover:bg-[#F7EAEA] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === quote.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyQuotesPage;
