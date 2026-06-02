import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, AlertCircle, ArrowRight, Gem } from 'lucide-react';

export default function Login() {
  const { signIn, signUp, isDemoMode } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true); setError('');
    try {
      const email = role === 'admin' ? 'haashidgo@gmail.com' : 'family.member@gmail.com';
      const { error: e } = await signIn(email, 'wedding2026');
      if (e) setError(e.message); else navigate('/');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-[420px] animate-slide-up">
        
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-4 shadow-lg shadow-indigo-500/30"
               style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            <Gem className="w-8 h-8 text-slate-800" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hasheema's</h1>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-1">Wedding Expense Registry</p>
        </div>

        {/* Clean White Card */}
        <div className="bg-white rounded-[28px] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 border border-slate-100">
            <button type="button" onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                isLogin ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
              }`}>
              Sign In
            </button>
            <button type="button" onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                !isLogin ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
              }`}>
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" required placeholder="Amina Khan" value={fullName} onChange={e => setFullName(e.target.value)}
                    className="input-glass w-full pl-11 pr-4 py-3.5 rounded-2xl" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-glass w-full pl-11 pr-4 py-3.5 rounded-2xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  className="input-glass w-full pl-11 pr-12 py-3.5 rounded-2xl" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-slide-up">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="glow-btn w-full py-4 rounded-2xl flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>{isLogin ? 'Sign In' : 'Create Account'}</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {isDemoMode && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3 inline mr-1 text-amber-600" /> Quick Demo Access
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleDemoLogin('admin')} disabled={loading}
                  className="py-2.5 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all">
                  👑 Admin Login
                </button>
                <button onClick={() => handleDemoLogin('member')} disabled={loading}
                  className="py-2.5 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-all">
                  👨‍👩‍👧 Member Login
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6 space-y-2">
          <p className="text-xs font-medium text-slate-500">
            🔒 Access restricted to invited family members
          </p>
          <Link to="/login/admin" className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            👑 Administrator Portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
