import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const SelfieAttendance = () => {
    const webcamRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

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
                    setError("Location access is required for attendance. Please enable GPS permissions.");
                    setStatus('error');
                }
            );
        } else {
            setError("Geolocation is not supported by your browser.");
            setStatus('error');
        }
    };

    const submitAttendance = async () => {
        if (!imageSrc || !location) return;
        setStatus('uploading');
        setError(null);

        try {
            await axios.post('/api/attendance', {
                image: imageSrc,
                latitude: location.lat,
                longitude: location.lng,
                timestamp: new Date().toISOString()
            });
            setStatus('success');
        } catch (err) {
            console.error("Upload failed", err);
            setError(err.response?.data?.message || "Failed to record attendance. Please try again.");
            setStatus('error');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-6 w-full relative border-t-4 border-amber-500">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Selfie Attendance</h2>

            {status === 'success' ? (
                <div className="flex flex-col items-center justify-center p-10 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
                    <p className="text-xl font-medium text-green-800">Attendance Recorded!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-3">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center shadow-inner border-2 border-dashed border-gray-300">
                        {status === 'location' && (
                            <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center text-amber-600">
                                <Loader2 className="animate-spin mb-2" size={32} />
                                <p className="font-semibold text-sm">Getting Location...</p>
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

                    <div className="flex justify-between items-center text-sm font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className={`flex items-center gap-2 ${location ? 'text-green-600' : 'text-gray-500'}`}>
                            {location ? <CheckCircle size={18} /> : <MapPin size={18} />}
                            <span>{location ? `Loc: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Waiting for capture...'}</span>
                        </div>
                    </div>

                    {!imageSrc ? (
                        <button
                            onClick={capture}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform transform active:scale-[0.98] shadow-lg"
                        >
                            <Camera size={22} /> Take Selfie
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                onClick={() => { setImageSrc(null); setError(null); setStatus('idle'); }}
                                className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-4 rounded-xl transition-colors outline-none"
                            >
                                Retake
                            </button>
                            <button
                                onClick={submitAttendance}
                                disabled={!location || status === 'uploading'}
                                className={`w-2/3 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform shadow-lg
                                    ${(!location || status === 'uploading') ? 'bg-amber-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-[0.98]'}`}
                            >
                                {status === 'uploading' ? <><Loader2 className="animate-spin" size={20} /> Uploading...</> : 'Confirm Attendance'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SelfieAttendance;
