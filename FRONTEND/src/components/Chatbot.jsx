import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';

const Chatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [flavorsData, setFlavorsData] = useState([]);
  const [userName, setUserName] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          id: 1, 
          sender: 'bot', 
          text: '¡Hola! Bienvenido a DeBalu Premium 🍦. Soy tu asistente virtual.\n\n¿En qué te puedo ayudar hoy?',
          options: ['Ver Menú y Precios', 'Horarios y Ubicación', 'Hablar por WhatsApp']
        }
      ]);
    }
    
    fetch('https://crescent-hydrant-diary.ngrok-free.dev/api/sabores')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setFlavorsData(data); })
      .catch(() => console.error("Bot offline"));
  }, []);

  useEffect(() => { 
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, isChatOpen]);

  const processBotResponse = (text) => {
    const input = text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
      .replace(/[¿?¡!.,;]/g, "") 
      .trim(); 
    
    const contiene = (palabras) => palabras.some(palabra => input.includes(palabra));
    const esExacto = (palabras) => palabras.some(palabra => input === palabra);

    if (contiene(['me llamo', 'mi nombre es', 'soy '])) {
      const words = input.split(' ');
      const nameIndex = words.findIndex(w => w === 'llamo' || w === 'soy' || w === 'es') + 1;
      if (words[nameIndex]) {
        const name = words[nameIndex].charAt(0).toUpperCase() + words[nameIndex].slice(1);
        setUserName(name);
        return `¡Mucho gusto, ${name}! ¿Qué se te antoja hoy?`;
      }
    }

    //CALCULOS Y BUSQUEDA
    const matchCantidadSabor = input.match(/(\d+)\s+([a-z]+)/);
    if (matchCantidadSabor) {
      const cantidad = parseInt(matchCantidadSabor[1]);
      const saborBuscado = matchCantidadSabor[2];
      const saborEncontrado = flavorsData.find(f => f.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(saborBuscado));
      
      if (saborEncontrado) {
        const precioNumero = parseFloat(saborEncontrado.price.replace(/[^0-9.]/g, '')) || 0;
        const total = precioNumero * cantidad;
        return `Si quieres ${cantidad} de "${saborEncontrado.name}", te saldría un total de ${total} Bs. ¡Añádelo a tu carrito arriba a la derecha! 🛒`;
      }
    }

    const saborConsultado = flavorsData.find(f => input.includes(f.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(' ')[0]));
    if (saborConsultado && input.length >= 3) {
      return `¡Sí! Tenemos el exquisito "${saborConsultado.name}" y su precio es de ${saborConsultado.price}. ¿Te gustaría pedirlo?`;
    }

    //HOLA
    if (esExacto(['hola', 'buenas']) || contiene(['saludos', 'que tal', 'buen dia', 'buenas tardes', 'buenas noches'])) {
      return `¡Hola${userName ? ' ' + userName : ''}! Qué gusto saludarte. Puedes preguntarme por nuestro menú, envíos o ubicación.`;
    }

    //WHATSAPP
    if (contiene(['whatsapp', 'wpp', 'whats', 'wasap', 'numero', 'celular', 'telefono', 'contacto', 'contactar', 'humano', 'persona'])) {
      return "Para hablar directamente con nosotros por WhatsApp, solo tienes que tocar el ícono verde de WhatsApp que está flotando abajo a la derecha. ¡Te atenderemos enseguida! 📱";
    }

    //MÉTODOS
    if (contiene(['pago', 'pagos', 'pagar', 'qr', 'efectivo', 'tarjeta', 'transferencia', 'metodo', 'cuenta', 'banco'])) {
      return "Aceptamos pagos mediante Transferencia QR (te enviamos el código por WhatsApp) y también en Efectivo (pagas al repartidor cuando llegue tu helado). 💸";
    }

    //DELIVERY
    if (contiene(['delivery', 'envio', 'envios', 'domicilio', 'llega', 'mandan', 'repartidor', 'llevan', 'moto'])) {
      return "¡Sí! Tenemos servicio de delivery en La Paz. Solo arma tu pedido en el carrito, dale a 'Continuar al Pago' y coordinamos tu dirección exacta por WhatsApp. 🛵";
    }

    //CÓMO COMPRAR
    if (contiene(['como pido', 'como comprar', 'pedir', 'comprar', 'carrito', 'hacer pedido', 'helado', 'helados'])) {
      return "Hacer un pedido es súper fácil:\n1️⃣ Busca el helado que quieras en la página.\n2️⃣ Toca el carrito rosado para añadirlo.\n3️⃣ Abre tu carrito (arriba a la derecha) y dale a 'Continuar al Pago'. 🛍️";
    }

    //PRECIO
    if (contiene(['menu', 'precio', 'precios', 'cuesta', 'cuanto vale', 'sabores', 'lista', 'catalogo', 'costo', 'opciones'])) {
      if (flavorsData.length === 0) return "Tenemos opciones desde los 5 Bs hasta los 15 Bs. ¡Revisa la sección de Especialidades en la página!";
      
      let menuText = "Aquí tienes nuestro catálogo actual:\n\n";
      flavorsData.forEach(f => { menuText += `▫️ ${f.name}: ${f.price}\n`; });
      return menuText;
    } 

    //HORARIO
    if (contiene(['horario', 'horarios', 'hora', 'atienden', 'abren', 'cierran', 'abierto'])) {
      return "Atendemos de lunes a domingo desde las 1:00 AM hasta las 06:00 PM.";
    } 

    //UBICACIÓN
    if (contiene(['ubicacion', 'donde', 'direccion', 'lugar', 'zona', 'estan', 'sucursal', 'local'])) {
      return "Nuestra central está en la ciudad de La Paz, Bolivia. ¡Pero llegamos a ti gracias a nuestro servicio de delivery!";
    }

    //DESPEDIDA
    if (contiene(['gracias', 'adios', 'chau', 'hasta luego', 'bye'])) {
      return `¡De nada${userName ? ', ' + userName : ''}! En DeBalu estamos para endulzarte el día. ¡Vuelve pronto! 🍦✨`;
    }

    //FALLBACK
    return { 
      text: "Mmm... no estoy seguro de entender eso 😅. Todavía estoy aprendiendo a ser un buen mesero virtual.\n\nPuedes intentar preguntarme sobre:", 
      options: ['Ver Menú', 'Delivery', 'Pagos', 'Hablar por WhatsApp'] 
    };
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: text }]);
    setInputMessage('');

    setTimeout(() => {
      const response = processBotResponse(text);
      if (typeof response === 'string') {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: response }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: response.text, options: response.options }]);
      }
    }, 800);
  };

  const handleOptionClick = (option) => {
    handleSendMessage(option);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans">
      {isChatOpen && (
        <div className="bg-white w-[320px] sm:w-[380px] h-[480px] rounded-[30px] shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          
          <div className="bg-[#E13D7B] text-white p-4 flex justify-between items-center shadow-md z-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
                <MessageSquare size={18} className="text-white"/>
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-wide">Asistente Virtual</h4>
                <p className="text-[10px] text-pink-100 flex items-center gap-1.5 mt-0.5 font-medium">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span> 
                  En línea
                </p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors relative z-10"><X size={20} /></button>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gray-50/80 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {msg.sender === 'bot' && (
                   <span className="text-[10px] font-bold text-gray-400 ml-1 mb-1">DeBalu Bot</span>
                )}
                {msg.sender === 'user' && userName && (
                   <span className="text-[10px] font-bold text-[#E13D7B] mr-1 mb-1 flex items-center gap-1"><User size={10}/> {userName}</span>
                )}

                <div className={`max-w-[85%] p-3.5 text-sm shadow-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user' 
                  ? 'bg-gradient-to-br from-[#E13D7B] to-pink-600 text-white rounded-2xl rounded-br-sm' 
                  : 'bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>

                {msg.options && (
                  <div className="flex flex-wrap gap-2 mt-3 w-full">
                    {msg.options.map((opt, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleOptionClick(opt)}
                        className="text-xs bg-pink-50 hover:bg-[#E13D7B] hover:text-white text-[#E13D7B] font-bold py-2 px-3 rounded-full border border-pink-100 transition-colors shadow-sm"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }} 
            className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center"
          >
            <input 
              type="text" 
              value={inputMessage} 
              onChange={e => setInputMessage(e.target.value)} 
              placeholder="Pregúntame algo..." 
              className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-200 focus:bg-white transition-all border border-transparent focus:border-pink-300" 
            />
            <button 
              type="submit" 
              disabled={!inputMessage.trim()}
              className="bg-[#E13D7B] hover:bg-pink-700 disabled:bg-pink-300 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors shadow-md hover:shadow-lg"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsChatOpen(!isChatOpen)} 
        className="bg-gradient-to-r from-[#E13D7B] to-pink-600 text-white w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center relative group"
      >
        {isChatOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isChatOpen && (
          <span className="absolute left-20 bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            ¿Dudas? Chatea aquí
          </span>
        )}
      </button>
    </div>
  );
};

export default Chatbot;