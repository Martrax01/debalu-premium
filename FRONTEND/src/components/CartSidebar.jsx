import React from 'react';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';

const CartSidebar = ({ isCartOpen, setIsCartOpen, cart, updateQuantity, removeFromCart, getCartTotal, setIsOrderModalOpen }) => {
  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 bg-[#E13D7B] text-white flex justify-between items-center shadow-md">
          <h2 className="text-2xl font-black flex items-center gap-3"><ShoppingCart size={28}/> Carrito</h2>
          <button onClick={() => setIsCartOpen(false)} className="hover:bg-pink-700 p-2 rounded-full"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-32 flex flex-col items-center">
              <ShoppingCart size={40} className="text-[#E13D7B] opacity-50 mb-4"/>
              <p className="text-lg font-medium text-gray-600">Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl"/>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-gray-800">{item.name}</h4>
                  <span className="text-[#E13D7B] font-black">{item.price}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg border p-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-500 hover:text-[#E13D7B]"><Minus size={14}/></button>
                  <span className="font-bold w-5 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-500 hover:text-[#E13D7B]"><Plus size={14}/></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-lg ml-1"><Trash2 size={18}/></button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-6 border-t shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">Total:</span>
              <span className="text-2xl font-black text-[#E13D7B]">{getCartTotal()} Bs</span>
            </div>
            <button onClick={() => {setIsCartOpen(false); setIsOrderModalOpen(true);}} className="w-full bg-[#E13D7B] hover:bg-pink-700 text-white font-bold py-4 rounded-xl shadow-lg">Continuar al Pago</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;