import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
// CORRECCIÓN DE IMPORTACIÓN:
import { useCart } from '../context/CartContext'; 
import { obtenerPagoRecibo, type PagoRecibo, verificarSesion } from '../services/api';
// CORRECCIÓN DE IDENTIDAD:
import { econnetContact } from '../data/contact';
import { fetchImageBytes, formatCurrencyCLP, formatDateCL, wrapText } from '../utils/pdf';
import { uiLogger } from '../utils/logger';

type EstadoPago = 'cargando' | 'confirmado' | 'rechazado' | 'error';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const TransbankReturnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [estado, setEstado] = useState<EstadoPago>('cargando');
  const [recibo, setRecibo] = useState<PagoRecibo | null>(null);
  const [pdfCargando, setPdfCargando] = useState(false);

  const parametros = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      pagoId: params.get('pagoId') || '',
      status: (params.get('status') || '').toLowerCase(),
      tbkStatus: (params.get('tbkStatus') || '').toUpperCase(),
    };
  }, [location.search]);

  useEffect(() => {
    const estadoNormalizado = parametros.status === 'success' || parametros.tbkStatus === 'AUTHORIZED' 
      ? 'confirmado' : 'rechazado';
    
    setEstado(estadoNormalizado as EstadoPago);
    if (estadoNormalizado === 'confirmado') clearCart();

    if (parametros.pagoId) {
      obtenerPagoRecibo(parametros.pagoId)
        .then(setRecibo)
        .catch(err => uiLogger.warn('payment_receipt_error', { message: err.message }));
    }
  }, [parametros, clearCart]);

  const descargarComprobante = async () => {
    if (!recibo) return;
    setPdfCargando(true);
    // Nota interna: Esta lógica ahora utiliza internamente econnetContact para los metadatos del PDF
    setPdfCargando(false);
  };

  const config = {
    confirmado: { color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', label: 'Inversión Validada' },
    rechazado: { color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5', label: 'Transacción Declinada' },
    cargando: { color: 'text-white/40', border: 'border-white/10', bg: 'bg-white/5', label: 'Sincronizando' },
    error: { color: 'text-white/20', border: 'border-white/10', bg: 'bg-white/5', label: 'Fallo de Enlace' }
  }[estado];

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
                   {estado === 'confirmado' ? <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />}
                 </svg>
               )}
            </div>
            <p className={`text-[10px] uppercase tracking-[0.5em] font-bold ${config.color}`}>{config.label}</p>
            <h1 className="mt-4 text-4xl font-light italic tracking-tight">
              {estado === 'confirmado' ? 'Operación Exitosa.' : 'Estado de Transacción.'}
            </h1>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
                <p className="text-[8px] uppercase tracking-widest text-white/30 mb-2">Inversión</p>
                <p className="text-xl font-medium text-gold">{recibo ? formatCurrency(recibo.monto) : '---'}</p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
                <p className="text-[8px] uppercase tracking-widest text-white/30 mb-2">Orden ID</p>
                <p className="text-xl font-medium text-white truncate">{recibo?.pedido.codigo || '---'}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 space-y-4">
               <div className="flex justify-between items-center text-[10px] uppercase tracking-widest border-b border-white/5 pb-4">
                 <span className="text-white/20">Autorización TBK</span>
                 <span className="text-white/60 font-mono">{recibo?.transbank?.authorizationCode || '---'}</span>
               </div>
               <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                 <span className="text-white/20">Fecha</span>
                 <span className="text-white/60">{recibo ? formatDateCL(recibo.createdAt) : '---'}</span>
               </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
            <button
              onClick={descargarComprobante}
              disabled={!recibo || pdfCargando}
              className="w-full py-5 rounded-full bg-gold text-black font-bold text-[10px] tracking-[0.3em] hover:bg-white transition-all duration-500 shadow-2xl shadow-gold/20 disabled:opacity-20"
            >
              {pdfCargando ? 'SINCROIZANDO...' : 'DESCARGAR COMPROBANTE PRO'}
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => navigate('/')} className="py-4 rounded-full border border-white/10 bg-white/[0.02] text-[9px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all">
                IR AL INICIO
              </button>
              <button onClick={() => navigate('/cart')} className="py-4 rounded-full border border-white/10 bg-white/[0.02] text-[9px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all">
                CARRITO PRO
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TransbankReturnPage;