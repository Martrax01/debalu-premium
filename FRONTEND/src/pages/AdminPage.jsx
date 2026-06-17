import React, { useState, useEffect } from 'react';
import { FileText, BarChart2, LogOut, UserPlus, ShieldAlert, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminInventario from '../components/AdminInventario';

const AdminPage = ({ currentUser, setCurrentView, setCurrentUser }) => {
  const usernameActive = currentUser?.username || 'Desconocido';
  const roleActive = currentUser?.role || 'empleado';

  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('empleado');
  const [adminMsg, setAdminMsg] = useState('');
  const [usersList, setUsersList] = useState([]);
  
  const [flavors, setFlavors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]); 

  const checkPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'text-gray-400' };
    if (pwd.length < 6) return { label: '🔴 Débil (Mínimo 6 caracteres)', color: 'text-red-500' };
    const tieneMayuscula = /[A-Z]/.test(pwd);
    const tieneNumero = /[0-9]/.test(pwd);
    const tieneEspecial = /[^A-Za-z0-9]/.test(pwd);
    if (pwd.length >= 8 && tieneMayuscula && tieneNumero && tieneEspecial) return { label: '🟢 Fuerte (Segura para el sistema)', color: 'text-green-500' };
    return { label: '🟡 Intermedia (Añada mayúsculas y símbolos)', color: 'text-yellow-500' };
  };
  const passwordStrength = checkPasswordStrength(newAdminPass);

  const fetchData = () => {
    fetch('https://crescent-hydrant-diary.ngrok-free.dev/api/sabores', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setFlavors(data); }).catch(() => setFlavors([]));
    fetch('https://crescent-hydrant-diary.ngrok-free.dev/api/estadisticas', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setChartData(data); }).catch(() => setChartData([]));

    if (roleActive === 'gerente') {
      fetch('https://crescent-hydrant-diary.ngrok-free.dev/api/logs', { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(r => r.json()).then(data => { if (Array.isArray(data)) setLogs(data); }).catch(() => setLogs([]));
      fetch('https://crescent-hydrant-diary.ngrok-free.dev/api/usuarios', { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(r => r.json()).then(data => { if (Array.isArray(data)) setUsersList(data); }).catch(() => setUsersList([]));
    }
  };

  useEffect(() => { fetchData(); }, []);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte Oficial - Inventario DeBalu", 14, 15);
    const tableData = flavors.map(f => [f.id, f.name, f.price]);
    autoTable(doc, { startY: 20, head: [['ID', 'Producto', 'Precio']], body: tableData });
    doc.save("Reporte_DeBalu.pdf");
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const res = await fetch('https://crescent-hydrant-diary.ngrok-free.dev/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ username: newAdminUser, password: newAdminPass, role: newAdminRole })
    });
    const data = await res.json();
    if (res.ok) {
      setAdminMsg('✅ Cuenta configurada con éxito');
      setNewAdminUser(''); setNewAdminPass('');
      fetchData();
    } else setAdminMsg('❌ ' + data.error);
    setTimeout(() => setAdminMsg(''), 4000);
  };

  const handleDeleteUser = async (id, nameToDel) => {
    if (nameToDel === usernameActive) return alert("No puedes eliminar tu propia cuenta en sesión.");
    if (nameToDel === 'admin') return alert("La cuenta de administración raíz no se puede destruir.");
    if (confirm(`¿Está seguro de despedir y borrar a "${nameToDel}" del sistema?`)) {
      await fetch(`https://crescent-hydrant-diary.ngrok-free.dev/api/usuarios/${id}`, { method: 'DELETE', headers: { 'ngrok-skip-browser-warning': 'true' } });
      fetchData();
    }
  };

  const handleLogout = async () => {
    await fetch('https://crescent-hydrant-diary.ngrok-free.dev/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ username: usernameActive })
    });
    setCurrentUser(null);
    setCurrentView('store');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900 p-6 rounded-2xl shadow-xl text-white">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Dashboard General</h1>
            <p className="text-gray-400">Usuario: <span className="font-bold text-pink-400">{usernameActive}</span> | Rango: <span className="uppercase text-xs bg-pink-600 text-white px-2 py-0.5 rounded font-black">{roleActive}</span></p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button onClick={exportPDF} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold transition"><FileText size={18}/> Reporte PDF</button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-[#E13D7B] hover:bg-pink-600 px-4 py-2 rounded-lg font-bold transition"><LogOut size={18}/> Salir</button>
          </div>
        </div>

        {roleActive === 'gerente' && (
          <div className="grid md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
            <div className="md:col-span-1 border-r border-gray-100 md:pr-6">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-gray-800"><UserPlus size={18} className="text-[#E13D7B]"/> Registrar Personal</h2>
              <form onSubmit={handleCreateAdmin} className="space-y-3">
                <input required className="w-full p-2 bg-gray-50 border rounded-lg text-sm" value={newAdminUser} onChange={e=>setNewAdminUser(e.target.value)} placeholder="Nombre de usuario" />
                <input type="password" required className="w-full p-2 bg-gray-50 border rounded-lg text-sm" value={newAdminPass} onChange={e=>setNewAdminPass(e.target.value)} placeholder="Contraseña de seguridad" />
                {newAdminPass && <p className={`text-[11px] font-black mt-1 ${passwordStrength.color}`}>{passwordStrength.label}</p>}
                <select className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-bold text-gray-600" value={newAdminRole} onChange={e=>setNewAdminRole(e.target.value)}>
                  <option value="empleado">Rango: Empleado</option>
                  <option value="gerente">Rango: Gerente</option>
                </select>
                <button type="submit" className="w-full bg-gray-900 text-white py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition">Dar de Alta</button>
              </form>
              {adminMsg && <p className="mt-2 text-xs font-bold text-center">{adminMsg}</p>}
            </div>

            <div className="md:col-span-2">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-gray-800"><Users size={18} className="text-[#E13D7B]"/> Panel de Control de Cuentas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-44 overflow-y-auto pr-2">
                {usersList.map(u => (
                  <div key={u.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{u.username}</p>
                      <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">{u.role}</p>
                    </div>
                    <button onClick={() => handleDeleteUser(u.id, u.username)} className="text-xs font-black text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition">Eliminar</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <AdminInventario flavors={flavors} roleActive={roleActive} fetchData={fetchData} />

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BarChart2 size={20} className="text-[#E13D7B]"/> Ventas Reales Confirmadas</h2>
            <div className="flex-1 min-h-[250px] w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium">No hay ventas registradas.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#fce7f3'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                    <Bar dataKey="Ventas" fill="#E13D7B" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-gray-900 text-green-400 p-6 rounded-2xl shadow-lg border border-gray-800 flex flex-col min-h-[250px]">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
              Logs de Seguridad
            </h2>
            {roleActive === 'gerente' ? (
              <div className="flex-1 max-h-56 overflow-y-auto text-xs font-mono space-y-2 pr-2">
                {logs.length === 0 && <p className="text-gray-500">No hay registros.</p>}
                {logs.map(log => (
                  <div key={log.id} className="border-b border-gray-800 pb-2">
                    <span className="text-gray-500">[{new Date(log.timestamp).toLocaleString()}]</span><br/>
                    <span className="text-blue-400">USER:</span> {log.username} | <span className="text-yellow-400">IP:</span> {log.ip} | <span className="text-pink-400">EVENTO:</span> {log.event}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 space-y-2">
                <ShieldAlert size={36} className="text-red-500 animate-bounce" />
                <p className="text-sm font-bold text-red-400">ACCESO RESTRINGIDO</p>
                <p className="text-xs text-gray-400">Su rango no tiene permisos para realizar auditorías.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPage;