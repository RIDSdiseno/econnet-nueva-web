import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarMisPagos, type PagoListado } from '../services/api';

type EstadoListado = 'idle' | 'cargando' | 'error';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Por confirmar';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
};

const estadoLabel = (estado?: string | null) => {
  if (!estado) return 'PENDIENTE';
  return estado.replace(/_/g, ' ');
};

const estadoColor = (estado?: string | null) => {
  if (!estado) return 'text-gold';
  if (estado === 'CONFIRMADO') return 'text-emerald-400';
  if (estado === 'RECHAZADO') return 'text-red-400';
  if (estado === 'PENDIENTE') return 'text-gold';
  return 'text-white/20';
};

const resolverMetodoPago = (pago: PagoListado) => {
  if (pago.metodo === 'STRIPE') return 'Stripe';
  if (pago.metodo === 'OTRO' && pago.proveedor?.referencia?.startsWith('pi_')) return 'Stripe';
  return pago.metodo.replace(/_/g, ' ');
};

const MyPaymentsPage = () => {
  const { isAuthenticated } = useAuth();
  const [pagos, setPagos] = useState<PagoListado[]>([]);
  const [estado, setEstado] = useState<EstadoListado>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let activo = true;
    setEstado('cargando');
    setError(null);

    listarMisPagos()
      .then((data) => {
        if (!activo) return;
        setPagos(data);
        setEstado('idle');
      })
      .catch((err) => {
        if (!activo) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar tus pagos.');
        setEstado('error');
      });
    return () => { activo = false; };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-[3rem] border border-white/10 bg-white/[0.02] p-12 text-center backdrop-blur-2xl">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold mb-6">Acceso Privado</p>
          <h1 className="text-3xl font-light tracking-tight mb-4">Identificación requerida</h1>
          <p className="text-sm text-white/40 font-light mb-8">Debes iniciar sesión para revisar tu historial de transacciones y estados de pago.</p>
          <Link to="/login" className="inline-block w-full py-4 rounded-full bg-gold text-black font-bold text-[10px] tracking-widest hover:bg-white transition-all duration-500">
            ENTRAR AL ECOSISTEMA
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 font-inter">
      <section className="container mx-auto px-6">
        
        {/* HEADER - Estilo Spotlight */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-10 md:p-16 mb-16 shadow-2xl backdrop-blur-sm">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/5 rounded-full blur-[100px]"></div>
          <div className="relative space-y-4">
            <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">Finanzas Pro</p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight italic">Historial de <span className="text-gold font-normal">Compras</span></h1>
            <p className="max-w-2xl text-sm md:text-base text-white/40 font-light leading-relaxed">
              Gestión centralizada de transacciones, validación de estados y recibos digitales de tu infraestructura tecnológica.
            </p>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="space-y-8">
          {estado === 'cargando' && (
            <div className="py-40 text-center">
              <div className="h-10 w-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">Sincronizando transacciones...</p>
            </div>
          )}

          {estado === 'error' && (
            <div className="p-10 rounded-[2rem] border border-red-500/20 bg-red-500/5 text-center">
              <p className="text-red-400 text-sm font-light tracking-widest">{error}</p>
            </div>
          )}

          {estado === 'idle' && pagos.length === 0 && (
            <div className="py-40 rounded-[3rem] border border-white/5 bg-white/[0.01] text-center">
              <p className="text-xl font-light text-white/60 mb-8">Tu historial de pagos está vacío.</p>
              <Link to="/products" className="inline-block px-12 py-4 rounded-full bg-gold text-black font-bold text-[10px] tracking-widest hover:bg-white transition-all">
                EXPLORAR CATÁLOGO
              </Link>
            </div>
          )}

          {estado === 'idle' && pagos.length > 0 && (
            <div className="space-y-6">
              <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 ml-6">{pagos.length} transacciones registradas</p>

              {pagos.map((pago) => (
                <div key={pago.pagoId} className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 transition-all duration-500 hover:bg-white/[0.03] hover:border-white/10">
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className={`text-[9px] font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full border ${estadoColor(pago.estado).replace('text-', 'border-').replace('text-', 'bg-')}/5 ${estadoColor(pago.estado)}`}>
                          {estadoLabel(pago.estado)}
                        </span>
                        <span className="text-[10px] text-white/20 uppercase tracking-widest">{resolverMetodoPago(pago)}</span>
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight">
                          {pago.pedido?.codigo || pago.pedido?.id || pago.pagoId}
                        </h2>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-1">{formatDateTime(pago.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="text-center sm:text-right px-8 border-x border-white/5">
                        <p className="text-[8px] uppercase tracking-widest text-white/20 mb-1">Monto Invertido</p>
                        <p className="text-2xl font-light text-gold tracking-tight">{formatCurrency(pago.monto)}</p>
                      </div>
                      <Link
                        to={`/mis-pagos/${pago.pagoId}`}
                        className="w-full sm:w-auto px-10 py-4 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-gold hover:text-black transition-all duration-500"
                      >
                        DETALLES
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyPaymentsPage;