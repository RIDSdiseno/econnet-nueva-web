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
  
  const { addItems, items } = useCart();

  // Validación de Stock Real
  const itemInCart = items.find(i => i.productId === product.id);
  const currentQtyInCart = itemInCart ? itemInCart.quantity : 0;
  const availableStock = product.stock - currentQtyInCart;

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

  const handleOpenQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (availableStock <= 0) {
      alert("Disponibilidad Agotada: No puedes añadir más unidades de este equipo.");
      return;
    }
    setIsQuantityModalOpen(true);
  };

  const handleConfirmAddToCart = () => {
    if (quantity > availableStock) {
      alert(`Solo disponemos de ${availableStock} unidad(es) adicionales.`);
      return;
    }

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
    setQuantity(minQuantity); // Reset quantity
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
          className="group relative flex h-full cursor-pointer flex-col rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-4 md:p-5 transition-all duration-500 hover:bg-white/[0.05] hover:border-gold/30 shadow-2xl"
        >
          {/* Visualizador de Imagen */}
          <div className="relative aspect-square overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center justify-center p-6 md:p-8">
            
            {/* BADGE DE STOCK CRÍTICO */}
            {product.stock <= 2 && (
              <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 px-3 py-1 rounded-full border border-red-500/30 bg-black/60 backdrop-blur-md">
                <p className="text-[7px] md:text-[8px] uppercase tracking-[0.2em] text-red-500 font-black animate-pulse">
                  {product.stock === 1 ? 'Última Unidad' : 'Stock Limitado'}
                </p>
              </div>
            )}

            {gallery[0] ? (
              <img 
                src={gallery[0]} 
                alt={product.name} 
                className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110" 
              />
            ) : (
              <div className="text-white/10 uppercase tracking-[0.3em] text-[8px] text-center">Imagen en proceso</div>
            )}
            
            <div className="absolute top-3 right-3 md:top-4 md:right-4 rounded-full bg-black/60 backdrop-blur-md px-2 md:px-3 py-1 text-[6px] md:text-[7px] uppercase tracking-[0.4em] text-gold border border-gold/20">
              {product.category || 'General'}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 md:gap-4 pt-4 md:pt-6 px-1">
            <h3 className="text-base md:text-lg font-light tracking-tight text-white/90 group-hover:text-gold transition-colors duration-300 line-clamp-1">
              {product.name}
            </h3>
            
            <div className="mt-auto pt-3 md:pt-4 border-t border-white/5 flex items-end justify-between">
              <div>
                <p className="text-[6px] md:text-[7px] uppercase tracking-[0.3em] text-white/20 mb-1">Inversión Econnet</p>
                <p className="text-lg md:text-xl font-light text-white italic">
                  <span className="text-[8px] md:text-[10px] text-white/30 mr-1.5 font-medium">CLP</span>
                  {product.price.toLocaleString('es-CL')}
                </p>
              </div>
              
              {/* BOTÓN CIRCULAR GOLD OUTLINE */}
              <button 
                onClick={handleOpenQuantity}
                className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-gold/40 bg-transparent text-gold flex items-center justify-center transition-all duration-500 hover:bg-gold hover:text-black hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] shadow-lg shadow-gold/5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </article>
      )}

      {/* Modal Detalle */}
      {isModalOpen && createPortal(
        <div className={`fixed inset-0 ${modalZIndexClass} flex items-center justify-center p-4 sm:p-12`}>
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl" onClick={closeModal}></div>
          <div className="relative w-full max-w-5xl rounded-[2.5rem] md:rounded-[3rem] border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[90vh] md:max-h-[85vh]">
            
            <button onClick={closeModal} className="absolute top-4 right-4 md:top-6 md:right-6 h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 z-20 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>

            <div className="w-full h-1/2 md:h-auto md:w-1/2 bg-white/[0.01] p-6 md:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
              <ProductImageGallery images={gallery} title={product.name} />
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-12 overflow-y-auto space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-gold font-bold">
                  {product.category || 'Premium Hardware'}
                </span>
                <h2 className="text-3xl md:text-5xl font-light tracking-tighter leading-tight text-white italic">
                  {product.name}
                </h2>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-gold/60 font-black">Descripción Técnica</p>
                <p className="text-white/40 font-light leading-relaxed text-sm md:text-base border-l border-gold/20 pl-6 italic">
                  {product.description || "Ingeniería de vanguardia diseñada para superar los estándares de rendimiento más exigentes."}
                </p>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-8">
                <div className="space-y-2">
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/20">Inversión Final</p>
                  <div className="flex items-baseline gap-2 text-white">
                    <span className="text-xs text-gold font-bold">CLP</span>
                    <span className="text-4xl md:text-6xl font-light tracking-tighter">
                      {product.price.toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
                
                {/* BOTÓN MODAL GOLD OUTLINE */}
                <button 
                  onClick={() => { setIsModalOpen(false); setIsQuantityModalOpen(true); }} 
                  className="w-full py-5 rounded-full border border-gold bg-transparent text-gold font-black text-[10px] md:text-xs uppercase tracking-[0.4em] transition-all duration-500 hover:bg-gold hover:text-black hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] shadow-2xl shadow-gold/10"
                >
                  CONFIGURAR PEDIDO
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Cantidad */}
      {isQuantityModalOpen && createPortal(
        <div className={`fixed inset-0 ${quantityModalZIndexClass} flex items-center justify-center p-4`}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsQuantityModalOpen(false)}></div>
          <div className="relative w-full max-w-[320px] rounded-[2.5rem] border border-white/10 bg-[#0A0A0A] p-8 md:p-10 shadow-3xl text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-8 font-black">Seleccionar Unidades</p>
            
            <div className="flex items-center justify-between mb-10 bg-white/5 rounded-full p-2 border border-white/5">
              <button onClick={() => setQuantity(Math.max(minQuantity, quantity - 1))} className="h-12 w-12 rounded-full flex items-center justify-center text-2xl hover:text-gold text-white/40 transition-colors">-</button>
              <span className="text-4xl font-light text-white">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(availableStock, quantity + 1))} className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl transition-colors ${quantity >= availableStock ? 'text-white/5' : 'text-white/40 hover:text-gold'}`}>+</button>
            </div>

            <button 
              onClick={handleConfirmAddToCart} 
              className="w-full py-5 rounded-full border border-gold bg-transparent text-gold font-black text-[10px] md:text-xs uppercase tracking-[0.4em] transition-all duration-500 hover:bg-gold hover:text-black hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] shadow-2xl shadow-gold/10"
            >
              AÑADIR A LA BOLSA
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProductCard;