import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
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
import Layout from './components/Layout';
import { Camera } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    if (!user) return null;

    return (
        <div className="w-full text-center space-y-8 animate-in zoom-in-95 duration-300 my-10">
            <div>
                 <h1 className="text-5xl font-extrabold text-gray-900 mb-2 tracking-tight uppercase">
                    Misi <span className="text-amber-500">Anggrek</span>
                 </h1>
                 <p className="text-gray-500 font-medium text-lg capitalize">Selamat bertugas, {user.role} {user.name}!</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
                <p className="text-xl text-gray-700 leading-relaxed">
                    Silakan gunakan menu navigasi untuk mengakses fitur-fitur yang ada. Pantau targetmu, kerjakan tugasmu, dan laporkan ibadahmu setiap hari! 🔥
                </p>
                {user.role === 'peserta' && (
                    <div className="mt-8 flex justify-center text-amber-500">
                        <Camera size={48} className="animate-bounce" />
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
            <Route path="/ibadah" element={<ProtectedRoute allowedRoles={['peserta']}><IbadahReport /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/observer" element={<ProtectedRoute allowedRoles={['admin', 'observer']}><ObserverDashboard /></ProtectedRoute>} />
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
