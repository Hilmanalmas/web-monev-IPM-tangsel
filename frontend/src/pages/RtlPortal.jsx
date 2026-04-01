import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Camera, CheckCircle, Upload, Loader2, AlertCircle, Lock, ClipboardCheck } from 'lucide-react';
import Webcam from 'react-webcam';

const RtlPortal = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [rtlActive, setRtlActive] = useState(false);
    const [rtlFilled, setRtlFilled] = useState(false);

    const [answers, setAnswers] = useState({});

    // Selfie RTL (separate from attendance selfie)
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
            const [resStatus, resQ] = await Promise.all([
                axios.get('/api/rtl/status'),
                axios.get('/api/rtl/questions')
            ]);
            setRtlActive(resStatus.data.is_active);
            setRtlFilled(resStatus.data.is_filled);
            setQuestions(resQ.data);
        } catch (e) { console.error(e) }
        setLoading(false);
    };

    const capture = React.useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setSelfieImg(imageSrc);
        setCameraOpen(false);
    }, [webcamRef]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selfieImg) return alert('Selfie RTL wajib diunggah sebagai bukti dokumentasi.');

        // Ensure all questions are answered
        if (Object.keys(answers).length !== questions.length) {
            return alert('Harap isi rencana/jawaban untuk semua indikator.');
        }

        // Convert image logic (base64 to blob for selfie_url)
        let selfieUrl = null;
        if (selfieImg) {
            // We send the base64 as a string to store
            selfieUrl = selfieImg;
        }

        const payload = {
            selfie_url: selfieUrl,
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

    // ============================================
    // STATE: RTL Belum Aktif (Admin belum mengaktifkan)
    // ============================================
    if (!rtlActive) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 px-4 md:px-0">
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Target size={150} /></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <Target className="text-amber-400" /> Rencana Tindak Lanjut
                        </h1>
                        <p className="text-pink-100 text-lg">Penilaian pasca kegiatan untuk komitmen berkepanjangan.</p>
                    </div>
                </div>

                <div className="bg-white p-10 md:p-16 rounded-3xl border-2 border-dashed border-gray-200 text-center shadow-sm flex flex-col items-center gap-6">
                    <div className="bg-gray-100 p-6 rounded-full">
                        <Lock size={56} className="text-gray-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-gray-700">Laman Belum Bisa Diakses</h2>
                        <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
                            Penilaian RTL akan dibuka setelah seluruh rangkaian kegiatan selesai. 
                            Komando Pusat akan mengaktifkan laman ini secara manual.
                        </p>
                    </div>
                    <div className="bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl text-sm font-bold border border-amber-200">
                        ⏳ Mohon tunggu pengumuman lebih lanjut dari panitia
                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // STATE: Sudah mengisi RTL
    // ============================================
    if (rtlFilled) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 px-4 md:px-0">
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Target size={150} /></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <Target className="text-amber-400" /> Rencana Tindak Lanjut
                        </h1>
                        <p className="text-pink-100 text-lg">Penilaian pasca kegiatan untuk komitmen berkepanjangan.</p>
                    </div>
                </div>

                <div className="bg-green-50 p-10 md:p-16 rounded-3xl border-2 border-green-200 text-center shadow-sm flex flex-col items-center gap-6">
                    <div className="bg-green-100 p-6 rounded-full">
                        <CheckCircle size={56} className="text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-green-700">Penilaian RTL Selesai!</h2>
                        <p className="text-green-600 text-lg max-w-md mx-auto leading-relaxed">
                            Terima kasih! Kamu sudah mengirimkan penilaian RTL beserta selfie dokumentasi. 
                            Datamu sudah tercatat oleh Komando Pusat.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // STATE: RTL Aktif & Belum Diisi — Form Penilaian + Selfie RTL
    // ============================================
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
                    <CheckCircle size={24} /> {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 space-y-8">
                {/* SECTION 1: Indikator Penilaian RTL */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold border-b pb-2 text-gray-800 flex items-center gap-2">
                        <ClipboardCheck size={22} className="text-pink-500" />
                        1. Indikator Rencana Aksi
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

                {/* SECTION 2: Selfie RTL (terpisah dari selfie absensi kegiatan) */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold border-b pb-2 text-gray-800 flex items-center gap-2">
                        <Camera size={22} className="text-pink-500" />
                        2. Selfie Dokumentasi RTL
                    </h2>
                    <p className="text-sm text-gray-500 bg-amber-50 p-3 rounded-xl border border-amber-100">
                        📸 Selfie ini <strong>khusus untuk RTL</strong> dan terpisah dari selfie absensi kegiatan. 
                        Ambil foto dirimu sebagai bukti dokumentasi pengisian RTL.
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

                {/* SUBMIT */}
                <div className="pt-6 border-t border-gray-100">
                    <button type="submit" disabled={submitting} className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-xl active:scale-95 flex justify-center items-center gap-2 text-white ${submitting ? 'bg-pink-400' : 'bg-pink-600 hover:bg-pink-700'}`}>
                        {submitting ? <><Loader2 size={24} className="animate-spin" /> Mengirim Dokumen...</> : 'Kirim Laporan RTL'}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default RtlPortal;
