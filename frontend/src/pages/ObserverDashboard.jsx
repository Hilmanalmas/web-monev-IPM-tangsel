import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, CheckCircle, Search, Edit3, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';

const ObserverDashboard = () => {
    const [pesertaList, setPesertaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form state
    const [selectedUser, setSelectedUser] = useState(null);
    const [score, setScore] = useState('');
    const [notes, setNotes] = useState('');
    const [submitStatus, setSubmitStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const fetchPeserta = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/observer/peserta');
            setPesertaList(res.data.peserta);
        } catch (error) {
            console.error("Gagal memuat daftar target", error);
            setMessage("Koneksi bermasalah saat memuat target.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPeserta();
    }, []);

    const openForm = (user) => {
        setSelectedUser(user);
        setScore(user.score_value || '');
        setNotes('');
        setSubmitStatus('idle');
        setMessage('');
    };

    const closeForm = () => {
        setSelectedUser(null);
        setScore('');
        setNotes('');
        setSubmitStatus('idle');
    };

    const submitScore = async (e) => {
        e.preventDefault();
        if (score < 0 || score > 100 || score === '') {
            setMessage("Nilai harus antara 0 dan 100 ya!");
            return;
        }

        setSubmitStatus('submitting');
        setMessage('');

        try {
            const res = await axios.post('/api/observer/score', {
                user_id: selectedUser.id,
                score: score,
                notes: notes
            });
            setMessage(res.data.message || 'Misi sukses! Nilai tersimpan.');
            setSubmitStatus('success');
            fetchPeserta(); // Refresh list to show checkmarks
            setTimeout(() => {
                closeForm();
            }, 2000);
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Gagal menyimpan nilai.');
            setSubmitStatus('error');
        }
    };

    const filteredPeserta = pesertaList.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.asal_instansi?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-indigo-600">
                <RefreshCcw className="animate-spin mb-4" size={40} />
                <p className="font-bold text-lg">Memindai Daftar Target...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 relative">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Eye size={150} />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <Eye className="text-amber-400" /> Markas Pengawas
                        </h1>
                        <p className="text-gray-300 text-lg">Misi Utama: Amati dan berikan penilaian objektif (Nilai Kognitif) secara senyap.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-6 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Daftar Target (Peserta)</h2>
                    <div className="relative max-w-sm w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari pasukan / instansi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-bold">Nama Target</th>
                                <th className="p-4 font-bold">Instansi</th>
                                <th className="p-4 font-bold text-center">Status Misi</th>
                                <th className="p-4 font-bold text-center">Aksi Rahasia</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPeserta.length > 0 ? filteredPeserta.map(user => (
                                <tr key={user.id} className="hover:bg-indigo-50/50 transition-colors">
                                    <td className="p-4 font-bold text-gray-800">{user.name}</td>
                                    <td className="p-4 text-gray-600">{user.asal_instansi || '-'}</td>
                                    <td className="p-4 text-center">
                                        {user.has_score ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                                                <CheckCircle size={14}/> Selesai (NIL: {user.score_value})
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase">
                                                <AlertCircle size={14}/> Belum Dinilai
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => openForm(user)}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto"
                                        >
                                            <Edit3 size={16}/> {user.has_score ? 'Edit Nilai' : 'Beri Nilai'}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 italic">Target rahasia tidak ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {selectedUser && (
                <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Form Penilaian Kognitif</h3>
                                <p className="text-indigo-200 text-sm">Target amatan: {selectedUser.name}</p>
                            </div>
                        </div>
                        
                        <form onSubmit={submitScore} className="p-6 sm:p-8 space-y-6">
                            {message && (
                                <div className={`p-4 rounded-xl text-sm font-bold ${submitStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message}
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Berapa Nilai Kognitifnya? (0 - 100)</label>
                                <input 
                                    type="number" 
                                    min="0" max="100" required
                                    value={score} 
                                    onChange={e => setScore(e.target.value)}
                                    className="w-full text-3xl font-black text-center text-indigo-700 p-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Catatan Mata-mata (Opsional)</label>
                                <textarea 
                                    rows="3"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Ada kelakuan target yang mencolok hari ini?"
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={closeForm}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitStatus === 'submitting' || submitStatus === 'success'}
                                    className={`flex-1 flex justify-center items-center gap-2 py-3 font-bold rounded-xl text-white transition-all shadow-lg active:scale-95
                                        ${submitStatus === 'success' ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                >
                                    {submitStatus === 'submitting' ? <><Loader2 size={18} className="animate-spin"/> Menyimpan...</> 
                                     : submitStatus === 'success' ? <><CheckCircle size={18}/> Sukses!</> 
                                     : 'Kirim Sandi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ObserverDashboard;
