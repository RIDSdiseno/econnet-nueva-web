import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';
import ProductImageGallery from './ProductImageGallery';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image?: string;
  imagenUrl?: string;
  images?: string[];
  unit?: string;
  minQuantity?: number;
}

interface ProductCardProps {
  product: Product;
  index: number;
  autoOpen?: boolean;
  hideCard?: boolean;
  onModalClose?: () => void;
  modalZIndexClass?: string;
  quantityModalZIndexClass?: string;
}

const ProductCard = ({
  product,
  autoOpen = false,
  hideCard = false,
  onModalClose,
  modalZIndexClass = 'z-[60]',
  quantityModalZIndexClass = 'z-[70]',
}: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(autoOpen);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(product.minQuantity || 1);
  
  const { addItems } = useCart();

  const gallery = useMemo(() => {
    const imgs: string[] = [];
    if (product.imagenUrl) imgs.push(product.imagenUrl);
    else if (product.image) imgs.push(product.image);
    if (product.images && Array.isArray(product.images)) {
      imgs.push(...product.images);
    }
    return imgs;
  }, [product.imagenUrl, product.image, product.images]);

  const minQuantity = product.minQuantity && product.minQuantity > 0 ? product.minQuantity : 1;

  const handleConfirmAddToCart = () => {
    addItems([{
      productId: product.id,
      name: product.name,
      description: product.description || 'Producto Econnet Chile',
      unit: product.unit || 'un',
      unitPrice: product.price,
      quantity: quantity,
      image: product.imagenUrl || product.image || undefined,
    }]);
    setIsQuantityModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    onModalClose?.();
  };

  return (
    <>
      {!hideCard && (
        <article
          onClick={() => setIsModalOpen(true)}
          className="group relative flex h-full cursor-pointer flex-col rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-4 md:p-5 transition-all duration-500 hover:bg-white/[0.05] hover:border-gold/40 shadow-2xl"
        >
          {/* Visualizador de Imagen */}
          <div className="relative aspect-square overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center justify-center p-6 md:p-8 transition-all duration-500 group-hover:scale-[1.02]">
            {gallery[0] ? (
              <img 
                src={gallery[0]} 
                alt={product.name} 
                className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110" 
              />
            ) : (
              <div className="text-white/10 uppercase tracking-[0.3em] text-[8px] text-center">
                Imagen en proceso
              </div>
            )}
            <div className="absolute top-3 left-3 md:top-4 md:left-4 rounded-full bg-black/60 backdrop-blur-md px-2 md:px-3 py-1 text-[6px] md:text-[7px] uppercase tracking-[0.4em] text-gold border border-gold/20">
              {product.category || 'General'}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 md:gap-4 pt-4 md:pt-6 px-1">
            <h3 className="text-base md:text-lg font-light tracking-tight text-white group-hover:text-gold transition-colors duration-300 line-clamp-1">
              {product.name}
            </h3>
            
            <div className="mt-auto pt-3 md:pt-4 border-t border-white/5 flex items-end justify-between">
              <div>
                <p className="text-[6px] md:text-[7px] uppercase tracking-[0.3em] text-white/30 mb-1">Inversión Econnet</p>
                <p className="text-lg md:text-xl font-medium text-white">
                  <span className="text-[8px] md:text-[10px] text-gold mr-1.5 font-medium">CLP</span>
                  {product.price.toLocaleString('es-CL')}
                </p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsQuantityModalOpen(true); }}
                className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-gold text-black flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg shadow-gold/20"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </article>
      )}

      {/* Modal Detalle - Responsive (Scroll habilitado) */}
      {isModalOpen && createPortal(
        <div className={`fixed inset-0 ${modalZIndexClass} flex items-center justify-center p-4 sm:p-12`}>
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl" onClick={closeModal}></div>
          <div className="relative w-full max-w-5xl rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-[85vh]">
            
            <button onClick={closeModal} className="absolute top-4 right-4 md:top-6 md:right-6 h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 z-20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>

            <div className="w-full h-1/2 md:h-auto md:w-1/2 bg-white/[0.02] p-6 md:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
              <ProductImageGallery images={gallery} title={product.name} />
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-12 overflow-y-auto space-y-6 md:space-y-10">
              <div className="space-y-4">
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-gold font-bold">{product.category}</span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-tight">{product.name}</h2>
                <p className="text-white/50 font-light leading-relaxed text-sm md:text-base">{product.description}</p>
              </div>

              <div className="pt-6 md:pt-10 border-t border-white/5 flex flex-col gap-6 md:gap-10">
                <div className="space-y-2 md:space-y-4">
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/30">Valor Econnet</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs md:text-sm text-gold font-bold">CLP</span>
                    <span className="text-4xl md:text-5xl font-light">{product.price.toLocaleString('es-CL')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => { setIsModalOpen(false); setIsQuantityModalOpen(true); }} 
                  className="w-full py-4 md:py-5 rounded-full bg-gold text-black font-black text-[10px] md:text-xs uppercase tracking-[0.4em] hover:bg-white transition-all duration-500 shadow-2xl shadow-gold/20"
                >
                  CONFIGURAR PEDIDO
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Cantidad - Ajustado para pulgar y pantallas angostas */}
      {isQuantityModalOpen && createPortal(
        <div className={`fixed inset-0 ${quantityModalZIndexClass} flex items-center justify-center p-4`}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsQuantityModalOpen(false)}></div>
          <div className="relative w-full max-w-[320px] sm:max-w-sm rounded-[2.5rem] md:rounded-[3rem] border border-white/10 bg-[#0A0A0A] p-8 md:p-10 shadow-3xl text-center">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-gold mb-8 font-black">Ajustar Unidades</p>
            <div className="flex items-center justify-between mb-8 md:mb-10 bg-white/5 rounded-full p-2 border border-white/5">
              <button onClick={() => setQuantity(Math.max(minQuantity, quantity - 1))} className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center text-xl md:text-2xl hover:bg-white/10 text-white transition-colors">-</button>
              <span className="text-3xl md:text-4xl font-light text-white">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center text-xl md:text-2xl hover:bg-white/10 text-white transition-colors">+</button>
            </div>
            <button onClick={handleConfirmAddToCart} className="w-full py-4 md:py-5 rounded-full bg-gold text-black font-black text-[10px] md:text-xs uppercase tracking-[0.4em] hover:bg-white transition-all shadow-2xl shadow-gold/20">
              AÑADIR AL CARRITO
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProductCard;