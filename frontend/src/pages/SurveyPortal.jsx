import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardEdit, User, Send, Star, MessageSquare } from 'lucide-react';

const SurveyPortal = () => {
    const [surveys, setSurveys] = useState([]);
    const [target, setTarget] = useState(null);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [responses, setResponses] = useState({}); // { question_id: answer }
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [surveyRes, targetRes] = await Promise.all([
                axios.get('/api/surveys'),
                axios.get('/api/manito/target')
            ]);
            setSurveys(surveyRes.data);
            setTarget(targetRes.data.target);
            if (surveyRes.data.length > 0) {
                setSelectedSurvey(surveyRes.data[0]);
            }
        } catch (err) {
            console.error("Error fetching survey data", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            target_id: target?.id,
            responses: Object.entries(responses).map(([qid, ans]) => ({
                question_id: qid,
                answer: ans
            }))
        };
        await axios.post(`/api/surveys/${selectedSurvey.id}/respond`, payload);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <Send size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Evaluasi Terkirim!</h2>
                <p className="text-gray-500">Terima kasih telah memberikan penilaian yang objektif untuk temanmu.</p>
            </div>
        );
    }

    if (!target) {
        return (
            <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
                Belum ada target Manito yang ditentukan untukmu.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in slide-in-from-bottom duration-500">
            {/* Target Info Header */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2rem] p-8 text-white shadow-xl shadow-amber-900/20 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30">
                        <User size={48} />
                    </div>
                    <div className="text-center md:text-left">
                        <span className="bg-white/20 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-white/10">Target Evaluasi Manito</span>
                        <h1 className="text-4xl font-black mt-2 leading-tight">{target.name}</h1>
                        <p className="text-amber-100 opacity-80">{target.asal_instansi} • {target.nip}</p>
                    </div>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {selectedSurvey ? (
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100">
                    <div className="mb-10 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedSurvey.title}</h2>
                        <p className="text-gray-500 mt-2">{selectedSurvey.description}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {selectedSurvey.questions.map((q, idx) => (
                            <div key={q.id} className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl font-black text-amber-500/30 font-mono leading-none">0{idx + 1}</span>
                                    <label className="text-lg font-bold text-gray-800 leading-tight">{q.question_text}</label>
                                </div>

                                {q.type === 'rating' ? (
                                    <div className="flex justify-between max-w-md mx-auto relative group">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setResponses({...responses, [q.id]: num})}
                                                className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${responses[q.id] == num ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30 scale-110' : 'bg-white border-gray-100 text-gray-400 hover:border-amber-200'}`}
                                            >
                                                <span className="text-xl font-black">{num}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 text-gray-700 focus:bg-white focus:border-amber-500 outline-none transition-all placeholder:text-gray-300"
                                        placeholder="Tuliskan alasan atau bukti konkret..."
                                        rows={4}
                                        value={responses[q.id] || ''}
                                        onChange={e => setResponses({...responses, [q.id]: e.target.value})}
                                        required
                                    />
                                )}
                            </div>
                        ))}

                        <button className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-3xl text-xl font-black transition-all shadow-xl shadow-gray-900/20 active:scale-95 flex items-center justify-center gap-3">
                            <Send size={24} /> Kirim Penilaian Manito
                        </button>
                    </form>
                </div>
            ) : (
                <div className="text-center py-20 text-gray-400">Belum ada angket aktif dari instruktur.</div>
            )}
        </div>
    );
};

export default SurveyPortal;
