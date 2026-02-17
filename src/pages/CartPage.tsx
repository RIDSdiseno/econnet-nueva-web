import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
// Eliminamos useAuth si no lo vamos a usar para lógica de bloqueo por ahora, para evitar el error de "unused"
// import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  // CORRECCIÓN: Si 'totalAmount' no existe en tu context, calculamos el neto directamente aquí
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  // Cálculo de ingeniería para el subtotal neto
  const subtotalNeto = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 font-inter">
      <div className="container mx-auto px-6">
        
        {/* HEADER DEL CARRITO - Liquid Glass */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-medium">Orden de Selección</p>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight">Tu <span className="italic text-gold font-normal">Bolsa</span></h1>
          </div>
          <button 
            onClick={clearCart}
            className="text-[10px] uppercase tracking-widest text-white/20 hover:text-red-400 transition-colors"
          >
            Vaciar Carrito
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-40 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <p className="text-white/40 font-light mb-8 tracking-widest">No hay dispositivos en tu selección.</p>
            <Link to="/products" className="inline-block px-10 py-4 rounded-full bg-gold text-black font-bold text-[10px] tracking-[0.3em] hover:bg-white transition-all">
              EXPLORAR CATÁLOGO
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LISTA DE ITEMS */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="group relative flex items-center gap-6 p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                  <div className="h-24 w-24 rounded-2xl bg-white/[0.03] border border-white/10 p-2 overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-lg font-light truncate">{item.name}</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">{item.unit}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border border-white/10 rounded-full px-3 py-1 bg-black/50 backdrop-blur-md">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2 text-white/40 hover:text-gold">-</button>
                        <span className="px-4 text-xs font-light w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2 text-white/40 hover:text-gold">+</button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-[9px] text-white/20 hover:text-red-400 uppercase tracking-widest ml-4 transition-colors">Remover</button>
                    </div>
                  </div>

                  <div className="text-right shrink-0 px-4">
                    <p className="text-[9px] text-gold uppercase tracking-[0.3em] mb-1">Subtotal</p>
                    <p className="text-xl font-light">
                      <span className="text-[10px] text-white/30 mr-2">CLP</span>
                      {(item.unitPrice * item.quantity).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* SUMMARY PANEL - DETALLES DORADOS */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 p-10 rounded-[3rem] border border-gold/20 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent backdrop-blur-2xl shadow-2xl">
                <div className="inline-flex items-center gap-2 mb-8 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-[8px] uppercase tracking-[0.4em] text-gold">
                  Resumen de Pago
                </div>
                
                <div className="space-y-4 mb-10 pb-10 border-b border-white/5">
                  <div className="flex justify-between text-sm font-light">
                    <span className="text-white/40 tracking-wider">Monto Neto</span>
                    <span>${subtotalNeto.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-light">
                    <span className="text-white/40 tracking-wider">Logística</span>
                    <span className="text-gold uppercase text-[9px] tracking-widest">A convenir</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-12">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-medium">Inversión Total</span>
                  <div className="text-right">
                    <span className="block text-[10px] text-gold font-bold mb-1">CLP</span>
                    <span className="text-5xl font-light tracking-tighter">${subtotalNeto.toLocaleString('es-CL')}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-6 rounded-full bg-gold text-black font-bold text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(197,160,89,0.2)] hover:bg-white hover:scale-[1.02] transition-all duration-500"
                >
                  Confirmar Pedido
                </button>

                <div className="mt-8 flex items-center justify-center gap-3 opacity-20">
                  <div className="h-px w-8 bg-white"></div>
                  <p className="text-[8px] uppercase tracking-[0.5em]">Econnet Secure</p>
                  <div className="h-px w-8 bg-white"></div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;