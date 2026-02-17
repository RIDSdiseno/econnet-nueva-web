import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProductos } from '../hooks/useProductos';
import { crearCotizacion } from '../services/api';
import { getRegiones, getComunasByRegion } from '../services/dpaService';
import ModalSuccessCotizacion from '../components/ModalSuccessCotizacion';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const QuotePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { productos, cargando } = useProductos({ search: searchQuery, limit: 100 });
  
  const [items, setItems] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const [regiones, setRegiones] = useState<string[]>([]);
  const [comunas, setComunas] = useState<string[]>([]);
  const [regionSeleccionada, setRegionSeleccionada] = useState('');

  // Sincronización de búsqueda (Debounce)
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Carga de regiones (DPA)
  useEffect(() => {
    getRegiones().then(setRegiones);
  }, []);

  useEffect(() => {
    if (regionSeleccionada) getComunasByRegion(regionSeleccionada).then(setComunas);
  }, [regionSeleccionada]);

  const handleAddItem = (product: any) => {
    setItems(prev => [...prev, { ...product, cantidad: 1, productold: product.id }]);
  };

  const totalNeto = items.reduce((acc, item) => acc + (item.price * item.cantidad), 0);

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-40 font-inter">
      <section className="container mx-auto px-6 max-w-6xl">
        
        {/* HEADER PREMIUM */}
        <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.02] p-10 md:p-16 mb-16 shadow-2xl backdrop-blur-md">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/5 rounded-full blur-[100px]"></div>
          <div className="relative space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-[10px] uppercase tracking-[0.5em] text-gold font-bold">
              Configurador B2B
            </div>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight italic">Diseña tu <span className="text-gold font-normal">Propuesta.</span></h1>
            <p className="text-white/40 font-light text-lg leading-relaxed">
              Define los parámetros de tu proyecto tecnológico y recibe una propuesta técnica personalizada en menos de 24 horas.
            </p>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="mb-12 p-8 rounded-[2rem] border border-gold/20 bg-gold/5 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
            <p className="text-sm font-light text-gold tracking-wide">Para procesar configuraciones oficiales, se requiere validación de identidad.</p>
            <Link to="/login" className="px-10 py-4 rounded-full bg-gold text-black font-bold text-[10px] tracking-widest hover:bg-white transition-all duration-500">
              IDENTIFICARSE
            </Link>
          </div>
        )}

        <form className="grid lg:grid-cols-12 gap-12">
          
          {/* LADO IZQUIERDO: FORMULARIO TÉCNICO */}
          <div className="lg:col-span-7 space-y-12">
            <div className="p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] space-y-10">
              <h2 className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-bold">Información de Enlace</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 ml-4 font-bold">Responsable Técnico</label>
                  <input type="text" placeholder="Nombre completo" className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm focus:border-gold/50 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 ml-4 font-bold">Email Corporativo</label>
                  <input type="email" placeholder="email@empresa.cl" className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm focus:border-gold/50 outline-none transition-all" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 ml-4 font-bold">Región</label>
                  <select value={regionSeleccionada} onChange={e => setRegionSeleccionada(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm focus:border-gold/50 outline-none appearance-none">
                    <option value="">Seleccionar Región</option>
                    {regiones.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 ml-4 font-bold">Comuna</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm focus:border-gold/50 outline-none appearance-none">
                    <option value="">Seleccionar Comuna</option>
                    {comunas.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* SELECCIÓN DE HARDWARE */}
            <div className="p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] space-y-10">
              <h2 className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-bold">Configuración de Hardware</h2>
              
              <div className="space-y-6">
                <input 
                  type="search" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar dispositivos en el catálogo..." 
                  className="w-full bg-white/10 border-b border-white/10 py-4 text-lg font-light outline-none placeholder:text-white/10"
                />
                
                <div className="max-h-60 overflow-y-auto no-scrollbar space-y-2">
                  {productos.map(p => (
                    <button key={p.id} type="button" onClick={() => handleAddItem(p)} className="w-full flex justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors text-left group">
                      <span className="text-sm font-light group-hover:text-gold transition-colors">{p.name}</span>
                      <span className="text-[10px] text-white/20 uppercase tracking-widest">{formatCurrency(p.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: RESUMEN DE COTIZACIÓN */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 p-10 rounded-[3rem] border border-gold/10 bg-gradient-to-b from-gold/[0.03] to-transparent backdrop-blur-md space-y-10">
              <h3 className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">Resumen de Propuesta</h3>
              
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 no-scrollbar">
                {items.length === 0 ? (
                  <p className="text-xs text-white/20 italic text-center py-10">No se han integrado dispositivos a la configuración.</p>
                ) : (
                  items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-white/5">
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-light truncate">{item.name}</p>
                        <p className="text-[9px] text-white/30">Cant: {item.cantidad}</p>
                      </div>
                      <p className="text-sm font-medium text-gold">{formatCurrency(item.price * item.cantidad)}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-8 border-t border-white/10">
                <div className="flex justify-between items-end mb-10">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">Inversión Estimada</p>
                  <p className="text-4xl font-light text-gold tracking-tighter italic">{formatCurrency(totalNeto)}</p>
                </div>
                
                <button 
                  disabled={items.length === 0 || submitting}
                  className="w-full py-6 rounded-full bg-gold text-black font-bold text-[10px] tracking-[0.4em] hover:bg-white transition-all duration-500 shadow-3xl shadow-gold/20 disabled:opacity-20"
                >
                  {submitting ? 'SINCRONIZANDO...' : 'SOLICITAR PROPUESTA'}
                </button>
              </div>
            </div>
          </div>

        </form>
      </section>

      <ModalSuccessCotizacion open={successOpen} stage="confirmed" data={submittedData} onClose={() => setSuccessOpen(false)} />
    </div>
  );
};

export default QuotePage;