import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, MapPin, CheckCircle, AlertCircle, Loader2, Clock, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const SelfieAttendance = () => {
    const webcamRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState('loading_slots');
    const [error, setError] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await axios.get('/api/attendance/slots');
            setSlots(res.data);
            
            // Auto-select open slot if exists
            const openSlot = res.data.find(s => s.is_open && !s.is_filled);
            if (openSlot) {
                setSelectedSlot(openSlot);
            }
            setStatus('idle');
        } catch (err) {
            console.error("Failed to fetch slots", err);
            setError("Gagal memuat sesi absensi. Silakan muat ulang halaman.");
            setStatus('error');
        }
    };

    const capture = useCallback(() => {
        const image = webcamRef.current.getScreenshot();
        setImageSrc(image);
        getLocation();
    }, [webcamRef]);

    const getLocation = () => {
        setStatus('location');
        setError(null);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setStatus('idle');
                },
                (err) => {
                    console.error("Error getting location", err);
                    setError("Akses lokasi diperlukan untuk absensi. Harap aktifkan izin GPS.");
                    setStatus('error');
                }
            );
        } else {
            setError("Geolocation tidak didukung oleh browser Anda.");
            setStatus('error');
        }
    };

    const submitAttendance = async () => {
        if (!imageSrc || !location || !selectedSlot) return;
        setStatus('uploading');
        setError(null);

        try {
            await axios.post('/api/attendance', {
                image: imageSrc,
                slot_name: selectedSlot.name,
                latitude: location.lat,
                longitude: location.lng,
                timestamp: new Date().toISOString()
            });
            setStatus('success');
        } catch (err) {
            console.error("Upload failed", err);
            setError(err.response?.data?.message || "Gagal merekam absensi. Silakan coba lagi.");
            setStatus('error');
        }
    };

    if (status === 'loading_slots') {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-amber-600 font-bold animate-pulse">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p>Memeriksa Sesi Absensi...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto space-y-6 px-4 py-8">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10"><Camera size={100} /></div>
                <div className="relative z-10 text-center">
                    <h1 className="text-3xl font-black mb-1">Selfie Attendance</h1>
                    <p className="text-amber-100 text-sm font-medium">Capture kehadiranmu dengan bukti foto dan lokasi.</p>
                </div>
            </div>

            {status === 'success' ? (
                <div className="bg-white p-10 rounded-3xl shadow-2xl border border-green-100 text-center flex flex-col items-center gap-6 animate-in zoom-in duration-300">
                    <div className="bg-green-100 p-6 rounded-full text-green-600 shadow-inner">
                        <CheckCircle size={60} strokeWidth={3} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-gray-800">Absensi Berhasil!</h2>
                        <p className="text-gray-500 font-medium">Kehadiranmu telah tercatat di basis data Markas Anggrek.</p>
                    </div>
                    <div className="bg-green-50 text-green-700 px-6 py-2 rounded-full font-bold text-sm border border-green-200">
                        Sesi: {selectedSlot?.name}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Slot Selection */}
                    <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock size={16} /> Sesi Absensi Aktif
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {slots.filter(s => s.is_open).length === 0 ? (
                                <div className="w-full bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold border border-red-100 flex items-center justify-center gap-2">
                                    <AlertCircle size={20} /> Tidak ada sesi absensi yang dibuka saat ini.
                                </div>
                            ) : (
                                slots.filter(s => s.is_open).map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => !s.is_filled && setSelectedSlot(s)}
                                        disabled={s.is_filled}
                                        className={`px-4 py-3 rounded-xl font-bold transition-all border-2 flex items-center gap-2
                                            ${selectedSlot?.id === s.id ? 'bg-amber-100 border-amber-500 text-amber-700 shadow-md transform scale-[1.05]' : 
                                              s.is_filled ? 'bg-gray-50 border-gray-100 text-green-600 opacity-70 cursor-not-allowed' :
                                              'bg-white border-gray-100 text-gray-500 hover:border-amber-300'}`}
                                    >
                                        {s.is_filled ? <CheckCircle size={18} /> : <div className={`w-3 h-3 rounded-full ${s.is_open ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />}
                                        {s.name}
                                        {s.is_filled && <span className="text-[10px] bg-green-200 px-2 rounded-full uppercase">Selesai</span>}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {selectedSlot && (
                        <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video shadow-2xl border-4 border-white ring-1 ring-gray-100">
                                {status === 'location' && (
                                    <div className="absolute inset-0 bg-gray-900/80 z-20 flex flex-col items-center justify-center text-amber-400">
                                        <Loader2 className="animate-spin mb-3" size={40} />
                                        <p className="font-black tracking-widest uppercase text-xs">Mengunci Lokasi...</p>
                                    </div>
                                )}

                                {!imageSrc ? (
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="object-cover w-full h-full"
                                        videoConstraints={{ facingMode: "user" }}
                                    />
                                ) : (
                                    <img src={imageSrc} alt="Selfie" className="object-cover w-full h-full" />
                                )}
                            </div>

                            <div className="flex items-center justify-between px-2">
                                <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${location ? 'text-green-600' : 'text-gray-400'}`}>
                                    <div className={`p-1.5 rounded-lg ${location ? 'bg-green-100' : 'bg-gray-100'}`}>
                                        <MapPin size={14} />
                                    </div>
                                    <span>{location ? `GPS AKTIF: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'MENUNGGU CAPTURE...'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                                    <ShieldCheck size={14} />
                                    <span>SECURE DATA</span>
                                </div>
                            </div>

                            {!imageSrc ? (
                                <button
                                    onClick={capture}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-[0_10px_20px_-10px_rgba(245,158,11,0.5)]"
                                >
                                    <Camera size={24} /> AMBIL SELFIE
                                </button>
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setImageSrc(null); setError(null); setStatus('idle'); }}
                                        className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-all"
                                    >
                                        ULANG
                                    </button>
                                    <button
                                        onClick={submitAttendance}
                                        disabled={!location || status === 'uploading'}
                                        className={`w-2/3 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl
                                            ${(!location || status === 'uploading') ? 'bg-amber-400 cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
                                    >
                                        {status === 'uploading' ? <><Loader2 className="animate-spin" size={20} /> MENGIRIM...</> : 'KONFIRMASI ABSENSI'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SelfieAttendance;
