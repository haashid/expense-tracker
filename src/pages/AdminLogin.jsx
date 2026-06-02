import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, Sparkles, AlertCircle, Key, Eye, EyeOff, ArrowRight, Heart } from 'lucide-react';

export default function AdminLogin() {
  const { signIn, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true); setError('');
    const targetEmail = email.trim().toLowerCase();

    if (targetEmail && !targetEmail.includes('haashid') && !targetEmail.startsWith('admin')) {
      setError('Access denied. Family members must log in via the standard Family Portal.');
      setLoading(false); return;
    }

    try {
      const { error: signInError } = await signIn(email || 'haashidgo@gmail.com', password || 'wedding2026');
      if (signInError) { setError(signInError.message); }
      else { navigate('/'); }
    } catch (err) { setError(err.message || 'Sign-in failed.'); }
    finally { setLoading(false); }
  }

  const handleQuickLogin = async () => {
    setLoading(true); setError('');
    try {
      const { error: e } = await signIn('haashidgo@gmail.com', 'wedding2026');
      if (e) setError(e.message); else navigate('/');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* Dark Admin Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-20 animate-orb"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.9) 0%, transparent 70%)', filter: 'blur(70px)' }} />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] rounded-full opacity-15 animate-orb"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.8) 0%, transparent 70%)', filter: 'blur(60px)', animationDelay: '6s' }} />
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[250px] h-[250px] rounded-full opacity-10 animate-orb"
          style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.6) 0%, transparent 70%)', filter: 'blur(50px)', animationDelay: '3s' }} />
      </div>

      <div className="w-full max-w-md animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 relative animate-float"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)', border: '1px solid rgba(99,102,241,0.4)', boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.2)' }}>
            <Key className="w-9 h-9 text-violet-300" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 2px 8px rgba(245,158,11,0.5)' }}>
              <ShieldAlert className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Secure Admin Portal</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Access</h1>
          <p className="text-sm font-medium mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Hasheema's Wedding Registry — Control Center</p>
        </div>

        {/* Glass Card */}
        <div className="rounded-3xl p-8"
          style={{ background: 'rgba(10,8,30,0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.06)' }}>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                <input type="email" required placeholder="haashidgo@gmail.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-glass w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium" />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Security Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  className="input-glass w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm font-medium" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer opacity-40 hover:opacity-80 transition-opacity">
                  {showPassword ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl text-sm animate-slide-up"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><p>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-all"
              style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4338ca)', boxShadow: '0 4px 24px rgba(67,56,202,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(67,56,202,0.7), inset 0 1px 0 rgba(255,255,255,0.15)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(67,56,202,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'}>
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              ) : (
                <><span>Secure Admin Sign In</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {isDemoMode && (
            <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-center text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                <Sparkles className="w-3 h-3 inline mr-1 text-amber-400" />Quick Admin Access
              </p>
              <button onClick={handleQuickLogin} disabled={loading}
                className="w-full py-3 rounded-2xl text-xs font-bold cursor-pointer transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                👑 Sign In as Haashid (Admin)
              </button>
            </div>
          )}

          <p className="text-center mt-5">
            <Link to="/login" className="text-xs font-semibold transition-colors" style={{ color: 'rgba(167,139,250,0.6)' }}
              onMouseOver={e => e.currentTarget.style.color = '#a78bfa'} onMouseOut={e => e.currentTarget.style.color = 'rgba(167,139,250,0.6)'}>
              ← Return to Family Portal
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-5 flex items-center justify-center gap-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <Lock className="w-3 h-3" /> End-to-end encrypted · Supabase Auth
        </p>
      </div>
    </div>
  );
}
