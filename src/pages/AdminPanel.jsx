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
      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Admin Control Center</h1>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Manage family permissions and registry access.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            <Users className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span>{users.length} Registered</span>
          </div>
          <button onClick={fetchUsers}
            className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer transition-all"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a78bfa' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
            title="Refresh list">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 rounded-2xl text-sm font-bold animate-slide-up"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
          <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#10b981' }} />
          <span>{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-card flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full" style={{ border: '2px solid rgba(99,102,241,0.15)' }}></div>
            <div className="absolute inset-0 rounded-full animate-spin" style={{ border: '2px solid transparent', borderTopColor: '#6366f1' }}></div>
          </div>
          <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading family registry...</span>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Admins Section */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(245,158,11,0.06)' }}>
              <Crown className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-extrabold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Administrators ({admins.length})
              </h2>
            </div>
            <div style={{ borderTop: 'none' }}>
              {admins.map(u => (
                <UserCard key={u.id} u={u} isSelf={u.id === currentProfile?.id}
                  isAdminUser={true} actionLoadingId={actionLoadingId} changeRole={changeRole} />
              ))}
              {admins.length === 0 && (
                <p className="text-center py-8 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>No administrators found.</p>
              )}
            </div>
          </div>

          {/* Members Section */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(99,102,241,0.06)' }}>
              <Users className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-extrabold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Family Members ({members.length})
              </h2>
            </div>
            <div>
              {members.map(u => (
                <UserCard key={u.id} u={u} isSelf={u.id === currentProfile?.id}
                  isAdminUser={false} actionLoadingId={actionLoadingId} changeRole={changeRole} />
              ))}
              {members.length === 0 && (
                <p className="text-center py-8 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>No family members have signed up yet.</p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function UserCard({ u, isSelf, isAdminUser, actionLoadingId, changeRole }) {
  return (
    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>

      {/* Avatar + Identity */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm uppercase shadow-sm flex-shrink-0"
          style={isAdminUser
            ? { background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }
            : { background: 'rgba(99,102,241,0.15)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.3)' }}>
          {u.full_name?.charAt(0) || <UserRound className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-extrabold text-sm text-white">{u.full_name}</p>
            {isSelf && (
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase"
                style={{ background: 'rgba(99,102,241,0.2)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.3)' }}>
                YOU
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={isAdminUser
                ? { background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }
                : { background: 'rgba(99,102,241,0.12)', color: '#a78bfa' }}>
              {isAdminUser ? '👑 Admin' : '👨‍👩‍👧 Member'}
            </span>
            <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <CalendarClock className="w-3 h-3" />
              Joined {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {isSelf ? (
          <span className="text-[10px] font-bold flex items-center gap-1 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
            <ShieldAlert className="w-3.5 h-3.5" /> Self-lock
          </span>
        ) : (
          <>
            {actionLoadingId === u.id && (
              <div className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0"
                style={{ borderColor: 'rgba(99,102,241,0.3)', borderTopColor: '#6366f1' }} />
            )}
            <select
              value={u.role}
              onChange={e => changeRole(u.id, e.target.value)}
              disabled={actionLoadingId === u.id}
              className="input-glass text-xs font-bold rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none disabled:opacity-50 min-w-[120px]">
              <option value="member">👨‍👩‍👧 Member</option>
              <option value="admin">👑 Admin</option>
            </select>
          </>
        )}
      </div>

    </div>
  );
}
