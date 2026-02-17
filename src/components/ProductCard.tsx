import { useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import type { Product, ProductVariante } from '../data/products';
import { useCart } from '../context/CartContext';
import ProductImageGallery from './ProductImageGallery';

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
  index,
  autoOpen = false,
  hideCard = false,
  onModalClose,
  modalZIndexClass = 'z-[60]',
  quantityModalZIndexClass = 'z-[70]',
}: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(autoOpen);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(product.minQuantity || 1);
  const [selectedVariante, setSelectedVariante] = useState<ProductVariante | null>(null);
  
  // SOLUCIÓN AL BLOQUEO: Se eliminó getProductImages que rompía el renderizado.
  // Esta lógica ya está lista para recibir tus URLs de Cloudinary.
  const gallery = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [];
  }, [product.images, product.image]);

  const { addItems } = useCart();

  const precioEfectivo = useMemo(() => {
    // Lógica de variantes comentada hasta que la necesites para no generar inconsistencias
    // if (product.precioPorVariante && selectedVariante?.precio != null) return selectedVariante.precio;
    return product.price;
  }, [product.price]);

  const minQuantity = product.minQuantity && product.minQuantity > 0 ? product.minQuantity : 1;

  const handleConfirmAddToCart = () => {
    addItems([{
      productId: product.id,
      varianteId: selectedVariante?.id, 
      name: product.name,
      description: product.description || 'Dispositivo tecnológico premium',
      unit: product.unit || 'un',
      unitPrice: precioEfectivo,
      quantity: quantity,
      image: product.image || undefined,
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
          className="group relative flex h-full cursor-pointer flex-col rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-5 transition-all duration-500 hover:bg-white/[0.05] hover:border-gold/40 shadow-2xl"
        >
          {/* Visualizador de Imagen */}
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center justify-center p-8 transition-all duration-500 group-hover:scale-[1.02]">
            {gallery[0] ? (
              <img src={gallery[0]} alt={product.name} className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="text-white/10 uppercase tracking-[0.3em] text-[8px]">En proceso de carga</div>
            )}
            <div className="absolute top-4 left-4 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[7px] uppercase tracking-[0.4em] text-gold border border-gold/20">
              {product.category}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 pt-6 px-2">
            <h3 className="text-lg font-light tracking-tight text-white group-hover:text-gold transition-colors duration-300 line-clamp-1">
              {product.name}
            </h3>
            
            <div className="mt-auto pt-4 border-t border-white/5 flex items-end justify-between">
              <div>
                <p className="text-[7px] uppercase tracking-[0.3em] text-white/30 mb-1">Inversión Econnet</p>
                <p className="text-xl font-medium text-white">
                  <span className="text-[10px] text-gold mr-1.5 font-medium">CLP</span>
                  {precioEfectivo.toLocaleString('es-CL')}
                </p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsQuantityModalOpen(true); }}
                className="h-11 w-11 rounded-full bg-gold text-black flex items-center justify-center hover:bg-white transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </article>
      )}

      {/* Modal Detalle - Unificado con tu lógica previa */}
      {isModalOpen && createPortal(
        <div className={`fixed inset-0 ${modalZIndexClass} flex items-center justify-center p-4 sm:p-12`}>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl" onClick={closeModal}></div>
          <div className="relative w-full max-w-5xl rounded-[3rem] border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[85vh]">
            <button onClick={closeModal} className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 z-20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <div className="w-full md:w-1/2 bg-white/[0.02] p-8 flex items-center justify-center border-r border-white/5">
              <ProductImageGallery images={gallery} title={product.name} />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto space-y-10">
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.4em] text-gold">{product.category}</span>
                <h2 className="text-4xl font-light tracking-tight">{product.name}</h2>
                <p className="text-white/50 font-light leading-relaxed">{product.description}</p>
              </div>
              <div className="space-y-4 pt-10 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">Valor Econnet</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gold">CLP</span>
                  <span className="text-5xl font-light">{precioEfectivo.toLocaleString('es-CL')}</span>
                </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); setIsQuantityModalOpen(true); }} className="w-full py-5 rounded-full bg-gold text-black font-bold tracking-widest hover:bg-white transition-all duration-500 shadow-2xl shadow-gold/20">
                CONFIGURAR PEDIDO
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Cantidad */}
      {isQuantityModalOpen && createPortal(
        <div className={`fixed inset-0 ${quantityModalZIndexClass} flex items-center justify-center p-4`}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsQuantityModalOpen(false)}></div>
          <div className="relative w-full max-w-sm rounded-[3rem] border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-3xl p-10 shadow-3xl text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-8">Unidades</p>
            <div className="flex items-center justify-between mb-10 bg-white/5 rounded-full p-2 border border-white/5">
              <button onClick={() => setQuantity(Math.max(minQuantity, quantity - 1))} className="h-12 w-12 rounded-full flex items-center justify-center text-xl hover:bg-white/10 text-white transition-colors">-</button>
              <span className="text-4xl font-light text-white">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="h-12 w-12 rounded-full flex items-center justify-center text-xl hover:bg-white/10 text-white transition-colors">+</button>
            </div>
            <button onClick={handleConfirmAddToCart} className="w-full py-5 rounded-full bg-gold text-black font-bold tracking-widest hover:bg-white transition-all duration-500 shadow-2xl shadow-gold/20">
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