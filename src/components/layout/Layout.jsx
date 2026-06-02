import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Receipt, PlusCircle, Settings, LogOut, User, Sparkles } from 'lucide-react';
import { mockService } from '../../lib/mockService';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'All Expenses', icon: Receipt },
  { to: '/add', label: 'Add Expense', icon: PlusCircle },
];

export default function Layout() {
  const { profile, isAdmin, signOut, isDemoMode, refetchProfile } = useAuth();
  const location = useLocation();

  // Helper to switch roles instantly in demo mode for testing
  const handleToggleDemoRole = async () => {
    if (!isDemoMode || !profile) return;
    const newRole = profile.role === 'admin' ? 'member' : 'admin';
    await mockService.profiles.updateRole(profile.id, newRole);
    refetchProfile();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 md:pb-0 flex flex-col font-sans">
      
      {/* Demo Mode Action Bar */}
      {isDemoMode && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 select-none shadow-sm z-50">
          <Sparkles className="w-4 h-4 animate-spin text-amber-100" />
          <span>Running in <strong>Live Demo Mode</strong> (Offline Local DB).</span>
          <button 
            onClick={handleToggleDemoRole}
            className="bg-white/20 hover:bg-white/30 text-white font-extrabold px-2.5 py-0.5 rounded-full border border-white/20 transition-all active:scale-95 ml-2 cursor-pointer"
          >
            Switch Role to {profile?.role === 'admin' ? 'Member' : 'Admin'} (Current: {profile?.role})
          </button>
        </div>
      )}

      {/* Top Navbar - Desktop Only */}
      <nav className="bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-45 shadow-sm">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">💍</span>
            <span className="font-extrabold bg-gradient-to-r from-purple-900 to-rose-600 bg-clip-text text-transparent tracking-tight text-lg">
              Hasheema's Wedding
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex gap-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link 
                  key={item.to} 
                  to={item.to}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-555 bg-gradient-to-tr from-purple-600 to-purple-500 text-white shadow-md shadow-purple-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-550'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Desktop Admin Link */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                  location.pathname === '/admin'
                    ? 'bg-purple-600 bg-gradient-to-tr from-purple-600 to-purple-500 text-white shadow-md shadow-purple-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* User profile dropdown & signout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-100 to-rose-100 border border-purple-200 flex items-center justify-center text-purple-750 font-bold text-sm shadow-inner">
              {profile?.full_name?.charAt(0) || <User className="w-4 h-4" />}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-bold text-slate-800 leading-none">{profile?.full_name}</span>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mt-0.5">
                {profile?.role === 'admin' ? '👑 Admin' : '👨‍👩‍👧 Family Member'}
              </span>
            </div>
          </div>

          <button 
            onClick={signOut}
            className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors border border-slate-200 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-red-50 hover:border-red-100 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-3 py-2 flex justify-around items-center z-45 shadow-lg shadow-black/10 backdrop-blur-md bg-white/95">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <Link 
              key={item.to} 
              to={item.to}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-purple-650 scale-105' 
                  : 'text-slate-400 hover:text-slate-650'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
        
        {isAdmin && (
          <Link 
            to="/admin" 
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
              location.pathname === '/admin' 
                ? 'text-purple-650 scale-105' 
                : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <Settings className={`w-5 h-5 ${location.pathname === '/admin' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
            <span className="text-[10px] font-bold tracking-tight">Admin</span>
          </Link>
        )}

        <button 
          onClick={signOut}
          className="flex flex-col items-center gap-1 px-3 py-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
        >
          <LogOut className="w-5 h-5 stroke-[2px]" />
          <span className="text-[10px] font-bold tracking-tight">Exit</span>
        </button>
      </nav>

    </div>
  );
}
