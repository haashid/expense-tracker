import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Lock, Mail, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
  const { signIn, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true); 
    setError('');

    const targetEmail = email.trim().toLowerCase();

    // Enforce administrator-only access
    if (targetEmail && !targetEmail.includes('haashid') && !targetEmail.startsWith('admin')) {
      setError('Access denied. Family members must log in via the standard Family Portal.');
      setLoading(false);
      return;
    }

    try {
      const { error: signInError } = await signIn(email || 'haashidgo@gmail.com', password || 'wedding2026');
      if (signInError) {
        setError(signInError.message);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong during sign-in.');
    } finally {
      setLoading(false);
    }
  }

  // Helper for quick admin demo logins
  const handleQuickLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await signIn('haashidgo@gmail.com', 'wedding2026');
      if (signInError) {
        setError(signInError.message);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-purple-100 via-slate-50 to-indigo-100 p-4 md:p-6">
      
      {/* Decorative Floating Circles */}
      <div className="absolute top-12 left-12 w-64 h-64 rounded-full bg-purple-300/30 blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-12 right-12 w-72 h-72 rounded-full bg-amber-200/30 blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-purple-200/40 shadow-2xl rounded-3xl p-8 relative">
        
        {/* Mode indicator badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1 bg-purple-950 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-purple-800">
            <ShieldAlert className="w-3.5 h-3.5" /> Secure Admin Portal
          </span>
        </div>

        <div className="text-center mt-4 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-900 to-indigo-950 text-white text-3xl shadow-xl mb-4 transform hover:rotate-12 transition-transform duration-300">
            🔑
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-950 to-indigo-900">
            Admin Registry Access
          </h1>
          <p className="text-sm font-semibold text-purple-750 tracking-wide mt-1 uppercase">
            Hasheema's Wedding Ledger
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="relative">
            <label className="text-xs font-semibold text-slate-700 mb-1 block pl-1">Admin Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-650" />
              <input 
                type="email" 
                required 
                placeholder="haashidgo@gmail.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/70 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-slate-700 mb-1 block pl-1">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-650" />
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/70 border border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 p-3.5 rounded-xl text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-900 hover:to-indigo-950 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-purple-900/20 shadow-md"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying Administrator credentials...</span>
              </>
            ) : (
              <>
                <span>Secure Admin Sign In</span>
                <Heart className="w-4 h-4 fill-white" />
              </>
            )}
          </button>
        </form>

        {/* Admin Demo Login Box */}
        {isDemoMode && (
          <div className="mt-8 pt-6 border-t border-purple-100">
            <div className="flex items-center gap-1.5 justify-center mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-purple-900/60 uppercase tracking-wider">Quick Admin Shortcut</p>
            </div>
            <button 
              onClick={handleQuickLogin}
              disabled={loading}
              className="w-full flex flex-col items-center p-3 bg-purple-50/70 hover:bg-purple-100 border border-purple-100 rounded-xl transition-all group"
            >
              <span className="text-xs font-bold text-purple-950 group-hover:text-purple-800">👑 Sign In as Haashid (Admin)</span>
              <span className="text-[10px] text-purple-600 font-semibold mt-0.5">Full Read/Write Ledger Access</span>
            </button>
          </div>
        )}

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-xs font-bold text-indigo-650 hover:text-indigo-850 transition-colors hover:underline"
          >
            ← Return to standard Family Portal login
          </Link>
        </div>

      </div>
    </div>
  );
}
