const WhatsAppButton = () => {
  const phoneNumber = "56990308676"; // Asegúrate de cambiar esto
  const message = encodeURIComponent("Hola Econnet, me gustaría recibir asesoría técnica.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      // Usamos fixed y un z-index masivo para que flote sobre todo
      className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9999] group flex items-center justify-center"
      style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}
    >
      {/* Efecto Aura */}
      <span className="absolute inset-0 rounded-full bg-green-500/20 animate-ping"></span>
      
      {/* Círculo del Botón */}
      <div className="relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_40px_rgba(37,211,102,0.4)] transition-all duration-500 group-hover:bg-gold group-hover:scale-110">
        <svg className="h-7 w-7 md:h-8 md:w-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412 0 12.048c0 2.123.554 4.197 1.607 6.013L0 24l6.135-1.61a11.787 11.787 0 005.912 1.594h.005c6.638 0 12.048-5.414 12.052-12.051a11.767 11.767 0 00-3.528-8.52z"/>
        </svg>
      </div>
    </a>
  );
};

export default WhatsAppButton;