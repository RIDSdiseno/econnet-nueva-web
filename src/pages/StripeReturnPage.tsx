import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { descargarReciboPdf, obtenerEstadoStripe, type StripeEstado } from '../services/api';
import { uiLogger } from '../utils/logger';

type EstadoPago = 'cargando' | 'aprobado' | 'pendiente' | 'rechazado' | 'error';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const formatDateTime = (value?: string) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-CL');
};

const resolverEstadoDesdeResultado = (resultado?: string): EstadoPago => {
  const slug = (resultado || '').toLowerCase();
  if (slug === 'success') return 'aprobado';
  if (slug === 'pending') return 'pendiente';
  if (slug === 'failure') return 'rechazado';
  return 'error';
};

const resolverEstadoInterno = (estado?: string | null): EstadoPago => {
  const valor = (estado || '').toUpperCase();
  if (valor === 'CONFIRMADO') return 'aprobado';
  if (valor === 'PENDIENTE') return 'pendiente';
  if (valor === 'RECHAZADO') return 'rechazado';
  return 'error';
};

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 15;

const StripeReturnPage = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { resultado } = useParams<{ resultado?: string }>();
  const location = useLocation();
  const [estado, setEstado] = useState<EstadoPago>('cargando');
  const [mensaje, setMensaje] = useState('Sincronizando con Stripe...');
  const [resumen, setResumen] = useState<StripeEstado | null>(null);
  const [pdfCargando, setPdfCargando] = useState(false);
  const ultimaClaveRef = useRef<string | null>(null);

  const params = useMemo(() => {
    const search = new URLSearchParams(location.search);
    return {
      pedidoId: search.get('pedidoId'),
      cotizacionId: search.get('cotizacionId'),
      paymentIntentId: search.get('payment_intent'),
    };
  }, [location.search]);

  const estadoFallback = useMemo(() => resolverEstadoDesdeResultado(resultado), [resultado]);
  const esRutaExito = estadoFallback === 'aprobado';

  useEffect(() => {
    const clave = `${params.pedidoId ?? ''}|${params.cotizacionId ?? ''}|${params.paymentIntentId ?? ''}`;
    if (ultimaClaveRef.current === clave) return;
    ultimaClaveRef.current = clave;

    let activo = true;
    let intentos = 0;
    let timer: number | undefined;

    const consultarEstado = async () => {
      try {
        const data = await obtenerEstadoStripe({
          pedidoId: params.pedidoId,
          cotizacionId: params.cotizacionId,
          paymentIntentId: params.paymentIntentId,
        });
        if (!activo) return;
        setResumen(data);
        const nuevoEstado = resolverEstadoInterno(data.estado);
        setEstado(nuevoEstado);
        if (nuevoEstado === 'aprobado') {
          clearCart();
          return;
        }
      } catch (error) {
        if (!activo) return;
      }

      intentos += 1;
      if (intentos < MAX_POLL_ATTEMPTS && activo) {
        timer = window.setTimeout(consultarEstado, POLL_INTERVAL_MS);
      } else if (activo) {
        setEstado(estadoFallback);
        if (estadoFallback === 'aprobado') clearCart();
      }
    };

    consultarEstado();
    return () => { activo = false; if (timer) window.clearTimeout(timer); };
  }, [clearCart, params, estadoFallback]);

  const descargarPdf = async () => {
    if (!resumen?.pagoId || !isAuthenticated) return;
    setPdfCargando(true);
    try {
      const blob = await descargarReciboPdf(resumen.pagoId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo-econnet-${resumen.pagoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setPdfCargando(false);
    }
  };

  // Configuración de UI según estado
  const config = {
    aprobado: { color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', label: 'Inversión Confirmada' },
    pendiente: { color: 'text-gold', border: 'border-gold/20', bg: 'bg-gold/5', label: 'Procesando Transacción' },
    rechazado: { color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5', label: 'Transacción Declinada' },
    cargando: { color: 'text-white/40', border: 'border-white/10', bg: 'bg-white/5', label: 'Sincronizando' },
    error: { color: 'text-white/20', border: 'border-white/10', bg: 'bg-white/5', label: 'Error de Enlace' }
  }[estado] || { color: 'text-white/40', border: 'border-white/10', bg: 'bg-white/5', label: 'Procesando' };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-40 font-inter">
      <section className="container mx-auto max-w-2xl px-6">
        <div className={`rounded-[3rem] border ${config.border} ${config.bg} p-10 backdrop-blur-3xl shadow-2xl transition-all duration-700`}>
          
          <div className="flex flex-col items-center text-center mb-12">
            <div className={`mb-8 rounded-full border ${config.border} p-5 bg-white/[0.02]`}>
               {estado === 'cargando' ? (
                 <div className="h-10 w-10 animate-spin border-2 border-gold border-t-transparent rounded-full" />
               ) : (
                 <svg className={`h-10 w-10 ${config.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                   {estado === 'aprobado' ? <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />}
                 </svg>
               )}
            </div>
            <p className={`text-[10px] uppercase tracking-[0.5em] font-bold ${config.color}`}>{config.label}</p>
            <h1 className="mt-4 text-4xl font-light italic tracking-tight">
              {estado === 'aprobado' ? 'Gracias por tu confianza.' : 'Verificando Operación.'}
            </h1>
          </div>

          {/* RECIBO DIGITAL */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
                <p className="text-[8px] uppercase tracking-widest text-white/30 mb-2">Monto Total</p>
                <p className="text-xl font-medium text-gold">{resumen ? formatCurrency(resumen.monto) : '---'}</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
                <p className="text-[8px] uppercase tracking-widest text-white/30 mb-2">Orden ID</p>
                <p className="text-xl font-medium text-white truncate">{resumen?.pedidoCodigo || resumen?.cotizacionCodigo || '---'}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 space-y-4">
               <div className="flex justify-between items-center text-[10px] uppercase tracking-widest border-b border-white/5 pb-4">
                 <span className="text-white/20">Estado Pasarela</span>
                 <span className="text-white/60">{resumen?.stripeStatus || 'En proceso'}</span>
               </div>
               <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                 <span className="text-white/20">Sincronizado</span>
                 <span className="text-white/60">{formatDateTime(resumen?.updatedAt)}</span>
               </div>
            </div>
          </div>

          {/* ACCIONES ESTRATÉGICAS */}
          <div className="mt-12 flex flex-col gap-4">
            {resumen?.pagoId && (
              <button
                onClick={descargarPdf}
                disabled={pdfCargando}
                className="w-full py-5 rounded-full bg-gold text-black font-bold text-[10px] tracking-[0.3em] hover:bg-white transition-all duration-500 shadow-2xl shadow-gold/20 disabled:opacity-20"
              >
                {pdfCargando ? 'GENERANDO...' : 'DESCARGAR COMPROBANTE PDF'}
              </button>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/')}
                className="py-4 rounded-full border border-white/10 bg-white/[0.02] text-[9px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                IR AL INICIO
              </button>
              <button
                onClick={() => navigate('/mis-pagos')}
                className="py-4 rounded-full border border-white/10 bg-white/[0.02] text-[9px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                HISTORIAL PRO
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StripeReturnPage;