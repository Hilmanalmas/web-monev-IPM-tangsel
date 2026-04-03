import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SCALE_LABELS = {
    4: "Pro Banget",
    3: "Oke / Bisa",
    2: "Butuh Guide",
    1: "Skip / Belum Bisa"
};

const AdminRealtimeMonitor = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const res = await axios.get('/admin/surveys/realtime');
            setLogs(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Gagal ambil data monitor", err);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000); // Update tiap 5 detik
        return () => clearInterval(interval);
    }, []);

    const getScoreBadge = (score) => {
        const colors = {
            4: "bg-emerald-100 text-emerald-700 border-emerald-200",
            3: "bg-blue-100 text-blue-700 border-blue-200",
            2: "bg-amber-100 text-amber-700 border-amber-200",
            1: "bg-rose-100 text-rose-700 border-rose-200"
        };
        return `${colors[score] || "bg-gray-100"} px-2 py-1 rounded-full text-xs font-bold border`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                        Live Monitoring Manito
                    </h3>
                    <p className="text-xs text-slate-500">Menampilkan 50 penilaian terbaru secara real-time</p>
                </div>
                <button 
                    onClick={fetchLogs}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Refresh Manual"
                >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Waktu</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Assessor (Penilai)</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Target (Dinilai)</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Item Penilaian</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Nilai</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        Memuat data monitor...
                                    </div>
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                    Belum ada penilaian yang masuk hari ini.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">{log.assessor_name}</td>
                                    <td className="px-6 py-4 font-medium text-indigo-600">{log.target_name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-[200px]" title={log.question_text}>
                                        {log.question_text}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={getScoreBadge(log.answer)}>
                                            {log.answer}: {SCALE_LABELS[log.answer]}
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
