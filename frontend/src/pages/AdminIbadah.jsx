import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Moon, Plus, Trash2 } from 'lucide-react';

const AdminIbadah = () => {
    const [slots, setSlots] = useState([]);
    const [name, setName] = useState('');

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        const res = await axios.get('/api/admin/worship/slots');
        setSlots(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('/api/admin/worship/slots', { name });
        setName('');
        fetchSlots();
    };

    const handleDelete = async (id) => {
        if (confirm('Yakin hapus?')) {
            await axios.delete(`/api/admin/worship/slots/${id}`);
            fetchSlots();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6 animate-in fade-in duration-300">
            <h1 className="text-3xl font-black flex items-center gap-3">
                <Moon className="text-indigo-500" size={32} /> Pengaturan Ibadah (Observer)
            </h1>
            <p className="text-gray-500">Nilai ibadah murni dilakukan oleh Observer secara manual (0-100). Admin hanya perlu membuat slot waktu ibadahnya di bawah ini agar Observer bisa membukanya.</p>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold mb-4">Tambah Master Ibadah</h2>
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <input type="text" placeholder="Nama Ibadah (cth. Subuh Berjamaah, Qiyamul Lail)" required className="flex-1 p-3 border rounded-xl"
                           value={name} onChange={e => setName(e.target.value)} />
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700">
                        <Plus size={20}/>
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slots.map(s => (
                    <div key={s.id} className="bg-white p-5 rounded-2xl border flex justify-between items-center shadow-sm">
                        <span className="font-bold text-lg">{s.name}</span>
                        <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:bg-red-50 p-3 rounded-full">
                            <Trash2 size={24}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default AdminIbadah;
