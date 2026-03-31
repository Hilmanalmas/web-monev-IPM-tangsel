import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Plus, Trash2 } from 'lucide-react';

const AdminAttendance = () => {
    const [slots, setSlots] = useState([]);
    const [form, setForm] = useState({ name: '', start_time: '', end_time: '' });

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        const res = await axios.get('/api/admin/attendance/slots');
        setSlots(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/api/admin/attendance/slots', form);
        setForm({ name: '', start_time: '', end_time: '' });
        fetchSlots();
    };

    const handleDelete = async (id) => {
        if (confirm('Yakin ingin menghapus slot ini?')) {
            await axios.delete(`/api/admin/attendance/slots/${id}`);
            fetchSlots();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <h1 className="text-3xl font-black flex items-center gap-3">
                <Clock className="text-blue-500" size={32} /> Pengaturan Jam Absensi
            </h1>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold mb-4">Tambah Slot Absensi Baru</h2>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                    <input type="text" placeholder="Nama Slot (Pagi, Siang...)" required className="flex-1 p-3 border rounded-xl"
                           value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    <input type="time" required className="p-3 border rounded-xl"
                           value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
                    <span className="self-center font-bold text-gray-400">s/d</span>
                    <input type="time" required className="p-3 border rounded-xl"
                           value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
                        <Plus size={20}/> Tambah
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slots.map(s => (
                    <div key={s.id} className="bg-white p-5 rounded-2xl shadow border flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">{s.name}</h3>
                            <p className="text-gray-500">{s.start_time} - {s.end_time}</p>
                        </div>
                        <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:bg-red-50 p-3 rounded-full">
                            <Trash2 size={24}/>
                        </button>
                    </div>
                ))}
                {slots.length === 0 && <p className="text-gray-500 p-4">Belum ada slot absensi.</p>}
            </div>
        </div>
    );
};
export default AdminAttendance;
