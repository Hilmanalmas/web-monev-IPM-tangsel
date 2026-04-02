import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Search, Target, Camera, BookOpen, Activity, Play, Star, CheckCircle, RefreshCcw, Loader2 } from 'lucide-react';

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
    const [gamesData, setGamesData] = useState([]);
    const [practiceData, setPracticeData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [ibadahData, setIbadahData] = useState([]);

    // Form states for adding scores inline
    const [formScore, setFormScore] = useState('');
    const [formNotes, setFormNotes] = useState('');
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
        setScoringId(null);
        setSubmitStatus('idle');

        try {
            if (tab === 'kognitif') {
                const res = await axios.get(`/api/observer/peserta/${userId}/exams?day=${selectedDay}`);
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

    const submitCognitive = async (submissionId) => {
        setSubmitStatus('submitting');
        try {
            await axios.post('/api/observer/score/cognitive', {
                user_id: selectedUser.id,
                exam_submission_id: submissionId,
                score: formScore
            });
            setSubmitStatus('success');
            setTimeout(() => fetchTabData(selectedUser.id, 'kognitif'), 1000);
        } catch(e) {
            alert('Gagal menyimpan nilai');
            setSubmitStatus('idle');
        }
    };

    const submitGamePractice = async (type) => {
        if (!formNotes || !formScore) return alert('Nama/Keterangan dan nilai wajib diisi (0-100)');
        setSubmitStatus('submitting');
        let url = '';
        if (type === 'games') url = '/api/observer/score/games';
        if (type === 'practice') url = '/api/observer/score/practice';
        if (type === 'ibadah') url = '/api/observer/score/worship';

        try {
            if (type === 'ibadah') {
                await axios.post(url, {
                    user_id: selectedUser.id,
                    score: formScore,
                    notes: formNotes
                });
            } else {
                await axios.post(url, {
                    user_id: selectedUser.id,
                    score: formScore,
                    notes: formNotes
                });
            }
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

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Eye size={150} /></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <Target className="text-amber-400" /> Markas Penilaian Pengawas
                    </h1>
                    <p className="text-indigo-100 text-lg max-w-2xl">Lakukan identifikasi target melalui foto selfie absensi mereka. Berikan nilai secara manual (0-100) untuk Test Kognitif, Games, dan Praktek.</p>
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
                                    <p className="text-indigo-200 text-sm">Target yang sedang diinvestigasi</p>
                                </div>
                            </div>
                            <button onClick={closeDetail} className="bg-indigo-800 hover:bg-indigo-900 p-2 rounded-xl font-bold">X Tutup</button>
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
                                            <p className="text-gray-500 mb-4">Daftar test yang telah dikerjakan target. Berikan nilai manual (0-100) setelah membaca jawaban mereka.</p>
                                            {examsData.length === 0 ? <p className="p-8 text-center bg-white rounded-xl border">Belum ada ujian yang dikerjakan.</p> : 
                                                examsData.map(ex => (
                                                    <div key={ex.submission_id} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-lg text-gray-800">{ex.exam_title}</h4>
                                                                <p className="text-xs text-gray-400">Disubmit: {new Date(ex.submitted_at).toLocaleString()}</p>
                                                            </div>
                                                            <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-3">
                                                                <span className="font-bold text-indigo-800">NILAI KOGNITIF:</span>
                                                                {ex.observer_score !== null ? (
                                                                     <span className="text-2xl font-black text-indigo-600">{ex.observer_score}</span>
                                                                ) : (
                                                                    scoringId === ex.submission_id ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <input type="number" min="0" max="100" className="w-20 p-2 border rounded-lg text-center font-bold" value={formScore} onChange={e=>setFormScore(e.target.value)}/>
                                                                            <button disabled={submitStatus === 'submitting'} onClick={() => submitCognitive(ex.submission_id)} className="bg-green-500 text-white p-2 rounded-lg"><CheckCircle size={18}/></button>
                                                                        </div>
                                                                    ) : (
                                                                        <button onClick={() => { setScoringId(ex.submission_id); setFormScore(''); }} className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-indigo-700">Skor (0-100)</button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Answers Spoilers */}
                                                        <div className="mt-4 border-t pt-4 space-y-3">
                                                            <h5 className="font-bold text-gray-600 text-sm uppercase tracking-wider">Rekaman Jawaban Target:</h5>
                                                            {ex.answers?.map((ans, i) => (
                                                                <div key={ans.id} className="bg-gray-50 p-3 rounded-lg border text-sm">
                                                                    <p className="font-medium text-gray-800">{i+1}. {ans.question?.question_text}</p>
                                                                    <p className="text-indigo-700 font-bold mt-1 bg-indigo-50 px-2 py-1 rounded inline-block">&gt; {ans.user_answer}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </>
                                    )}

                                    {/* GAMES, PRACTICE, IBADAH */}
                                    {(activeTab === 'games' || activeTab === 'practice' || activeTab === 'ibadah') && (
                                        <>
                                            <div className="bg-white p-6 rounded-2xl border shadow-sm mb-6">
                                                <h4 className="font-bold mb-4">Tambahkan Penilaian {activeTab.toUpperCase()} Baru</h4>
                                                <div className="flex gap-4 items-center">
                                                    <input type="text" placeholder={`Nama ${activeTab}...`} required className="flex-1 p-3 border rounded-xl outline-none focus:border-indigo-500" value={formNotes} onChange={e=>setFormNotes(e.target.value)}/>
                                                    <input type="number" min="0" max="100" placeholder="Skor 0-100" required className="w-32 p-3 border rounded-xl outline-none focus:border-indigo-500 font-bold text-center" value={formScore} onChange={e=>setFormScore(e.target.value)}/>
                                                    <button onClick={() => submitGamePractice(activeTab)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 whitespace-nowrap">
                                                        {submitStatus === 'submitting' ? 'Menyimpan...' : 'Simpan Nilai'}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {(activeTab === 'games' ? gamesData : activeTab === 'practice' ? practiceData : ibadahData).map(g => (
                                                    <div key={g.id} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
                                                        <span className="font-bold text-gray-700">{g.notes}</span>
                                                        <span className="flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-700 font-black rounded-lg text-xl">{g.score}</span>
                                                    </div>
                                                ))}
                                                {(activeTab === 'games' ? gamesData : activeTab === 'practice' ? practiceData : ibadahData).length === 0 && <p className="col-span-2 text-center p-8 text-gray-400">Belum ada riwayat penilaian.</p>}
                                            </div>
                                        </>
                                    )}

                                    {/* ABSENSI (JEJAK WAJAH) */}
                                    {activeTab === 'absensi' && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {attendanceData.length === 0 ? (
                                                <div className="col-span-full text-center p-8 bg-white border rounded space-y-2">
                                                    <p className="text-gray-400">Tidak ada rekaman selfie.</p>
                                                    <p className="text-xs text-gray-300">Pastikan peserta sudah melakukan absensi.</p>
                                                </div>
                                            ) : (
                                                attendanceData.map(att => (
                                                        <div key={att.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
                                                            <div className="w-full h-48 bg-gray-100 relative">
                                                                <img
                                                                    src={att.selfie_url}
                                                                    alt="selfie"
                                                                    className="w-full h-48 object-cover"
                                                                    onError={(e) => { e.target.style.display='none'; }}
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs -z-0">Foto tidak tersedia</div>
                                                            </div>
                                                            <div className="p-3 bg-gray-900 text-white text-center">
                                                                <p className="font-bold text-sm tracking-widest text-amber-400 uppercase">{att.slot?.name || att.type || 'Absen'}</p>
                                                                <p className="text-xs text-gray-400 mt-1">{att.recorded_at ? new Date(att.recorded_at).toLocaleString('id-ID') : ''}</p>
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
