import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Lock, Mail, Sparkles, AlertCircle, User } from 'lucide-react';

export default function Login() {
  const { signIn, signUp, signInWithGoogle, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e?.preventDefault();
    setLoading(true); 
    setError('');
    const targetEmail = email.trim().toLowerCase();

    // Prevent administrators from logging in on standard member form
    if (!isSignUp && targetEmail && (targetEmail.includes('haashid') || targetEmail.startsWith('admin'))) {
      setError('Administrators must log in via the secure Admin Portal at /login/admin.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setError('Please provide your full name.');
          setLoading(false);
          return;
        }
        const { error: signUpError } = await signUp(email, password, fullName);
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setError('Account registered successfully! You can now log in.');
          setIsSignUp(false);
        }
      } else {
        const { error: signInError } = await signIn(email || 'family@wedding.com', password || 'wedding2026');
        if (signInError) {
          setError(signInError.message);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  // Helper for Google Authentication
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: googleError } = await signInWithGoogle();
      if (googleError) {
        setError(googleError.message);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  // Helper for quick demo logins
  const handleQuickLogin = async (demoEmail, demoRole) => {
    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await signIn(demoEmail, 'wedding2026');
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
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden bg-[#f4f7fe] p-4 md:p-6">
      
      {/* Decorative Floating Circles */}
      <div className="absolute top-12 left-12 w-64 h-64 rounded-full bg-blue-200/40 blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-12 right-12 w-72 h-72 rounded-full bg-emerald-200/40 blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl p-8 relative">
        
        {/* Mode indicator badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          {isDemoMode ? (
            <span className="flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-amber-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Live Demo Mode Active
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-emerald-500">
              <span className="w-2 h-2 rounded-full bg-green-200 animate-ping"></span> Supabase Connected
            </span>
          )}
        </div>

        <div className="text-center mt-4 mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 border border-blue-100 text-blue-600 shadow-lg shadow-blue-600/10 mb-4 transform hover:rotate-12 transition-transform duration-300">
            <Sparkles className="w-8 h-8 fill-blue-200" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800">
            Hasheema's Wedding
          </h1>
          <p className="text-sm font-semibold text-slate-400 tracking-wide mt-1 uppercase">
            Expense Tracker & Registry
          </p>
        </div>

        {/* Google Sign In Option */}
        <div className="mb-5 space-y-4">
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:shadow-md transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 cursor-pointer text-sm shadow-sm"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-slate-200"></div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              or use secure email
            </span>
            <div className="flex-1 h-[1px] bg-slate-200"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isSignUp && (
            <div className="relative">
              <label className="text-xs font-semibold text-gray-600 mb-1 block pl-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  required 
                  placeholder="Haashid Ali" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                />
              </div>
            </div>
          )}

          <div className="relative">
            <label className="text-xs font-semibold text-gray-600 mb-1 block pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                required 
                placeholder="family@wedding.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-gray-600 mb-1 block pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-blue-600/30 shadow-lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{isSignUp ? 'Creating registry account...' : 'Signing in securely...'}</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? 'Register & Access Registry' : 'Sign In Securely'}</span>
                <Heart className="w-4 h-4 fill-white" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors hover:underline cursor-pointer"
          >
            {isSignUp 
              ? 'Already registered? Sign In instead' 
              : "New family member? Create a registry account"}
          </button>
        </div>

        {/* Quick Demo Login Box */}
        {isDemoMode && (
          <div className="mt-8 pt-6 border-t border-gray-150">
            <div className="flex items-center gap-1.5 justify-center mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Demo Shortcut</p>
            </div>
            <button 
              onClick={() => handleQuickLogin('family@wedding.com', 'member')}
              disabled={loading}
              className="w-full flex flex-col items-center p-3 bg-blue-50/70 hover:bg-blue-100 border border-blue-100 rounded-xl transition-all group shadow-sm"
            >
              <span className="text-xs font-bold text-blue-950 group-hover:text-blue-800">👨‍👩‍👧 Family Member</span>
              <span className="text-[10px] text-blue-600 font-semibold mt-0.5">Standard Registry Access</span>
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6 flex flex-col items-center justify-center gap-2">
          <span className="flex items-center gap-1 justify-center">
            <Lock className="w-3 h-3" /> Access restricted to invited family members.
          </span>
          <Link to="/login/admin" className="text-[10px] text-blue-600 font-bold hover:underline transition-all">
            🔒 Secure Administrator Portal
          </Link>
        </p>

      </div>
    </div>
  );
}
