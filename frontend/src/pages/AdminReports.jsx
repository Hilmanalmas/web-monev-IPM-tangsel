import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, BookOpen, Target, Activity, Star, Camera, 
    ChevronRight, ChevronDown, Download, Search, RefreshCcw,
    Award, BarChart3, ClipboardList, Zap
} from 'lucide-react';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedUser, setExpandedUser] = useState(null);
    const [overrideModal, setOverrideModal] = useState(null);
    const [overrideForm, setOverrideForm] = useState({
        manito_afektif: '', absensi: '', manito_psiko: '', games: '', praktek: '', kognitif: '', ibadah: ''
    });
    const [overrideStatus, setOverrideStatus] = useState('idle');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/reports/full');
            setReports(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setReports([]);
            console.error("Gagal ambil laporan detail", err);
        } finally {
            setLoading(false);
        }
    };

    const openOverrideModal = (report) => {
        setOverrideModal(report);
        setOverrideForm({
            manito_afektif: report.summary.manito_afektif,
            absensi: report.summary.absensi,
            manito_psiko: report.summary.manito_psiko,
            games: report.summary.games,
            praktek: report.summary.praktek,
            kognitif: report.summary.kognitif,
            ibadah: report.summary.ibadah
        });
    };

    const handleOverrideSubmit = async () => {
        setOverrideStatus('saving');
        try {
            await axios.post('/api/admin/reports/override', {
                user_id: overrideModal.user.id,
                ...overrideForm
            });
            setOverrideStatus('success');
            setTimeout(() => {
                setOverrideModal(null);
                fetchData();
            }, 1000);
        } catch (e) {
            alert("Gagal menyimpan rekap manual");
            setOverrideStatus('idle');
        }
    };

    const computeLiveFinal = () => {
        const afektifFinal = (parseFloat(overrideForm.manito_afektif||0) * 0.5) + (parseFloat(overrideForm.absensi||0) * 0.5);
        const psikoFinal = (parseFloat(overrideForm.manito_psiko||0) * 0.4) + (parseFloat(overrideForm.games||0) * 0.3) + (parseFloat(overrideForm.praktek||0) * 0.3);
        const final = (afektifFinal * 0.35) + (psikoFinal * 0.35) + (parseFloat(overrideForm.kognitif||0) * 0.20) + (parseFloat(overrideForm.ibadah||0) * 0.10);
        return {
            afektif: afektifFinal.toFixed(2),
            psiko: psikoFinal.toFixed(2),
            final: final.toFixed(2)
        };
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredReports = reports.filter(r => 
        r.user.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.user.instansi || '').toLowerCase().includes(search.toLowerCase())
    );

    const StatCard = ({ label, value, icon, color }) => (
        <div className={`p-4 rounded-2xl border bg-white flex items-center gap-4 shadow-sm`}>
            <div className={`p-3 rounded-xl bg-${color}-50 text-${catColorMap[color] || color}-600`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-xl font-black text-gray-800">{value}</p>
            </div>
        </div>
    );

    const catColorMap = {
        'indigo': 'indigo',
        'emerald': 'emerald',
        'rose': 'rose',
        'amber': 'amber',
        'blue': 'blue'
    };

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <RefreshCcw className="animate-spin mx-auto text-indigo-600" size={48} />
            <p className="font-black text-gray-400 uppercase tracking-widest animate-pulse">Menyusun Raport Seluruh Pasukan...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <Award size={200} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-black mb-3 flex items-center justify-center md:justify-start gap-4 uppercase tracking-tighter">
                            <Zap className="text-amber-400 fill-amber-400" /> Pusat Raport Pasukan
                        </h1>
                        <p className="text-slate-400 font-medium text-lg">Transparansi nilai total & detail setiap misi rahasia.</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={fetchData}
                            className="bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl transition-all border border-slate-700 group"
                        >
                            <RefreshCcw size={20} className="group-active:rotate-180 transition-transform" />
                        </button>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text" 
                                placeholder="Cari Nama Pasukan..." 
                                className="bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-6">
                {filteredReports.map((report) => (
                    <div 
                        key={report.user.id} 
                        className={`bg-white rounded-[32px] overflow-hidden border-2 transition-all duration-300 shadow-xl
                            ${expandedUser === report.user.id ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                        {/* Summary Header */}
                        <div 
                            className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer select-none"
                            onClick={() => setExpandedUser(expandedUser === report.user.id ? null : report.user.id)}
                        >
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner transition-colors
                                    ${expandedUser === report.user.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <User size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{report.user.name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg uppercase tracking-widest">{report.user.instansi || 'UMUM'}</span>
                                        <span className="text-[10px] font-mono text-slate-400">{report.user.nip || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 w-full md:w-auto">
                                <div className="text-center bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/50">
                                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">Afektif</p>
                                    <p className="font-black text-indigo-600">{report.summary.afektif}</p>
                                </div>
                                <div className="text-center bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50">
                                    <p className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Psiko</p>
                                    <p className="font-black text-emerald-600">{report.summary.psiko}</p>
                                </div>
                                <div className="text-center bg-rose-50/50 p-2 rounded-xl border border-rose-100/50">
                                    <p className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">Kognitif</p>
                                    <p className="font-black text-rose-600">{report.summary.kognitif}</p>
                                </div>
                                <div className="text-center bg-amber-50/50 p-2 rounded-xl border border-amber-100/50">
                                    <p className="text-[8px] font-black text-amber-400 uppercase tracking-tighter">Ibadah</p>
                                    <p className="font-black text-amber-600">{report.summary.ibadah}</p>
                                </div>
                                <div className="text-center bg-slate-900 p-2 rounded-xl col-span-2 lg:col-span-1 shadow-lg shadow-slate-200">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Final</p>
                                    <p className="font-black text-white">{report.summary.final}</p>
                                </div>
                            </div>

                            <div className={`p-2 rounded-full transition-all ${expandedUser === report.user.id ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'bg-slate-50 text-slate-300'}`}>
                                <ChevronDown size={24} />
                            </div>
                        </div>

                        {/* Detailed Content */}
                        {expandedUser === report.user.id && (report.details ? (
                            <div className="bg-slate-50/50 border-t border-slate-100 p-8 space-y-10 animate-in slide-in-from-top-4 duration-500">
                                
                                <div className="flex justify-end">
                                    <button onClick={(e) => { e.stopPropagation(); openOverrideModal(report); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all">
                                        <ClipboardList size={18} /> EDIT REKAP MANUAL
                                    </button>
                                </div>

                                {/* Section Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    
                                    {/* EXAMS */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest pl-2">
                                            <BookOpen size={16} className="text-rose-500" /> Test Kognitif
                                        </h4>
                                        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                                            {report.details.exams.length > 0 ? (
                                                <table className="w-full text-xs">
                                                    <thead className="bg-slate-50/80 border-b">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left font-black uppercase text-slate-400">Judul Test</th>
                                                            <th className="px-6 py-3 text-right font-black uppercase text-slate-400">Skor</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {report.details.exams.map((ex, i) => (
                                                            <tr key={i} className="hover:bg-slate-50/50">
                                                                <td className="px-6 py-3 font-bold text-slate-700 lowercase first-letter:uppercase">{ex.title}</td>
                                                                <td className="px-6 py-3 text-right">
                                                                    <span className="font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">{ex.score}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className="p-8 text-center text-slate-300 italic font-bold">Belum ada test yang selesai.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* MANITO ANSWERS (SAMPLES) */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest pl-2">
                                            <Target size={16} className="text-purple-500" /> Rekam Jejak Manito
                                        </h4>
                                        <div className="space-y-2">
                                            {report.details.surveys.length > 0 ? (
                                                report.details.surveys.slice(0, 5).map((sv, i) => (
                                                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="overflow-hidden">
                                                            <p className="text-[10px] font-black text-purple-400 uppercase mb-1">{sv.period}</p>
                                                            <p className="text-[11px] font-bold text-slate-600 truncate lowercase first-letter:uppercase">{sv.question_text}</p>
                                                        </div>
                                                        <div className="shrink-0 flex items-center gap-2">
                                                             <span className="text-[10px] text-slate-300 font-bold uppercase">{sv.category}</span>
                                                             <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-black border border-purple-100 shadow-inner">{sv.answer}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="p-8 text-center text-slate-300 bg-white border rounded-3xl italic font-bold">Tidak ada jejak survey.</p>
                                            )}
                                            {report.details.surveys.length > 5 && (
                                                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest pt-2">+ {report.details.surveys.length - 5} RESPON LAINNYA DI DATABASE</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* GAMES & PRACTICE */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest pl-2">
                                            <Activity size={16} className="text-emerald-500" /> Games & Praktek Lapangan
                                        </h4>
                                        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                                            <table className="w-full text-xs">
                                                <thead className="bg-slate-50/80 border-b">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left font-black uppercase text-slate-400">Sesi</th>
                                                        <th className="px-6 py-3 text-left font-black uppercase text-slate-400">Tipe</th>
                                                        <th className="px-6 py-3 text-right font-black uppercase text-slate-400">Skor</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {report.details.games.map((g, i) => (
                                                        <tr key={`g-${i}`} className="hover:bg-slate-50/50">
                                                            <td className="px-6 py-3 font-bold text-slate-700">{g.name}</td>
                                                            <td className="px-6 py-3 text-[10px] uppercase font-black text-blue-400">GAMES</td>
                                                            <td className="px-6 py-3 text-right"><span className="font-black text-slate-800">{g.score}</span></td>
                                                        </tr>
                                                    ))}
                                                    {report.details.practice.map((p, i) => (
                                                        <tr key={`p-${i}`} className="hover:bg-slate-50/50">
                                                            <td className="px-6 py-3 font-bold text-slate-700">{p.name}</td>
                                                            <td className="px-6 py-3 text-[10px] uppercase font-black text-emerald-400">PRAKTEK</td>
                                                            <td className="px-6 py-3 text-right"><span className="font-black text-slate-800">{p.score}</span></td>
                                                        </tr>
                                                    ))}
                                                    {report.details.games.length === 0 && report.details.practice.length === 0 && (
                                                        <tr>
                                                            <td colSpan="3" className="p-8 text-center text-slate-300 italic font-bold">Belum ada penilaian lapangan.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* WORSHIP & ATTENDANCE */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest pl-2">
                                             <Star size={16} className="text-amber-500" /> Ibadah & Absensi
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Aktivitas Ibadah</p>
                                                <div className="space-y-2">
                                                    {report.details.worship.slice(0, 4).map((w, i) => (
                                                        <div key={i} className="flex justify-between items-center text-[11px]">
                                                            <span className="font-bold text-slate-600 truncate w-32 lowercase first-letter:uppercase">{w.name}</span>
                                                            <span className="font-black text-amber-600">+{w.score}</span>
                                                        </div>
                                                    ))}
                                                    {report.details.worship.length === 0 && <p className="text-[10px] text-slate-300 italic">Kosong.</p>}
                                                </div>
                                            </div>
                                            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Total Kehadiran</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                                                        <Camera size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-black text-slate-800">{report.details.attendance.length}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sesi Divalidasi</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ) : (
                             <div className="p-20 text-center text-slate-300 font-bold italic">Terjadi kesalahan saat memproses detail...</div>
                        ))}
                    </div>
                ))}

                {filteredReports.length === 0 && (
                    <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-slate-100 animate-in zoom-in-95">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                            <Search size={48} />
                        </div>
                        <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Hasil Tidak Ditemukan</h3>
                        <p className="text-slate-300 mt-2">Coba gunakan kata kunci pencarian yang berbeda.</p>
                    </div>
                )}
            </div>

            {/* Override Modal */}
            {overrideModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                        <div className="bg-slate-900 p-8 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                    <ClipboardList className="text-amber-400" />
                                    REKAP MANUAL: {overrideModal.user.name}
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">Kosongkan kolom jika ingin sistem menghitung otomatis dari riwayat.</p>
                            </div>
                            <button onClick={() => setOverrideModal(null)} className="bg-slate-800 p-3 rounded-2xl text-slate-400 hover:text-white transition-colors font-black">X</button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
                            {/* Live Calculator View */}
                            <div className="bg-indigo-600 rounded-3xl p-6 mb-8 text-white flex justify-around shadow-xl shadow-indigo-200 items-center">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Live Afektif</p>
                                    <p className="text-3xl font-black">{computeLiveFinal().afektif}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Live Psiko</p>
                                    <p className="text-3xl font-black">{computeLiveFinal().psiko}</p>
                                </div>
                                <div className="text-center bg-white text-indigo-900 px-8 py-4 rounded-2xl shadow-inner border-4 border-indigo-500">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Final Score</p>
                                    <p className="text-5xl font-black">{computeLiveFinal().final}</p>
                                </div>
                            </div>
                            
                            {/* Inputs Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['manito_afektif', 'absensi', 'manito_psiko', 'games', 'praktek', 'kognitif', 'ibadah'].map(key => (
                                    <div key={key} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{key.replace('_', ' ')} (Raw)</label>
                                        <input 
                                            type="number" 
                                            min="0" max="100" 
                                            value={overrideForm[key] || ''}
                                            onChange={e => setOverrideForm({...overrideForm, [key]: e.target.value})}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 font-black text-slate-700 text-xl outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="Otomatis dari Riwayat"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 bg-white border-t border-slate-100 flex justify-end shrink-0">
                            <button 
                                onClick={handleOverrideSubmit}
                                disabled={overrideStatus === 'saving'}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-amber-200 transition-all flex items-center gap-2"
                            >
                                {overrideStatus === 'saving' ? <RefreshCcw className="animate-spin" /> : 'SIMPAN REKAP MANUAL'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReports;
