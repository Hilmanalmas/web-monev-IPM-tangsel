import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Trash2, Clock, CheckCircle, HelpCircle } from 'lucide-react';

const AdminExams = () => {
    const [exams, setExams] = useState([]);
    const [newExam, setNewExam] = useState({ title: '', description: '', start_time: '', end_time: '', duration_minutes: 60 });
    const [selectedExam, setSelectedExam] = useState(null);
    const [newQuestion, setNewQuestion] = useState({ question_text: '', options: [{ key: 'A', val: '' }, { key: 'B', val: '' }, { key: 'C', val: '' }, { key: 'D', val: '' }], correct_answer: 'A', points: 10 });

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        const res = await axios.get('/api/admin/exams');
        setExams(res.data);
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        await axios.post('/api/admin/exams', newExam);
        setNewExam({ title: '', description: '', start_time: '', end_time: '', duration_minutes: 60 });
        fetchExams();
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        await axios.post(`/api/admin/exams/${selectedExam.id}/questions`, newQuestion);
        setNewQuestion({ question_text: '', options: [{ key: 'A', val: '' }, { key: 'B', val: '' }, { key: 'C', val: '' }, { key: 'D', val: '' }], correct_answer: 'A', points: 10 });
        const res = await axios.get('/api/admin/exams');
        setExams(res.data);
        setSelectedExam(res.data.find(ex => ex.id === selectedExam.id));
    };

    return (
        <div className="p-6 space-y-8 animate-in slide-in-from-bottom duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <BookOpen className="text-amber-500" /> Manajemen Penugasan (Ujian)
                </h1>
                <p className="text-gray-400 mt-1">Atur jadwal tugas dan ujian sekolah</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Create Exam Panel */}
                <div className="lg:col-span-1 border border-gray-800 bg-gray-900/50 p-6 rounded-2xl">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Plus className="text-amber-500" size={20} /> Buat Ujian Baru
                    </h2>
                    <form onSubmit={handleCreateExam} className="space-y-4">
                        <input 
                            type="text" placeholder="Judul Ujian"
                            className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                            value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})}
                            required
                        />
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Mulai</label>
                            <input 
                                type="datetime-local"
                                className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                                value={newExam.start_time} onChange={e => setNewExam({...newExam, start_time: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-500 ml-2">Selesai</label>
                            <input 
                                type="datetime-local"
                                className="w-full bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                                value={newExam.end_time} onChange={e => setNewExam({...newExam, end_time: e.target.value})}
                                required
                            />
                        </div>
                        <button className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all">
                            Simpan Jadwal
                        </button>
                    </form>

                    <div className="mt-8 space-y-3">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Daftar Jadwal</h3>
                        {exams.map(ex => (
                            <div 
                                key={ex.id} 
                                onClick={() => setSelectedExam(ex)}
                                className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedExam?.id === ex.id ? 'border-amber-500 bg-amber-500/10' : 'border-gray-800 bg-gray-900/30 hover:border-gray-600'}`}
                            >
                                <h4 className="font-bold text-white">{ex.title}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                                    <Clock size={12} /> {new Date(ex.start_time).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question Manager */}
                <div className="lg:col-span-3">
                    {selectedExam ? (
                        <div className="space-y-6">
                            <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl">
                                <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">{selectedExam.title}</h2>
                                
                                <form onSubmit={handleAddQuestion} className="bg-black/50 p-6 rounded-2xl border border-gray-800 space-y-4 mb-10">
                                    <textarea 
                                        placeholder="Pertanyaan..."
                                        className="w-full bg-transparent border-b border-gray-700 p-2 text-white outline-none focus:border-amber-500"
                                        value={newQuestion.question_text} onChange={e => setNewQuestion({...newQuestion, question_text: e.target.value})}
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        {newQuestion.options.map((opt, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                                                <span className="font-bold text-amber-500">{opt.key}</span>
                                                <input 
                                                    type="text" placeholder={`Opsi ${opt.key}`}
                                                    className="bg-transparent text-white w-full outline-none"
                                                    value={opt.val} onChange={e => {
                                                        const opts = [...newQuestion.options];
                                                        opts[idx].val = e.target.value;
                                                        setNewQuestion({...newQuestion, options: opts});
                                                    }}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <label className="text-xs text-gray-500 font-bold uppercase">Jawaban Benar:</label>
                                            <select 
                                                className="bg-gray-800 text-white p-1 rounded border border-gray-700"
                                                value={newQuestion.correct_answer} onChange={e => setNewQuestion({...newQuestion, correct_answer: e.target.value})}
                                            >
                                                {newQuestion.options.map(opt => <option key={opt.key} value={opt.key}>{opt.key}</option>)}
                                            </select>
                                        </div>
                                        <button className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded-lg transition-all">
                                            Tambah Soal
                                        </button>
                                    </div>
                                </form>

                                <div className="space-y-4">
                                    {selectedExam.questions.map((q, idx) => (
                                        <div key={idx} className="bg-black/20 p-5 rounded-2xl border border-gray-800 hover:border-gray-600 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4">
                                                    <span className="text-gray-600 font-bold font-mono">{idx + 1}.</span>
                                                    <p className="text-white font-medium">{q.question_text}</p>
                                                </div>
                                                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-full">KUNCI: {q.correct_answer}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 ml-8">
                                                {q.options.map(opt => (
                                                    <div key={opt.key} className={`text-xs p-2 rounded-lg border ${opt.key === q.correct_answer ? 'border-green-500/50 bg-green-500/5' : 'border-gray-800'}`}>
                                                        <span className="font-bold mr-2 text-gray-500">{opt.key}.</span>
                                                        <span className="text-gray-400">{opt.val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-gray-800/50 rounded-3xl p-10">
                            <HelpCircle size={60} className="mb-4 opacity-10" />
                            <p className="text-lg">Pilih atau buat jadwal ujian baru untuk mengelola soal.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminExams;
