import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Plus, Trash2, Calendar, Clock } from 'lucide-react';

const AdminPractice = () => {
    const [slots, setSlots] = useState([]);
    const [form, setForm] = useState({ name: '', day: 1, start_time: '08:00', end_time: '23:59' });

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await axios.get('/api/admin/practice/slots');
            setSlots(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/practice/slots', form);
            setForm({ ...form, name: '' });
            fetchSlots();
            alert("Sesi Praktek berhasil disimpan!");
        } catch (error) {
            alert(error.response?.data?.message || "Gagal menyimpan sesi praktek.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Yakin menghapus slot praktek ini?')) {
            try {
                await axios.delete(`/api/admin/practice/slots/${id}`);
                fetchSlots();
            } catch (error) {
                alert("Gagal menghapus sesi praktek.");
            }
        }
    };

    const groupedSlots = Array.isArray(slots) ? slots.reduce((acc, slot) => {
        acc[slot.day] = acc[slot.day] || [];
        acc[slot.day].push(slot);
        return acc;
    }, {}) : {};

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <h1 className="text-3xl font-black flex items-center gap-3 text-indigo-600 uppercase tracking-tighter">
                <Award size={32} /> Pengaturan Penilaian Praktek
            </h1>

            <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-indigo-50">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Plus className="text-indigo-500" /> Tambah Sesi Praktek Baru
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Nama Praktek / Sesi</label>
                        <input type="text" placeholder="Tahfidz / Ceramah / Persidangan..." required className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 transition-colors"
                               value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest text-[10px]">Hari Ke-</label>
                        <input type="number" min="1" required className="w-full p-4 border-2 border-gray-100 rounded-2xl"
                               value={form.day} onChange={e => setForm({...form, day: parseInt(e.target.value)})} />
                    </div>
                    <div className="flex items-end">
                        <button type="submit" className="w-full h-[60px] bg-indigo-500 text-white p-3 rounded-2xl font-black hover:bg-indigo-600 active:scale-95 transition-all shadow-lg shadow-indigo-100">
                            SIMPAN
                        </button>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase text-[10px]">Buka Jam</label>
                        <input type="time" required className="w-full p-3 border-2 border-gray-100 rounded-2xl"
                               value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase text-[10px]">Tutup Jam</label>
                        <input type="time" required className="w-full p-3 border-2 border-gray-100 rounded-2xl"
                               value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                {Object.keys(groupedSlots).sort().map(day => (
                    <div key={day} className="space-y-3">
                        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 px-2">
                            <Calendar size={20} className="text-indigo-500" /> HARI {day}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {groupedSlots[day].map(s => (
                                <div key={s.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors flex justify-between items-center group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="pl-2">
                                        <h3 className="font-bold text-gray-800 text-lg uppercase">{s.name}</h3>
                                        <p className="text-sm text-gray-400 font-mono flex items-center gap-1 mt-1">
                                            <Clock size={12}/> {s.start_time?.substring(0,5)} - {s.end_time?.substring(0,5)}
                                        </p>
                                    </div>
                                    <button onClick={() => handleDelete(s.id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all">
                                        <Trash2 size={22}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default AdminPractice;
