import { useEffect, useState, type Ref } from 'react';

type FloatingCartButtonProps = {
  onClick: () => void;
  totalQuantity: number;
  isActive: boolean;
  isOpen: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
};

const FloatingCartButton = ({
  onClick,
  totalQuantity,
  isActive,
  isOpen,
  buttonRef,
}: FloatingCartButtonProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia('(max-width: 768px)');

    const update = () => setIsMobile(media.matches);

    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  if (!isMobile) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-label="Abrir carrito"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      className={`fixed bottom-[112px] right-4 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#B01010] text-white shadow-[0_20px_40px_rgba(176,16,16,0.35)] transition hover:bg-[#D03030] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04040]/60 sm:bottom-[128px] sm:right-6 ${
        isActive ? 'ring-2 ring-[#E04040]/60' : ''
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {totalQuantity > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E04040] text-[0.65rem] font-bold text-white shadow-md ring-2 ring-white">
          {totalQuantity}
        </span>
      )}
    </button>
  );
};

export default FloatingCartButton;
