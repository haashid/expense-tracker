import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import AllExpenses from './pages/AllExpenses';
import AddExpense from './pages/AddExpense';
import AdminPanel from './pages/AdminPanel';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    // Return a completely blank, empty container instead of a loader.
    // This protects the OAuth hash in the URL and allows session hydration 
    // without annoying the user with a spinning loading page.
    return <div className="min-h-screen bg-slate-50"></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="expenses" element={<AllExpenses />} />
            <Route path="add" element={<AddExpense />} />
            <Route path="admin" element={<AdminPanel />} />
          </Route>
          {/* Wildcard wildcard redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
