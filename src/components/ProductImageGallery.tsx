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
    if (total === 0) return;
    const bounded = (index + total) % total;
    setActiveIndex(bounded);
  };

  const handlePrev = () => showControls && goToIndex(activeIndex - 1);
  const handleNext = () => showControls && goToIndex(activeIndex + 1);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (!showControls) return;
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!showControls || touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    delta < 0 ? handleNext() : handlePrev();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!showControls) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); handlePrev(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); handleNext(); }
  };

  const handleImageError = (index: number) => {
    setErrored((prev) => ({ ...prev, [index]: true }));
  };

  const wrapperClassName = ['space-y-6', className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClassName}>
      {/* Visualizador Principal de Vidrio */}
      <div
        className="relative flex h-72 items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-2xl focus:outline-none sm:h-96 transition-all duration-500 overflow-hidden shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={showControls ? 0 : -1}
      >
        {activeImage && !errored[activeIndex] ? (
          <img
            src={activeImage}
            alt={`${title} imagen ${activeIndex + 1}`}
            className="h-full w-full object-contain p-8 transition-transform duration-700 hover:scale-105"
            loading="lazy"
            onError={() => handleImageError(activeIndex)}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-white/10 italic tracking-widest uppercase text-[10px]">
            <svg viewBox="0 0 24 24" className="h-12 w-12 opacity-20" fill="none" stroke="currentColor" strokeWidth={1}>
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Sincronizando imagen...
          </div>
        )}

        {showControls && (
          <>
            {/* Controles de Navegación Estilo Apple */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/20 p-3 text-white/40 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/20 p-3 text-white/40 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Indicador de posición sutilmente dorado */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/40 border border-white/10 px-4 py-1.5 backdrop-blur-md">
              <span className="text-[10px] font-medium tracking-[0.3em] text-white/60">
                {activeIndex + 1} <span className="text-gold">/</span> {total}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Miniaturas de Cristal */}
      {showControls && (
        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${image}-${index}`}
                onClick={() => goToIndex(index)}
                className={`group relative flex h-20 w-24 shrink-0 items-center justify-center rounded-[1.5rem] border transition-all duration-500 ${
                  isActive 
                    ? 'border-gold/50 bg-white/5 shadow-lg shadow-gold/5' 
                    : 'border-white/5 bg-white/[0.01] hover:border-white/20'
                }`}
              >
                {!errored[index] ? (
                  <img
                    src={image}
                    alt={`${title} miniatura ${index + 1}`}
                    className={`h-full w-full object-contain p-3 transition-transform duration-500 ${isActive ? 'scale-110' : 'opacity-40 group-hover:opacity-100'}`}
                    onError={() => handleImageError(index)}
                  />
                ) : (
                  <span className="text-[8px] text-white/10 uppercase tracking-widest font-bold">N/A</span>
                )}
                {/* Línea inferior indicadora si es activo */}
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-4 bg-gold rounded-full shadow-[0_0_8px_rgba(197,160,89,0.5)]"></div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;