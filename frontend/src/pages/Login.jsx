import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = await login(email, password);
        
        if (result.success) {
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
                    <img src="https://ipmtangsel.or.id/wp-content/uploads/2023/07/Logo-IPM-Tangsel.png" alt="IPM Logo" className="h-16 mx-auto mb-6 object-contain"/>
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium"
                            placeholder="Peserta, Observer, or Admin"
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
