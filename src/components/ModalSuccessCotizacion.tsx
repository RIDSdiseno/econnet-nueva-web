import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

export type CotizacionSuccessData = {
  id: string;
  codigo?: string | null;
  total: number;
  estado?: string | null;
  createdAt?: string | null;
};

type ModalSuccessCotizacionProps = {
  open: boolean;
  stage: 'confirming' | 'confirmed';
  data: CotizacionSuccessData | null;
  onClose: () => void;
  onView?: () => void;
};

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const formatDateTime = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
};

const ModalSuccessCotizacion = ({ open, stage, data, onClose, onView }: ModalSuccessCotizacionProps) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const isConfirming = stage === 'confirming';
  const codigo = data?.codigo || data?.id || '';
  const fecha = formatDateTime(data?.createdAt);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      {/* Backdrop con desenfoque profundo */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl"></div>
      
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-panel relative z-10 w-full max-w-lg overflow-hidden rounded-[3rem] border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-2xl shadow-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Luces de fondo doradas sutiles */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-[80px]"></div>
        
        <div className="relative space-y-8 p-8 sm:p-12 text-center">
          {/* Icono Dorado con Animación */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold text-black shadow-[0_0_50px_rgba(197,160,89,0.3)] animate-in zoom-in duration-500">
            {isConfirming ? (
              <div className="h-8 w-8 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">
              {isConfirming ? 'Procesando' : 'Sistema Actualizado'}
            </p>
            <h2 id={titleId} className="text-3xl font-light tracking-tight text-white">
              {isConfirming ? 'Registrando Solicitud' : 'Cotización Confirmada'}
            </h2>
            <p className="text-sm text-white/40 font-light leading-relaxed">
              {isConfirming
                ? 'Sincronizando los parámetros de tu configuración con nuestro ecosistema.'
                : 'Hemos recibido tu solicitud técnica. Un especialista revisará los detalles.'}
            </p>
          </div>

          {data && !isConfirming && (
            <div className="grid gap-3 sm:grid-cols-3 pt-4">
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-[8px] uppercase tracking-widest text-white/30 mb-1">ID Orden</p>
                <p className="text-xs font-medium text-white truncate">{codigo}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-[8px] uppercase tracking-widest text-white/30 mb-1">Inversión</p>
                <p className="text-xs font-medium text-gold">{formatCurrency(data.total)}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-[8px] uppercase tracking-widest text-white/30 mb-1">Fecha</p>
                <p className="text-xs font-medium text-white">{fecha?.split(',')[0] ?? 'Hoy'}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 pt-4">
            <button
              type="button"
              onClick={onView}
              disabled={!onView || isConfirming}
              className="w-full rounded-full border border-white/10 bg-white/5 py-4 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 disabled:opacity-20"
            >
              Ver Detalle Técnico
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-gold py-4 text-[10px] font-bold uppercase tracking-widest text-black shadow-2xl shadow-gold/20 hover:bg-white transition-all duration-500"
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalSuccessCotizacion;