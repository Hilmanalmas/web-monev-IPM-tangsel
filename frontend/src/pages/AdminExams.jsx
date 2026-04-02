import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Plus, Trash2, Clock, HelpCircle, Settings, Edit3, Save, X } from 'lucide-react';

const AdminExams = () => {
    const [exams, setExams] = useState([]);
    
    // Forms and Visibility
    const [isCreatingOrEditing, setIsCreatingOrEditing] = useState(false);
    const [editingExamId, setEditingExamId] = useState(null);
    const [examForm, setExamForm] = useState({ title: '', description: '', start_time: '', end_time: '', duration_minutes: 60, type: 'test', show_result: true, day: 1 });
    
    // Questions Editor
    const [editingQuestionsExam, setEditingQuestionsExam] = useState(null);
    const [questionsForm, setQuestionsForm] = useState([]);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        const res = await axios.get('/api/admin/exams');
        setExams(res.data);
    };

    // Format datetime string for HTML input
    const formatForInput = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    };

    const openCreateExam = () => {
        setEditingExamId(null);
        setExamForm({ title: '', description: '', start_time: '', end_time: '', duration_minutes: 60, type: 'test', show_result: true, day: 1 });
        setIsCreatingOrEditing(true);
    };

    const openEditExam = (exam) => {
        setEditingExamId(exam.id);
        setExamForm({ 
            title: exam.title, 
            description: exam.description || '', 
            start_time: formatForInput(exam.start_time), 
            end_time: formatForInput(exam.end_time), 
            duration_minutes: exam.duration_minutes,
            type: exam.type || 'test',
            show_result: exam.show_result ?? true,
            day: exam.day || 1
        });
        setIsCreatingOrEditing(true);
    };

    const handleSaveExam = async (e) => {
        e.preventDefault();
        try {
            if (editingExamId) {
                await axios.put(`/api/admin/exams/${editingExamId}`, examForm);
            } else {
                await axios.post('/api/admin/exams', examForm);
            }
            setIsCreatingOrEditing(false);
            fetchExams();
            alert("Pengaturan tes berhasil disimpan!");
        } catch (error) {
            console.error("Gagal menyimpan tes:", error);
            alert(error.response?.data?.message || "Internal Server Error: Gagal menyimpan pengaturan tes. Pastikan database sudah terupdate.");
        }
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm("Yakin ingin menghapus tes ini beserta seluruh soalnya?")) return;
        await axios.delete(`/api/admin/exams/${id}`);
        if (editingQuestionsExam?.id === id) setEditingQuestionsExam(null);
        fetchExams();
    };

    const openEditQuestions = (exam) => {
        setEditingQuestionsExam(exam);
        const loadedQuestions = exam.questions.map(q => ({
            id: q.id,
            type: q.type || 'pg',
            question_text: q.question_text,
            options: q.options ? (Array.isArray(q.options) ? q.options : Object.keys(q.options).map(k => ({key: k, val: q.options[k]}))) : [{ key: 'A', val: '' }, { key: 'B', val: '' }, { key: 'C', val: '' }, { key: 'D', val: '' }],
            weights: q.weights || { A: 4, B: 3, C: 2, D: 1 },
            correct_answer: q.correct_answer || 'A',
            points: q.points || 0
        }));
        setQuestionsForm(loadedQuestions);
    };

    const handleAddQuestionToForm = () => {
        setQuestionsForm([...questionsForm, { 
            type: 'pg',
            question_text: '', 
            options: [{ key: 'A', val: '' }, { key: 'B', val: '' }, { key: 'C', val: '' }, { key: 'D', val: '' }], 
            weights: { A: 4, B: 3, C: 2, D: 1 },
            correct_answer: 'A', 
            points: 10 
        }]);
    };

    const handleRemoveQuestionFromForm = (index) => {
        const newQ = [...questionsForm];
        newQ.splice(index, 1);
        setQuestionsForm(newQ);
    };

    const handleTypeChange = (index, value) => {
        const newQ = [...questionsForm];
        newQ[index].type = value;
        // Reset defaults for type if needed
        if (value === 'pg' && !newQ[index].options) {
            newQ[index].options = [{ key: 'A', val: '' }, { key: 'B', val: '' }, { key: 'C', val: '' }, { key: 'D', val: '' }];
            newQ[index].correct_answer = 'A';
        }
        setQuestionsForm(newQ);
    };

    const handleQuestionTextChange = (index, value) => {
        const newQ = [...questionsForm];
        newQ[index].question_text = value;
        setQuestionsForm(newQ);
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        const newQ = [...questionsForm];
        newQ[qIndex].options[optIndex].val = value;
        setQuestionsForm(newQ);
    };

    const handleCorrectAnswerChange = (qIndex, value) => {
        const newQ = [...questionsForm];
        newQ[qIndex].correct_answer = value;
        setQuestionsForm(newQ);
    };

    const handleWeightChange = (qIndex, key, value) => {
        const newQ = [...questionsForm];
        if (!newQ[qIndex].weights) newQ[qIndex].weights = {};
        newQ[qIndex].weights[key] = parseInt(value) || 0;
        setQuestionsForm(newQ);
    };

    const handleSaveQuestionsBatch = async () => {
        try {
            await axios.put(`/api/admin/exams/${editingQuestionsExam.id}/questions/batch`, { questions: questionsForm });
            alert("Soal berhasil disimpan!");
            setEditingQuestionsExam(null);
            fetchExams();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Gagal menyimpan soal.");
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in slide-in-from-bottom duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    < BookOpen className="text-amber-500" /> Manajemen Test
                </h1>
                <p className="text-gray-400 mt-1">Atur jadwal dan daftar soal Test</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Panel: Daftar Tes */}
                <div className="lg:col-span-1 space-y-4">
                    <button 
                        onClick={openCreateExam}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-2xl transition-all shadow-xl shadow-amber-900/20 flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> Tambah Tes Baru
                    </button>

                    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl space-y-3">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Daftar Tes Aktif</h3>
                        {exams.length === 0 && <p className="text-xs text-gray-600 italic">Belum ada tes yang dibuat.</p>}
                        
                        {exams.map(ex => (
                            <div key={ex.id} className="group relative p-4 rounded-xl border border-gray-800 bg-black/40 hover:border-amber-500/50 transition-all overflow-hidden">
                                <h4 className="font-bold text-white pr-6">{ex.title}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                                    <Clock size={12} /> {new Date(ex.start_time).toLocaleString()}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1 flex gap-2">
                                    <span>{ex.duration_minutes} Menit</span>
                                    <span>• {ex.questions?.length || 0} Soal</span>
                                    <span className={`px-1 rounded ${ex.type === 'archetype' ? 'bg-purple-900/40 text-purple-400' : 'bg-blue-900/40 text-blue-400'}`}>{ex.type?.toUpperCase()}</span>
                                </div>

                                {/* Hover Actions */}
                                <div className="absolute top-0 right-0 h-full bg-gray-900 border-l border-gray-800 p-2 flex flex-col justify-center gap-2 translate-x-full group-hover:translate-x-0 transition-transform">
                                    <button onClick={() => openEditQuestions(ex)} title="Edit Soal" className="p-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-all">
                                        <Edit3 size={16} />
                                    </button>
                                    <button onClick={() => openEditExam(ex)} title="Edit Pengaturan Tes" className="p-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white rounded-lg transition-all">
                                        <Settings size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteExam(ex.id)} title="Hapus Tes" className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Panel: Editor */}
                <div className="lg:col-span-3">
                    {/* Settings Editor */}
                    {isCreatingOrEditing && !editingQuestionsExam && (
                        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl relative animate-in zoom-in-95 duration-300">
                            <button onClick={() => setIsCreatingOrEditing(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>
                            <h2 className="text-2xl font-bold text-white mb-6 uppercase flex items-center gap-2">
                                <Settings className="text-amber-500" /> {editingExamId ? 'Edit Pengaturan Tes' : 'Tambah Tes Baru'}
                            </h2>
                            <form onSubmit={handleSaveExam} className="space-y-4 max-w-xl">
                                <div>
                                    <label className="text-xs uppercase font-bold text-gray-500">Judul Tes</label>
                                    <input type="text" className="w-full mt-1 bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase font-bold text-gray-500">Waktu Mulai</label>
                                        <input type="datetime-local" className="w-full mt-1 bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none" value={examForm.start_time} onChange={e => setExamForm({...examForm, start_time: e.target.value})} required />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase font-bold text-gray-500">Waktu Selesai</label>
                                        <input type="datetime-local" className="w-full mt-1 bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none" value={examForm.end_time} onChange={e => setExamForm({...examForm, end_time: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase font-bold text-gray-500">Tipe Tes</label>
                                        <select className="w-full mt-1 bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none" value={examForm.type} onChange={e => setExamForm({...examForm, type: e.target.value})}>
                                            <option value="test">Test Standar (Benar/Salah)</option>
                                            <option value="archetype">Archetype (Skala 1-4)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase font-bold text-gray-500">Durasi (Menit)</label>
                                        <input type="number" className="w-full mt-1 bg-black/50 border border-gray-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none" value={examForm.duration_minutes} onChange={e => setExamForm({...examForm, duration_minutes: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <input type="checkbox" className="w-5 h-5 accent-amber-500" checked={examForm.show_result} onChange={e => setExamForm({...examForm, show_result: e.target.checked})} />
                                    <div>
                                        <p className="text-sm font-bold text-white">Tampilkan Hasil Ke Peserta</p>
                                        <p className="text-[10px] text-gray-400">Jika dicentang, peserta dapat melihat skor/archetype mereka segera setelah selesai.</p>
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-4">
                                    <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all">Simpan Pengaturan</button>
                                    <button type="button" onClick={() => setIsCreatingOrEditing(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all">Batal</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Questions Batch Editor */}
                    {editingQuestionsExam && (
                        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl relative animate-in fade-in duration-300">
                             <div className="flex justify-between items-end border-b border-gray-800 pb-6 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Edit3 className="text-blue-500" /> Edit Soal: <span className="text-amber-500">{editingQuestionsExam.title}</span></h2>
                                    <p className="text-gray-400 mt-1 text-sm">Tambahkan atau ubah soal di bawah ini, lalu klik Simpan pada bagian paling bawah halaman.</p>
                                </div>
                                <button onClick={() => setEditingQuestionsExam(null)} className="p-2 bg-gray-800 text-gray-400 hover:text-white rounded-xl"><X size={20}/></button>
                             </div>

                             <div className="space-y-8">
                                 {questionsForm.map((q, qIndex) => (
                                     <div key={qIndex} className="bg-black/40 border border-gray-700 p-6 rounded-2xl relative shadow-lg">
                                        <span className="absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center bg-gray-800 border-2 border-gray-700 text-white font-black rounded-full text-xs">{qIndex + 1}</span>
                                        <button onClick={() => handleRemoveQuestionFromForm(qIndex)} title="Hapus Soal Ini" className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                        
                                        <div className="space-y-4 mt-2 pr-8">
                                            <div className="flex items-center gap-4 mb-2">
                                                <label className="text-[10px] uppercase font-bold text-gray-500">Tipe Soal:</label>
                                                <div className="flex bg-gray-800 rounded-lg p-1">
                                                    <button 
                                                        onClick={() => handleTypeChange(qIndex, 'pg')}
                                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${q.type === 'pg' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                                    >
                                                        Pilihan Ganda
                                                    </button>
                                                    <button 
                                                        onClick={() => handleTypeChange(qIndex, 'essay')}
                                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${q.type === 'essay' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                                    >
                                                        Essay
                                                    </button>
                                                </div>
                                            </div>

                                            <textarea 
                                                placeholder="Tulis pertanyaan di sini..."
                                                className="w-full bg-black/60 border border-gray-700 rounded-xl p-4 text-white outline-none focus:border-blue-500 placeholder-gray-600 min-h-[100px]"
                                                value={q.question_text} onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                                            />
                                            
                                            {q.type === 'pg' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    {q.options.map((opt, optIndex) => (
                                                        <div key={optIndex} className={`flex items-center gap-3 bg-gray-900 border p-2 rounded-xl transition-all ${editingQuestionsExam.type !== 'archetype' && q.correct_answer === opt.key ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'border-gray-800'}`}>
                                                            <div className="flex flex-col items-center pl-2">
                                                                <span className={`text-xs font-black ${(editingQuestionsExam.type !== 'archetype' && q.correct_answer === opt.key) ? 'text-green-500' : 'text-gray-500'}`}>{opt.key}</span>
                                                                {editingQuestionsExam.type !== 'archetype' && (
                                                                    <input 
                                                                        type="radio" name={`correct_${qIndex}`} 
                                                                        checked={q.correct_answer === opt.key} 
                                                                        onChange={() => handleCorrectAnswerChange(qIndex, opt.key)}
                                                                        className="mt-1 cursor-pointer accent-green-500"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 flex gap-2 items-center">
                                                                <input 
                                                                    type="text" placeholder={`Opsi ${opt.key}`}
                                                                    className="bg-transparent border-none text-white w-full outline-none text-sm p-2"
                                                                    value={opt.val} onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                                                />
                                                                {editingQuestionsExam.type === 'archetype' && (
                                                                    <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-gray-700">
                                                                        <span className="text-[10px] font-black text-amber-500">SKOR:</span>
                                                                        <input type="number" className="w-10 bg-transparent text-white text-xs font-black text-center outline-none" value={q.weights?.[opt.key] || 0} 
                                                                               onChange={(e) => handleWeightChange(qIndex, opt.key, e.target.value)}/>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {q.type === 'essay' && (
                                                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl text-[10px] text-amber-500/80 italic animate-in fade-in duration-300">
                                                    Mode Essay: Peserta akan diberikan kotak teks untuk mengisi jawaban secara bebas. Nilai tidak dihitung secara otomatis.
                                                </div>
                                            )}
                                        </div>
                                     </div>
                                 ))}

                                 {questionsForm.length === 0 && (
                                     <div className="text-center py-10 bg-black/20 border-2 border-dashed border-gray-800 rounded-2xl text-gray-500 font-medium">
                                         Belum ada soal pada tes ini. Klik "Tambah Soal Baru" di bawah.
                                     </div>
                                 )}

                                 <button onClick={handleAddQuestionToForm} className="w-full border-2 border-dashed border-gray-700 text-gray-400 hover:border-amber-500 hover:text-amber-500 py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-all">
                                     <Plus size={24} /> Tambah Soal Baru
                                 </button>
                             </div>

                             <div className="sticky bottom-6 mt-10 p-4 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-2xl flex justify-between items-center shadow-2xl">
                                <span className="text-gray-400 text-sm font-medium ml-2">Total Soal: <span className="text-white font-black">{questionsForm.length}</span></span>
                                <div className="flex gap-4">
                                    <button onClick={() => setEditingQuestionsExam(null)} className="px-6 py-2.5 rounded-xl text-white font-bold bg-gray-800 hover:bg-gray-700 transition-colors">Batal Edit</button>
                                    <button onClick={handleSaveQuestionsBatch} className="px-8 py-2.5 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
                                        <Save size={18} /> Simpan Seluruh Soal
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}

                    {/* Placeholder when nothing is selected */}
                    {!isCreatingOrEditing && !editingQuestionsExam && (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-700 border-2 border-dashed border-gray-800/50 rounded-3xl p-10">
                            <HelpCircle size={60} className="mb-4 opacity-10" />
                            <p className="text-lg">Buat atau pilih salah satu tes di panel kiri untuk mulai mengelola.</p>
                            <p className="text-sm mt-2 font-mono">Tips: Arahkan kursor ke tes untuk melihat opsi Edit & Hapus.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminExams;
