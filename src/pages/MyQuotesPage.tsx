import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarMisCotizaciones } from '../services/api';

const formatCurrency = (value: number) => `CLP ${value.toLocaleString('es-CL')}`;

const MyQuotesPage = () => {
  const { isAuthenticated } = useAuth();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    listarMisCotizaciones()
      .then(setQuotes)
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-[3rem] border border-white/10 bg-white/[0.02] p-12 text-center backdrop-blur-2xl">
          <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold mb-6">Área Reservada</p>
          <h1 className="text-3xl font-light tracking-tight mb-4">Acceso Pro</h1>
          <p className="text-sm text-white/40 font-light mb-8 leading-relaxed">Identifícate para gestionar tus configuraciones y propuestas técnicas activas.</p>
          <Link to="/login" className="inline-block w-full py-4 rounded-full bg-gold text-black font-bold text-[10px] tracking-widest hover:bg-white transition-all duration-500 shadow-2xl shadow-gold/10">
            ENTRAR AL SISTEMA
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-40 font-inter">
      <section className="container mx-auto px-6">
        
        {/* HEADER SPOTLIGHT */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-10 md:p-16 mb-16 shadow-2xl backdrop-blur-sm">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/5 rounded-full blur-[100px]"></div>
          <div className="relative space-y-4">
            <p className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">Gestión B2B</p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tight italic">Tus <span className="text-gold font-normal">Propuestas</span></h1>
            <p className="max-w-2xl text-sm md:text-base text-white/40 font-light leading-relaxed">
              Panel de control para supervisar, ajustar y finalizar tus configuraciones de infraestructura tecnológica.
            </p>
          </div>
        </div>

        {/* CONTENIDO LISTADO */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-40 text-center flex flex-col items-center gap-4">
              <div className="h-10 w-10 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">Sincronizando registros...</p>
            </div>
          ) : quotes.length === 0 ? (
            <div className="py-40 rounded-[3rem] border border-white/5 bg-white/[0.01] text-center">
              <p className="text-xl font-light text-white/40 mb-8 italic">No hay configuraciones activas en tu perfil.</p>
              <Link to="/cotizar" className="px-10 py-4 rounded-full bg-gold text-black font-bold text-[10px] tracking-widest hover:bg-white transition-all duration-500">
                INICIAR CONFIGURACIÓN
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {quotes.map((quote) => (
                <div key={quote.id} className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-8 transition-all duration-500 hover:bg-white/[0.03] hover:border-white/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-gold/20 bg-gold/5 text-gold">
                          {quote.estado || 'PENDIENTE'}
                        </span>
                        <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">
                          Ref: {quote.codigo || quote.id.slice(0, 8)}
                        </span>
                      </div>
                      <h2 className="text-2xl font-light text-white tracking-tight italic">
                        Propuesta Técnica Econnet
                      </h2>
                      <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
                        Creado el {new Date(quote.createdAt).toLocaleDateString('es-CL')}
                      </p>
                    </div>

                    <div className="flex items-center gap-12 border-l border-white/5 pl-12">
                      <div className="text-right">
                        <p className="text-[8px] uppercase tracking-widest text-white/20 mb-1">Inversión Estimada</p>
                        <p className="text-2xl font-light text-gold tracking-tight italic">
                          {formatCurrency(quote.total || 0)}
                        </p>
                      </div>
                      <Link
                        to={`/mis-cotizaciones/${quote.id}`}
                        className="px-10 py-4 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-gold hover:text-black transition-all duration-500 shadow-xl"
                      >
                        GESTIONAR
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyQuotesPage;