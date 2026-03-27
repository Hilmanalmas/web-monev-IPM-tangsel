import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, ClipboardCheck, Star, Clock, Calendar, Save } from 'lucide-react';

const AdminSurveys = () => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [slots, setSlots] = useState([]);
    const [newSlot, setNewSlot] = useState({ name: '', start: '', end: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [qRes, sRes] = await Promise.all([
            axios.get('/api/admin/surveys/questions'),
            axios.get('/api/admin/surveys/slots')
        ]);
        setQuestions(qRes.data);
        setSlots(sRes.data);
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;
        setLoading(true);
        try {
            await axios.post('/api/admin/surveys/questions', { question_text: newQuestion });
            setNewQuestion('');
            fetchData();
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!confirm('Hapus pertanyaan ini?')) return;
        await axios.delete(`/api/admin/surveys/questions/${id}`);
        fetchData();
    };

    const handleAddSlot = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/admin/surveys/slots', {
                name: newSlot.name,
                start_time: newSlot.start,
                end_time: newSlot.end
            });
            setNewSlot({ name: '', start: '', end: '' });
            fetchData();
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!confirm('Hapus waktu evaluasi ini?')) return;
        await axios.delete(`/api/admin/surveys/slots/${id}`);
        fetchData();
    };

    return (
        <div className="p-4 md:p-8 space-y-12 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-10 border-gray-100">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 leading-tight tracking-tight uppercase italic">Pengaturan <br/><span className="text-amber-500">Angket & Waktu</span></h1>
                    <p className="text-gray-500 text-lg mt-2 font-medium">Kelola pertanyaan evaluasi dan jendela waktu pengisian Manito.</p>
                </div>
                <div className="bg-amber-500 text-white p-6 rounded-[2.5rem] shadow-2xl shadow-amber-500/20">
                    <ClipboardCheck size={40} />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Section Pertanyaan */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 uppercase italic">Item Pertanyaan</h2>
                        <form onSubmit={handleAddQuestion} className="space-y-4">
                            <textarea
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-5 text-gray-700 focus:bg-white focus:border-amber-500 outline-none transition-all resize-none"
                                placeholder="Contoh: Bagaimana inisiatifnya hari ini?"
                                rows={3}
                                required
                            />
                            <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all">
                                <Plus size={20} /> Tambah Pertanyaan
                            </button>
                        </form>

                        <div className="space-y-3">
                            {questions.map((q, idx) => (
                                <div key={q.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group">
                                    <span className="font-bold text-gray-800">{idx+1}. {q.question_text}</span>
                                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section Waktu/Slots */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 uppercase italic">Jadwal Evaluasi</h2>
                        <form onSubmit={handleAddSlot} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Nama Sesi</label>
                                <input
                                    type="text"
                                    value={newSlot.name}
                                    onChange={e => setNewSlot({...newSlot, name: e.target.value})}
                                    placeholder="e.g. Sesi Siang"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-amber-500 transition-all font-bold"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Mulai</label>
                                <input
                                    type="time"
                                    value={newSlot.start}
                                    onChange={e => setNewSlot({...newSlot, start: e.target.value})}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-amber-500 transition-all font-bold"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Berakhir</label>
                                <input
                                    type="time"
                                    value={newSlot.end}
                                    onChange={e => setNewSlot({...newSlot, end: e.target.value})}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-amber-500 transition-all font-bold"
                                    required
                                />
                            </div>
                            <button className="col-span-2 bg-amber-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition-all mt-2">
                                <Plus size={20} /> Simpan Jadwal
                            </button>
                        </form>

                        <div className="space-y-3">
                            {slots.map(slot => (
                                <div key={slot.id} className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm"><Clock size={20} className="text-amber-500" /></div>
                                        <div>
                                            <p className="font-black text-gray-900 leading-none mb-1 uppercase tracking-tight">{slot.name}</p>
                                            <p className="text-xs text-gray-400 font-bold">{slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)} WIB</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteSlot(slot.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={24} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSurveys;
