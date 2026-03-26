import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
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
            // Re-fetch user to check role (AuthContext should have updated 'user')
            // If the user is an admin, they should not be here
            // Note: In a real app, the backend should ideally handle this via different guard/check if needed, 
            // but we can enforce it here.
            navigate('/');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen fixed inset-0 z-[-1] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full p-8 relative z-10">
                <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
                
                <div className="text-center mb-8 pt-4">
                    <img src={logo} alt="PD IPM Logo" className="h-20 mx-auto mb-6 object-contain"/>
                    <h2 className="text-3xl font-extrabold text-gray-800 uppercase tracking-tight">Login Portal</h2>
                    <p className="text-gray-500 mt-2 font-medium">Sistem Penilaian Shadow Partner</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                        <input 
                            type="text" 
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium"
                            placeholder="Masukkan username"
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
                        className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-4 rounded-xl transition-transform transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In securely"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
