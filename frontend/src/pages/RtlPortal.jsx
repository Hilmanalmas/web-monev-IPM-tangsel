import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Camera, CheckCircle, Upload, Loader2, AlertCircle } from 'lucide-react';
import Webcam from 'react-webcam';

const RtlPortal = () => {
    const [slots, setSlots] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [answers, setAnswers] = useState({});
    
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
            if (resSlots.data.length > 0) {
                // Find first open slot by default
                const openSlot = resSlots.data.find(s => s.is_open);
                if (openSlot) setSelectedSlot(openSlot);
            }
        } catch(e) { console.error(e) }
        setLoading(false);
    };

    const capture = React.useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setSelfieImg(imageSrc);
        setCameraOpen(false);
    }, [webcamRef]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedSlot) return alert('Pilih slot RTL terlebih dahulu.');
        if (!selfieImg) return alert('Selfie bukti kegiatan wajib diunggah.');
        
        // Ensure all questions are answered
        if (Object.keys(answers).length !== questions.length) {
            return alert('Harap isi rencana/jawaban untuk semua indikator.');
        }

        const formData = new FormData();
        formData.append('period', selectedSlot.name);
        
        // Convert image logic (base64 to blob)
        const fetchRes = await fetch(selfieImg);
        const blob = await fetchRes.blob();
        formData.append('selfie', blob, 'rtl_selfie.jpg');

        // Append answers
        const formattedAnswers = Object.keys(answers).map(qId => ({
            question_id: qId,
            response_text: answers[qId]
        }));
        
        formattedAnswers.forEach((ans, index) => {
            formData.append(`responses[${index}][question_id]`, ans.question_id);
            formData.append(`responses[${index}][response_text]`, ans.response_text);
        });

        setSubmitting(true);
        try {
            await axios.post('/api/rtl/respond', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccessMessage(`RTL Sesi ${selectedSlot.name} berhasil disubmit!`);
            setTimeout(() => {
                setSuccessMessage('');
                setSelfieImg(null);
                setAnswers({});
                fetchData();
            }, 3000);
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal mengirim RTL!');
        }
        setSubmitting(false);
    };

    if (loading) return <div className="p-20 text-center font-bold text-pink-600 animate-pulse">Memuat Misi RTL...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 px-4 md:px-0">
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Target size={150} /></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <Target className="text-amber-400" /> Rencana Tindak Lanjut
                    </h1>
                    <p className="text-pink-100 text-lg">Catat aksi nyatamu dan lampirkan bukti foto untuk komitmen berkepanjangan.</p>
                </div>
            </div>

            {successMessage && (
                <div className="bg-green-100 text-green-700 p-6 rounded-2xl border border-green-200 font-bold flex items-center justify-center gap-2">
                    <CheckCircle size={24}/> {successMessage}
                </div>
            )}

            <div className="flex gap-4 overflow-x-auto pb-2 border-b">
                {slots.map(s => (
                    <button 
                        key={s.id} 
                        onClick={() => setSelectedSlot(s)}
                        disabled={!s.is_open || s.is_filled}
                        className={`px-6 py-4 rounded-t-2xl font-bold whitespace-nowrap transition-all border-b-4
                            ${selectedSlot?.id === s.id ? 'bg-pink-50 border-pink-500 text-pink-600' : 'bg-white border-transparent text-gray-400'}
                            ${s.is_filled ? 'opacity-50 cursor-not-allowed' : (!s.is_open && 'opacity-50')}`}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-sm">{s.name}</span>
                            {s.is_filled ? (
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 rounded-full flex items-center gap-1"><CheckCircle size={10}/> SELESAI</span>
                            ) : s.is_open ? (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 rounded-full animate-pulse">TERBUKA</span>
                            ) : (
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 rounded-full">DITUTUP</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {selectedSlot && !selectedSlot.is_filled && selectedSlot.is_open && (
                <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 space-y-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold border-b pb-2 text-gray-800">1. Indikator Rencana Aksi</h2>
                        {questions.map((q, idx) => (
                            <div key={q.id} className="space-y-2">
                                <label className="block font-bold text-gray-700">{idx + 1}. {q.question_text}</label>
                                <textarea 
                                    rows="3" required
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-colors"
                                    placeholder="Tuliskan komitmen atau aksimu..."
                                    value={answers[q.id] || ''}
                                    onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-bold border-b pb-2 text-gray-800">2. Bukti Kegiatan (Selfie)</h2>
                        {!selfieImg ? (
                            <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center flex flex-col items-center gap-4 hover:bg-gray-100 transition">
                                {cameraOpen ? (
                                    <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-lg border-4 border-white relative">
                                        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "user" }} className="w-full" />
                                        <button type="button" onClick={capture} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-full shadow-2xl active:scale-95 transition">
                                            <Camera size={28}/>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={48} className="text-gray-300" />
                                        <div className="text-gray-500">Ambil selfie dokumentasi kegiatan nyatamu sebagai bukti!</div>
                                        <button type="button" onClick={() => setCameraOpen(true)} className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 flex items-center gap-2">
                                            <Camera size={20}/> Buka Kamera
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 bg-gray-50 p-6 rounded-2xl border">
                                <img src={selfieImg} className="w-48 h-48 object-cover rounded-2xl border-4 border-white shadow-xl rotate-2" alt="selfie" />
                                <button type="button" onClick={() => setSelfieImg(null)} className="text-pink-600 font-bold hover:underline text-sm">
                                    Ambil Ulang Foto
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <button type="submit" disabled={submitting} className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-xl active:scale-95 flex justify-center items-center gap-2 text-white ${submitting ? 'bg-pink-400' : 'bg-pink-600 hover:bg-pink-700'}`}>
                            {submitting ? <><Loader2 size={24} className="animate-spin"/> Mengirim Dokumen...</> : 'Kirim Laporan RTL'}
                        </button>
                    </div>
                </form>
            )}

            {slots.length === 0 && (
                <div className="bg-white p-8 rounded-3xl border text-center text-gray-500 shadow-sm flex flex-col items-center gap-3">
                    <AlertCircle size={40} className="text-gray-300"/>
                    <p>Sesi RTL belum diatur oleh Komando Pusat.</p>
                </div>
            )}
        </div>
    );
};
export default RtlPortal;
