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
    <div className="min-h-screen pb-24 md:pb-0 flex flex-col" style={{ fontFamily: 'Inter, Plus Jakarta Sans, sans-serif' }}>

      {/* ── Floating background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="animate-orb absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)' }} />
        <div className="animate-orb absolute top-1/3 -right-40 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, transparent 70%)', animationDelay: '4s' }} />
        <div className="animate-orb absolute -bottom-40 left-1/3 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.5) 0%, transparent 70%)', animationDelay: '8s' }} />
      </div>

      {/* ── Demo Banner ── */}
      {isDemoMode && (
        <div className="relative z-50 flex items-center justify-center gap-3 px-4 py-2.5 text-xs font-semibold"
          style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.9), rgba(234,88,12,0.9))', backdropFilter: 'blur(8px)' }}>
          <Sparkles className="w-3.5 h-3.5 text-white animate-spin" />
          <span className="text-white">Running in <strong>Live Demo Mode</strong> (Offline Local DB)</span>
          <button onClick={handleToggleDemoRole}
            className="bg-white/25 hover:bg-white/40 text-white font-extrabold px-3 py-1 rounded-full border border-white/30 transition-all active:scale-95 cursor-pointer text-[10px] uppercase tracking-widest">
            Switch to {profile?.role === 'admin' ? 'Member' : 'Admin'}
          </button>
        </div>
      )}

      {/* ── Top Navbar ── */}
      <nav className="nav-glass sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.45)' }}>
            <Gem className="w-4.5 h-4.5 text-white" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-white text-base tracking-tight leading-none block">Hasheema's</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-300 leading-none">Wedding Registry</span>
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
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/8'
                }`}
                style={isActive ? { background: 'rgba(99,102,241,0.25)', boxShadow: '0 0 0 1px rgba(99,102,241,0.4)' } : {}}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-300' : ''}`} />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link to="/admin"
              className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                location.pathname === '/admin'
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/8'
              }`}
              style={location.pathname === '/admin' ? { background: 'rgba(99,102,241,0.25)', boxShadow: '0 0 0 1px rgba(99,102,241,0.4)' } : {}}>
              <Settings className={`w-4 h-4 ${location.pathname === '/admin' ? 'text-indigo-300' : ''}`} />
              Admin
            </Link>
          )}
        </div>

        {/* Right: User Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-2xl cursor-pointer transition-all hover:bg-white/8"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold text-white uppercase"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.4)' }}>
                {profile?.full_name?.charAt(0) || '?'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight">{profile?.full_name || 'User'}</p>
                <p className="text-[10px] font-semibold leading-tight" style={{ color: profile?.role === 'admin' ? '#a78bfa' : 'rgba(255,255,255,0.45)' }}>
                  {profile?.role === 'admin' ? '👑 Administrator' : 'Family Member'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/40 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl overflow-hidden z-50 animate-slide-up"
                style={{ background: 'rgba(15,12,40,0.95)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
                <button onClick={() => { signOut(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  Sign Out
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
        style={{ background: 'rgba(8,11,26,0.85)', backdropFilter: 'blur(28px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex justify-around items-end relative">
          <Link to="/" className={`flex flex-col items-center gap-1 p-2 transition-all ${location.pathname === '/' ? 'text-indigo-400' : 'text-white/35 hover:text-white/60'}`}>
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
          </Link>

          <Link to="/expenses" className={`flex flex-col items-center gap-1 p-2 transition-all ${location.pathname === '/expenses' ? 'text-indigo-400' : 'text-white/35 hover:text-white/60'}`}>
            <Receipt className="w-6 h-6" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Ledger</span>
          </Link>

          {/* FAB */}
          <Link to="/add" className="relative -top-5 flex items-center justify-center w-16 h-16 rounded-full transition-all active:scale-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 0 4px rgba(8,11,26,0.9), 0 8px 32px rgba(99,102,241,0.5)' }}>
            <PlusCircle className="w-7 h-7 text-white" />
          </Link>

          {isAdmin ? (
            <Link to="/admin" className={`flex flex-col items-center gap-1 p-2 transition-all ${location.pathname === '/admin' ? 'text-indigo-400' : 'text-white/35 hover:text-white/60'}`}>
              <Settings className="w-6 h-6" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Admin</span>
            </Link>
          ) : <div className="w-12" />}

          <button onClick={signOut} className="flex flex-col items-center gap-1 p-2 text-white/35 hover:text-red-400 transition-colors">
            <LogOut className="w-6 h-6" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Exit</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
