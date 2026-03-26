import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Loader2, Lock } from 'lucide-react';
import logo from '../assets/logo.png';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login, logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = await login(username, password);
        
        if (result.success) {
            // Success call, but we should verify it is an admin
            // This logic relies on the fact that if a non-admin logs in, 
            // the ProtectedRoute or similar will handle it, but for better UX:
            // We can check the role here if we return it in the login response
            navigate('/admin');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen fixed inset-0 z-[-1] bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full p-8 relative z-10">
                <div className="absolute top-0 left-0 w-full h-2 bg-gray-900"></div>
                
                <div className="text-center mb-8 pt-4">
                    <img src={logo} alt="PD IPM Logo" className="h-20 mx-auto mb-6 object-contain"/>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Lock size={20} className="text-amber-600" />
                        <h2 className="text-3xl font-extrabold text-gray-800 uppercase tracking-tight">Admin Login</h2>
                    </div>
                    <p className="text-gray-500 font-medium">Sistem Monitoring & Evaluasi</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Username</label>
                        <input 
                            type="text" 
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium"
                            placeholder="Username admin"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-4 px-4 rounded-xl transition-transform transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Access Admin Panel"}
                    </button>
                    
                    <div className="text-center mt-6">
                        <button 
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-sm font-semibold text-amber-600 hover:text-amber-700"
                        >
                            &larr; Back to User Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
