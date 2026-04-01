import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Plus, Trash2, Power, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';

const AdminRtl = () => {
    const [questions, setQuestions] = useState([]);
    const [qForm, setQForm] = useState({ question_text: '' });
    const [rtlActive, setRtlActive] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(true);

    useEffect(() => {
        fetchQuestions();
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        setLoadingStatus(true);
        try {
            const res = await axios.get('/api/admin/rtl/status');
            setRtlActive(res.data.is_active);
        } catch (e) { console.error(e); }
        setLoadingStatus(false);
    };

    const fetchQuestions = async () => {
        const res = await axios.get('/api/admin/rtl/questions');
        setQuestions(res.data);
    };

    const handleQSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/api/admin/rtl/questions', { ...qForm, is_active: true });
        setQForm({ question_text: '' });
        fetchQuestions();
    };

    const deleteQ = async (id) => {
        if (confirm('Yakin?')) {
             await axios.delete(`/api/admin/rtl/questions/${id}`);
             fetchQuestions();
        }
    };

    const toggleRtl = async () => {
        setToggling(true);
        try {
            const res = await axios.post('/api/admin/rtl/toggle', { is_active: !rtlActive });
            setRtlActive(res.data.is_active);
        } catch (e) { 
            alert('Gagal mengubah status RTL');
            console.error(e); 
        }
        setToggling(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">
            <h1 className="text-3xl font-black flex items-center gap-3">
                <Target className="text-pink-500" size={32} /> Rencana Tindak Lanjut (RTL)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* RTL Activation Toggle */}
                <div>
                    <div className={`p-8 rounded-3xl shadow-xl border-2 transition-all duration-500 relative overflow-hidden ${rtlActive ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' : 'bg-gradient-to-br from-gray-50 to-red-50 border-gray-200'}`}>
                        <div className={`absolute top-0 right-0 p-6 opacity-10 ${rtlActive ? 'text-green-500' : 'text-gray-300'}`}>
                            <Power size={120} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div>
                                <h2 className="text-xl font-bold mb-1">Status Penilaian RTL</h2>
                                <p className="text-sm text-gray-500">
                                    {rtlActive 
                                        ? 'Peserta saat ini BISA mengakses dan mengisi laman RTL.' 
                                        : 'Peserta saat ini TIDAK BISA mengakses laman RTL.'}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {rtlActive ? (
                                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
                                        <ShieldCheck size={18} />
                                        <span>AKTIF</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-red-100 text-red-500 px-4 py-2 rounded-full font-bold text-sm">
                                        <ShieldOff size={18} />
                                        <span>NONAKTIF</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={toggleRtl}
                                disabled={toggling || loadingStatus}
                                className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 text-white
                                    ${toggling || loadingStatus ? 'bg-gray-400 cursor-not-allowed' : rtlActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {toggling ? (
                                    <><Loader2 size={22} className="animate-spin" /> Memproses...</>
                                ) : loadingStatus ? (
                                    <><Loader2 size={22} className="animate-spin" /> Memuat...</>
                                ) : rtlActive ? (
                                    <><ShieldOff size={22} /> Nonaktifkan RTL</>
                                ) : (
                                    <><ShieldCheck size={22} /> Aktifkan RTL Sekarang</>
                                )}
                            </button>

                            <p className="text-xs text-gray-400 text-center leading-relaxed">
                                Aktifkan RTL setelah seluruh kegiatan selesai. Peserta akan bisa mengisi form penilaian RTL beserta selfie dokumentasi.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RTL Questions */}
                <div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
                        <h2 className="text-xl font-bold mb-4">Pertanyaan RTL (Indikator)</h2>
                        <form onSubmit={handleQSubmit} className="flex gap-4 border p-2 rounded-xl border-gray-200 focus-within:border-pink-500">
                            <input type="text" placeholder="Ketik Indikator RTL..." required className="flex-1 outline-none px-2"
                                   value={qForm.question_text} onChange={e => setQForm({question_text: e.target.value})} />
                            <button type="submit" className="bg-pink-100 text-pink-700 p-2 rounded-lg hover:bg-pink-200">
                                <Plus size={20}/>
                            </button>
                        </form>
                    </div>
                    <div className="space-y-3">
                        {questions.map(q => (
                            <div key={q.id} className="bg-white p-4 rounded-xl border flex justify-between">
                                <p className="text-sm font-medium">{q.question_text}</p>
                                <button onClick={() => deleteQ(q.id)} className="text-red-500 ml-4"><Trash2 size={18}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminRtl;
