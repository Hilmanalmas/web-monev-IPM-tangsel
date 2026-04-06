import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Search, RefreshCcw, Users, CheckCircle, LogOut } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shuffling, setShuffling] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');
    const [currentDay, setCurrentDay] = useState(1);
    const [shuffleDay, setShuffleDay] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        username: '',
        password: '',
        role: 'peserta',
        nip: '',
        asal_instansi: ''
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/users');
            setUsers(Array.isArray(res.data.users) ? res.data.users : []);
            const setRes = await axios.get('/api/admin/settings');
            setCurrentDay(setRes.data.current_day);
            setShuffleDay(setRes.data.current_day);
        } catch (error) {
            console.error(error);
            setMessage("Koneksi bermasalah saat memuat data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await axios.post('/api/admin/users', newUser);
            setMessage(`Pasukan ${newUser.name} berhasil didaftarkan ke sistem!`);
            setShowAddForm(false);
            setNewUser({ name: '', username: '', password: '', role: 'peserta', nip: '', asal_instansi: '' });
            fetchUsers();
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menambah user!');
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Yakin ingin menghapus ${name} dari sistem? Semua data terkait (nilai, absensi) juga akan terdampak.`)) return;
        
        try {
            await axios.delete(`/api/admin/users/${id}`);
            setMessage(`User ${name} telah dihapus.`);
            fetchUsers();
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            alert('Gagal menghapus user!');
        }
    };

    const handleShuffle = async () => {
        if (!window.confirm(`Yakin nih mau kocok ulang target Manito untuk HARI ${shuffleDay}? Target sebelumnya pada hari tersebut bakal ketimpa!`)) return;
        
        setShuffling(true);
        setMessage('');
        try {
            await axios.post('/api/admin/manito/shuffle', { day: shuffleDay });
            setMessage(`Mantap! Seluruh target Manito HARI ${shuffleDay} sudah berhasil dikocok ulang secara rahasia! 🎉`);
            fetchUsers(); 
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Gagal mengocok target!');
        } finally {
            setShuffling(false);
        }
    };

    const filteredUsers = Array.isArray(users) ? users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.instansi?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    if (loading) return <div className="p-20 text-center text-amber-500 font-bold"><RefreshCcw className="animate-spin mx-auto mb-4" size={40}/> Memuat Database Pasukan...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
            {message && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-xl flex items-center gap-3 shadow-md font-bold">
                    <CheckCircle /> {message}
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                 <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 gap-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                     <div>
                         <h2 className="text-2xl font-black flex items-center gap-3"><Users className="text-amber-400"/> Daftar Pasukan & Misi Target</h2>
                         <p className="text-gray-300 mt-1">Pantau instruksi rahasia siapa mengawasi siapa.</p>
                     </div>
                     <div className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex items-center">
                            <span className="px-3 text-xs font-bold text-amber-400 uppercase tracking-tighter">Hari Kocok:</span>
                            {[1, 2, 3, 4, 5].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setShuffleDay(d)}
                                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${shuffleDay === d ? 'bg-amber-500 text-gray-900 shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleShuffle}
                            disabled={shuffling}
                            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-900 font-black py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <RefreshCcw size={20} className={shuffling ? "animate-spin" : ""} />
                            {shuffling ? 'MENGACAK...' : `KOCOK MANITO H-${shuffleDay}!`}
                        </button>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl border border-white/20 transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <Users size={20} />
                            {showAddForm ? 'BATAL' : 'TAMBAH'}
                        </button>
                     </div>
                 </div>

                 {showAddForm && (
                     <div className="p-6 bg-gray-900/5 border-b border-gray-100 animate-in slide-in-from-top duration-300">
                         <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <input 
                                 placeholder="Nama Lengkap" 
                                 className="p-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500" 
                                 required
                                 value={newUser.name}
                                 onChange={e => setNewUser({...newUser, name: e.target.value})}
                             />
                             <input 
                                 placeholder="Username" 
                                 className="p-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500" 
                                 required
                                 value={newUser.username}
                                 onChange={e => setNewUser({...newUser, username: e.target.value})}
                             />
                             <input 
                                 type="password"
                                 placeholder="Password" 
                                 className="p-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500" 
                                 required
                                 value={newUser.password}
                                 onChange={e => setNewUser({...newUser, password: e.target.value})}
                             />
                             <select 
                                 className="p-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                                 value={newUser.role}
                                 onChange={e => setNewUser({...newUser, role: e.target.value})}
                             >
                                 <option value="peserta">Peserta</option>
                                 <option value="observer">Observer (Penilai)</option>
                                 <option value="admin">Admin (Super User)</option>
                             </select>
                             <input 
                                 placeholder="NIP / No Anggota" 
                                 className="p-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500 font-mono" 
                                 value={newUser.nip}
                                 onChange={e => setNewUser({...newUser, nip: e.target.value})}
                             />
                             <input 
                                 placeholder="Asal Instansi" 
                                 className="p-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-amber-500" 
                                 value={newUser.asal_instansi}
                                 onChange={e => setNewUser({...newUser, asal_instansi: e.target.value})}
                             />
                             <button className="md:col-span-3 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all">
                                 DAFTARKAN PASUKAN SEKARANG
                             </button>
                         </form>
                     </div>
                 )}

                 <div className="p-6 bg-gray-50 border-b border-gray-100">
                     <div className="relative max-w-md">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <Search className="text-gray-400" size={20} />
                         </div>
                         <input
                             type="text"
                             placeholder="Cari sandi nama pasukan..."
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none"
                         />
                     </div>
                 </div>

                 <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                         <thead>
                             <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                 <th className="p-4 font-bold">Identitas Pasukan</th>
                                 <th className="p-4 font-bold">Akses & Instansi</th>
                                 <th className="p-4 font-bold">🎯 Target Rahasia</th>
                                 <th className="p-4 font-bold text-center">Aksi</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                             {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                 <tr key={user.id} className="hover:bg-amber-50/50 transition-colors group">
                                     <td className="p-4">
                                         <div className="font-black text-gray-900">{user.name}</div>
                                         <div className="text-xs text-gray-400 font-mono">@{user.username}</div>
                                     </td>
                                     <td className="p-4">
                                         <div className={`text-xs font-bold uppercase inline-block px-2 py-0.5 rounded ${user.role === 'admin' ? 'bg-red-100 text-red-600' : user.role === 'observer' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                             {user.role}
                                         </div>
                                         <div className="text-sm text-gray-600 mt-1 font-medium">{user.instansi || '-'}</div>
                                     </td>
                                     <td className="p-4">
                                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold
                                             ${user.target_name === 'Belum Ada Target' ? 'bg-red-100 text-red-600' : user.target_name === '-' ? 'text-gray-300' : 'bg-gray-800 text-amber-400'}`}>
                                             <Target size={14}/> {user.target_name}
                                         </span>
                                     </td>
                                     <td className="p-4 text-center">
                                         <button 
                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Hapus Pasukan"
                                         >
                                            <LogOut size={18} className="rotate-180" />
                                         </button>
                                     </td>
                                 </tr>
                             )) : (
                                 <tr><td colSpan="4" className="p-8 text-center text-gray-500 italic">Tidak ada pasukan ditemukan.</td></tr>
                             )}
                         </tbody>
                     </table>
                 </div>
            </div>
        </div>
    );
};
export default AdminUsers;
