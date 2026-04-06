import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Moon, Plus, Trash2, Calendar, Clock } from 'lucide-react';

const AdminIbadah = () => {
    const [slots, setSlots] = useState([]);
    const [form, setForm] = useState({ name: '', day: 1, start_time: '', end_time: '' });

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await axios.get('/api/admin/worship/slots');
            setSlots(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/worship/slots', form);
            setForm({ ...form, name: '' });
            fetchSlots();
            alert("Sesi Ibadah berhasil disimpan!");
        } catch (error) {
            alert(error.response?.data?.message || "Gagal menyimpan sesi ibadah.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Yakin menghapus slot ibadah ini?')) {
            try {
                await axios.delete(`/api/admin/worship/slots/${id}`);
                fetchSlots();
            } catch (error) {
                alert("Gagal menghapus sesi ibadah.");
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
            <h1 className="text-3xl font-black flex items-center gap-3">
                <Moon className="text-emerald-500" size={32} /> Pengaturan Ibadah
            </h1>

            <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-emerald-50">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Plus className="text-emerald-500" /> Tambah Sesi Ibadah
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Nama Ibadah</label>
                        <input type="text" placeholder="Tahajud / Dhuha / Tadarus..." required className="w-full p-3 border rounded-xl"
                               value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Hari Ke-</label>
                        <input type="number" min="1" required className="w-full p-3 border rounded-xl"
                               value={form.day} onChange={e => setForm({...form, day: parseInt(e.target.value)})} />
                    </div>
                    <div className="flex items-end">
                        <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded-xl font-black hover:bg-emerald-700 active:scale-95 transition-all">
                            SIMPAN
                        </button>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Mulai</label>
                        <input type="time" required className="w-full p-3 border rounded-xl"
                               value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Selesai</label>
                        <input type="time" required className="w-full p-3 border rounded-xl"
                               value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                {Object.keys(groupedSlots).sort().map(day => (
                    <div key={day} className="space-y-3">
                        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 px-2">
                            <Calendar size={20} className="text-emerald-500" /> HARI {day}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {groupedSlots[day].map(s => (
                                <div key={s.id} className="bg-white p-5 rounded-2xl shadow-sm border hover:border-emerald-200 flex justify-between items-center group">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{s.name}</h3>
                                        <p className="text-sm text-gray-500 font-mono flex items-center gap-1">
                                            <Clock size={12}/> {s.start_time?.substring(0,5)} - {s.end_time?.substring(0,5)}
                                        </p>
                                    </div>
                                    <button onClick={() => handleDelete(s.id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all">
                                        <Trash2 size={20}/>
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
export default AdminIbadah;
