import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

const LoginPage = ({ setCurrentView, setCurrentUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAns, setCaptchaAns] = useState('');
  const [num1] = useState(Math.floor(Math.random() * 10) + 1);
  const [num2] = useState(Math.floor(Math.random() * 10) + 1);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(captchaAns) !== num1 + num2) {
      setErrorMsg('Captcha incorrecto. Intenta de nuevo.');
      return;
    }
    
    try {
      const res = await fetch('https://crescent-hydrant-diary.ngrok-free.dev/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ 
            username: username,
            password: password
        })
      });
      
      const data = await res.json();

      if (res.ok) {
        setCurrentUser({ username: data.username, role: data.role });
        setCurrentView('admin');
      } else {
        setErrorMsg(data.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-[#E13D7B]">
        <button onClick={() => setCurrentView('store')} className="text-gray-400 hover:text-[#E13D7B] mb-6 flex items-center gap-2 text-sm font-bold transition-colors">
          <X size={16} /> Volver a la Tienda Pública
        </button>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white"><Lock size={20}/></div>
          <h2 className="text-2xl font-black text-gray-900">Portal Administrativo</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Usuario</label>
            <input type="text" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E13D7B]" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contraseña</label>
            <input type="password" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#E13D7B]" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>

          <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100">
            <label className="block text-xs font-bold text-[#E13D7B] uppercase tracking-wider mb-2">Código de Seguridad (Captcha)</label>
            <div className="flex items-center gap-3">
              <span className="text-lg font-black bg-white px-4 py-2 rounded-lg shadow-sm text-gray-800">{num1} + {num2} = </span>
              <input type="number" required className="w-24 p-2 border border-gray-200 rounded-lg text-center font-bold text-lg" value={captchaAns} onChange={e=>setCaptchaAns(e.target.value)} />
            </div>
          </div>

          {errorMsg && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">{errorMsg}</p>}

          <button type="submit" className="w-full bg-gray-900 text-white p-4 rounded-xl font-bold hover:bg-[#E13D7B] transition-colors shadow-lg">
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;