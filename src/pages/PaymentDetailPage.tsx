import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { descargarReciboPdf, obtenerPagoDetalle, type PagoDetalle } from '../services/api';

type EstadoDetalle = 'cargando' | 'listo' | 'error';

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

const resolverMetodoPago = (pago: PagoDetalle) => {
  if (pago.metodo === 'STRIPE' || (pago.metodo === 'OTRO' && pago.proveedor?.referencia?.startsWith('pi_'))) return 'Stripe';
  return pago.metodo.replace(/_/g, ' ');
};

const PaymentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [detalle, setDetalle] = useState<PagoDetalle | null>(null);
  const [estado, setEstado] = useState<EstadoDetalle>('cargando');
  const [error, setError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfCargando, setPdfCargando] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !id) { setEstado('error'); return; }
    let activo = true;
    setEstado('cargando');
    obtenerPagoDetalle(id)
      .then((data) => {
        if (!activo) return;
        setDetalle(data);
        setEstado('listo');
      })
      .catch((err) => {
        if (!activo) return;
        setError(err instanceof Error ? err.message : 'Error de sincronización.');
        setEstado('error');
      });
    return () => { activo = false; };
  }, [id, isAuthenticated]);

  const descargarPdf = async () => {
    if (!id) return;
    setPdfError(null);
    setPdfCargando(true);
    try {
      const blob = await descargarReciboPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo-${detalle?.pedido?.codigo || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setPdfError('No se pudo generar el documento.');
    } finally {
      setPdfCargando(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-[3rem] border border-white/10 bg-white/[0.02] p-12 text-center backdrop-blur-2xl shadow-2xl">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold mb-6">Seguridad Econnet</p>
          <h1 className="text-3xl font-light tracking-tight mb-4 text-white">Acceso Denegado</h1>
          <p className="text-sm text-white/40 font-light mb-8 leading-relaxed">Debes autenticar tu cuenta para visualizar los detalles financieros de este registro.</p>
          <Link to="/login" className="inline-block w-full py-5 rounded-full bg-gold text-black font-bold text-[10px] tracking-widest hover:bg-white transition-all duration-500">
            INICIAR SESIÓN
          </Link>
        </div>
      </div>
    );
  }

  if (estado === 'cargando') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/20">Obteniendo recibo digital...</p>
      </div>
    );
  }

  if (estado === 'error' || !detalle) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-[3rem] border border-red-500/10 bg-red-500/5 p-12 text-center backdrop-blur-2xl">
          <p className="text-sm text-red-400/60 font-light">{error || 'Registro no encontrado.'}</p>
          <Link to="/mis-pagos" className="inline-block mt-8 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">Volver al Historial</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-40 font-inter">
      <section className="container mx-auto px-6 max-w-5xl">
        
        {/* RESUMEN DEL RECIBO */}
        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.02] p-10 md:p-16 mb-12 shadow-2xl backdrop-blur-sm">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/5 rounded-full blur-[100px]"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              <span className={`text-[9px] font-bold uppercase tracking-[0.4em] px-3 py-1 rounded-full border ${estadoColor(detalle.estado).replace('text-', 'border-')}/20 ${estadoColor(detalle.estado)}`}>
                {estadoLabel(detalle.estado)}
              </span>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight italic">Comprobante <span className="text-gold font-normal">Digital</span></h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">ID de Pago: <span className="text-white/60 font-mono ml-2">{detalle.pagoId}</span></p>
            </div>
            
            <button
              onClick={descargarPdf}
              disabled={pdfCargando}
              className="px-10 py-5 rounded-full bg-gold text-black font-bold text-[10px] tracking-widest hover:bg-white transition-all duration-500 shadow-2xl shadow-gold/20 disabled:opacity-20 shrink-0"
            >
              {pdfCargando ? 'GENERANDO...' : 'DESCARGAR PDF'}
            </button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-[8px] uppercase tracking-widest text-white/20">Referencia Pedido</p>
              <p className="text-lg font-light text-white">{detalle.pedido?.codigo || '---'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] uppercase tracking-widest text-white/20">Método de Pago</p>
              <p className="text-lg font-light text-white">{resolverMetodoPago(detalle)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] uppercase tracking-widest text-white/20">Fecha Registro</p>
              <p className="text-lg font-light text-white">{formatDateTime(detalle.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] uppercase tracking-widest text-white/20">Inversión Total</p>
              <p className="text-2xl font-light text-gold tracking-tight">{formatCurrency(detalle.monto)}</p>
            </div>
          </div>
        </div>

        {/* DETALLE TÉCNICO DEL PEDIDO */}
        {detalle.pedido && (
          <div className="space-y-12">
            <div className="grid md:grid-cols-12 gap-12">
              
              {/* LISTA DE ITEMS */}
              <div className="md:col-span-8 space-y-6">
                <h2 className="text-[10px] uppercase tracking-[0.5em] text-white/20 ml-6">Artículos Curados</h2>
                <div className="space-y-3">
                  {detalle.pedido.items.map((item, index) => (
                    <div key={`${item.descripcionSnapshot}-${index}`} className="group p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-lg font-light text-white group-hover:text-gold transition-colors">{item.descripcionSnapshot}</p>
                          <p className="text-[9px] uppercase tracking-widest text-white/20">Cantidad: {item.cantidad}</p>
                        </div>
                        <p className="text-sm font-light text-white">{formatCurrency(item.totalSnapshot)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LOGÍSTICA DE DESPACHO */}
              <div className="md:col-span-4">
                <div className="sticky top-32 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-10 space-y-8 backdrop-blur-md">
                   <h3 className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Logística</h3>
                   {detalle.pedido.direccion ? (
                     <div className="space-y-6 text-sm font-light text-white/60 leading-relaxed">
                        <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/20 mb-2">Responsable</p>
                          <p className="text-white font-normal">{detalle.pedido.direccion.nombreContacto}</p>
                        </div>
                        <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/20 mb-2">Destino</p>
                          <p>{detalle.pedido.direccion.direccion}</p>
                          <p>{detalle.pedido.direccion.comuna}, {detalle.pedido.direccion.region}</p>
                        </div>
                     </div>
                   ) : <p className="text-xs text-white/20 italic">Información de despacho no disponible.</p>}
                </div>
              </div>

            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default PaymentDetailPage;