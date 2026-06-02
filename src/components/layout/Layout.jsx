import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Receipt, PlusCircle, Settings, LogOut, Sparkles, Gem, ChevronDown } from 'lucide-react';
import { mockService } from '../../lib/mockService';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/add', label: 'Add Expense', icon: PlusCircle },
];

export default function Layout() {
  const { profile, isAdmin, signOut, isDemoMode, refetchProfile } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleToggleDemoRole = async () => {
    if (!isDemoMode || !profile) return;
    const newRole = profile.role === 'admin' ? 'member' : 'admin';
    await mockService.profiles.updateRole(profile.id, newRole);
    refetchProfile();
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 flex flex-col">

      {/* ── Demo Banner ── */}
      {isDemoMode && (
        <div className="relative z-50 flex items-center justify-center gap-3 px-4 py-2.5 text-xs font-semibold"
          style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.9), rgba(234,88,12,0.9))', backdropFilter: 'blur(8px)' }}>
          <Sparkles className="w-3.5 h-3.5 text-slate-800 animate-spin" />
          <span className="text-slate-800">Running in <strong>Live Demo Mode</strong> (Offline Local DB)</span>
          <button onClick={handleToggleDemoRole}
            className="bg-black/10 hover:bg-black/20 text-slate-800 font-extrabold px-3 py-1 rounded-full border border-white/30 transition-all active:scale-95 cursor-pointer text-[10px] uppercase tracking-widest">
            Switch to {profile?.role === 'admin' ? 'Member' : 'Admin'}
          </button>
        </div>
      )}

      {/* ── Top Navbar ── */}
      <nav className="nav-glass sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
            <Gem className="w-4.5 h-4.5 text-slate-800" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-slate-800 text-base tracking-tight leading-none block">Hasheema's</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-500 leading-none">Wedding Registry</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-700'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                style={isActive ? { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' } : { border: '1px solid transparent' }}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : ''}`} />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link to="/admin"
              className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                location.pathname === '/admin'
                  ? 'text-indigo-700'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              style={location.pathname === '/admin' ? { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' } : { border: '1px solid transparent' }}>
              <Settings className={`w-4 h-4 ${location.pathname === '/admin' ? 'text-indigo-600' : ''}`} />
              Admin
            </Link>
          )}
        </div>

        {/* Right: User Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-2xl cursor-pointer transition-all hover:bg-slate-100"
              style={{ border: '1px solid rgba(148, 163, 184, 0.2)' }}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-extrabold text-white uppercase"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }}>
                {profile?.full_name?.charAt(0) || '?'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">{profile?.full_name || 'User'}</p>
                <p className="text-[10px] font-semibold leading-tight text-slate-500">
                  {profile?.role === 'admin' ? '👑 Administrator' : 'Family Member'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden z-50 animate-slide-up bg-white border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]">
                <div className="px-4 py-3 border-b border-slate-50 sm:hidden">
                  <p className="text-xs font-bold text-slate-900 truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{profile?.role === 'admin' ? '👑 Administrator' : 'Family Member'}</p>
                </div>
                <button 
                  onClick={async () => { 
                    setShowUserMenu(false); 
                    await signOut(); 
                    window.location.href = '/login';
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3.5 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer active:bg-rose-100"
                >
                  <LogOut className="w-4 h-4 stroke-[2.5]" />
                  Sign Out safely
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-10 animate-fade-in">
        <Outlet />
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-2 pb-6"
        style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(226,232,240,0.8)' }}>
        <div className="flex justify-around items-end relative">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            if (item.to === '/add') return null; // Handle FAB separately
            
            return (
              <Link key={item.to} to={item.to}
                className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all duration-300 ${
                  isActive ? 'text-indigo-600' : 'text-slate-500'
                }`}>
                <div className={`relative transition-transform duration-300 ${isActive ? 'translate-y-[-4px]' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {isActive && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600" />}
                </div>
                <span className={`text-[9px] font-bold tracking-wide transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Center FAB for Add Expense */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6">
            <Link to="/add"
              className="w-14 h-14 rounded-full flex items-center justify-center text-slate-800 shadow-xl transition-transform active:scale-90"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
              <PlusCircle className="w-7 h-7 stroke-2" />
            </Link>
          </div>

          {isAdmin && (
            <Link to="/admin"
              className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all duration-300 ${
                location.pathname === '/admin' ? 'text-indigo-600' : 'text-slate-500'
              }`}>
              <div className={`relative transition-transform duration-300 ${location.pathname === '/admin' ? 'translate-y-[-4px]' : ''}`}>
                <Settings className={`w-5 h-5 ${location.pathname === '/admin' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {location.pathname === '/admin' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600" />}
              </div>
              <span className={`text-[9px] font-bold tracking-wide transition-all duration-300 ${location.pathname === '/admin' ? 'opacity-100' : 'opacity-70'}`}>
                Admin
              </span>
            </Link>
          )}
        </div>
      </nav>

    </div>
  );
}
