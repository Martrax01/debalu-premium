import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, MessageSquare, QrCode, Banknote } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import CartSidebar from '../components/CartSidebar';

const fallbackFlavors = [
  { id: 1, name: '2 Porciones (Local)', price: '7BS.', image: '/imagen/porciones.jpg' },
  { id: 2, name: 'Frappe (Local)', price: '15 Bs.', image: '/imagen/frappe.jpg' },
  { id: 3, name: 'Fresas con Crema (Local)', price: '15 Bs.', image: '/imagen/fresas.jpeg' },
  { id: 4, name: 'Popsipatitas (Local)', price: '5 Bs.', image: '/imagen/popsi.jpg' }
];

const StorePage = ({ setCurrentView }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [flavors, setFlavors] = useState(fallbackFlavors);
  const [backendError, setBackendError] = useState(false);
  
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qr');

  useEffect(() => {
    const fetchFlavors = async () => {
      try {
        // AQUÍ ESTÁ LA CORRECCIÓN: Agregué el header ngrok-skip-browser-warning
        const res = await fetch('https://crescent-hydrant-diary.ngrok-free.dev/api/sabores', {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setFlavors(data);
          setBackendError(false);
        } else {
          setFlavors(fallbackFlavors);
          setBackendError(true);
        }
      } catch (e) {
        setFlavors(fallbackFlavors);
        setBackendError(true);
      }
    };
    fetchFlavors();

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = (flavor) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === flavor.id);
      if (existing) return prev.map(item => item.id === flavor.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...flavor, quantity: 1 }];
    });
    setIsCartOpen(true);
  };
  
  const updateQuantity = (id, delta) => setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const getCartTotal = () => cart.reduce((total, item) => total + ((parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0) * item.quantity), 0);
  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;

    try {
      await fetch('https://crescent-hydrant-diary.ngrok-free.dev/api/ventas', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ items: cart })
      });
    } catch (error) {
      console.error("Error BD", error);
    }

    let msg = `¡Hola! Pedido en DeBalu Premium 🍦.\n\n*Detalle:*\n`;
    cart.forEach(item => msg += `▫️ ${item.quantity}x ${item.name}\n`);
    msg += `\n*TOTAL: ${getCartTotal()} Bs.*\nMétodo: *${paymentMethod === 'qr' ? 'Código QR' : 'Efectivo'}*`;
    
    window.open(`https://wa.me/59171277172?text=${encodeURIComponent(msg)}`, '_blank');
    setCart([]);
    setIsOrderModalOpen(false);
  };

  return (
    <div className="relative bg-white min-h-screen">
      
      <Navbar isScrolled={isScrolled} setIsCartOpen={setIsCartOpen} getTotalItems={getTotalItems} />
      <CartSidebar isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} getCartTotal={getCartTotal} setIsOrderModalOpen={setIsOrderModalOpen} />
      <Chatbot />

      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full relative shadow-2xl animate-in zoom-in duration-200">
            <button onClick={() => setIsOrderModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:bg-gray-100 p-2 rounded-full"><X size={24}/></button>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Finalizar Pedido</h2>
            <p className="text-gray-500 text-sm mb-6">Monto total: <span className="font-bold text-[#E13D7B]">{getCartTotal()} Bs</span></p>

            <div className="space-y-4 mb-8">
              <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer ${paymentMethod === 'qr' ? 'border-[#E13D7B] bg-pink-50' : 'border-gray-100'}`} onClick={() => setPaymentMethod('qr')}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'qr' ? 'bg-[#E13D7B] text-white' : 'bg-gray-100 text-gray-500'}`}><QrCode size={24} /></div>
                <div className="flex-1"><h4 className="font-bold">Transferencia QR</h4></div>
              </label>
              <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer ${paymentMethod === 'efectivo' ? 'border-[#E13D7B] bg-pink-50' : 'border-gray-100'}`} onClick={() => setPaymentMethod('efectivo')}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'efectivo' ? 'bg-[#E13D7B] text-white' : 'bg-gray-100 text-gray-500'}`}><Banknote size={24} /></div>
                <div className="flex-1"><h4 className="font-bold">Efectivo al Delivery</h4></div>
              </label>
            </div>
            
            <button onClick={handleConfirmOrder} className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-4 rounded-xl w-full shadow-lg">
              <MessageSquare size={20} /> Confirmar por WhatsApp
            </button>
          </div>
        </div>
      )}

      <section className="min-h-screen flex items-center bg-gradient-to-br from-pink-50 via-white to-pink-100 px-6 pt-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 z-10">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-[#E13D7B] leading-[0.85]">DEBALU<br/><span className="text-gray-900 text-5xl md:text-6xl lg:text-8xl font-black">PREMIUM</span></h1>
            <p className="text-xl text-gray-600 max-w-md leading-relaxed">Artesanía en cada cucharada. 100% Natural. El verdadero sabor de La Paz.</p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#E13D7B] blur-3xl opacity-20 rounded-full animate-pulse"></div>
            <img src="/imagen/logo ice cream premium.jpg" className="w-full max-w-md mx-auto aspect-square object-cover rounded-3xl shadow-2xl relative z-10 border-8 border-white" alt="Helado" />
          </div>
        </div>
      </section>

      <section id="sabores" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900">Especialidades</h2>
          {backendError && <p className="text-sm text-amber-600 font-bold mt-3">⚠️ Mostrando Inventario Offline (Modo de Respaldo)</p>}
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {flavors.map(f => (
            <div key={f.id} className="bg-white rounded-[32px] p-5 shadow-xl shadow-gray-100/50 border border-gray-100 flex flex-col group hover:-translate-y-1 transition-all">
              <div className="overflow-hidden rounded-[24px] mb-6 h-60">
                <img src={f.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={f.name} />
              </div>
              <h3 className="font-bold text-xl text-gray-800 mb-2">{f.name}</h3>
              <div className="flex justify-between items-center mt-auto pt-4">
                <span className="text-2xl font-black text-[#E13D7B]">{f.price}</span>
                <button onClick={() => addToCart(f)} className="bg-pink-50 text-[#E13D7B] p-3.5 rounded-2xl hover:bg-[#E13D7B] hover:text-white transition-colors active:scale-95"><ShoppingCart size={22}/></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <a href="https://wa.me/59171277172?text=¡Hola!" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 hover:scale-110 transition-transform duration-300 group flex items-center justify-center w-16 h-16 bg-[#25D366] rounded-full shadow-2xl" title="Chat de WhatsApp">
        <div className="absolute inset-0 bg-[#25D366] blur-xl rounded-full opacity-40 group-hover:opacity-60 transition-opacity"></div>
        <svg viewBox="0 0 24 24" className="w-9 h-9 relative z-10 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.031 0C5.398 0 .013 5.385.011 12.016c0 2.124.553 4.195 1.604 6.02L0 24l6.115-1.605c1.761.948 3.738 1.448 5.897 1.449h.004c6.634 0 12.022-5.388 12.025-12.022C24.043 5.385 18.665.002 12.031 0zm0 21.84c-1.802 0-3.565-.484-5.111-1.397l-.367-.217-3.799.996.996-3.704-.238-.378C2.518 15.454 1.956 13.766 1.958 12.016c.002-5.553 4.524-10.07 10.077-10.07 5.55 0 10.068 4.522 10.065 10.073-.002 5.553-4.525 10.073-10.069 10.073zm5.534-7.554c-.304-.152-1.797-.887-2.075-.989-.278-.101-.481-.152-.684.152-.203.304-.784.989-.961 1.192-.177.203-.354.228-.658.076-.304-.152-1.282-.473-2.443-1.518-.903-.812-1.512-1.816-1.689-2.12-.177-.304-.019-.469.133-.62.137-.137.304-.354.456-.531.152-.177.203-.304.304-.506.101-.203.051-.379-.025-.531-.076-.152-.684-1.645-.936-2.253-.246-.593-.496-.513-.684-.522-.177-.009-.379-.009-.582-.009-.203 0-.531.076-.81.379-.278.304-1.063 1.038-1.063 2.531 0 1.493 1.088 2.936 1.24 3.139.152.203 2.14 3.265 5.184 4.568.723.31 1.287.495 1.727.634.726.229 1.387.197 1.909.119.585-.087 1.797-.734 2.05-1.443.253-.709.253-1.316.177-1.443-.076-.127-.278-.203-.582-.355z"/>
        </svg>
      </a>

      <Footer setCurrentView={setCurrentView} />
      
    </div>
  );
};

export default StorePage;