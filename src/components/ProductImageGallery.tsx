import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';

type ProductImageGalleryProps = {
  images: string[];
  title: string;
  className?: string;
};

const ProductImageGallery = ({ images, title, className }: ProductImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [errored, setErrored] = useState<Record<number, boolean>>({});
  const touchStartX = useRef<number | null>(null);
  const total = images.length;
  const showControls = total > 1;
  const activeImage = total > 0 ? images[Math.min(activeIndex, total - 1)] : null;

  useEffect(() => {
    setActiveIndex(0);
  }, [total]);

  const goToIndex = (index: number) => {
    if (total === 0) {
      return;
    }
    const bounded = (index + total) % total;
    setActiveIndex(bounded);
  };

  const handlePrev = () => {
    if (!showControls) {
      return;
    }
    goToIndex(activeIndex - 1);
  };

  const handleNext = () => {
    if (!showControls) {
      return;
    }
    goToIndex(activeIndex + 1);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (!showControls) {
      return;
    }
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!showControls || touchStartX.current === null) {
      return;
    }
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) {
      return;
    }
    if (delta < 0) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!showControls) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handlePrev();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleNext();
    }
  };

  const handleImageError = (index: number) => {
    setErrored((prev) => ({ ...prev, [index]: true }));
  };

  const wrapperClassName = ['space-y-3', className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClassName}>
      <div
        className="relative flex h-60 items-center justify-center rounded-2xl border border-white/30 bg-white/40 backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04040] sm:h-72"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={showControls ? 0 : -1}
        aria-label={showControls ? 'Galeria de imagenes del producto' : undefined}
      >
        {activeImage && !errored[activeIndex] ? (
          <img
            src={activeImage}
            alt={`${title} imagen ${activeIndex + 1}`}
            className="h-full w-full object-contain"
            loading="lazy"
            onError={() => handleImageError(activeIndex)}
          />
          
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-dashed border-white/40 bg-white/30 text-slate-500 backdrop-blur-xl sm:h-40 sm:w-40">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 15l4-4 4 4 5-6 5 6" />
              <circle cx="9" cy="9" r="1.5" />
            </svg>
          </div>
        )}
        {showControls ? (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/40 p-2 text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04040]"
              aria-label="Imagen anterior"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/40 p-2 text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04040]"
              aria-label="Siguiente imagen"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/30 bg-white/40 px-3 py-1 text-[0.65rem] font-semibold text-slate-700 backdrop-blur-xl">
              {activeIndex + 1}/{total}
            </div>
          </>
        ) : null}
      </div>

      {showControls ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => goToIndex(index)}
                aria-pressed={isActive}
                aria-label={`Ver imagen ${index + 1} de ${title}`}
                className={`flex h-14 w-16 shrink-0 items-center justify-center rounded-2xl border bg-white/40 backdrop-blur-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04040] sm:h-16 sm:w-20 ${
                  isActive ? 'border-[#B01010] shadow-sm' : 'border-white/30 hover:border-[#B01010]/60'
                }`}
              >
                {errored[index] ? (
                  <span className="text-xs font-semibold text-slate-400">N/A</span>
                ) : (
                  <img
                    src={image}
                    alt={`${title} miniatura ${index + 1}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    onError={() => handleImageError(index)}
                  />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default ProductImageGallery;
