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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-amber-600"><Activity size={120} /></div>
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-gray-800">
                        <Activity className="text-amber-500" /> Kontrol Hari Operasional
                    </h2>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="text-center md:text-left bg-amber-50 p-6 rounded-2xl border border-amber-100 flex-1 w-full">
                            <p className="text-amber-800 font-bold uppercase tracking-widest text-xs mb-1">Hari Saat Ini</p>
                            <div className="text-7xl font-black text-amber-600 leading-none">H-{stats?.current_day || 1}</div>
                            <p className="text-amber-700/60 text-sm mt-3 italic">Seluruh absensi & manito mengikuti hari ini.</p>
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                            <label className="block text-sm font-bold text-gray-500 uppercase">Ganti Hari Operasional</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(d => (
                                    <button
                                        key={d}
                                        onClick={async () => {
                                            if (!window.confirm(`Pindah ke HARI ${d}? Data absensi & manito akan difilter untuk hari ini.`)) return;
                                            try {
                                                await axios.post('/api/admin/settings', { current_day: d });
                                                window.location.reload();
                                            } catch (e) {
                                                alert("Gagal update hari");
                                            }
                                        }}
                                        className={`flex-1 py-4 font-black rounded-xl border-2 transition-all ${stats?.current_day === d ? 'bg-amber-500 border-amber-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500'}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400">Pilih angka di atas untuk berpindah sesi hari. Sistem akan otomatis menyesuaikan filter dashboard.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-600 group-hover:scale-110 transition-transform"><Target size={120} /></div>
                    <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3 uppercase tracking-tight">
                        <Sparkles className="text-amber-500" /> Strategi Pembobotan Nilai
                    </h3>
                    
                    <div className="space-y-5">
                        {[
                            { label: 'Afektif', weight: 35, color: 'indigo', items: ['Manito (50%)', 'Absensi (50%)'] },
                            { label: 'Psikomotorik', weight: 35, color: 'emerald', items: ['Manito (40%)', 'Games (30%)', 'Praktek (30%)'] },
                            { label: 'Kognitif', weight: 20, color: 'rose', items: ['Post-test', 'Ujian Harian'] },
                            { label: 'Ibadah', weight: 10, color: 'amber', items: ['Worship Logs', 'Kultum'] },
                        ].map((cat, i) => (
                            <div key={i} className="relative">
                                <div className="flex justify-between items-end mb-1.5 px-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{cat.label}</span>
                                    <span className={`text-xs font-black text-${cat.color}-600`}>{cat.weight}%</span>
                                </div>
                                <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                                    <div 
                                        className={`h-full bg-gradient-to-r from-${cat.color}-500 to-${cat.color}-400 rounded-full shadow-lg`}
                                        style={{ width: `${cat.weight}%` }}
                                    ></div>
                                </div>
                                <p className="text-[9px] text-gray-400 mt-1.5 px-1 font-bold italic opacity-60">
                                    Komponen: {cat.items.join(' • ')}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-50">
                        <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                            <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                                <strong>PENTING:</strong> Pastikan Hari Operasional (H-X) sudah sesuai sebelum mengunduh rekap. Bobot ini telah disesuaikan dengan kurikulum Pelajar Anggrek V2.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;
