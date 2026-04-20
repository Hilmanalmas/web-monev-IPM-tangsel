import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Camera, CheckCircle, Upload, Loader2, Play, ClipboardCheck, Lock, Clock } from 'lucide-react';
import Webcam from 'react-webcam';

const RtlPortal = () => {
    const [slots, setSlots] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeSlot, setActiveSlot] = useState(null);
    const [answers, setAnswers] = useState({});

    // Selfie RTL
    const [cameraOpen, setCameraOpen] = useState(false);
    const [selfieImg, setSelfieImg] = useState(null);
    const webcamRef = React.useRef(null);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resSlots, resQ] = await Promise.all([
                axios.get('/api/rtl/slots'),
                axios.get('/api/rtl/questions')
            ]);
            setSlots(resSlots.data);
            setQuestions(resQ.data);
        } catch (e) { console.error(e) }
        setLoading(false);
    };

    const capture = React.useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setSelfieImg(imageSrc);
        setCameraOpen(false);
    }, [webcamRef]);

    const startRtl = (slot) => {
        setActiveSlot(slot);
        setAnswers({});
        setSelfieImg(null);
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selfieImg) return alert('Selfie RTL wajib diunggah sebagai bukti dokumentasi.');
        if (Object.keys(answers).length !== questions.length) {
            return alert('Harap isi rencana/jawaban untuk semua indikator.');
        }

        const payload = {
            slot_id: activeSlot.id,
            selfie_url: selfieImg,
            responses: Object.keys(answers).map(qId => ({
                question_id: qId,
                response_text: answers[qId]
            }))
        };

        setSubmitting(true);
        try {
            await axios.post('/api/rtl/respond', payload);
            setSuccessMessage('Penilaian RTL berhasil disubmit! Terima kasih atas partisipasimu.');
            setTimeout(() => {
                setActiveSlot(null);
                setSuccessMessage('');
                fetchData();
            }, 3000);
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal mengirim RTL!');
        }
        setSubmitting(false);
    };

    if (loading) return <div className="p-20 text-center font-bold text-pink-600 flex justify-center items-center gap-3"><Loader2 size={30} className="animate-spin" /> Memuat Misi RTL...</div>;

    // ============================================
    // STATE 2: Form Pengisian RTL
    // ============================================
    if (activeSlot) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 px-4 md:px-0 mt-6">
                <button onClick={() => setActiveSlot(null)} className="text-gray-500 hover:text-gray-800 font-bold mb-4">&larr; Kembali ke Daftar RTL</button>
                
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Target size={150} /></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black mb-2">{activeSlot.name}</h1>
                        <p className="text-pink-100 text-lg">Catat aksi nyatamu dan lampirkan bukti foto untuk komitmen berkepanjangan.</p>
                    </div>
                </div>

                {successMessage ? (
                    <div className="bg-green-100 text-green-700 p-8 rounded-3xl border border-green-200 text-center space-y-4">
                        <CheckCircle size={64} className="mx-auto text-green-500" />
                        <h2 className="text-2xl font-bold">{successMessage}</h2>
                        <p className="text-green-600">Anda akan diarahkan kembali...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 space-y-8">
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold border-b pb-2 text-gray-800 flex items-center gap-2">
                                <ClipboardCheck size={22} className="text-pink-500" /> 1. Indikator Rencana Aksi
                            </h2>
                            {questions.map((q, idx) => (
                                <div key={q.id} className="space-y-2">
                                    <label className="block font-bold text-gray-700">{idx + 1}. {q.question_text}</label>
                                    <textarea
                                        rows="3" required
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-colors"
                                        placeholder="Tuliskan komitmen atau aksimu..."
                                        value={answers[q.id] || ''}
                                        onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xl font-bold border-b pb-2 text-gray-800 flex items-center gap-2">
                                <Camera size={22} className="text-pink-500" /> 2. Selfie Dokumentasi RTL
                            </h2>
                            <p className="text-sm text-gray-500 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                📸 Selfie ini <strong>khusus untuk RTL</strong> dan terpisah dari absensi. 
                                Ambil foto dirimu sebagai bukti dokumentasi kegiatan ini.
                            </p>
                            {!selfieImg ? (
                                <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center flex flex-col items-center gap-4 hover:bg-gray-100 transition">
                                    {cameraOpen ? (
                                        <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-lg border-4 border-white relative">
                                            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "user" }} className="w-full" />
                                            <button type="button" onClick={capture} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-full shadow-2xl active:scale-95 transition">
                                                <Camera size={28} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={48} className="text-gray-300" />
                                            <div className="text-gray-500">Ambil selfie dokumentasi RTL sebagai bukti!</div>
                                            <button type="button" onClick={() => setCameraOpen(true)} className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 flex items-center gap-2">
                                                <Camera size={20} /> Buka Kamera RTL
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 bg-gray-50 p-6 rounded-2xl border">
                                    <img src={selfieImg} className="w-48 h-48 object-cover rounded-2xl border-4 border-white shadow-xl rotate-2" alt="selfie rtl" />
                                    <button type="button" onClick={() => setSelfieImg(null)} className="text-pink-600 font-bold hover:underline text-sm">
                                        Ambil Ulang Foto RTL
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <button type="submit" disabled={submitting} className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-xl active:scale-95 flex justify-center items-center gap-2 text-white ${submitting ? 'bg-pink-400' : 'bg-pink-600 hover:bg-pink-700'}`}>
                                {submitting ? <><Loader2 size={24} className="animate-spin" /> Mengirim Laporan...</> : 'Kirim Laporan RTL'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    }

    // ============================================
    // STATE 1: Daftar Slot RTL Tersedia
    // ============================================
    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8 animate-in fade-in duration-500 mt-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 leading-tight">Rencana <br/><span className="text-pink-500 italic">Tindak Lanjut</span></h1>
                    <p className="text-gray-500 text-lg mt-2 font-medium">Buktikan komitmenmu lewat langkah nyata.</p>
                </div>
                <Target size={80} className="text-pink-100 md:block hidden" />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {slots.length === 0 && (
                    <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center shadow-sm flex flex-col items-center gap-6">
                        <div className="bg-gray-100 p-6 rounded-full"><Lock size={56} className="text-gray-300" /></div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-gray-700">RTL Kosong</h2>
                            <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">Belum ada RTL yang ditugaskan untuk hari ini.</p>
                        </div>
                    </div>
                )}
                {slots.map(s => (
                    <div key={s.id} className={`bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col hover:shadow-2xl hover:scale-[1.02] transition-all ${s.is_filled || !s.is_open ? 'opacity-80' : ''}`}>
                        <div className="mb-6 flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-2xl font-bold text-gray-900 leading-tight flex-1">{s.name}</h2>
                                {s.is_filled && (
                                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 uppercase tracking-wider border border-green-200">
                                        <CheckCircle size={10} /> Selesai
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-pink-600 bg-pink-50 w-fit px-3 py-1 rounded-full border border-pink-100">
                                    <Clock size={14} /> {s.slot_date}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 w-fit px-3 py-1 rounded-full border border-purple-100">
                                    <Clock size={14} /> {s.start_time.substring(0,5)} - {s.end_time.substring(0,5)}
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                {s.is_filled ? (
                                    <span className="text-green-600">Laporan Diterima</span>
                                ) : s.is_open ? (
                                    <span className="text-pink-600 animate-pulse">Menunggu Laporan</span>
                                ) : (
                                    <span className="text-gray-400">Jadwal Belum/Sudah Lewat</span>
                                )}
                            </div>
                            <button 
                                onClick={() => !s.is_filled && s.is_open && startRtl(s)}
                                disabled={s.is_filled || !s.is_open}
                                className={`p-4 rounded-2xl shadow-lg transition-all ${s.is_filled || !s.is_open ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/30 active:scale-90'}`}
                            >
                                <Play size={22} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RtlPortal;
