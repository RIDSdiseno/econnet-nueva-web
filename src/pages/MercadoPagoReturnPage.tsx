import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { obtenerEstadoMercadoPago, type MercadoPagoEstado } from '../services/api';
import { uiLogger } from '../utils/logger';

type EstadoPago = 'cargando' | 'aprobado' | 'pendiente' | 'rechazado' | 'error';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const formatDateTime = (value?: string) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-CL');
};

const resolverEstadoDesdeResultado = (resultado?: string, status?: string | null): EstadoPago => {
  const slug = (resultado || '').toLowerCase();
  const rawStatus = (status || '').toLowerCase();
  if (slug === 'success' || rawStatus === 'approved') return 'aprobado';
  if (['pending', 'in_process', 'in_mediation'].includes(slug) || ['pending', 'in_process'].includes(rawStatus)) return 'pendiente';
  if (['failure', 'rejected', 'cancelled'].includes(slug) || ['rejected', 'cancelled'].includes(rawStatus)) return 'rechazado';
  return 'error';
};

const MercadoPagoReturnPage = () => {
  const { clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { resultado } = useParams<{ resultado?: string }>();
  const [estado, setEstado] = useState<EstadoPago>('cargando');
  const [mensaje, setMensaje] = useState('Sincronizando con Mercado Pago...');
  const [resumen, setResumen] = useState<MercadoPagoEstado | null>(null);

  const datos = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      status: params.get('status'),
      paymentId: params.get('payment_id'),
      preferenceId: params.get('preference_id'),
      externalReference: params.get('external_reference'),
    };
  }, [location.search]);

  useEffect(() => {
    const identificador = datos.paymentId || datos.externalReference || datos.preferenceId;
    let activo = true;

    obtenerEstadoMercadoPago({
      paymentId: datos.paymentId,
      externalReference: datos.externalReference,
      preferenceId: datos.preferenceId,
    })
      .then((data) => {
        if (!activo) return;
        setResumen(data);
        const nuevoEstado = data.estado === 'CONFIRMADO' ? 'aprobado' : data.estado === 'RECHAZADO' ? 'rechazado' : 'pendiente';
        setEstado(nuevoEstado);
        if (nuevoEstado === 'aprobado') clearCart();
      })
      .catch(() => {
        if (!activo) return;
        setEstado(resolverEstadoDesdeResultado(resultado, datos.status));
      });

    return () => { activo = false; };
  }, [clearCart, datos, resultado]);

  // Configuración visual dinámica según el estado
  const config = {
    aprobado: { color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', label: 'Transacción Exitosa' },
    pendiente: { color: 'text-gold', bg: 'bg-gold/5', border: 'border-gold/20', label: 'Pago en Proceso' },
    rechazado: { color: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20', label: 'Pago Rechazado' },
    cargando: { color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10', label: 'Verificando' },
    error: { color: 'text-white/20', bg: 'bg-white/5', border: 'border-white/10', label: 'Error de Sistema' }
  }[estado];

  return (
    <div className="min-h-screen pt-20 pb-40">
      <section className="container mx-auto max-w-2xl px-4">
        <div className={`rounded-[3rem] border ${config.border} ${config.bg} p-10 backdrop-blur-3xl transition-all duration-700`}>
          
          <div className="flex flex-col items-center text-center">
            <div className={`mb-6 rounded-full border ${config.border} p-4`}>
               {estado === 'cargando' ? (
                 <div className="h-8 w-8 animate-spin border-2 border-gold border-t-transparent rounded-full" />
               ) : (
                 <svg className={`h-8 w-8 ${config.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                   {estado === 'aprobado' ? <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />}
                 </svg>
               )}
            </div>
            
            <p className={`text-[10px] uppercase tracking-[0.5em] font-medium ${config.color}`}>{config.label}</p>
            <h1 className="mt-4 text-3xl font-light text-white italic tracking-tight">
              {estado === 'aprobado' ? 'Gracias por tu confianza' : 'Estado de tu orden'}
            </h1>
          </div>

          {/* Detalles del Recibo */}
          <div className="mt-12 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
                <p className="text-[8px] uppercase tracking-widest text-white/30">Monto Total</p>
                <p className="mt-2 text-xl font-medium text-gold">{resumen ? formatCurrency(resumen.monto) : '---'}</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
                <p className="text-[8px] uppercase tracking-widest text-white/30">Código Pedido</p>
                <p className="mt-2 text-xl font-medium text-white">{resumen?.pedidoCodigo || '---'}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                <span className="text-[10px] uppercase tracking-widest text-white/20">ID de Transacción</span>
                <span className="text-xs text-white/60">{resumen?.pagoId || datos.paymentId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-white/20">Fecha</span>
                <span className="text-xs text-white/60">{formatDateTime(resumen?.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => navigate('/')}
              className="flex-1 rounded-full border border-white/10 bg-white/[0.03] py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
            >
              Volver al inicio
            </button>
            {estado !== 'aprobado' && (
              <button
                onClick={() => navigate('/cart')}
                className="flex-1 rounded-full bg-gold py-4 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-white"
              >
                Reintentar Pago
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MercadoPagoReturnPage;