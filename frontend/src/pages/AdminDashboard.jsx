import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Activity, Target, ShieldAlert, Sparkles, CheckCircle, Download, RefreshCcw } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/admin/stats');
                setStats(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-20 text-center font-bold text-amber-500"><RefreshCcw className="animate-spin mx-auto mb-4" size={40}/> Memuat Statistik...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert size={150} /></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <Sparkles className="text-amber-400" /> Ruang Kendali Pusat
                        </h1>
                        <p className="text-gray-300 text-lg">Pantau seluruh statistik misi rahasia Pelajar Anggrek di sini.</p>
                    </div>
                    <button
                        onClick={() => {
                            const token = localStorage.getItem('token');
                            window.open(`/api/admin/reports/export?bearer=${token}`, '_blank');
                        }}
                        className="bg-green-600 hover:bg-green-700 active:scale-95 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 border-b-4 border-green-800"
                    >
                        <Download size={24} /> UNDUH REKAP NILAI (CSV)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Pasukan', value: stats?.peserta || 0, icon: <Users size={28}/>, color: 'bg-blue-100 text-blue-600' },
                    { title: 'Absensi Hari Ini', value: stats?.attendance_today || 0, icon: <Activity size={28}/>, color: 'bg-green-100 text-green-600' },
                    { title: 'Evaluasi Terkumpul', value: stats?.evaluations || 0, icon: <CheckCircle size={28}/>, color: 'bg-purple-100 text-purple-600' },
                    { title: 'Pasangan Manito', value: stats?.manito_pairs || 0, icon: <Target size={28}/>, color: 'bg-amber-100 text-amber-600' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center gap-5 hover:scale-105 transition-transform cursor-default">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.title}</h3>
                            <p className="text-4xl font-black text-gray-800 mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-amber-50 rounded-3xl p-8 border border-amber-200 mt-8">
                <h3 className="text-xl font-bold text-amber-800 mb-2">Petunjuk Admin</h3>
                <ul className="list-disc ml-5 text-amber-700 space-y-2">
                    <li>Gunakan tombol <strong>"Unduh Rekap Nilai"</strong> untuk mengkalkulasi skor akhir secara otomatis.</li>
                    <li>Sistem MONEV V2 menghitung Bobot: Afektif (35%), Psikomotorik (35%), Kognitif (20%) dan Ibadah (10%).</li>
                    <li>Silakan navigasi menu sisi kiri untuk mengatur slot Absensi, Ibadah, Test, maupun Manito.</li>
                </ul>
            </div>
        </div>
    );
};
export default AdminDashboard;
