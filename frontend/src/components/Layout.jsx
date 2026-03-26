import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Camera, ClipboardEdit, BookOpen, ShieldAlert, Users, Eye } from 'lucide-react';
import logo from '../assets/logo.png';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const isAdmin = user?.role === 'admin';
        await logout();
        navigate(isAdmin ? '/admin/login' : '/login');
    };

    if (!user) return <>{children}</>;

    const navItems = [];
    navItems.push({ path: '/', label: 'Dasbor', icon: <Home size={22} /> });

    if (user.role === 'peserta') {
        navItems.push({ path: '/attendance', label: 'Absensi', icon: <Camera size={22} /> });
        navItems.push({ path: '/evaluation', label: 'Manito', icon: <ClipboardEdit size={22} /> });
        navItems.push({ path: '/ibadah', label: 'Ibadah', icon: <BookOpen size={22} /> });
    }

    if (user.role === 'admin') {
        navItems.push({ path: '/admin', label: 'Statistik', icon: <ShieldAlert size={22} /> });
        navItems.push({ path: '/admin/users', label: 'Target Manito', icon: <Users size={22} /> });
    }

    if (user.role === 'observer' || user.role === 'admin') {
        navItems.push({ path: '/observer', label: 'Nilai Kognitif', icon: <Eye size={22} /> });
    }

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full shadow-sm z-10">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <img src={logo} alt="PD IPM Logo" className="h-10 w-10 object-contain"/>
                    <div>
                        <span className="font-black text-gray-800 tracking-tight block leading-none">MONEV</span>
                        <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Pelajar Anggrek</span>
                    </div>
                </div>
                
                <div className="p-4 flex-1 space-y-2 overflow-y-auto">
                    {navItems.map(item => (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${location.pathname === item.path ? 'bg-amber-100 text-amber-600 shadow-sm transform scale-[1.02]' : 'text-gray-500 hover:bg-gray-50 hover:text-amber-500'}`}
                        >
                            {item.icon} {item.label}
                        </Link>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="mb-4 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 text-sm">
                        <p className="font-bold text-gray-800 truncate">{user.name}</p>
                        <p className="text-gray-400 capitalize text-xs">{user.role}</p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all">
                        <LogOut size={20} /> Keluar Sandi
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 pb-24 md:pb-0 w-full min-h-screen flex flex-col">
                <div className="md:hidden bg-white p-4 border-b border-gray-100 flex justify-between items-center shadow-sm sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="PD IPM Logo" className="h-8 w-8 object-contain"/>
                        <span className="font-black text-gray-800 tracking-tight">MONEV</span>
                    </div>
                     <button onClick={handleLogout} className="text-red-500 p-2 bg-red-50 rounded-lg"><LogOut size={18}/></button>
                </div>
                
                <div className="p-4 md:p-8 w-full transition-all flex-1">
                    {children}
                </div>
            </main>

            {/* Bottom Nav (Mobile) */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-20 flex justify-around p-2 pb-safe">
                {navItems.map(item => (
                    <Link 
                        key={item.path} 
                        to={item.path}
                        className={`flex flex-col items-center p-2 rounded-xl transition-all ${location.pathname === item.path ? 'text-amber-500 font-bold bg-amber-50' : 'text-gray-400 font-medium'}`}
                    >
                        {item.icon}
                        <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};
export default Layout;
