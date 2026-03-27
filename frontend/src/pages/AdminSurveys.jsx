import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardEdit, Plus, Trash2, Save, HelpCircle, CheckCircle } from 'lucide-react';

const AdminSurveys = () => {
    const [surveys, setSurveys] = useState([]);
    const [newSurvey, setNewSurvey] = useState({ title: '', description: '' });
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [newQuestion, setNewQuestion] = useState({ question_text: '', type: 'rating' });

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        const res = await axios.get('/api/admin/surveys');
        setSurveys(res.data);
    };

    const handleCreateSurvey = async (e) => {
        e.preventDefault();
        await axios.post('/api/admin/surveys', newSurvey);
        setNewSurvey({ title: '', description: '' });
        fetchSurveys();
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        await axios.post(`/api/admin/surveys/${selectedSurvey.id}/questions`, newQuestion);
        setNewQuestion({ question_text: '', type: 'rating' });
        const res = await axios.get('/api/admin/surveys'); // Refresh all
        setSurveys(res.data);
        setSelectedSurvey(res.data.find(s => s.id === selectedSurvey.id));
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ClipboardEdit className="text-amber-500" /> Manajemen Angket
                    </h1>
                    <p className="text-gray-400 mt-1">Buat panduan penilaian untuk Manito</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Survey */}
                <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-amber-500" /> Buat Angket Baru
                    </h2>
                    <form onSubmit={handleCreateSurvey} className="space-y-4">
                        <input 
                            type="text" placeholder="Judul Angket (Contoh: Evaluasi Adab)"
                            className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none transition-all"
                            value={newSurvey.title} onChange={e => setNewSurvey({...newSurvey, title: e.target.value})}
                            required
                        />
                        <textarea 
                            placeholder="Deskripsi singkat..."
                            className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none transition-all"
                            value={newSurvey.description} onChange={e => setNewSurvey({...newSurvey, description: e.target.value})}
                        />
                        <button className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-900/20">
                            Simpan Angket
                        </button>
                    </form>

                    <div className="mt-8 space-y-3">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Daftar Angket</h3>
                        {surveys.map(s => (
                            <div 
                                key={s.id} 
                                onClick={() => setSelectedSurvey(s)}
                                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedSurvey?.id === s.id ? 'border-amber-500 bg-amber-500/10' : 'border-gray-800 bg-gray-900/30 hover:border-gray-600'}`}
                            >
                                <h4 className="font-bold text-white">{s.title}</h4>
                                <p className="text-xs text-gray-500 truncate">{s.description || 'Tanpa deskripsi'}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question Manager */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedSurvey ? (
                        <div className="bg-gray-900/50 border border-amber-500/30 p-8 rounded-3xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-2">{selectedSurvey.title}</h2>
                                <p className="text-gray-400 mb-6">{selectedSurvey.description}</p>

                                <form onSubmit={handleAddQuestion} className="flex flex-wrap gap-4 mb-8 bg-black/40 p-4 rounded-2xl border border-gray-800">
                                    <div className="flex-1 min-w-[200px]">
                                        <input 
                                            type="text" placeholder="Pertanyaan baru..."
                                            className="w-full bg-transparent border-b border-gray-700 p-2 text-white focus:border-amber-500 outline-none"
                                            value={newQuestion.question_text} onChange={e => setNewQuestion({...newQuestion, question_text: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <select 
                                        className="bg-gray-800 text-white p-2 rounded-lg outline-none border border-gray-700"
                                        value={newQuestion.type} onChange={e => setNewQuestion({...newQuestion, type: e.target.value})}
                                    >
                                        <option value="rating">Skala 1-5</option>
                                        <option value="text">Teks Narasi</option>
                                    </select>
                                    <button className="bg-amber-600 p-2 rounded-lg text-white hover:bg-amber-500">
                                        Tambah
                                    </button>
                                </form>

                                <div className="space-y-4">
                                    {selectedSurvey.questions.length === 0 && (
                                        <div className="text-center py-10 text-gray-600 italic">Belum ada pertanyaan. Tambahkan pertanyaan untuk memulai angket.</div>
                                    )}
                                    {selectedSurvey.questions.map((q, idx) => (
                                        <div key={q.id} className="group flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-700 hover:border-amber-500/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <span className="w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-xs font-bold text-amber-500">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <p className="text-white font-medium">{q.question_text}</p>
                                                    <span className="text-[10px] uppercase font-bold text-gray-500">{q.type === 'rating' ? 'Skala 1-5' : 'Text Freeform'}</span>
                                                </div>
                                            </div>
                                            <button className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-3xl p-10">
                            <HelpCircle size={48} className="mb-4 opacity-20" />
                            <p>Pilih angket dari daftar di samping untuk melihat atau mengelola pertanyaan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSurveys;
