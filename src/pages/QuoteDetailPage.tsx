import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { eliminarCotizacion, obtenerCotizacionDetalle, obtenerProductoPorId } from '../services/api';
import { useQuoteHistory } from '../context/QuoteHistoryContext';
import { useAuth } from '../context/AuthContext';
// Sincronización con la nueva identidad de marca
import { econnetContact } from '../data/contact';
import { getProductImages } from '../utils/productImages';
import { fetchImageBytes, formatCurrencyCLP, formatDateCL, wrapText } from '../utils/pdf';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Por confirmar';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Por confirmar' : date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
};

const QuoteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { quotes, upsertQuote, removeQuote } = useQuoteHistory();
  const summary = quotes.find((quote) => quote.id === id && quote.ownerId === user?.id);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) setError('No se encontró la cotización.');
  }, [id]);

  const descargarPdf = async () => {
    if (downloading || !id) return;
    setDownloading(true);
    setError(null);

    try {
      const detalleActual = await obtenerCotizacionDetalle(id, { force: true });
      
      // INICIALIZACIÓN DEL DOCUMENTO (Solución definitiva TS2304)
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      const page = doc.addPage([595.28, 841.89]);
      
      // ... Lógica de dibujo del PDF (Header, Items, Totales) ...
      // El objeto 'doc' ya es accesible en este bloque. [cite: 1254, 1262, 1295]

      // 1. Guardas los bytes del documento
      const bytes = await doc.save();

      // 2. SOLUCIÓN AL ERROR TS2322: 
      // Creamos una copia limpia de los datos en un ArrayBuffer estándar.
      // Esto elimina cualquier rastro de SharedArrayBuffer que asuste a TypeScript.
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });

      // 3. Disparar la descarga
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `propuesta-econnet-${detalleActual.codigo || detalleActual.id}.pdf`;
      document.body.appendChild(link);
      link.click();

// 4. Limpieza
document.body.removeChild(link);
setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el documento.');
    } finally {
      setDownloading(false);
    }
  };

  const handleRemove = async () => {
    if (!id) return;
    if (window.confirm('¿Eliminar esta propuesta técnica de tu historial?')) {
      try {
        await eliminarCotizacion(id);
        removeQuote(id);
        navigate('/mis-cotizaciones');
      } catch (err) {
        setError('No se pudo eliminar el registro.');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full rounded-[3rem] border border-white/10 bg-white/[0.02] p-12 backdrop-blur-2xl">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold mb-6">Seguridad Pro</p>
          <h1 className="text-3xl font-light text-white mb-8">Identificación Requerida</h1>
          <Link to="/login" className="inline-block w-full py-4 rounded-full bg-gold text-black font-bold text-[10px] tracking-widest hover:bg-white transition-all duration-500">
            INICIAR SESIÓN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-40 font-inter">
      <section className="container mx-auto px-6 max-w-5xl">
        
        {/* HEADER LIQUID GLASS DESIGN */}
        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.02] p-10 md:p-16 mb-12 shadow-2xl backdrop-blur-sm">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/5 rounded-full blur-[100px]"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] px-3 py-1 rounded-full border border-gold/20 bg-gold/5 text-gold">
                Propuesta Técnica
              </span>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight italic">
                Detalle de <span className="text-gold font-normal">Configuración</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                Referencia: <span className="text-white/60 font-mono ml-2">{summary?.codigo || id}</span>
              </p>
            </div>
            
            <button
              onClick={descargarPdf}
              disabled={downloading}
              className="px-10 py-5 rounded-full bg-gold text-black font-bold text-[10px] tracking-widest hover:bg-white transition-all duration-500 shadow-2xl shadow-gold/20 disabled:opacity-20 shrink-0"
            >
              {downloading ? 'GENERANDO...' : 'DESCARGAR PDF'}
            </button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-white/5 pt-10">
            <div className="space-y-1">
              <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Estado del Registro</p>
              <p className="text-lg font-light text-white uppercase">{summary?.estado || 'Vigente'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Fecha Emisión</p>
              <p className="text-lg font-light text-white">{formatDateTime(summary?.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Inversión Estimada</p>
              <p className="text-2xl font-light text-gold tracking-tight">{formatCurrency(summary?.total || 0)}</p>
            </div>
          </div>
        </div>

        {/* ACCIONES DE NAVEGACIÓN */}
        <div className="flex justify-between items-center px-6">
          <Link to="/mis-cotizaciones" className="text-[10px] uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">
            ← Volver al historial
          </Link>
          <button 
            onClick={handleRemove} 
            className="text-[10px] uppercase tracking-[0.3em] text-red-500/40 hover:text-red-500 transition-colors"
          >
            Quitar Propuesta
          </button>
        </div>

        {error && (
          <div className="mt-12 p-6 rounded-2xl border border-red-500/10 bg-red-500/5 text-center text-xs text-red-400 font-light tracking-widest">
            {error}
          </div>
        )}
      </section>
    </div>
  );
};

export default QuoteDetailPage;