import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Eye, Search, Target, Camera, BookOpen, Activity, Play, Star, 
    CheckCircle, RefreshCcw, Loader2, ChevronDown, FileText, Check, X 
} from 'lucide-react';

const ObserverDashboard = () => {
    const [pesertaList, setPesertaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDay, setCurrentDay] = useState(1);
    const [selectedDay, setSelectedDay] = useState(1);
    
    // Detail Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeTab, setActiveTab] = useState('kognitif'); // kognitif, games, practice, absensi
    
    // Tab Data States
    const [tabLoading, setTabLoading] = useState(true);
    const [examsData, setExamsData] = useState([]);
    const [expandedExam, setExpandedExam] = useState(null); // ID of expanded exam
    const [gamesData, setGamesData] = useState([]);
    const [practiceData, setPracticeData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [ibadahData, setIbadahData] = useState([]);

    // Form states for adding scores inline
    const [formScore, setFormScore] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formSlotId, setFormSlotId] = useState('');
    const [availableSlots, setAvailableSlots] = useState({ games: [], practice: [], ibadah: [] });
    const [scoringId, setScoringId] = useState(null); // to track which item is being scored
    const [submitStatus, setSubmitStatus] = useState('idle');

    useEffect(() => {
        const init = async () => {
            try {
                const res = await axios.get('/api/admin/settings');
                setCurrentDay(res.data.current_day);
                setSelectedDay(res.data.current_day);
            } catch (e) { console.error(e); }
            fetchPeserta();
        };
        init();
    }, []);

    useEffect(() => {
        fetchAvailableSlots();
    }, [selectedDay]);

    const fetchPeserta = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/observer/peserta');
            setPesertaList(res.data.peserta);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async () => {
        try {
            const res = await axios.get(`/api/observer/available-slots?day=${selectedDay}`);
            setAvailableSlots(res.data);
            // Default select the first slot if available
            setFormSlotId(''); 
        } catch (e) { console.error(e); }
    };

    const openDetail = async (user) => {
        setSelectedUser(user);
        setActiveTab('kognitif');
        fetchTabData(user.id, 'kognitif');
    };

    const closeDetail = () => {
        setSelectedUser(null);
        setExamsData([]);
        setGamesData([]);
        setPracticeData([]);
        setAttendanceData([]);
        setIbadahData([]);
    };

    const fetchTabData = async (userId, tab) => {
        setTabLoading(true);
        setFormScore('');
        setFormNotes('');
        setFormSlotId('');
        setScoringId(null);
        setSubmitStatus('idle');

        try {
            if (tab === 'kognitif') {
                const res = await axios.get(`/api/observer/peserta/${userId}/exams?day=${selectedDay}`);
                console.log("[DEBUG] Exams Data:", res.data.exams);
                setExamsData(res.data.exams || []);
            } else if (tab === 'games' || tab === 'practice' || tab === 'ibadah') {
                const res = await axios.get(`/api/observer/peserta/${userId}/games-practice?day=${selectedDay}`);
                setGamesData(res.data.games || []);
                setPracticeData(res.data.practice || []);
                setIbadahData(res.data.ibadah || []);
            } else if (tab === 'absensi') {
                const res = await axios.get(`/api/observer/peserta/${userId}/attendance?day=${selectedDay}`);
                const attendances = res.data.attendances || [];
                setAttendanceData(attendances);
            }
        } catch(error) {
            console.error('[DEBUG] Tab fetch error:', error.response || error);
        } finally {
            setTabLoading(false);
        }
    };

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        if (selectedUser) {
            fetchTabData(selectedUser.id, tab);
        }
    };

    const submitCognitive = async (submissionId = null) => {
        if (!formScore) return alert('Nilai wajib diisi (0-100)');
        setSubmitStatus('submitting');
        try {
            await axios.post('/api/observer/score/cognitive', {
                user_id: selectedUser.id,
                exam_submission_id: submissionId,
                score: formScore,
                notes: submissionId ? null : formNotes // Use notes as test name for manual input
            });
            setSubmitStatus('success');
            setTimeout(() => fetchTabData(selectedUser.id, 'kognitif'), 1000);
        } catch(e) {
            alert('Gagal menyimpan nilai');
            setSubmitStatus('idle');
        }
    };

    const submitGamePractice = async (type) => {
        if (!formSlotId || !formScore) return alert('Sesi/Slot dan nilai wajib diisi (0-100)');
        setSubmitStatus('submitting');
        let url = '';
        if (type === 'games') url = '/api/observer/score/games';
        if (type === 'practice') url = '/api/observer/score/practice';
        if (type === 'ibadah') url = '/api/observer/score/worship';

        try {
            await axios.post(url, {
                user_id: selectedUser.id,
                slot_id: formSlotId,
                score: formScore,
                notes: formNotes
            });
            setSubmitStatus('success');
            setTimeout(() => fetchTabData(selectedUser.id, activeTab), 1000);
        } catch(e) {
            alert('Gagal menyimpan nilai');
            setSubmitStatus('idle');
        }
    };

    const filteredPeserta = pesertaList.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (user.instansi || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-20 text-center font-bold text-indigo-600"><RefreshCcw className="animate-spin mx-auto mb-4" size={40}/> Memuat Daftar Target...</div>;

    const currentTypeSlots = availableSlots[activeTab] || [];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Eye size={150} /></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <Target className="text-amber-400" /> Markas Penilaian Pengawas
                    </h1>
                    <p className="text-indigo-100 text-lg max-w-2xl">Identifikasi target melalui selfie absensi & berikan penilaian tertarget sesuai jadwal yang telah diatur Admin.</p>
                </div>
            </div>

            {/* List Target */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-6 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800">Daftar Pasukan (Target)</h2>
                        <div className="flex bg-gray-200 p-1 rounded-xl items-center border border-gray-300">
                             <span className="px-3 text-xs font-bold text-gray-500 uppercase tracking-tighter">HARI:</span>
                             {[1, 2, 3, 4, 5].map(d => (
                                 <button
                                     key={d}
                                     onClick={() => setSelectedDay(d)}
                                     className={`w-8 h-8 rounded-lg text-sm font-black transition-all ${selectedDay === d ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-indigo-600'}`}
                                 >
                                     {d}
                                 </button>
                             ))}
                        </div>
                    </div>
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input type="text" placeholder="Cari nama/instansi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 outline-none focus:border-indigo-500 shadow-inner" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {filteredPeserta.map(user => (
                        <div key={user.id} onClick={() => openDetail(user)} className="bg-white border rounded-2xl p-5 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer flex gap-4 items-center group">
                            <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border">
                                {user.first_selfie ? (
                                    <img src={user.first_selfie} alt={user.name} className="w-full h-full object-cover" onError={(e)=>{e.target.style.display='none'}}/>
                                ) : (
                                    <Camera className="text-gray-300" size={28}/>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-gray-800 truncate group-hover:text-indigo-600">{user.name}</h3>
                                <p className="text-xs text-gray-400 uppercase tracking-wider truncate">{user.instansi || '-'}</p>
                            </div>
                        </div>
                    ))}
                    {filteredPeserta.length === 0 && <p className="col-span-full text-center p-8 text-gray-400 italic">Target tidak ditemukan.</p>}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-gray-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm pt-20">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        <div className="bg-indigo-600 px-6 py-4 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                {selectedUser.first_selfie && (
                                    <img src={selectedUser.first_selfie} className="w-12 h-12 rounded-lg object-cover border-2 border-indigo-400" onError={(e)=>{e.target.style.display='none'}}/>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                                    <p className="text-indigo-200 text-sm">Target yang sedang diinvestigasi (Hari {selectedDay})</p>
                                </div>
                            </div>
                            <button onClick={closeDetail} className="bg-indigo-800 hover:bg-indigo-900 p-2 rounded-xl font-bold transition-colors">X TUTUP</button>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex border-b overflow-x-auto shrink-0 bg-gray-50">
                            {[
                                { id: 'kognitif', label: 'Test Kognitif', icon: <BookOpen size={16}/> },
                                { id: 'games', label: 'Nilai Games', icon: <Play size={16}/> },
                                { id: 'practice', label: 'Nilai Praktek', icon: <Activity size={16}/> },
                                { id: 'ibadah', label: 'Nilai Ibadah', icon: <Star size={16}/> },
                                { id: 'absensi', label: 'Jejak Wajah', icon: <Camera size={16}/> }
                            ].map(t => (
                                <button key={t.id} onClick={() => handleTabSwitch(t.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-bold whitespace-nowrap border-b-2 transition-colors
                                    ${activeTab === t.id ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
                                >
                                    {t.icon} {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            {tabLoading ? (
                                <div className="py-20 flex justify-center text-indigo-500"><Loader2 className="animate-spin" size={40}/></div>
                            ) : (
                                <div className="space-y-6">
                                    
                                    {/* KOGNITIF */}
                                    {activeTab === 'kognitif' && (
                                        <>
                                            <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-6 items-center">
                                                <div className="bg-amber-100 p-4 rounded-2xl text-amber-600"><BookOpen size={30}/></div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-gray-800 uppercase tracking-tight">Input Nilai Kognitif Manual</h4>
                                                    <p className="text-xs text-amber-800 font-medium opacity-70">Gunakan form ini jika nilai diambil dari tes luar website (Tes Offline/Tertulis).</p>
                                                </div>
                                                <div className="flex gap-4 w-full md:w-auto items-end">
                                                    <div className="flex-1 md:w-48">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Nama Tes (Opsional)</label>
                                                        <input type="text" placeholder="Misal: Pre-test Tertulis" className="w-full p-3 border-2 border-white rounded-xl outline-none focus:border-amber-400 font-bold bg-white/50" 
                                                               value={formNotes} onChange={e=>setFormNotes(e.target.value)}/>
                                                    </div>
                                                    <div className="w-24">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Skor</label>
                                                        <input type="number" min="0" max="100" placeholder="0" className="w-full p-3 border-2 border-white rounded-xl outline-none focus:border-amber-400 font-black text-center text-lg bg-white/50" 
                                                               value={formScore} onChange={e=>setFormScore(e.target.value)}/>
                                                    </div>
                                                    <button onClick={() => submitCognitive(null)} disabled={submitStatus === 'submitting'}
                                                            className="bg-amber-500 text-white px-6 py-3.5 rounded-xl font-black hover:bg-amber-600 transition-all shadow-lg shadow-amber-200">
                                                        SIMPAN
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h5 className="font-black text-gray-400 text-[10px] uppercase tracking-widest pl-2">Riwayat Nilai Kognitif (Hari {selectedDay})</h5>
                                                {examsData.length === 0 ? (
                                                    <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold italic">
                                                        Belum ada rekam jejak nilai kognitif untuk hari ini.
                                                    </div>
                                                ) : (
                                                    examsData.map((ex, idx) => (
                                                        <div key={idx} className="flex flex-col gap-2">
                                                            <div className="bg-white p-5 rounded-2xl border shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-all cursor-pointer" 
                                                                 onClick={() => setExpandedExam(expandedExam === ex.submission_id ? null : ex.submission_id)}>
                                                                <div className="flex-1">
                                                                    <div className="flex flex-wrap items-center gap-3">
                                                                        <h4 className="font-black text-gray-800 uppercase tracking-tight">
                                                                            {ex.exam_title} 
                                                                            {ex.submission_id && <span className="text-indigo-600 ml-2">(Nilai Peserta: {ex.participant_score ?? 0})</span>}
                                                                        </h4>
                                                                        {ex.submission_id && (
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black text-white ${ex.archetype ? 'bg-purple-600' : 'bg-gray-400'}`}>
                                                                                {ex.archetype || 'Hasil Skor'}
                                                                            </span>
                                                                        )}
                                                                        {ex.submission_id && (
                                                                            <span className="text-[10px] font-black text-indigo-400 animate-pulse uppercase tracking-widest">• KLIK DETAIL JAWABAN</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[10px] text-gray-400 font-mono italic mt-1">
                                                                        {new Date(ex.submitted_at).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})} 
                                                                        {ex.submission_id ? ' (Online Exam)' : ' (Manual Entry)'}
                                                                    </p>
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-4">
                                                                    {ex.submission_id && ex.observer_score === null && (
                                                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                                            <input type="number" min="0" max="100" placeholder="Skor" className="w-20 p-2 border-2 border-indigo-100 rounded-xl text-center font-black" value={formScore} onChange={e=>setFormScore(e.target.value)}/>
                                                                            <button onClick={() => submitCognitive(ex.submission_id)} className="bg-indigo-600 text-white p-2 rounded-xl" title="Simpan Nilai Pengawas">
                                                                                <CheckCircle size={20}/>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="text-right flex flex-col items-end">
                                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-0.5 whitespace-nowrap">Skor Pengawas</label>
                                                                        <span className={`w-14 h-14 flex items-center justify-center rounded-2xl font-black text-2xl shadow-md ${ex.submission_id ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'}`}>
                                                                            {ex.observer_score ?? '-'}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    {ex.submission_id && (
                                                                        <ChevronDown className={`transition-transform duration-300 text-gray-400 ${expandedExam === ex.submission_id ? 'rotate-180 text-indigo-600' : ''}`} size={20}/>
                                                                    )}
                                                                </div>
                                                            </div>                                                            {/* EXPANDED ANSWERS */}
                                                            {expandedExam === ex.submission_id && (
                                                                <div className="bg-indigo-50/50 rounded-2xl p-6 border-2 border-indigo-100/50 mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                                    <div className="flex justify-between items-center mb-4">
                                                                        <h5 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
                                                                            <FileText size={14}/> Rekam Jejak Jawaban
                                                                        </h5>
                                                                        <span className="text-[10px] font-black bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded-lg">
                                                                            TOTAL JAWABAN: {ex.answers?.length || 0}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <div className="space-y-4">
                                                                        {(!ex.answers || ex.answers.length === 0) ? (
                                                                            <div className="text-center py-6 bg-white rounded-2xl border-2 border-dashed border-gray-100 italic space-y-2">
                                                                                <p className="text-xs font-bold text-gray-400">Database mengembalikan 0 jawaban untuk sesi ini.</p>
                                                                                {ex.debug_info && (
                                                                                    <div className="text-[10px] text-red-400 font-mono font-black uppercase tracking-widest bg-red-50 inline-block px-3 py-1 rounded-full border border-red-100">
                                                                                        DEBUG: Raw Answer In DB = {ex.debug_info.raw_answer_count}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            ex.answers.map((ans, aIdx) => (
                                                                                <div key={aIdx} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                                                                                    <p className="text-sm font-bold text-gray-800 mb-2">{aIdx + 1}. {ans.question_text || 'Pertanyaan tidak tersedia'}</p>
                                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                        <div className="p-2 rounded-lg bg-gray-100/50 border border-gray-100">
                                                                                            <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Jawaban Peserta</span>
                                                                                            <span className="font-bold text-gray-700">{ans.user_answer || '-'}</span>
                                                                                        </div>
                                                                                        {ans.correct_answer && (
                                                                                            <div className={`p-2 rounded-lg border ${ans.user_answer === ans.correct_answer ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                                                                                <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Kunci Jawaban</span>
                                                                                                <span className="font-black text-gray-900">{ans.correct_answer}</span>
                                                                                                {ans.user_answer === ans.correct_answer ? 
                                                                                                    <Check className="inline ml-2 text-green-600" size={14}/> : 
                                                                                                    <X className="inline ml-2 text-red-600" size={14}/>
                                                                                                }
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* GAMES, PRACTICE, IBADAH */}
                                    {(activeTab === 'games' || activeTab === 'practice' || activeTab === 'ibadah') && (
                                        <>
                                            <div className="bg-white p-8 rounded-3xl border-2 border-indigo-50 shadow-xl mb-8">
                                                <h4 className="font-black text-gray-800 uppercase tracking-tight mb-6">Tambahkan Penilaian {activeTab.toUpperCase()} (Hari {selectedDay})</h4>
                                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                                                    <div className="w-full md:flex-1">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Pilih Sesi/Program</label>
                                                        <select className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 font-bold appearance-none bg-white" 
                                                                value={formSlotId} onChange={e=>setFormSlotId(e.target.value)}>
                                                            <option value="">-- Pilih Sesi Terdaftar --</option>
                                                            {currentTypeSlots.map(s => (
                                                                <option key={s.id} value={s.id}>{s.name} ({s.start_time?.substring(0,5)} - {s.end_time?.substring(0,5)})</option>
                                                            ))}
                                                        </select>
                                                        {currentTypeSlots.length === 0 && <p className="text-[10px] text-red-500 mt-2 font-bold px-1">Belum ada sesi yang dibuat Admin untuk hari ini!</p>}
                                                    </div>
                                                    <div className="w-full md:w-32">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Skor 0-100</label>
                                                        <input type="number" min="0" max="100" placeholder="0" className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 font-black text-center text-xl" 
                                                               value={formScore} onChange={e=>setFormScore(e.target.value)}/>
                                                    </div>
                                                    <div className="w-full md:flex-1">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Catatan/Keterangan</label>
                                                        <input type="text" placeholder="Catatan tambahan (opsional)..." className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 font-medium" 
                                                               value={formNotes} onChange={e=>setFormNotes(e.target.value)}/>
                                                    </div>
                                                    <button onClick={() => submitGamePractice(activeTab)} 
                                                            disabled={!formSlotId || submitStatus === 'submitting'}
                                                            className="w-full md:w-auto h-[60px] bg-indigo-600 text-white px-8 rounded-2xl font-black hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-lg shadow-indigo-100">
                                                        {submitStatus === 'submitting' ? 'PROSES...' : 'SIMPAN'}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {(activeTab === 'games' ? gamesData : activeTab === 'practice' ? practiceData : ibadahData).map(g => (
                                                    <div key={g.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex justify-between items-center shadow-md relative overflow-hidden group hover:border-indigo-200 transition-all">
                                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 opacity-20 group-hover:opacity-100 transition-all"></div>
                                                        <div className="pl-3">
                                                            <span className="font-black text-gray-800 text-lg uppercase tracking-tighter leading-none block">{g.slot?.name || g.notes}</span>
                                                            <span className="text-[10px] text-gray-400 font-mono mt-1 block italic">{g.notes !== g.slot?.name ? g.notes : 'Penilaian Sesuai Sesi'}</span>
                                                        </div>
                                                        <span className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white font-black rounded-2xl text-2xl shadow-lg shadow-indigo-100">{g.score}</span>
                                                    </div>
                                                ))}
                                                {(activeTab === 'games' ? gamesData : activeTab === 'practice' ? practiceData : ibadahData).length === 0 && (
                                                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-300 font-black uppercase tracking-widest">
                                                        Belum ada rekam jejak penilaian.
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* ABSENSI (JEJAK WAJAH) */}
                                    {activeTab === 'absensi' && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                            {attendanceData.length === 0 ? (
                                                <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-300 font-black uppercase tracking-widest">
                                                    Tidak ada bukti visual absensi.
                                                </div>
                                            ) : (
                                                attendanceData.map(att => (
                                                        <div key={att.id} className="bg-white border-2 border-gray-50 rounded-3xl overflow-hidden shadow-xl hover:scale-[1.02] transition-transform">
                                                            <div className="w-full h-56 bg-gray-100 relative group">
                                                                <img
                                                                    src={att.selfie_url}
                                                                    alt="selfie"
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.style.display='none'; }}
                                                                />
                                                                <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs font-bold pointer-events-none -z-10">Gambar Rusak/Hilang</div>
                                                            </div>
                                                            <div className="p-4 bg-gray-900 text-white">
                                                                <p className="font-black text-sm tracking-widest text-amber-400 uppercase text-center">{att.slot?.name || att.type || 'Sesi Umum'}</p>
                                                                <p className="text-[10px] text-gray-500 font-mono mt-2 text-center border-t border-gray-800 pt-2">{att.recorded_at ? new Date(att.recorded_at).toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : ''}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ObserverDashboard;
