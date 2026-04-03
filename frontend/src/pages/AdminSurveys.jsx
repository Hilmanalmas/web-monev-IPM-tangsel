import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Plus, Trash2, Calendar, Clock, HelpCircle, RefreshCw, Users, Play, Edit2 } from 'lucide-react';
import AdminRealtimeMonitor from './AdminRealtimeMonitor';

const AdminSurveys = () => {
    const [slots, setSlots] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ name: '', day: 1, start_time: '', end_time: '' });
    const [qForm, setQForm] = useState({ question_text: '', day: 1 });
    const [resetForm, setResetForm] = useState({ user_id: '', day: 1, period: '' });

    useEffect(() => {
        setQForm(q => ({...q, day: form.day}));
    }, [form.day]);

    useEffect(() => {
        fetchData();
        fetchUsers();
    }, []);

    const fetchData = async () => {
        try {
            const slotsRes = await axios.get('/api/admin/surveys/slots');
            const questionsRes = await axios.get('/api/admin/surveys/questions');
            setSlots(slotsRes.data);
            setQuestions(questionsRes.data);
        } catch (err) {
            console.error("Gagal mengambil data survey:", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/admin/users');
            // Backend mengembalikan { users: [...] }
            const userList = res.data.users || res.data;
            setUsers(userList.filter(u => u.role === 'peserta'));
        } catch (err) {
            console.error("Gagal mengambil data peserta:", err);
        }
    };

    const handleReset = async () => {
        if (!resetForm.user_id || !resetForm.period) return alert("Pilih peserta dan sesi!");
        const userName = users.find(u => u.id == resetForm.user_id)?.name;
        if (confirm(`RESET PENILAIAN: Apakah Anda yakin ingin menghapus penilaian ${userName} untuk sesi ${resetForm.period}?`)) {
            try {
                const res = await axios.post('/api/admin/surveys/reset', resetForm);
                alert(res.data.message || 'Penilaian berhasil direset!');
            } catch (err) {
                alert("Gagal reset penilaian: " + (err.response?.data?.error || err.message));
            }
        }
    };

    const handleSlotSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/surveys/slots', form);
            setForm({ ...form, name: '' });
            fetchData();
        } catch (err) {
            alert("Gagal menyimpan sesi survey.");
        }
    };

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/surveys/questions', qForm);
            setQForm({ question_text: '' });
            fetchData();
        } catch (err) {
            alert("Gagal menyimpan pertanyaan.");
        }
    };

    const handleDeleteSlot = async (id) => {
        if (confirm('Hapus sesi ini?')) {
            await axios.delete(`/api/admin/surveys/slots/${id}`);
            fetchData();
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (confirm('Hapus pertanyaan ini?')) {
            await axios.delete(`/api/admin/surveys/questions/${id}`);
            fetchData();
        }
    };

    const groupedSlots = slots.reduce((acc, slot) => {
        acc[slot.day] = acc[slot.day] || [];
        acc[slot.day].push(slot);
        return acc;
    }, {});

    return (
        <div className="max-w-5xl mx-auto space-y-12 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-black flex items-center gap-3">
                    <Target className="text-purple-600" size={32} /> Pengaturan Manito Master
                </h1>
                <button onClick={async () => {
                    if (confirm(`Acak ulang semua target Manito untuk Hari ${form.day}?`)) {
                        try {
                            const res = await axios.post('/api/admin/manito/shuffle', { day: form.day });
                            alert(res.data.message || 'Target berhasil diacak!');
                        } catch (err) {
                            alert('Gagal mengacak target: ' + (err.response?.data?.message || err.message));
                        }
                    }
                }} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:shadow-purple-200 transition-all flex items-center gap-2">
                    <Plus size={20}/> ACAK TARGET MANITO
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Slot Management */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-purple-50">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Clock className="text-purple-600" /> Tambah Sesi Survey
                        </h2>
                        <form onSubmit={handleSlotSubmit} className="space-y-4">
                            <input type="text" placeholder="Nama Sesi (Misal: Survey Day 1)" required className="w-full p-3 border rounded-xl"
                                   value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400">Hari Ke-</label>
                                    <input type="number" min="1" required className="w-full p-3 border rounded-xl"
                                           value={form.day} onChange={e => setForm({...form, day: parseInt(e.target.value)})} />
                                </div>
                                <div className="flex items-end">
                                    <button type="submit" className="w-full bg-purple-600 text-white p-3 rounded-xl font-black hover:bg-purple-700">SIMPAN SESI</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400">Buka Jam</label>
                                    <input type="time" required className="w-full p-3 border rounded-xl"
                                           value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400">Tutup Jam</label>
                                    <input type="time" required className="w-full p-3 border rounded-xl"
                                           value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-6">
                        {Object.keys(groupedSlots).sort().map(day => (
                            <div key={day} className="space-y-2">
                                <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest px-2">HARI {day}</h3>
                                {groupedSlots[day].map(s => (
                                    <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border flex justify-between items-center group">
                                        <div>
                                            <h4 className="font-bold text-gray-800">{s.name}</h4>
                                            <p className="text-xs text-gray-400">{s.start_time.substring(0,5)} - {s.end_time.substring(0,5)}</p>
                                        </div>
                                        <button onClick={() => handleDeleteSlot(s.id)} className="text-gray-300 hover:text-red-500 p-2">
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question Management */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-amber-50">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-600">
                            <HelpCircle /> Daftar Pertanyaan Survey
                        </h2>
                        <form onSubmit={handleQuestionSubmit} className="flex gap-4">
                            <input type="text" placeholder="Tulis pertanyaan..." required className="flex-1 p-3 border rounded-xl"
                                   value={qForm.question_text} onChange={e => setQForm({question_text: e.target.value})} />
                            <button type="submit" className="bg-amber-500 text-white px-6 rounded-xl font-black hover:bg-amber-600">TAMBAH</button>
                        </form>
                    </div>

                    <div className="bg-white rounded-3xl shadow-lg border overflow-hidden">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-gray-50 group">
                                <p className="text-gray-700"><span className="text-gray-300 font-bold mr-3">{idx + 1}</span>{q.question_text}</p>
                                <button onClick={() => handleDeleteQuestion(q.id)} className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        ))}
                        {questions.length === 0 && <p className="p-10 text-center text-gray-400">Belum ada pertanyaan.</p>}
                    </div>
                </div>
            </div>

            <AdminRealtimeMonitor />

            {/* Reset Penilaian Section */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-red-50">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-red-600">
                    <RefreshCw size={28} /> Reset Penilaian Manito
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-2">PILIH PESERTA (PENILAI)</label>
                        <select 
                            className="w-full p-3 border rounded-xl bg-gray-50"
                            value={resetForm?.user_id || ''}
                            onChange={e => setResetForm({...resetForm, user_id: e.target.value})}
                        >
                            <option value="">-- Pilih Peserta --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.asal_instansi})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-2">HARI KE-</label>
                        <input 
                            type="number" 
                            className="w-full p-3 border rounded-xl bg-gray-50"
                            value={resetForm?.day || 1}
                            onChange={e => setResetForm({...resetForm, day: parseInt(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 block mb-2">PILIH SESI/PERIOD</label>
                        <select 
                            className="w-full p-3 border rounded-xl bg-gray-50"
                            value={resetForm?.period || ''}
                            onChange={e => setResetForm({...resetForm, period: e.target.value})}
                        >
                            <option value="">-- Pilih Sesi --</option>
                            {slots.filter(s => s.day === (resetForm?.day || 1)).map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleReset}
                        className="bg-red-600 text-white p-3 rounded-xl font-black hover:bg-red-700 shadow-lg shadow-red-100 transition-all"
                    >
                        RESET PENILAIAN
                    </button>
                </div>
                <p className="mt-4 text-xs text-gray-400 italic font-medium">
                    * Reset ini akan menghapus semua jawaban peserta tersebut pada sesi yang pilih, sehingga mereka bisa mengisi ulang.
                </p>
            </div>
        </div>
    );
};
export default AdminSurveys;
