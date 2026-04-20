import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Plus, Trash2, Power, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';

const AdminRtl = () => {
    const [questions, setQuestions] = useState([]);
    const [qForm, setQForm] = useState({ question_text: '' });
    
    const [rtlActive, setRtlActive] = useState(false);
    const [startDatetime, setStartDatetime] = useState('');
    const [endDatetime, setEndDatetime] = useState('');

    const [saving, setSaving] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(true);

    useEffect(() => {
        fetchQuestions();
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        setLoadingStatus(true);
        try {
            const res = await axios.get('/api/admin/rtl/schedule');
            setRtlActive(res.data.is_active);
            setStartDatetime(res.data.start_datetime || '');
            setEndDatetime(res.data.end_datetime || '');
        } catch (e) { console.error(e); }
        setLoadingStatus(false);
    };

    const fetchQuestions = async () => {
        const res = await axios.get('/api/admin/rtl/questions');
        setQuestions(res.data);
    };

    const handleQSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/rtl/questions', { ...qForm, is_active: true });
            setQForm({ question_text: '' });
            fetchQuestions();
            alert("Pertanyaan RTL berhasil disimpan!");
        } catch (error) {
            alert(error.response?.data?.message || "Gagal menyimpan pertanyaan RTL.");
        }
    };

    const deleteQ = async (id) => {
        if (confirm('Yakin?')) {
            try {
                await axios.delete(`/api/admin/rtl/questions/${id}`);
                fetchQuestions();
            } catch (error) {
                alert("Gagal menghapus pertanyaan RTL.");
            }
        }
    };

    const handleSaveSchedule = async () => {
        setSaving(true);
        try {
            const res = await axios.post('/api/admin/rtl/schedule', { 
                is_active: rtlActive,
                start_datetime: startDatetime,
                end_datetime: endDatetime
            });
            setRtlActive(res.data.schedule.is_active);
            setStartDatetime(res.data.schedule.start_datetime || '');
            setEndDatetime(res.data.schedule.end_datetime || '');
            alert(res.data.message);
        } catch (e) { 
            alert('Gagal menyimpan jadwal/status RTL.');
            console.error(e); 
        }
        setSaving(false);
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
                                <h2 className="text-xl font-bold mb-1">Pengaturan Waktu RTL</h2>
                                <p className="text-sm text-gray-500">
                                    Atur rentang waktu RTL atau aktifkan secara manual. (Pengaturan waktu akan menimpa status manual jika diisi).
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Mulai Tanggal & Jam</label>
                                    <input 
                                        type="datetime-local" 
                                        value={startDatetime} 
                                        onChange={e => setStartDatetime(e.target.value)}
                                        className="w-full p-3 border rounded-xl focus:ring focus:ring-pink-200 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Batas Akhir Tanggal & Jam</label>
                                    <input 
                                        type="datetime-local" 
                                        value={endDatetime} 
                                        onChange={e => setEndDatetime(e.target.value)}
                                        className="w-full p-3 border rounded-xl focus:ring focus:ring-pink-200 outline-none"
                                    />
                                </div>
                            </div>
                            
                            <hr className="border-gray-200 border-dashed" />

                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-700 block">Status Manual (Fallback)</span>
                                <button
                                    onClick={() => setRtlActive(!rtlActive)}
                                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all shadow active:scale-95 flex items-center gap-2 text-white
                                        ${rtlActive ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'}`}
                                >
                                    {rtlActive ? <><ShieldCheck size={16} /> AKTIF</> : <><ShieldOff size={16} /> NONAKTIF</>}
                                </button>
                            </div>

                            <button
                                onClick={handleSaveSchedule}
                                disabled={saving || loadingStatus}
                                className={`w-full mt-4 py-4 rounded-2xl font-black text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 text-white
                                    ${saving || loadingStatus ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700'}`}
                            >
                                {saving ? (
                                    <><Loader2 size={22} className="animate-spin" /> Menyimpan...</>
                                ) : loadingStatus ? (
                                    <><Loader2 size={22} className="animate-spin" /> Memuat...</>
                                ) : (
                                    <><Power size={22} /> Simpan Pengaturan RTL</>
                                )}
                            </button>
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
