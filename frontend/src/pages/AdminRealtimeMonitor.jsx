import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, User, Activity, Search, ClipboardList, PenTool, LayoutGrid } from 'lucide-react';

const AdminRealtimeMonitor = () => {
    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState([]);
    const [exams, setExams] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        try {
            const [logsRes, progressRes] = await Promise.all([
                axios.get('/api/admin/surveys/realtime'),
                axios.get('/api/admin/reports/progress')
            ]);
            setLogs(logsRes.data);
            setProgress(progressRes.data.progress || []);
            setExams(progressRes.data.exams || []);
            setSurveys(progressRes.data.surveys || []);
            setLoading(false);
        } catch (err) {
            console.error("Gagal ambil data monitor", err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 8000);
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

    const StatusBox = ({ active, label, colorClass = "emerald" }) => (
        <div className={`p-1.5 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-500 border
            ${active 
                ? `bg-${colorClass}-50 border-${colorClass}-200 text-${colorClass}-600` 
                : 'bg-slate-50 border-slate-100 text-slate-200 opacity-50'}`}>
            {active ? <CheckCircle size={10} strokeWidth={3} /> : <XCircle size={10} />}
            <span className="text-[7px] font-black uppercase tracking-tighter truncate w-12 text-center" title={label}>{label}</span>
        </div>
    );

    const filteredProgress = progress.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* TASK PROGRESS MATRIX */}
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-8 py-5 flex justify-between items-center border-b border-slate-800">
                    <div>
                        <h3 className="font-black text-rose-500 text-lg flex items-center gap-3">
                            <LayoutGrid size={22} />
                             RADAR PENGERJAAN TUGAS
                        </h3>
                        <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Memantau status per sesi individu</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <input 
                                type="text" 
                                placeholder="Cari Nama..." 
                                className="bg-slate-800 border-none rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-rose-500/50 outline-none w-48 transition-all"
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10 border-r">Nama Peserta</th>
                                <th className="px-4 py-8 text-center bg-rose-50/30">
                                    <div className="flex flex-col items-center gap-1">
                                        <ClipboardList size={14} className="text-rose-500" />
                                        <span className="text-[10px] font-black text-rose-600 uppercase italic">Ujian / Test</span>
                                    </div>
                                </th>
                                <th className="px-4 py-8 text-center bg-purple-50/30">
                                    <div className="flex flex-col items-center gap-1">
                                        <PenTool size={14} className="text-purple-500" />
                                        <span className="text-[10px] font-black text-purple-600 uppercase italic">Manito / Survey</span>
                                    </div>
                                </th>
                                <th className="px-4 py-8 text-center bg-emerald-50/30">
                                    <div className="flex flex-col items-center gap-1">
                                        <CheckCircle size={14} className="text-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase italic">RTL</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProgress.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-all group">
                                    <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-inner">
                                                <User size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-700 text-sm whitespace-nowrap">{p.name}</span>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{p.instansi}</span>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* EXAMS INDICATORS */}
                                    <td className="px-4 py-4 bg-rose-50/10">
                                        <div className="flex flex-wrap gap-2 justify-center min-w-[150px]">
                                            {exams.map(ex => (
                                                <StatusBox key={ex.id} active={p.exams[ex.id]} label={ex.title} colorClass="rose" />
                                            ))}
                                        </div>
                                    </td>

                                    {/* MANITO INDICATORS */}
                                    <td className="px-4 py-4 bg-purple-50/10">
                                        <div className="flex flex-wrap gap-2 justify-center min-w-[150px]">
                                            {surveys.map(sv => (
                                                <StatusBox key={sv.id} active={p.surveys[sv.id]} label={sv.session_name} colorClass="purple" />
                                            ))}
                                        </div>
                                    </td>

                                    {/* RTL INDICATOR */}
                                    <td className="px-4 py-4 bg-emerald-50/10 text-center">
                                        <div className="flex justify-center">
                                            <StatusBox active={p.has_rtl} label="Submission RTL" colorClass="emerald" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* LIVE FEED ACTIVITIES - COMPACT */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden border-t-4 border-t-slate-900">
                <div className="bg-white px-8 py-4 flex justify-between items-center border-b border-slate-100">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 uppercase tracking-widest italic">
                        <Activity size={16} className="text-rose-500" />
                        Aktivitas Masuk Baru
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-slate-50">
                            {logs.slice(0, 8).map((log, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-8 py-3 text-[10px] font-bold text-slate-400">
                                        {new Date(log.created_at).toLocaleTimeString('id-ID')}
                                    </td>
                                    <td className="px-8 py-3">
                                        <span className={getTypeBadge(log.type)}>{log.type}</span>
                                    </td>
                                    <td className="px-8 py-3">
                                        <span className="font-black text-slate-700 text-xs">{log.user_name}</span>
                                    </td>
                                    <td className="px-8 py-3">
                                        <span className="text-[10px] text-slate-500 font-bold">{log.description}</span>
                                    </td>
                                    <td className="px-8 py-3 text-right">
                                        <span className="text-sm font-black text-rose-500">{log.score}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRealtimeMonitor;
