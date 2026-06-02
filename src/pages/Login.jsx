import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Sparkles, AlertCircle, User, Gem, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const { signIn, signUp, signInWithGoogle, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const targetEmail = email.trim().toLowerCase();

    if (!isSignUp && targetEmail && (targetEmail.includes('haashid') || targetEmail.startsWith('admin'))) {
      setError('Administrators must log in via the secure Admin Portal.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!fullName.trim()) { setError('Please provide your full name.'); setLoading(false); return; }
        const { error: signUpError } = await signUp(email, password, fullName);
        if (signUpError) { setError(signUpError.message); }
        else { setSuccess('Account created! You can now sign in.'); setIsSignUp(false); }
      } else {
        const { error: signInError } = await signIn(email || 'family@wedding.com', password || 'wedding2026');
        if (signInError) { setError(signInError.message); }
        else { navigate('/'); }
      }
    } catch (err) { setError(err.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true); setError('');
    try {
      const { error: googleError } = await signInWithGoogle();
      if (googleError) { setError(googleError.message); }
      else { navigate('/'); }
    } catch (err) { setError(err.message || 'Google sign-in failed.'); }
    finally { setLoading(false); }
  };

  const handleQuickLogin = async (demoEmail) => {
    setLoading(true); setError('');
    try {
      const { error: e } = await signIn(demoEmail, 'wedding2026');
      if (e) setError(e.message); else navigate('/');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* Animated Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-25 animate-orb"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.8) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-20 animate-orb"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, transparent 70%)', filter: 'blur(60px)', animationDelay: '5s' }} />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full opacity-15 animate-orb"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.6) 0%, transparent 70%)', filter: 'blur(50px)', animationDelay: '9s' }} />
      </div>

      <div className="w-full max-w-md animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 relative animate-float"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)', boxShadow: '0 8px 40px rgba(99,102,241,0.5), 0 0 0 1px rgba(255,255,255,0.1)' }}>
            <Gem className="w-9 h-9 text-slate-800" />
            <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none">Hasheema's</h1>
          <p className="text-lg font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Wedding Expense Registry</p>
          {isDemoMode && (
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-[11px] font-bold"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}>
              <Sparkles className="w-3 h-3" /> Demo Mode Active
            </div>
          )}
        </div>

        {/* Glass Card */}
        <div className="rounded-3xl p-8"
          style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}>

          {/* Tab switcher */}
          <div className="flex rounded-2xl p-1 mb-7" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {['Sign In', 'Register'].map((tab, i) => (
              <button key={tab} onClick={() => { setIsSignUp(i === 1); setError(''); setSuccess(''); }}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer"
                style={isSignUp === (i === 1)
                  ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#1e293b', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }
                  : { color: 'rgba(15, 23, 42, 0.6)' }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Google Button */}
          <button type="button" disabled={loading} onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm mb-5 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}>
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(15, 23, 42, 0.05)' }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(15, 23, 42, 0.55)' }}>or email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(15, 23, 42, 0.05)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(15, 23, 42, 0.55)' }} />
                <input type="text" placeholder="Full Name" required value={fullName} onChange={e => setFullName(e.target.value)}
                  className="input-glass w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium" />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(15, 23, 42, 0.55)' }} />
              <input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)}
                className="input-glass w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium" />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(15, 23, 42, 0.55)' }} />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)}
                className="input-glass w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm font-medium" />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer opacity-40 hover:opacity-80 transition-opacity">
                {showPassword ? <EyeOff className="w-4 h-4 text-slate-800" /> : <Eye className="w-4 h-4 text-slate-800" />}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl text-sm animate-slide-up"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><p>{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl text-sm animate-slide-up"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
                <span>✓</span><p>{success}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="glow-btn w-full py-3.5 rounded-2xl font-bold text-slate-800 text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-slate-800" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              ) : (
                <><span>{isSignUp ? 'Create Account' : 'Sign In'}</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo shortcut */}
          {isDemoMode && (
            <button onClick={() => handleQuickLogin('family@wedding.com')} disabled={loading}
              className="w-full mt-4 py-3 rounded-2xl text-xs font-bold cursor-pointer transition-all"
              style={{ background: 'rgba(15, 23, 42, 0.03)', border: '1px solid rgba(15, 23, 42, 0.08)', color: 'rgba(15, 23, 42, 0.65)' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              👨‍👩‍👧 Quick Demo — Family Member Access
            </button>
          )}
        </div>

        <p className="text-center text-xs mt-5 flex flex-col items-center gap-2" style={{ color: 'rgba(15, 23, 42, 0.55)' }}>
          <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" />Access restricted to invited family members</span>
          <Link to="/login/admin" className="font-bold transition-colors" style={{ color: 'rgba(167,139,250,0.7)' }}
            onMouseOver={e => e.currentTarget.style.color = '#a78bfa'} onMouseOut={e => e.currentTarget.style.color = 'rgba(167,139,250,0.7)'}>
            🔒 Administrator Portal →
          </Link>
        </p>
      </div>
    </div>
  );
}
