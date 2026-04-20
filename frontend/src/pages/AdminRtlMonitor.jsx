import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Search, Eye, Filter, Loader2, Calendar } from 'lucide-react';

const AdminRtlMonitor = () => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal for specific response viewing
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchRtlData();
    }, []);

    const fetchRtlData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/rtl/monitor');
            setResponses(res.data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const filteredResponses = responses.filter(r => 
        r.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-6">
            <h1 className="text-3xl font-black flex items-center gap-3">
                <Target className="text-purple-600" size={32} /> Monitor RTL
            </h1>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Laporan Masuk</h2>
                    <p className="text-gray-500 text-sm">Pantau dokumen dan form Rencana Tindak Lanjut dari peserta.</p>
                </div>
                
                <div className="relative font-mono w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari Peserta..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-full text-sm outline-none w-full md:w-64 focus:border-purple-500 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center gap-4 text-purple-600 font-bold">
                    <Loader2 size={40} className="animate-spin" />
                    Memuat Laporan...
                </div>
            ) : filteredResponses.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border text-center text-gray-500">
                    Belum ada data RTL yang terkumpul atau peserta tidak ditemukan.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResponses.map((r, idx) => (
                        <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow flex flex-col h-full">
                            <div className="h-48 bg-gray-100 relative group">
                                {r.selfie_url ? (
                                    <img src={r.selfie_url} alt="Selfie" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 font-medium">
                                        Tanpa Selfie
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                                    <Calendar size={12} /> {r.date}
                                </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-bold text-xl mb-1">{r.user_name}</h3>
                                <p className="text-gray-500 text-sm mb-4">Total: {r.answers.length} Indikator Terisi</p>
                                
                                <button 
                                    onClick={() => setSelectedUser(r)}
                                    className="mt-auto w-full py-2 bg-purple-50 text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Eye size={18} /> Lihat Detail Jawaban
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Detail */}
            {selectedUser && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-2xl font-black">{selectedUser.user_name}</h2>
                                <p className="text-sm text-gray-500">Detail Jawaban RTL - {selectedUser.date}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-red-500 font-bold p-2">✕ Tutup</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-6">
                            {selectedUser.selfie_url && (
                                <div className="flex justify-center mb-6">
                                    <img src={selectedUser.selfie_url} className="w-48 h-48 rounded-2xl object-cover shadow-lg border-4 border-white" alt="selfie doc" />
                                </div>
                            )}

                            {selectedUser.answers.map((ans, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <h4 className="font-bold text-gray-700 text-sm mb-2">{i+1}. {ans.question}</h4>
                                    <p className="text-gray-800 whitespace-pre-wrap">{ans.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRtlMonitor;
