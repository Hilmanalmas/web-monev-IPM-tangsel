import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Camera, ClipboardEdit, BookOpen, ShieldAlert, Users, Eye, ClipboardCheck, BarChart3, Gamepad2, Activity, Star, Instagram, Phone, Mail, Youtube, Twitter, MapPin, Heart } from 'lucide-react';
import logo from '../assets/logo-monev.png';
import pdIpmLogo from '../assets/logo.png';

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
        navItems.push({ path: '/rtl', label: 'RTL', icon: <ClipboardCheck size={22} /> });
        navItems.push({ path: '/surveys', label: 'Manito Master', icon: <ClipboardEdit size={22} /> });
        navItems.push({ path: '/exams', label: 'Test', icon: <BookOpen size={22} /> });
    }

    if (user.role === 'admin') {
        navItems.push({ path: '/admin', label: 'Statistik', icon: <ShieldAlert size={22} /> });
        navItems.push({ path: '/admin/users', label: 'Pasukan', icon: <Users size={22} /> });
        navItems.push({ path: '/admin/attendance', label: 'Absensi', icon: <Camera size={22} /> });
        navItems.push({ path: '/admin/surveys', label: 'Manito Master', icon: <ClipboardCheck size={22} /> });
        navItems.push({ path: '/admin/rtl', label: 'RTL', icon: <ClipboardEdit size={22} /> });
        navItems.push({ path: '/admin/exams', label: 'Test', icon: <BookOpen size={22} /> });
        navItems.push({ path: '/admin/games', label: 'Set Games', icon: <Gamepad2 size={22} /> });
        navItems.push({ path: '/admin/practice', label: 'Set Praktek', icon: <Activity size={22} /> });
        navItems.push({ path: '/admin/ibadah', label: 'Set Ibadah', icon: <Star size={22} /> });
    }

    if (user.role === 'observer' || user.role === 'admin') {
        navItems.push({ path: '/observer', label: 'Markas Penilaian', icon: <Eye size={22} /> });
    }

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full shadow-sm z-10">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <img src={logo} alt="PD IPM Logo" className="h-10 w-10 object-contain" />
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
                        <img src={logo} alt="PD IPM Logo" className="h-8 w-8 object-contain" />
                        <span className="font-black text-gray-800 tracking-tight">MONEV</span>
                    </div>
                    <button onClick={handleLogout} className="text-red-500 p-2 bg-red-50 rounded-lg"><LogOut size={18} /></button>
                </div>

                <div className="p-4 md:p-8 w-full transition-all flex-1">
                    {children}
                </div>

                {/* Footer Section - New Professional Design */}
                <footer className="bg-[#0f172a] text-gray-300 pt-16 pb-8 px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 px-4">
                            
                            {/* Left Column: Mission */}
                            <div className="space-y-8">
                                <div className="flex gap-4 items-center">
                                     <img src={pdIpmLogo} alt="PD IPM" className="h-14 w-auto object-contain" />
                                     <img src={logo} alt="MONEV" className="h-14 w-auto object-contain" />
                                </div>
                                <p className="text-sm leading-relaxed text-gray-400 font-medium max-w-sm">
                                    Ikatan Pelajar Muhammadiyah (IPM) Tangerang Selatan adalah organisasi pergerakan, dakwah amal makruf nahi mungkar yang beraqidah Islam, bersumber pada Al-Qur'an dan As-Sunnah di kalangan pelajar.
                                </p>
                                <div className="flex gap-4">
                                    {[
                                        { icon: <Instagram size={18}/>, link: '#' },
                                        { icon: <Youtube size={18}/>, link: '#' },
                                        { icon: <Twitter size={18}/>, link: '#' }
                                    ].map((s, i) => (
                                        <a key={i} href={s.link} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all">
                                            {s.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Middle Column: Links */}
                            <div className="md:pl-12">
                                <h4 className="text-white font-black uppercase tracking-widest text-lg mb-8 relative inline-block">
                                    Lainnya
                                    <span className="absolute -bottom-2 left-0 w-12 h-1 bg-amber-500 rounded-full"></span>
                                </h4>
                                <ul className="space-y-4 font-bold text-gray-400">
                                    {['Pendaftaran Kegiatan', 'Galeri Kegiatan', 'E-Voting'].map(link => (
                                        <li key={link}>
                                            <a href="#" className="hover:text-amber-500 flex items-center gap-2 transition-colors">
                                                <span className="text-amber-500">→</span> {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Right Column: Contact */}
                            <div>
                                <h4 className="text-white font-black uppercase tracking-widest text-lg mb-8 relative inline-block">
                                    Hubungi Kami
                                    <span className="absolute -bottom-2 left-0 w-12 h-1 bg-amber-500 rounded-full"></span>
                                </h4>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <MapPin className="text-amber-500 shrink-0" size={24} />
                                        <p className="text-sm leading-relaxed font-medium">
                                            Gedung Muhammadiyah Tangerang Selatan<br/>
                                            Sekretariat: Jl. Desa Setu, Setu, Kec. Setu, Kota Tangerang Selatan, Banten 15314
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Phone className="text-amber-500 shrink-0" size={20} />
                                        <span className="font-bold">+62 857 1192 1089</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Mail className="text-amber-500 shrink-0" size={20} />
                                        <span className="font-bold underline decoration-amber-500/30 underline-offset-4">pdipmtangsel@gmail.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Copyright */}
                        <div className="pt-8 border-t border-gray-800 text-center space-y-4 px-4">
                            <p className="text-xs font-bold text-gray-500 tracking-wide">
                                © 2026 Pimpinan Daerah IPM Tangerang Selatan | Dikelola oleh Lembaga Media & Komunikasi IPM Tangerang Selatan
                            </p>
                            <p className="text-[11px] text-gray-600 flex items-center justify-center gap-1.5 font-bold uppercase tracking-tighter">
                                Designed with <Heart size={10} className="text-red-500 fill-red-500" /> for <span className="text-amber-500">Pelajar Anggrek.</span>
                            </p>
                        </div>
                    </div>
                </footer>
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
