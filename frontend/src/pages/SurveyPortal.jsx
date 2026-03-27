import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Send, Star, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

const SurveyPortal = () => {
    const [questions, setQuestions] = useState([]);
    const [target, setTarget] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [responses, setResponses] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [qRes, tRes, sRes] = await Promise.all([
                axios.get('/api/surveys/questions'),
                axios.get('/api/manito/target'),
                axios.get('/api/surveys/status')
            ]);
            setQuestions(qRes.data);
            setTarget(tRes.data.target);
            setSlots(sRes.data);

            // Auto-select first open and unfilled slot
            const openSlot = sRes.data.find(s => s.is_open && !s.is_filled);
            if (openSlot) setSelectedPeriod(openSlot.name);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPeriod || Object.keys(responses).length < questions.length) {
            alert("Harap isi semua penilaian.");
            return;
        }

        setSubmitting(true);
        try {
            await axios.post('/api/surveys/respond', {
                target_id: target.id,
                period: selectedPeriod,
                responses: Object.entries(responses).map(([qid, ans]) => ({
                    question_id: qid,
                    answer: ans
                }))
            });
            setSuccess(true);
        } catch (err) {
            alert(err.response?.data?.message || "Gagal mengirim penilaian.");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-8 border border-green-200 shadow-lg shadow-green-500/10">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-4 italic uppercase tracking-tight">Evaluasi Terkirim!</h1>
                <p className="text-gray-500 text-lg max-w-md mx-auto">Sasaran Manito-mu telah berhasil dievaluasi untuk sesi ini.</p>
                <button onClick={() => window.location.reload()} className="mt-10 bg-gray-950 text-white px-12 py-5 rounded-3xl font-black italic uppercase tracking-widest hover:bg-black transition-all shadow-2xl active:scale-95">Selesai</button>
            </div>
        );
    }

    if (!target) {
        return (
            <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-[3rem] text-gray-400 mt-10">
                <User size={48} className="mx-auto mb-4 opacity-10" />
                Belum ada target Manito yang ditentukan untukmu.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-10 animate-in slide-in-from-bottom duration-700 pb-20">
            {/* Header Target */}
            <header className="bg-gradient-to-br from-indigo-950 to-black rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-gray-800">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-32 h-32 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-inner">
                        <User size={60} className="text-indigo-300" />
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full border border-indigo-500/30">Target Manito-mu</span>
                        <h1 className="text-5xl font-black mt-4 leading-tight tracking-tight italic uppercase">{target.name}</h1>
                        <p className="text-indigo-200/60 mt-2 font-medium tracking-wide">{target.asal_instansi || 'Instansi Tidak Diketahui'} • {target.nip || '-'}</p>
                    </div>
                </div>
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute left-10 bottom-10 opacity-5">
                    <Calendar size={120} />
                </div>
            </header>

            {/* Dynamic Time Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((slot, idx) => (
                    <button 
                        key={idx}
                        disabled={!slot.is_open || slot.is_filled}
                        onClick={() => setSelectedPeriod(slot.name)}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group h-full ${selectedPeriod === slot.name ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/20 scale-[1.02]' : (slot.is_filled ? 'bg-gray-50 border-gray-100 text-gray-300' : (slot.is_open ? 'bg-white border-gray-200 text-gray-700 hover:border-amber-300' : 'bg-gray-100/50 border-transparent text-gray-400 opacity-50 cursor-not-allowed'))}`}
                    >
                        <div className="flex items-center gap-4">
                            <Clock size={24} className={slot.is_open && !slot.is_filled ? 'text-amber-500' : ''} />
                            <div className="text-left">
                                <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{slot.name}</p>
                                <p className="text-[10px] font-bold opacity-60 italic">{slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)} WIB</p>
                            </div>
                        </div>
                        {slot.is_filled && <CheckCircle2 size={24} className="text-green-500/50" />}
                    </button>
                ))}
            </div>

            {selectedPeriod ? (
                <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-10 md:p-16 shadow-2xl border border-gray-50 space-y-20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-20"></div>
                    
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tight">Evaluasi Performa</h2>
                        <p className="text-gray-400 font-bold tracking-widest text-xs uppercase opacity-60">Sesi {selectedPeriod}</p>
                    </div>

                    <div className="space-y-20">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="space-y-10 animate-in slide-in-from-left duration-300" style={{ animationDelay: `${idx * 150}ms` }}>
                                <div className="flex items-start gap-8">
                                    <span className="text-5xl font-black text-gray-900/5 font-mono leading-none">{idx + 1}</span>
                                    <p className="text-2xl font-black text-gray-800 leading-tight tracking-tight uppercase italic">{q.question_text}</p>
                                </div>

                                <div className="flex justify-between max-w-xl mx-auto p-5 bg-gray-50/50 rounded-[3rem] border-2 border-gray-100/50 relative group">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setResponses({...responses, [q.id]: num})}
                                            className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] border-4 flex flex-col items-center justify-center transition-all ${responses[q.id] === num ? 'bg-black border-black text-white shadow-2xl scale-110 rotate-3' : 'bg-white border-gray-100 text-gray-300 hover:border-amber-400 hover:text-amber-500'}`}
                                        >
                                            <span className="text-3xl font-black italic">{num}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        disabled={submitting}
                        className="w-full bg-gray-950 hover:bg-black text-white py-7 rounded-[2.5rem] text-3xl font-black italic uppercase tracking-widest transition-all flex items-center justify-center gap-5 shadow-2xl shadow-gray-950/40 active:scale-95 disabled:opacity-50"
                    >
                        <Send size={32} /> {submitting ? 'Mengirim Data...' : 'Kirim Sekarang'}
                    </button>
                </form>
            ) : (
                <div className="text-center py-20 px-10 bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-gray-100">
                    <AlertCircle size={64} className="mx-auto mb-8 text-amber-500 opacity-20" />
                    <h3 className="text-2xl font-black text-gray-700 uppercase italic">Waktu Evaluasi Belum Tersedia</h3>
                    <p className="text-gray-400 mt-3 max-w-sm mx-auto font-medium">Harap tunggu hingga jendela waktu evaluasi dibuka oleh instruktur, atau pilih sesi yang tersedia di atas.</p>
                </div>
            )}
        </div>
    );
};

export default SurveyPortal;
