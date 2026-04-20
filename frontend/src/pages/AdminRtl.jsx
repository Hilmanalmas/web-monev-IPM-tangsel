import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Plus, Trash2, Calendar, ClipboardCheck } from 'lucide-react';

const AdminRtl = () => {
    const [questions, setQuestions] = useState([]);
    const [qForm, setQForm] = useState({ question_text: '' });
    
    const [slots, setSlots] = useState([]);
    const [sForm, setSForm] = useState({ name: '', start_time: '', end_time: '', slot_date: '' });

    useEffect(() => {
        fetchQuestions();
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await axios.get('/api/admin/rtl/slots');
            setSlots(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchQuestions = async () => {
        try {
            const res = await axios.get('/api/admin/rtl/questions');
            setQuestions(res.data);
        } catch (e) { console.error(e); }
    };

    const handleQSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/rtl/questions', { ...qForm, is_active: true });
            setQForm({ question_text: '' });
            fetchQuestions();
        } catch (error) {
            alert(error.response?.data?.message || "Gagal menyimpan pertanyaan RTL.");
        }
    };

    const deleteQ = async (id) => {
        if (confirm('Yakin hapus pertanyaan RTL ini?')) {
            try {
                await axios.delete(`/api/admin/rtl/questions/${id}`);
                fetchQuestions();
            } catch (error) {
                alert("Gagal menghapus pertanyaan RTL.");
            }
        }
    };

    const handleSlotSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/rtl/slots', sForm);
            setSForm({ ...sForm, name: '' });
            fetchSlots();
            alert("Jadwal RTL berhasil disimpan! Peserta bisa mengaksesnya pada waktu yang ditentukan.");
        } catch (err) {
            alert("Gagal menyimpan jadwal RTL.");
        }
    };

    const deleteSlot = async (id) => {
        if (confirm('Yakin ingin menghapus slot RTL ini?')) {
            try {
                await axios.delete(`/api/admin/rtl/slots/${id}`);
                fetchSlots();
            } catch (err) {
                alert("Gagal menghapus slot RTL.");
            }
        }
    };

    const groupedSlots = Array.isArray(slots) ? slots.reduce((acc, slot) => {
        const dateKey = slot.slot_date || 'Tanpa Tanggal';
        acc[dateKey] = acc[dateKey] || [];
        acc[dateKey].push(slot);
        return acc;
    }, {}) : {};

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">
            <h1 className="text-3xl font-black flex items-center gap-3">
                <Target className="text-pink-500" size={32} /> Rencana Tindak Lanjut (RTL)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SLOTS RTL */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-pink-50">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Plus className="text-pink-500" /> Tambah Jadwal RTL Baru
                        </h2>
                        <form onSubmit={handleSlotSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Nama Jadwal RTL</label>
                                <input type="text" placeholder="RTL Hari 1 / RTL Pagi..." required className="w-full p-3 border rounded-xl"
                                       value={sForm.name} onChange={e => setSForm({...sForm, name: e.target.value})} />
                            </div>
                            <div className="md:col-span-2 flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Tanggal Pelaksanaan RTL</label>
                                    <input type="date" required className="w-full p-3 border rounded-xl"
                                           value={sForm.slot_date} onChange={e => setSForm({...sForm, slot_date: e.target.value})} />
                                </div>
                                <div className="flex-1 pt-6">
                                    <button type="submit" className="w-full bg-pink-600 text-white p-3 rounded-xl font-black hover:bg-pink-700 active:scale-95 transition-all">
                                        SIMPAN JADWAL
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Jam Buka Pengerjaan</label>
                                <input type="time" required className="w-full p-3 border rounded-xl"
                                       value={sForm.start_time} onChange={e => setSForm({...sForm, start_time: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Batas Tutup Jam Pengerjaan</label>
                                <input type="time" required className="w-full p-3 border rounded-xl"
                                       value={sForm.end_time} onChange={e => setSForm({...sForm, end_time: e.target.value})} />
                            </div>
                        </form>
                    </div>

                    <div className="space-y-6">
                        {Object.keys(groupedSlots).sort().map(dateKey => (
                            <div key={dateKey} className="space-y-3">
                                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 px-2">
                                    <Calendar size={20} className="text-pink-500" /> JADWAL {dateKey}
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {groupedSlots[dateKey].map(s => (
                                        <div key={s.id} className="bg-white p-5 rounded-2xl shadow-sm border hover:border-pink-200 transition-colors flex justify-between items-center group">
                                            <div>
                                                <h3 className="font-bold text-gray-800">{s.name}</h3>
                                                <p className="text-sm text-gray-500 font-mono">{s.start_time?.substring(0,5)} - {s.end_time?.substring(0,5)}</p>
                                            </div>
                                            <button onClick={() => deleteSlot(s.id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all">
                                                <Trash2 size={20}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RTL Questions */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-purple-50">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <ClipboardCheck className="text-purple-500" /> 
                            Indikator / Pertanyaan Template
                        </h2>
                        <form onSubmit={handleQSubmit} className="flex gap-4 border p-2 rounded-xl border-gray-200 focus-within:border-purple-500">
                            <input type="text" placeholder="Ketik Indikator / Panduan RTL..." required className="flex-1 outline-none px-2"
                                   value={qForm.question_text} onChange={e => setQForm({question_text: e.target.value})} />
                            <button type="submit" className="bg-purple-100 text-purple-700 p-2 rounded-lg hover:bg-purple-200">
                                <Plus size={20}/>
                            </button>
                        </form>
                    </div>
                    
                    <div className="space-y-3">
                        {questions.map((q, i) => (
                            <div key={q.id} className="bg-white p-5 rounded-2xl border flex items-start justify-between shadow-sm">
                                <div className="flex gap-3">
                                    <span className="font-bold text-purple-400 mt-1">{i + 1}.</span>
                                    <p className="text-sm font-medium leading-relaxed pt-1 text-gray-700">{q.question_text}</p>
                                </div>
                                <button onClick={() => deleteQ(q.id)} className="text-gray-300 hover:text-red-500 ml-4 p-2 rounded-lg"><Trash2 size={18}/></button>
                            </div>
                        ))}
                        {questions.length === 0 && (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 font-bold">Belum ada templat indikator RTL yang diatur.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRtl;
