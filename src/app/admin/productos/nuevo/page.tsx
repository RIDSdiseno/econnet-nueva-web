'use client';

import { useState } from 'react';

export default function NuevoProductoPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      // AJUSTA ESTA URL a la de tu backend (ej: http://localhost:3001/api/productos)
      const response = await fetch('http://localhost:3001/api/productos', {
        method: 'POST',
        body: formData, // No agregues headers de Content-Type, el navegador lo hará
      });

      if (!response.ok) throw new Error('Error al crear producto');

      alert('¡Producto creado con éxito!');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error(error);
      alert('Hubo un fallo en la conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Añadir Nuevo Producto</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del Producto</label>
          <input name="nombre" type="text" required className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea name="descripcion" required className="w-full border p-2 rounded" rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Precio</label>
            <input name="precio" type="number" required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock inicial</label>
            <input name="stock" type="number" required className="w-full border p-2 rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Imagen del Producto</label>
          <input name="imagen" type="file" accept="image/*" required className="w-full border p-2 rounded cursor-pointer" />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3 rounded text-white font-bold ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Subiendo...' : 'Crear Producto'}
        </button>
      </form>
    </div>
  );
}