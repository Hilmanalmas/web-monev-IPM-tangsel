import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import SelfieAttendance from './SelfieAttendance';
import EvaluationForm from './EvaluationForm';
import IbadahReport from './IbadahReport';
import AdminDashboard from './pages/AdminDashboard';
import ObserverDashboard from './pages/ObserverDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminSurveys from './pages/AdminSurveys';
import AdminExams from './pages/AdminExams';
import AdminAttendance from './pages/AdminAttendance';
import AdminIbadah from './pages/AdminIbadah';
import AdminRtl from './pages/AdminRtl';
import AdminGames from './pages/AdminGames';
import AdminPractice from './pages/AdminPractice';
import ExamPortal from './pages/ExamPortal';
import SurveyPortal from './pages/SurveyPortal';
import RtlPortal from './pages/RtlPortal';
import ObserverIbadah from './pages/ObserverIbadah';
import Layout from './components/Layout';
import { Camera } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        if (user?.role === 'peserta') {
            fetchTasks();
        } else {
            setLoading(false);
        }
    }, [user]);
    
    const fetchTasks = async () => {
        try {
            // Using a simple fetch or axios if available (assumes axios is imported but let's use fetch just in case or we can import axios)
            const token = localStorage.getItem('token');
            const res = await fetch('/api/peserta/dashboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setTasks(data.tasks || []);
        } catch(e) { console.error(e) }
        setLoading(false);
    };

    if (!user) return null;

    return (
        <div className="w-full space-y-8 animate-in zoom-in-95 duration-300 my-4 md:my-10 max-w-4xl mx-auto px-4">
            <div className="text-center">
                 <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight uppercase">
                    Misi <span className="text-amber-500">Anggrek</span>
                 </h1>
                 <p className="text-gray-500 font-medium text-lg capitalize">Selamat bertugas, {user.role} {user.name}!</p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-amber-500">
                    <Camera size={150} />
                </div>
                
                <p className="text-xl text-gray-700 leading-relaxed relative z-10 text-center mb-8">
                    Silakan gunakan menu navigasi untuk mengakses fitur-fitur yang ada. Pantau targetmu, kerjakan tugasmu, dan selesaikan semuanya dengan gemilang! 🔥
                </p>
                
                {user.role === 'peserta' && !loading && (
                    <div className="relative z-10 mt-8 border-t border-gray-100 pt-8">
                        <h2 className="text-2xl font-black mb-6 text-gray-800 flex items-center gap-2">Misi Aktif  Saat Ini</h2>
                        {tasks.length === 0 ? (
                            <div className="bg-green-50 text-green-700 p-6 rounded-2xl border border-green-200 text-center font-bold">
                                Tidak ada misi wajib yang menunggumu saat ini. Waktunya istirahat!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tasks.map((task, idx) => (
                                    <div key={idx} className={`p-5 rounded-2xl border-2 flex items-center justify-between ${task.done ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-amber-400 shadow-md'}`}>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-widest text-amber-500">{task.type}</p>
                                            <p className="font-bold text-gray-800 text-lg leading-tight mt-1">{task.name}</p>
                                        </div>
                                        <div>
                                            {task.done ? (
                                                <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs">Selesai</span>
                                            ) : (
                                                <span className="font-bold text-red-500 bg-red-100 px-3 py-1 rounded-full text-xs animate-pulse">Menunggu</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const AppLayout = () => (
    <Layout>
        <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute allowedRoles={['peserta']}><SelfieAttendance /></ProtectedRoute>} />
            <Route path="/evaluation" element={<ProtectedRoute allowedRoles={['peserta']}><EvaluationForm /></ProtectedRoute>} />
            <Route path="/rtl" element={<ProtectedRoute allowedRoles={['peserta']}><RtlPortal /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/surveys" element={<ProtectedRoute allowedRoles={['admin']}><AdminSurveys /></ProtectedRoute>} />
            <Route path="/admin/exams" element={<ProtectedRoute allowedRoles={['admin']}><AdminExams /></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute allowedRoles={['admin']}><AdminAttendance /></ProtectedRoute>} />
            <Route path="/admin/ibadah" element={<ProtectedRoute allowedRoles={['admin']}><AdminIbadah /></ProtectedRoute>} />
            <Route path="/admin/rtl" element={<ProtectedRoute allowedRoles={['admin']}><AdminRtl /></ProtectedRoute>} />
            <Route path="/admin/games" element={<ProtectedRoute allowedRoles={['admin']}><AdminGames /></ProtectedRoute>} />
            <Route path="/admin/practice" element={<ProtectedRoute allowedRoles={['admin']}><AdminPractice /></ProtectedRoute>} />
            
            <Route path="/observer" element={<ProtectedRoute allowedRoles={['admin', 'observer']}><ObserverDashboard /></ProtectedRoute>} />
            
            <Route path="/exams" element={<ProtectedRoute allowedRoles={['peserta']}><ExamPortal /></ProtectedRoute>} />
            <Route path="/surveys" element={<ProtectedRoute allowedRoles={['peserta']}><SurveyPortal /></ProtectedRoute>} />
        </Routes>
    </Layout>
);


function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
           <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/*" element={<AppLayout />} />
           </Routes>
        </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
