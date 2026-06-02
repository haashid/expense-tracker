import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Receipt, PlusCircle, Settings, LogOut, User, Sparkles, Gem } from 'lucide-react';
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
      <nav className="bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-45 shadow-sm">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:rotate-12 transition-all duration-300 shadow-sm border border-blue-100">
              <Gem className="w-5 h-5 fill-blue-200" />
            </div>
            <span className="font-extrabold text-slate-800 tracking-tight text-lg">
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
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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
            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shadow-sm">
              {profile?.full_name?.charAt(0) || <User className="w-4 h-4" />}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-bold text-slate-800 leading-none">{profile?.full_name}</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">
                {profile?.role === 'admin' ? '👑 Admin' : 'Family Member'}
              </span>
            </div>
          </div>

          <button 
            onClick={signOut}
            className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors border border-slate-200 px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 hover:border-red-100 cursor-pointer shadow-sm"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white px-6 py-2 pb-6 flex justify-between items-center z-45 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.08)] rounded-t-3xl">
        <Link to="/" className={`flex flex-col items-center gap-1 p-2 transition-all ${location.pathname === '/' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <LayoutDashboard className={`w-6 h-6 ${location.pathname === '/' ? 'fill-blue-50' : ''}`} />
        </Link>
        
        <Link to="/expenses" className={`flex flex-col items-center gap-1 p-2 transition-all ${location.pathname === '/expenses' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <Receipt className={`w-6 h-6 ${location.pathname === '/expenses' ? 'fill-blue-50' : ''}`} />
        </Link>

        {/* Prominent Floating Action Button */}
        <Link to="/add" className="relative -top-6 bg-blue-600 text-white p-4 rounded-full shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center border-4 border-white">
          <PlusCircle className="w-7 h-7" />
        </Link>

        {isAdmin ? (
          <Link to="/admin" className={`flex flex-col items-center gap-1 p-2 transition-all ${location.pathname === '/admin' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <Settings className={`w-6 h-6 ${location.pathname === '/admin' ? 'fill-blue-50' : ''}`} />
          </Link>
        ) : (
           <div className="w-10"></div> /* Spacer if not admin */
        )}

        <button onClick={signOut} className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut className="w-6 h-6" />
        </button>
      </nav>

    </div>
  );
}
