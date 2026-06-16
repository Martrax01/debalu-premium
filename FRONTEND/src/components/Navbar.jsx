import React from 'react';
import { ShoppingCart } from 'lucide-react';

const Navbar = ({ isScrolled, setIsCartOpen, getTotalItems }) => {
  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#E13D7B] rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg">D</div>
          <span className="text-3xl font-black text-[#E13D7B] tracking-tighter">DeBalu</span>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="bg-[#E13D7B] text-white px-6 py-2.5 rounded-full font-bold shadow-md flex items-center gap-2 hover:bg-pink-700 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <ShoppingCart size={18} /> 
          <span className="bg-white text-[#E13D7B] w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm">{getTotalItems()}</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;