import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminRealtimeMonitor = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const res = await axios.get('/api/admin/surveys/realtime');
            setLogs(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Gagal ambil data monitor", err);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    const getTypeBadge = (type) => {
        const styles = {
            'MANITO': "bg-purple-100 text-purple-700 border-purple-200",
            'GAMES': "bg-emerald-100 text-emerald-700 border-emerald-200",
            'PRAKTEK': "bg-blue-100 text-blue-700 border-blue-200",
            'IBADAH': "bg-amber-100 text-amber-700 border-amber-200",
            'TEST': "bg-rose-100 text-rose-700 border-rose-200"
        };
        return `${styles[type] || "bg-gray-100"} px-2 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider`;
    };

    const formatScore = (score, type) => {
        if (type === 'MANITO') {
            const labels = { 4: "Pro", 3: "Oke", 2: "Guide", 1: "Skip" };
            return labels[score] || score;
        }
        return score;
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mt-10">
            <div className="bg-slate-900 px-8 py-6 flex justify-between items-center">
                <div>
                    <h3 className="font-black text-white text-xl flex items-center gap-3">
                        <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                        </span>
                        LIVE FEED AKTIVITAS
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 font-bold">Memantau semua nilai & aktivitas peserta secara real-time</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-700">AUTO-REFRESH: 5S</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Peserta / Penilai</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas / Item</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Nilai</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading && logs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="font-bold text-slate-400 uppercase tracking-widest animate-pulse">Menghubungkan ke Server...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                                    Belum ada aktivitas terekam.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log, idx) => (
                                <tr key={log.type + log.id + idx} className="hover:bg-slate-50 transition-all duration-300 group">
                                    <td className="px-8 py-5 text-sm font-bold text-slate-400 group-hover:text-slate-600">
                                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={getTypeBadge(log.type)}>{log.type}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-700 text-base">{log.user_name}</span>
                                            {log.target_name && (
                                                <span className="text-[10px] font-bold text-indigo-500 uppercase">Menilai: {log.target_name}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-bold text-slate-500 truncate max-w-[250px]" title={log.description}>
                                            {log.description || '-'}
                                        </p>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`text-xl font-black ${log.score >= 80 || log.score == 4 ? 'text-emerald-500' : 'text-slate-800'}`}>
                                            {formatScore(log.score, log.type)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminRealtimeMonitor;
