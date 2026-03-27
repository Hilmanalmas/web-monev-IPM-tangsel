import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Calendar, Star, CheckCircle2, Award } from 'lucide-react';

const ObserverIbadah = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ total_points: 0, total_days: 0 });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        const res = await axios.get('/api/ibadah');
        setLogs(res.data);
        
        const total = res.data.reduce((acc, log) => acc + (log.bonus_points || 0), 0);
        const uniqueDays = new Set(res.data.map(log => new Date(log.created_at).toLocaleDateString())).size;
        setStats({ total_points: total, total_days: uniqueDays });
    };

    return (
        <div className="p-4 md:p-8 space-y-10 animate-in fade-in slide-in-from-right duration-700">
            <header className="relative py-10 px-8 bg-black rounded-[3rem] overflow-hidden text-white border border-gray-800 shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-5xl font-black tracking-tight mb-2 uppercase">Rekap <span className="text-amber-500">Ibadah</span></h1>
                    <p className="text-gray-400 text-lg">Pantau konsistensi ibadahmu selama misi berlangsung.</p>
                </div>
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-amber-500/20 to-transparent"></div>
                <BarChart3 size={150} className="absolute -right-10 opacity-5 -bottom-10" />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center justify-between group hover:border-amber-500/50 transition-all">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Poin Ibadah</p>
                        <h2 className="text-6xl font-black text-gray-900 group-hover:text-amber-500 transition-colors italic">{stats.total_points}</h2>
                    </div>
                    <Award size={60} className="text-amber-500/20" />
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex items-center justify-between group hover:border-amber-500/50 transition-all">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Konsistensi Hari</p>
                        <h2 className="text-6xl font-black text-gray-900 group-hover:text-amber-500 transition-colors italic">{stats.total_days} <span className="text-xl font-medium not-italic">Hari</span></h2>
                    </div>
                    <Calendar size={60} className="text-amber-500/20" />
                </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-50">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <CheckCircle2 className="text-green-500" /> Riwayat Aktivitas
                </h3>

                <div className="space-y-4">
                    {logs.length === 0 && (
                        <div className="text-center py-20 text-gray-400 italic font-medium">Belum ada laporan ibadah yang tercatat.</div>
                    )}
                    {logs.map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-bold text-amber-500 border border-gray-100 shadow-sm">
                                    {new Date(log.created_at).getDate()}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800">{log.activity_name}</h4>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {new Date(log.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-full border border-amber-200/50 font-black italic">
                                <Star size={16} fill="currentColor" /> +{log.bonus_points}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ObserverIbadah;
