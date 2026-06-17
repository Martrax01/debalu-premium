import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

const AdminInventario = ({ flavors, roleActive, fetchData }) => {
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState('/imagen/porciones.jpg');

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    await fetch('https://crescent-hydrant-diary.ngrok-free.dev/api/sabores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ name: newName, price: newPrice, image: newImage })
    });
    setNewName(''); setNewPrice(''); setNewImage('/imagen/porciones.jpg');
    fetchData(); // Actualiza la lista en el padre
  };

  const handleDeleteProduct = async (id) => {
    await fetch(`https://crescent-hydrant-diary.ngrok-free.dev/api/sabores/${id}`, { 
      method: 'DELETE',
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    fetchData();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Añadir Sabor</h2>
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
            <input required className="w-full p-2.5 bg-gray-50 border rounded-lg" value={newName} onChange={e=>setNewName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Precio</label>
            <input required className="w-full p-2.5 bg-gray-50 border rounded-lg" value={newPrice} onChange={e=>setNewPrice(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Imagen</label>
            <input required className="w-full p-2.5 bg-gray-50 border rounded-lg text-sm" value={newImage} onChange={e=>setNewImage(e.target.value)} />
          </div>
          <button type="submit" className="bg-[#E13D7B] text-white px-4 py-3 rounded-xl font-bold w-full shadow-md">Publicar Producto</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Sabores en Vitrina</h2>
        <ul className="space-y-3 max-h-72 overflow-y-auto pr-2">
          {flavors.map(f => (
            <li key={f.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <img src={f.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
              <div className="flex-1">
                <p className="font-bold text-gray-800">{f.name}</p>
                <p className="text-[#E13D7B] font-black text-sm">{f.price}</p>
              </div>
              {roleActive === 'gerente' ? (
                <button onClick={() => handleDeleteProduct(f.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition" title="Borrado Lógico">
                  <Trash2 size={18} />
                </button>
              ) : (
                <span className="text-[10px] text-gray-400 font-bold border px-2 py-1 rounded bg-white">Bloqueado</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminInventario;