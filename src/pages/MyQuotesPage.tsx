import { Link } from 'react-router-dom';
import { useQuoteHistory } from '../context/QuoteHistoryContext';

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
  const { quotes, removeQuote, clearQuotes } = useQuoteHistory();

  const handleRemove = (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Quitar esta cotizacion de tu lista?')) {
      return;
    }
    removeQuote(id);
  };

  const handleClear = () => {
    if (typeof window !== 'undefined' && !window.confirm('Eliminar todas tus cotizaciones guardadas?')) {
      return;
    }
    clearQuotes();
  };

  return (
    <div className="space-y-10 pb-20">
      <section className="container mx-auto px-4 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-[#1b0b0b] p-8 text-white lg:p-12">
          <div className="absolute inset-0 hero-grid opacity-10"></div>
          <div className="relative space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-[#E04040]">Mis cotizaciones</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl">Tus solicitudes recientes</h1>
            <p className="max-w-2xl text-sm text-white/75">
              Guarda y revisa tus cotizaciones enviadas desde este navegador.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        {quotes.length === 0 ? (
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
                {quotes.length} cotizaciones
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full border border-[#F0E0E0] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B01010] transition hover:bg-[#F7EAEA]"
              >
                Limpiar historial
              </button>
            </div>

            {quotes.map((quote) => (
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
                        className="rounded-full border border-[#F0E0E0] px-5 py-2.5 text-sm font-semibold text-[#B01010] transition hover:bg-[#F7EAEA]"
                      >
                        Eliminar
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
