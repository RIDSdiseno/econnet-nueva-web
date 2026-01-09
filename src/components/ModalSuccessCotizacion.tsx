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
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const isConfirming = stage === 'confirming';
  const codigo = data?.codigo || data?.id || '';
  const fecha = formatDateTime(data?.createdAt);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8 sm:py-12"
      onClick={onClose}
    >
      <div className="modal-backdrop fixed inset-0 bg-emerald-950/40 backdrop-blur-md"></div>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-panel relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-white via-emerald-50/70 to-emerald-100/80 shadow-[0_30px_80px_rgba(6,95,70,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl"></div>
        <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl"></div>

        <div className="relative space-y-6 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-[0_12px_24px_rgba(16,185,129,0.35)]">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.32em] text-emerald-500">
                {isConfirming ? 'Confirmando...' : 'Confirmada'}
              </p>
              <h2 id={titleId} className="text-2xl font-semibold text-emerald-900">
                {isConfirming ? 'Confirmando cotización' : 'Cotización confirmada'}
              </h2>
              <p className="text-sm text-emerald-800/80">
                {isConfirming
                  ? 'Estamos registrando tu solicitud.'
                  : 'Recibimos tu solicitud y la estamos procesando.'}
              </p>
            </div>
          </div>

          {data && !isConfirming && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200/70 bg-white/70 px-4 py-3 text-sm">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-400">Código</p>
                <p className="mt-1 font-semibold text-emerald-900">{codigo}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200/70 bg-white/70 px-4 py-3 text-sm">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-400">Total</p>
                <p className="mt-1 font-semibold text-emerald-900">{formatCurrency(data.total)}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200/70 bg-white/70 px-4 py-3 text-sm">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-400">Fecha</p>
                <p className="mt-1 font-semibold text-emerald-900">{fecha ?? 'Por confirmar'}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onView}
              disabled={!onView}
              className="flex-1 rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Ver cotización
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(16,185,129,0.35)] transition hover:bg-emerald-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalSuccessCotizacion;
