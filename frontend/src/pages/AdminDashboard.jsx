import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Activity, Target, ShieldAlert, Sparkles, RefreshCcw, CheckCircle, Search, Download } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shuffling, setShuffling] = useState(false);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes] = await Promise.all([
                axios.get('/api/admin/stats'),
                axios.get('/api/admin/users')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data.users);
        } catch (error) {
            console.error("Gagal memuat data komandan", error);
            setMessage("Waduh, koneksi ke markas terputus!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleShuffle = async () => {
        if (!window.confirm('Yakin nih mau kocok ulang target Manito? Target sebelumnya bakal ketimpa lho!')) return;
        
        setShuffling(true);
        setMessage('');
        try {
            await axios.post('/api/admin/manito/shuffle', { event_id: 1 }); // Default event for now
            setMessage('Mantap! Seluruh target Manito sudah berhasil dikocok ulang secara rahasia! 🎉');
            fetchData(); // Refresh data
            
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Gagal mengocok target! Coba lagi komandan.');
        } finally {
            setShuffling(false);
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.instansi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-amber-600">
                <RefreshCcw className="animate-spin mb-4" size={40} />
                <p className="font-bold text-lg">Menyiapkan Ruang Kendali...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldAlert size={150} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <Sparkles className="text-amber-400" /> Ruang Kendali Pusat
                    </h1>
                    <p className="text-gray-300 text-lg">Selamat datang, Komandan! Di sini tempat kamu mengatur seluruh misi rahasia Pelajar Anggrek.</p>
                </div>
            </div>

            {message && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-xl flex items-center gap-3 shadow-md font-bold">
                    <CheckCircle /> {message}
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Pasukan', value: stats?.peserta || 0, icon: <Users size={24}/>, color: 'bg-blue-100 text-blue-600' },
                    { title: 'Absensi Hari Ini', value: stats?.attendance_today || 0, icon: <Activity size={24}/>, color: 'bg-green-100 text-green-600' },
                    { title: 'Evaluasi Terkumpul', value: stats?.evaluations || 0, icon: <CheckCircle size={24}/>, color: 'bg-purple-100 text-purple-600' },
                    { title: 'Pasangan Manito', value: stats?.manito_pairs || 0, icon: <Target size={24}/>, color: 'bg-amber-100 text-amber-600' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-gray-100 hover:border-amber-500 transition-colors">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.title}</h3>
                        <p className="text-4xl font-black text-gray-800 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Action Panel */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                 <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 gap-4">
                     <div>
                         <h2 className="text-2xl font-bold text-gray-800">Daftar Pasukan & Misi Target</h2>
                         <p className="text-gray-500">Pantau siapa yang mengawasi siapa secara diam-diam.</p>
                     </div>
                     <div className="flex flex-col sm:flex-row gap-3">
                         <button
                             onClick={handleShuffle}
                             disabled={shuffling}
                             className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform flex items-center gap-2 whitespace-nowrap"
                         >
                             <RefreshCcw size={20} className={shuffling ? "animate-spin" : ""} />
                             {shuffling ? 'MENGACAK TARGET...' : 'KOCOK TARGET MANITO!'}
                         </button>
                         <button
                             onClick={() => {
                                // Add Auth token for export download
                                const token = localStorage.getItem('token');
                                window.open(`/api/admin/scores/export?bearer=${token}`, '_blank');
                             }}
                             className="bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2 whitespace-nowrap"
                         >
                             <Download size={20} /> UNDUH REKAP NILAI
                         </button>
                     </div>
                 </div>

                 <div className="p-6 bg-gray-50 border-b border-gray-100">
                     <div className="relative max-w-md">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <Search className="text-gray-400" size={20} />
                         </div>
                         <input
                             type="text"
                             placeholder="Cari nama pasukan atau instansi..."
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                         />
                     </div>
                 </div>

                 <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                         <thead>
                             <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                 <th className="p-4 font-bold">Nama Pasukan</th>
                                 <th className="p-4 font-bold">Asal Instansi</th>
                                 <th className="p-4 font-bold">🎯 Target Manito</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                             {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                 <tr key={user.id} className="hover:bg-amber-50/50 transition-colors">
                                     <td className="p-4">
                                         <p className="font-bold text-gray-800">{user.name}</p>
                                     </td>
                                     <td className="p-4 text-gray-600">{user.instansi}</td>
                                     <td className="p-4">
                                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold
                                             ${user.target_name === 'Belum Ada Target' ? 'bg-red-100 text-red-600' : 'bg-gray-800 text-amber-400'}`}>
                                             <Target size={14}/> {user.target_name}
                                         </span>
                                     </td>
                                 </tr>
                             )) : (
                                 <tr>
                                     <td colSpan="3" className="p-8 text-center text-gray-500 italic">
                                         Tidak ada pasukan yang ditemukan.
                                     </td>
                                 </tr>
                             )}
                         </tbody>
                     </table>
                 </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
