import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockService } from '../lib/mockService';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield, Users, CalendarClock, ShieldAlert, CheckCircle, Crown, UserRound, RefreshCw } from 'lucide-react';

export default function AdminPanel() {
  const { isAdmin, isDemoMode, profile: currentProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at');
        if (error) throw error;
        setUsers(data || []);
      } else {
        const { data, error } = await mockService.profiles.getAll();
        if (error) throw error;
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  if (!isAdmin) return <Navigate to="/" replace />;

  async function changeRole(userId, newRole) {
    if (userId === currentProfile?.id) {
      alert('You cannot modify your own administrative role.');
      return;
    }
    setActionLoadingId(userId);
    setSuccessMessage('');
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        if (error) throw error;
      } else {
        await mockService.profiles.updateRole(userId, newRole);
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      const updatedUser = users.find(u => u.id === userId);
      setSuccessMessage(`✓ ${updatedUser?.full_name || 'User'} is now a ${newRole}.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  const admins = users.filter(u => u.role === 'admin');
  const members = users.filter(u => u.role === 'member');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Admin Control Center</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Manage family permissions and registry access.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 ' style='background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:1rem;padding:0.625rem 1rem;color:rgba(255,255,255,0.6)' text-xs font-bold">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{users.length} Registered</span>
          </div>
          <button
            onClick={fetchUsers}
            className="w-9 h-9 flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-sm font-bold text-emerald-700">
          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border border-slate-100">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-xs font-bold ' style='color:rgba(255,255,255,0.4)' >Loading family registry...</span>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Admins Section ── */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 ' style='background:rgba(255,255,255,0.04)' >
              <Crown className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-extrabold text-white/70 uppercase tracking-widest">Administrators ({admins.length})</h2>
            </div>
            <div className="divide-y divide-white/5">
              {admins.map(u => <UserCard key={u.id} u={u} isSelf={u.id === currentProfile?.id} isAdminUser={true} actionLoadingId={actionLoadingId} changeRole={changeRole} />)}
              {admins.length === 0 && <p className="text-xs text-slate-400 text-center py-8 font-semibold">No administrators found.</p>}
            </div>
          </div>

          {/* ── Members Section ── */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 ' style='background:rgba(255,255,255,0.04)' >
              <Users className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-extrabold text-white/70 uppercase tracking-widest">Family Members ({members.length})</h2>
            </div>
            <div className="divide-y divide-white/5">
              {members.map(u => <UserCard key={u.id} u={u} isSelf={u.id === currentProfile?.id} isAdminUser={false} actionLoadingId={actionLoadingId} changeRole={changeRole} />)}
              {members.length === 0 && <p className="text-xs text-slate-400 text-center py-8 font-semibold">No family members have signed up yet.</p>}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ── Shared User Card (works on ALL screen sizes) ──
function UserCard({ u, isSelf, isAdminUser, actionLoadingId, changeRole }) {
  return (
    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/5 transition-colors">

      {/* Avatar + Identity */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm uppercase shadow-sm flex-shrink-0 ${isAdminUser ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
          {u.full_name?.charAt(0) || <UserRound className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-extrabold text-slate-800 text-sm">{u.full_name}</p>
            {isSelf && (
              <span className="text-[9px] text-blue-600 font-extrabold bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">YOU</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${isAdminUser ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
              {isAdminUser ? '👑 Admin' : '👨‍👩‍👧 Member'}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <CalendarClock className="w-3 h-3" />
              Joined {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {isSelf ? (
          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
            <ShieldAlert className="w-3.5 h-3.5" /> Self-lock
          </span>
        ) : (
          <>
            {actionLoadingId === u.id && (
              <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin flex-shrink-0"></div>
            )}
            <select
              value={u.role}
              onChange={e => changeRole(u.id, e.target.value)}
              disabled={actionLoadingId === u.id}
              className="text-xs font-bold input-glass rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none disabled:opacity-50 min-w-[110px]"
            >
              <option value="member">👨‍👩‍👧 Member</option>
              <option value="admin">👑 Admin</option>
            </select>
          </>
        )}
      </div>

    </div>
  );
}
