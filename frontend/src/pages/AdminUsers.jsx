import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Search, RefreshCcw, Users, CheckCircle } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shuffling, setShuffling] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/users');
            setUsers(res.data.users);
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

    const handleShuffle = async () => {
        if (!window.confirm('Yakin nih mau kocok ulang target Manito? Target sebelumnya bakal ketimpa lho!')) return;
        
        setShuffling(true);
        setMessage('');
        try {
            await axios.post('/api/admin/manito/shuffle', { event_id: 1 });
            setMessage('Mantap! Seluruh target Manito sudah berhasil dikocok ulang secara rahasia! 🎉');
            fetchUsers(); 
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Gagal mengocok target!');
        } finally {
            setShuffling(false);
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.instansi?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                     <button
                         onClick={handleShuffle}
                         disabled={shuffling}
                         className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-900 font-black py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2"
                     >
                         <RefreshCcw size={20} className={shuffling ? "animate-spin" : ""} />
                         {shuffling ? 'MENGACAK TARGET...' : 'KOCOK TARGET MANITO!'}
                     </button>
                 </div>

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
                                 <th className="p-4 font-bold">Nama Pasukan</th>
                                 <th className="p-4 font-bold">Asal Instansi</th>
                                 <th className="p-4 font-bold">🎯 Target Rahasia (Manito)</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                             {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                 <tr key={user.id} className="hover:bg-amber-50/50 transition-colors">
                                     <td className="p-4 font-bold text-gray-800">{user.name}</td>
                                     <td className="p-4 text-gray-600">{user.instansi || '-'}</td>
                                     <td className="p-4">
                                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold
                                             ${user.target_name === 'Belum Ada Target' ? 'bg-red-100 text-red-600' : 'bg-gray-800 text-amber-400'}`}>
                                             <Target size={14}/> {user.target_name}
                                         </span>
                                     </td>
                                 </tr>
                             )) : (
                                 <tr><td colSpan="3" className="p-8 text-center text-gray-500 italic">Tidak ada pasukan ditemukan.</td></tr>
                             )}
                         </tbody>
                     </table>
                 </div>
            </div>
        </div>
    );
};
export default AdminUsers;
