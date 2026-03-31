import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Clock, CheckCircle, AlertCircle, Send, Play } from 'lucide-react';

const ExamPortal = () => {
    const [exams, setExams] = useState([]);
    const [activeExam, setActiveExam] = useState(null);
    const [answers, setAnswers] = useState({}); // { question_id: answer }
    const [timeLeft, setTimeLeft] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchExams();
    }, []);

    useEffect(() => {
        if (timeLeft === 0) handleSubmit();
        if (!timeLeft || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const fetchExams = async () => {
        const res = await axios.get('/api/exams');
        setExams(res.data);
    };

    const startExam = (exam) => {
        setActiveExam(exam);
        setTimeLeft(exam.duration_minutes * 60);
    };

    const handleSubmit = async () => {
        if (result) return;
        const res = await axios.post(`/api/exams/${activeExam.id}/submit`, { answers });
        setResult(res.data);
        setActiveExam(null);
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    if (result) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 max-w-xl mx-auto mt-10 animate-in zoom-in-95 duration-500">
                <div className="w-32 h-32 bg-amber-500/10 text-amber-600 rounded-full flex flex-col items-center justify-center mb-6">
                    <span className="text-4xl font-black">{result.score}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">POIN</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Selesai!</h2>
                <p className="text-gray-500 mb-8">Hasilmu telah dicatat oleh instruktur.</p>
                <button onClick={() => setResult(null)} className="bg-gray-900 text-white font-bold py-3 px-10 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95">Kembali ke Beranda</button>
            </div>
        );
    }

    if (activeExam) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md p-6 rounded-2xl flex justify-between items-center shadow-sm border border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{activeExam.title}</h2>
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Test Aktif</span>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2 bg-red-50 text-red-600 rounded-full border border-red-100">
                        <Clock size={20} className="animate-pulse" />
                        <span className="text-lg font-black font-mono">{formatTime(timeLeft)}</span>
                    </div>
                </header>

                <div className="space-y-8 pb-10">
                    {activeExam.questions.map((q, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-50 space-y-6">
                            <div className="flex gap-4">
                                <span className="text-2xl font-black text-gray-200 font-mono italic">{idx + 1}.</span>
                                <p className="text-xl font-medium text-gray-800 leading-snug">{q.question_text}</p>
                            </div>

                            {q.type === 'essay' ? (
                                <div className="ml-4">
                                    <textarea
                                        placeholder="Tuliskan jawaban Anda di sini..."
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 text-gray-800 outline-none focus:border-amber-500 min-h-[180px] transition-all text-lg"
                                        value={answers[q.id] || ''}
                                        onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                                    {(q.options || []).map(opt => (
                                        <button
                                            key={opt.key}
                                            onClick={() => setAnswers({...answers, [q.id]: opt.key})}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${answers[q.id] === opt.key ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 active:scale-[0.98]' : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-amber-200'}`}
                                        >
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${answers[q.id] === opt.key ? 'bg-white/20' : 'bg-white border text-gray-400'}`}>{opt.key}</span>
                                            <span className="font-medium">{opt.val}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    <button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-3xl text-2xl font-black transition-all shadow-xl shadow-green-900/10 active:scale-95 flex items-center justify-center gap-4">
                        <Send size={28} /> Selesaikan Test
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 leading-tight">Test & <br/><span className="text-amber-500 italic">Evaluasi Kognitif</span></h1>
                    <p className="text-gray-500 text-lg mt-2 font-medium">Selesaikan tugas harianmu untuk mendapatkan poin maksimal.</p>
                </div>
                <BookOpen size={80} className="text-gray-100 md:block hidden" />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                        <Clock className="mx-auto mb-4 opacity-10" size={48} />
                        <p>Belum ada test yang dijadwalkan saat ini.</p>
                    </div>
                )}
                {exams.map(ex => (
                    <div key={ex.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col hover:shadow-2xl hover:scale-[1.02] transition-all">
                        <div className="mb-6 flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{ex.title}</h2>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-4">{ex.description || 'Tidak ada deskripsi tambahan untuk tugas ini.'}</p>
                            
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 w-fit px-3 py-1 rounded-full border border-amber-100">
                                <Clock size={14} /> {ex.duration_minutes} Menit
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                <span className="block opacity-50">Berakhir pada:</span>
                                {new Date(ex.end_time).toLocaleDateString()} • {new Date(ex.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <button 
                                onClick={() => startExam(ex)}
                                className="bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-90 transition-all"
                            >
                                <Play size={20} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExamPortal;
