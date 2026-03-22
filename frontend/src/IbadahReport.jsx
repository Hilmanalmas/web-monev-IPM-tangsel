import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpencover, Plus, CheckCircle, Loader2, AlertCircle, History } from 'lucide-react';

const IbadahReport = () => {
    const [activity, setActivity] = useState('');
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    
    const PRESET_ACTIVITIES = [
        "Shalat Subuh Berjamaah",
        "Shalat Dhuha",
        "Tilawah Al-Quran (1 Juz)",
        "Qiyamul Lail (Tahajud)",
        "Kajian Islam / Mentoring"
    ];

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/api/ibadah');
            setHistory(res.data.logs);
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!activity.trim()) {
             setError("Please select or enter an activity.");
             return;
        }

        setStatus('submitting');
        setError(null);

        try {
            await axios.post('/api/ibadah', { activity_name: activity });
            setStatus('success');
            setActivity('');
            fetchHistory(); // Refresh list after success
            
            // Reset success message after 3 seconds
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to submit Ibadah report.");
            setStatus('error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto w-full space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 border-t-4 border-amber-500">
                <div className="flex items-center gap-3 mb-6 border-b pb-4 border-gray-100">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><BookOpencover size={24} /></div>
                    <div>
                         <h2 className="text-2xl font-bold text-gray-800">Ibadah Self-Report</h2>
                         <p className="text-sm text-gray-500">Record your daily worship activities for bonus points (+2 limit per day/activity)</p>
                    </div>
                </div>

                {status === 'success' && (
                     <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2 border border-green-200">
                         <CheckCircle className="text-green-500" />
                         <span className="font-bold">Alhamdulillah, report submitted! (+2 points added)</span>
                     </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-3">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Select Activity</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {PRESET_ACTIVITIES.map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => { setActivity(preset); setError(null); }}
                                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left
                                        ${activity === preset ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-gray-50'}`}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">OR</span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        <input 
                            type="text" 
                            value={activity}
                            onChange={(e) => { setActivity(e.target.value); setError(null); }}
                            placeholder="Enter another worship activity manually..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={status === "submitting" || !activity.trim()}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-transform transform active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {status === "submitting" ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20}/>}
                        {status === "submitting" ? "Submitting..." : "Submit Report"}
                    </button>
                </form>
            </div>

            {/* History Section */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 border-t border-gray-100">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-3 border-gray-100">
                     <History size={18} className="text-amber-600" /> My Recent Reports
                 </h3>
                 
                 {history.length === 0 ? (
                     <p className="text-center text-gray-500 py-6 italic text-sm">No ibadah reported today. Start tracking!</p>
                 ) : (
                     <div className="space-y-3">
                         {history.map(log => (
                             <div key={log.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                 <div>
                                     <p className="font-semibold text-gray-800 text-sm">{log.activity_name}</p>
                                     <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                                 </div>
                                 <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                     +{log.bonus_points} pts
                                 </span>
                             </div>
                         ))}
                     </div>
                 )}
            </div>
        </div>
    );
}

export default IbadahReport;
