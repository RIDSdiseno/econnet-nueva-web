import { useEffect, useState, type Ref } from 'react';
import { useCart } from '../context/CartContext';

type FloatingCartButtonProps = {
  onClick: () => void;
  isActive: boolean;
  isOpen: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
};

const FloatingCartButton = ({
  onClick,
  isActive,
  isOpen,
  buttonRef,
}: FloatingCartButtonProps) => {
  // Obtenemos la cantidad directamente del contexto para mayor reactividad
  const { totalQuantity } = useCart();

  if (totalQuantity === 0) return null;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label="Abrir carrito"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      className={`fixed bottom-8 right-8 z-[50] flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:scale-110 hover:bg-white/[0.08] hover:border-white/40 active:scale-95 focus:outline-none ${
        isActive ? 'ring-2 ring-white/40 border-white/60' : ''
      }`}
    >
      {/* Resplandor blanco sutil de fondo al hacer hover (opcional, incluido en la clase hover anterior) */}
      
      {/* Icono Minimalista de Bolsa - Estilo Apple */}
      <svg 
        viewBox="0 0 24 24" 
        className="h-6 w-6 text-white/80 transition-colors duration-300" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={1.2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
      </svg>

      {/* CONTADOR DE CRISTAL - 100% Neutro */}
      <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-[10px] font-light text-white shadow-lg animate-in zoom-in duration-300">
        {totalQuantity}
      </span>
    </button>
  );
};

export default FloatingCartButton;