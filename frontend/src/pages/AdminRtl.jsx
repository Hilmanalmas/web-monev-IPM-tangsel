import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Plus, Trash2 } from 'lucide-react';

const AdminRtl = () => {
    const [slots, setSlots] = useState([]);
    const [questions, setQuestions] = useState([]);
    
    // Forms
    const [slotForm, setSlotForm] = useState({ name: '', start_time: '', end_time: '' });
    const [qForm, setQForm] = useState({ question_text: '' });

    useEffect(() => {
        fetchSlots();
        fetchQuestions();
    }, []);

    const fetchSlots = async () => {
        const res = await axios.get('/api/admin/rtl/slots');
        setSlots(res.data);
    };

    const fetchQuestions = async () => {
        const res = await axios.get('/api/admin/rtl/questions');
        setQuestions(res.data);
    };

    const handleSlotSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/api/admin/rtl/slots', slotForm);
        setSlotForm({ name: '', start_time: '', end_time: '' });
        fetchSlots();
    };

    const handleQSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/api/admin/rtl/questions', { ...qForm, is_active: true });
        setQForm({ question_text: '' });
        fetchQuestions();
    };

    const deleteSlot = async (id) => {
        if (confirm('Yakin?')) {
             await axios.delete(`/api/admin/rtl/slots/${id}`);
             fetchSlots();
        }
    };

    const deleteQ = async (id) => {
        if (confirm('Yakin?')) {
             await axios.delete(`/api/admin/rtl/questions/${id}`);
             fetchQuestions();
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">
            <h1 className="text-3xl font-black flex items-center gap-3">
                <Target className="text-pink-500" size={32} /> Rencana Tindak Lanjut (RTL)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* RTL SLOTS */}
                <div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6">
                        <h2 className="text-xl font-bold mb-4">Slot Waktu RTL</h2>
                        <form onSubmit={handleSlotSubmit} className="flex flex-col gap-4">
                            <input type="text" placeholder="Nama Sesi (H-1, H-2)" required className="p-3 border rounded-xl"
                                   value={slotForm.name} onChange={e => setSlotForm({...slotForm, name: e.target.value})} />
                            <div className="flex gap-2 items-center">
                                <input type="time" required className="flex-1 p-3 border rounded-xl"
                                       value={slotForm.start_time} onChange={e => setSlotForm({...slotForm, start_time: e.target.value})} />
                                <span>s/d</span>
                                <input type="time" required className="flex-1 p-3 border rounded-xl"
                                       value={slotForm.end_time} onChange={e => setSlotForm({...slotForm, end_time: e.target.value})} />
                            </div>
                            <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-pink-700 flex justify-center gap-2">
                                <Plus/> Tambah Sesi
                            </button>
                        </form>
                    </div>
                    <div className="space-y-3">
                        {slots.map(s => (
                            <div key={s.id} className="bg-white p-4 rounded-xl border flex justify-between">
                                <div><h3 className="font-bold">{s.name}</h3><span className="text-xs text-gray-400">{s.start_time} - {s.end_time}</span></div>
                                <button onClick={() => deleteSlot(s.id)} className="text-red-500"><Trash2/></button>
                            </div>
                        ))}
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
