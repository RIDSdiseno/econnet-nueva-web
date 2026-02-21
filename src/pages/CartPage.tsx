import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';

const shippingOptions = [
  { id: 'stgo', label: 'Despacho Express Stgo (Asegurado)', price: 3500 },
  { id: 'region', label: 'Envío a Regiones (Starken/Chilexpress)', price: 4500 },
  { id: 'pickup', label: 'Retiro: La Concepción 65, Of. 1003, Providencia', price: 0 }
];

const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [shippingMethod, setShippingMethod] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transferencia Bancaria'); // Por defecto el más barato
  const [isProcessing, setIsProcessing] = useState(false);

  // Lógica de Recargo: +4% si es Tarjeta
  const RECARGO_TARJETA = 0.04; 
  
  const subtotalBase = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const shippingPrice = shippingOptions.find(o => o.id === shippingMethod)?.price || 0;
  
  const adicionalTarjeta = paymentMethod === 'Tarjeta de Crédito / Débito' ? subtotalBase * RECARGO_TARJETA : 0;
  const inversionTotal = subtotalBase + shippingPrice + adicionalTarjeta;

  const handleCheckout = () => {
    if (!shippingMethod) {
      alert("Por favor, selecciona el método de despacho.");
      return;
    }

    setIsProcessing(true);
    const WHATSAPP_NUMBER = "56990308676"; 

    setTimeout(() => {
      const orderID = Math.floor(10000 + Math.random() * 90000);
      const expiration = new Date();
      expiration.setHours(expiration.getHours() + 36);
      const expString = expiration.toLocaleString('es-CL', { 
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
      });

      const orderItems = items.map(item => `• ${item.name} (x${item.quantity})`).join('\n');
      
      const rawMessage = `*ORDEN DE COMPRA ECONNET #${orderID}*\n` +
                        `----------------------------------\n` +
                        `*Detalle:*\n${orderItems}\n\n` +
                        `*Inversión Total:* CLP ${inversionTotal.toLocaleString('es-CL')}\n` +
                        `*Método:* ${paymentMethod}\n` +
                        (adicionalTarjeta > 0 ? `*Recargo Tarjeta (4%):* +$${adicionalTarjeta.toLocaleString('es-CL')}\n` : '*Precio con Descuento Transferencia Aplicado*\n') +
                        `*Entrega:* ${shippingMethod.toUpperCase()}\n\n` +
                        `⏳ *LÍMITE DE PAGO:* ${expString}\n\n` +
                        `_Favor enviar link de Webpay o datos para transferencia._`;

      window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(rawMessage)}`;
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 font-inter">
      <div className="container mx-auto px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-medium">Orden de Selección</p>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight">Tu <span className="italic text-gold font-normal">Bolsa</span></h1>
          </div>
          <button onClick={clearCart} className="text-[10px] uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-colors font-bold">
            Vaciar Selección
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-40 rounded-[3rem] border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <p className="text-white/40 font-light mb-8 tracking-widest text-sm uppercase">No hay equipos seleccionados</p>
            <Link to="/products" className="inline-block px-10 py-4 rounded-full border border-gold text-gold font-bold text-[10px] tracking-[0.3em] hover:bg-gold hover:text-black transition-all">
              IR AL CATÁLOGO
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => {
                const productData = products.find(p => p.id === item.productId);
                const maxStock = productData?.stock || 1;
                const isMax = item.quantity >= maxStock;

                return (
                  <div key={item.productId} className="group relative flex items-center gap-6 p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                    <div className="h-24 w-24 rounded-2xl bg-white/[0.03] border border-white/10 p-2 shrink-0">
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-light truncate text-white/90">{item.name}</h3>
                      <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center border border-white/10 rounded-full px-2 py-1 bg-black/40">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-gold">-</button>
                          <span className="px-2 text-xs font-medium w-6 text-center text-gold">{item.quantity}</span>
                          <button onClick={() => { if (!isMax) updateQuantity(item.productId, item.quantity + 1); }} className={`w-8 h-8 flex items-center justify-center transition-colors ${isMax ? 'text-white/5 cursor-not-allowed' : 'text-white/20 hover:text-gold'}`}>+</button>
                        </div>
                        <button onClick={() => removeItem(item.productId)} className="text-[9px] text-red-500/60 hover:text-red-500 uppercase tracking-widest font-bold">Remover</button>
                      </div>
                    </div>
                    <div className="text-right shrink-0 px-4 border-l border-white/5">
                      <p className="text-[9px] text-gold uppercase tracking-[0.3em] mb-1">Inversión</p>
                      <p className="text-xl font-light text-white/90">CLP {(item.unitPrice * item.quantity).toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-32 p-8 rounded-[3rem] border border-gold/20 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl">
                <div className="space-y-8 mb-10">
                  
                  {/* METODOS DE PAGO */}
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-gold/60 font-bold ml-2">Método de Pago</p>
                    <label onClick={() => setPaymentMethod('Transferencia Bancaria')} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'Transferencia Bancaria' ? 'border-gold bg-gold/10 text-white' : 'border-white/5 text-white/40'}`}>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest font-bold">Transferencia</span>
                        <span className="text-[8px] text-green-400 font-bold tracking-widest italic underline">Precio Rebajado</span>
                      </div>
                      <div className={`h-3 w-3 rounded-full border ${paymentMethod === 'Transferencia Bancaria' ? 'bg-gold border-gold' : 'border-white/20'}`}></div>
                    </label>

                    <label onClick={() => setPaymentMethod('Tarjeta de Crédito / Débito')} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod.includes('Tarjeta') ? 'border-gold bg-gold/10 text-white' : 'border-white/5 text-white/40'}`}>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest font-bold">Tarjeta (Webpay)</span>
                        <span className="text-[8px] text-white/20">+4% de recargo bancario</span>
                      </div>
                      <div className={`h-3 w-3 rounded-full border ${paymentMethod.includes('Tarjeta') ? 'bg-gold border-gold' : 'border-white/20'}`}></div>
                    </label>
                  </div>

                  {/* LOGÍSTICA */}
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-[0.4em] text-gold/60 font-bold ml-2">Logística de Entrega</p>
                    {shippingOptions.map((opt) => (
                      <label key={opt.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-500 ${shippingMethod === opt.id ? 'border-gold bg-gold/5 text-white' : 'border-white/5 text-white/40 hover:bg-white/5'}`}>
                        <span className="text-[10px] uppercase tracking-widest">{opt.label}</span>
                        <input type="radio" className="hidden" onChange={() => setShippingMethod(opt.id)} name="ship" />
                        <span className="text-[9px] text-gold font-bold">{opt.price > 0 ? `+$${opt.price.toLocaleString('es-CL')}` : 'GRATIS'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* RESUMEN FINAL */}
                <div className="space-y-2 mb-8 border-t border-white/5 pt-8">
                  <div className="flex justify-between text-white/40 text-[10px] uppercase tracking-widest">
                    <span>Monto Base</span>
                    <span>CLP {subtotalBase.toLocaleString('es-CL')}</span>
                  </div>
                  {adicionalTarjeta > 0 && (
                    <div className="flex justify-between text-white/60 text-[10px] uppercase tracking-widest">
                      <span>Recargo Tarjeta (4%)</span>
                      <span>+CLP {adicionalTarjeta.toLocaleString('es-CL')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-white/30">Total a Pagar</span>
                    <span className="text-4xl font-light tracking-tighter text-white">CLP {inversionTotal.toLocaleString('es-CL')}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-6 rounded-full border border-gold bg-transparent text-gold font-bold text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-gold hover:text-black hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] disabled:opacity-50"
                >
                  {isProcessing ? "Validando..." : "Confirmar Selección"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;