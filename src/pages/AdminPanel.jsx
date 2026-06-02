import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockService } from '../lib/mockService';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield, Users, CalendarClock, UserCheck, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  async function changeRole(userId, newRole) {
    if (userId === currentProfile?.id) {
      alert('You cannot modify your own administrative role. Have another administrator perform this action if required.');
      return;
    }

    setActionLoadingId(userId);
    setSuccessMessage('');
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId);
        if (error) throw error;
      } else {
        await mockService.profiles.updateRole(userId, newRole);
      }
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      // Show success toast
      const updatedUser = users.find(u => u.id === userId);
      setSuccessMessage(`Successfully updated ${updatedUser?.full_name || 'user'} role to ${newRole}.`);
      
      // Automatically hide toast
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700">
            <Shield className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Admin Control Center</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Manage family permissions, promote administrators, and audit profiles.</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 border border-slate-150 rounded-2xl px-4 py-2 text-slate-650 text-xs font-bold self-start md:self-auto">
          <Users className="w-4 h-4 text-slate-400" />
          <span>Active Users Logged: {users.length}</span>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-150 p-4 rounded-2xl text-xs font-bold text-emerald-800 animate-slide-in">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-650 rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-400">Querying family database...</span>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 pl-8">Family Member</th>
                    <th className="px-6 py-4">Security Role</th>
                    <th className="px-6 py-4">Registry Join Date</th>
                    <th className="px-6 py-4 text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => {
                    const isSelf = u.id === currentProfile?.id;
                    const isAdminUser = u.role === 'admin';
                    
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/20 transition-all">
                        {/* User identity */}
                        <td className="px-6 py-4 pl-8">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-650 border border-slate-200 uppercase shadow-inner">
                              {u.full_name?.charAt(0) || '👤'}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800 text-sm">
                                {u.full_name} {isSelf && <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 ml-1">You</span>}
                              </p>
                              <span className="text-[10px] text-slate-400 font-semibold">{u.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Security Role */}
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            isAdminUser 
                              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {isAdminUser ? '👑 admin' : '👨‍👩‍👧 member'}
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-slate-450 flex items-center gap-1.5">
                            <CalendarClock className="w-4 h-4 text-slate-350" />
                            {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </td>

                        {/* Action selector */}
                        <td className="px-6 py-4 text-right pr-8">
                          {isSelf ? (
                            <span className="text-[10px] text-slate-400 font-bold italic flex items-center justify-end gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5" /> Self protection lock
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {actionLoadingId === u.id && (
                                <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                              )}
                              <select 
                                value={u.role} 
                                onChange={e => changeRole(u.id, e.target.value)}
                                disabled={actionLoadingId === u.id}
                                className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 hover:bg-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                              >
                                <option value="member">👨‍👩‍👧 Member</option>
                                <option value="admin">👑 Admin</option>
                              </select>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {users.map(u => {
                const isSelf = u.id === currentProfile?.id;
                const isAdminUser = u.role === 'admin';
                return (
                  <div key={u.id} className="p-5 space-y-4 hover:bg-slate-50/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-650 border border-slate-200 uppercase">
                          {u.full_name?.charAt(0) || '👤'}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm">
                            {u.full_name} {isSelf && <span className="text-[9px] text-purple-600 font-bold bg-purple-50 px-1 py-0.5 rounded border border-purple-100 ml-1">You</span>}
                          </p>
                          <span className="text-[10px] text-slate-400 font-semibold">{new Date(u.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isAdminUser 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </div>

                    {!isSelf && (
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
                        <span className="text-xs font-bold text-slate-500">Security Access</span>
                        <div className="flex items-center gap-2">
                          {actionLoadingId === u.id && (
                            <div className="w-3.5 h-3.5 border-2 border-purple-200 border-t-purple-650 rounded-full animate-spin"></div>
                          )}
                          <select 
                            value={u.role} 
                            onChange={e => changeRole(u.id, e.target.value)}
                            disabled={actionLoadingId === u.id}
                            className="text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white cursor-pointer"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>

    </div>
  );
}
