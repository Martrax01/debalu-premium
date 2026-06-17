import React from 'react';
import { Facebook, Instagram, Lock } from 'lucide-react';

const Footer = ({ setCurrentView }) => {
  return (
    <footer className="bg-gray-50 py-16 text-center border-t border-gray-100 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center gap-6 mb-8">
          <a href="https://www.facebook.com/profile.php?id=100088109960352" className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border text-gray-500 hover:text-[#1877F2]"><Facebook size={20} /></a>
          <a href="https://instagram.com/debalugelato" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border text-gray-500 hover:text-[#E1306C]"><Instagram size={20} /></a>
          <a href="https://www.tiktok.com/@debalu_helados_lp?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border text-gray-500 hover:text-black">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.81-.74-3.94-1.69-.22-.19-.42-.38-.62-.59v6.38c-.02 2.33-.82 4.67-2.5 6.27-1.65 1.59-4.05 2.45-6.33 2.16-2.53-.23-4.94-1.84-5.91-4.22-1.25-2.92-.48-6.62 1.83-8.68 1.65-1.5 4.09-2.12 6.26-1.56v4.02c-1.22-.38-2.6-.14-3.56.66-.99.8-1.39 2.17-1.01 3.39.35 1.19 1.51 2.08 2.75 2.05 1.54.04 2.87-1.12 2.94-2.66V0h.02-.02z"/></svg>
          </a>
        </div>
        <p className="text-gray-900 font-black text-lg mb-2">DeBalu Premium</p>
        <p className="text-gray-400 text-xs">© {new Date().getFullYear()} DeBalu Premium. Todos los derechos reservados.</p>
        <button onClick={() => setCurrentView('auth')} className="mt-12 flex items-center justify-center gap-2 mx-auto text-gray-400 hover:text-[#E13D7B] text-xs font-bold bg-white px-4 py-2 rounded-full border shadow-sm transition">
          <Lock size={14} /> Portal Administrativo
        </button>
      </div>
    </footer>
  );
};

export default Footer;