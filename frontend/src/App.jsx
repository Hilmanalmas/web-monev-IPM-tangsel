import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SelfieAttendance from './SelfieAttendance';
import EvaluationForm from './EvaluationForm';
import IbadahReport from './IbadahReport';
import { LogOut, Camera, ClipboardEdit, BookOpencover } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) {
        return (
            <div className="mt-10 text-center">
                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg">Login to Continue</Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl text-center">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <div className="text-left">
                    <h2 className="text-2xl font-bold text-gray-800">Welcome, {user.name}</h2>
                    <p className="text-gray-500 capitalize">{user.role} | {user.asal_instansi || 'No Instansi'}</p>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors font-medium">
                    <LogOut size={20} /> Logout
                </button>
            </div>

            {user.role === 'peserta' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link to="/attendance" className="bg-white hover:bg-blue-50 text-blue-800 font-bold py-6 px-4 border-2 border-blue-100 rounded-2xl shadow-sm transition-all flex flex-col items-center gap-3 hover:scale-[1.02]">
                        <Camera size={28} className="text-blue-500"/> Selfie Attendance
                    </Link>
                    <Link to="/evaluation" className="bg-white hover:bg-green-50 text-green-800 font-bold py-6 px-4 border-2 border-green-100 rounded-2xl shadow-sm transition-all flex flex-col items-center gap-3 hover:scale-[1.02]">
                        <ClipboardEdit size={28} className="text-green-500"/> Manito Evaluation
                    </Link>
                    <Link to="/ibadah" className="bg-white hover:bg-purple-50 text-purple-800 font-bold py-6 px-4 border-2 border-purple-100 rounded-2xl shadow-sm transition-all flex flex-col items-center gap-3 hover:scale-[1.02]">
                        <BookOpencover size={28} className="text-purple-500"/> Ibadah Report
                    </Link>
                </div>
            )}
            
            {user.role === 'admin' && (
                <div className="text-gray-500 italic mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    Admin Dashboard (Navigation links will appear here in Phase 5)
                </div>
            )}
            {user.role === 'observer' && (
                <div className="text-gray-500 italic mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    Observer Dashboard (Navigation links will appear here in Phase 6)
                </div>
            )}
        </div>
    );
};

function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
              <div className="max-w-4xl w-full mb-8 text-center">
                 <h1 className="text-4xl font-extrabold text-blue-900 mb-2 tracking-tight">Shadow Partner System</h1>
                 <p className="text-gray-500 font-medium text-lg">Manito Peer-Assessment Training Module</p>
              </div>
              <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/attendance" element={
                     <ProtectedRoute allowedRoles={['peserta']}>
                         <SelfieAttendance />
                     </ProtectedRoute>
                  } />
                  <Route path="/evaluation" element={
                     <ProtectedRoute allowedRoles={['peserta']}>
                         <EvaluationForm />
                     </ProtectedRoute>
                  } />
                  <Route path="/ibadah" element={
                     <ProtectedRoute allowedRoles={['peserta']}>
                         <IbadahReport />
                     </ProtectedRoute>
                  } />
              </Routes>
          </div>
        </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
