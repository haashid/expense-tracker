import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, ENTRY_TYPES } from '../lib/constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Filter, Calendar, Trash2, Eye, FileText, Camera, Tag, CalendarClock, RefreshCw, TrendingUp } from 'lucide-react';

export default function AllExpenses() {
  const [filters, setFilters] = useState({
    category: '',
    entry_type: '',
    date_from: '',
    date_to: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  const { expenses, loading, deleteExpense, totalAmount, refetch } = useExpenses({
    category: filters.category || undefined,
    entry_type: filters.entry_type || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined
  });
  
  const { isAdmin, user } = useAuth();
  const [imageModal, setImageModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Client-side search filtering (since full_text search might not be set up on supabase directly)
  const filteredExpenses = expenses.filter(exp => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      exp.description?.toLowerCase().includes(query) ||
      exp.paid_by?.toLowerCase().includes(query) ||
      exp.notes?.toLowerCase().includes(query) ||
      exp.category?.toLowerCase().includes(query)
    );
  });

  const handleResetFilters = () => {
    setFilters({ category: '', entry_type: '', date_from: '', date_to: '' });
    setSearchQuery('');
  };

  const dailyData = [...filteredExpenses].reduce((acc, exp) => {
    const date = new Date(exp.expense_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = { date, amount: 0 };
    acc[date].amount += Number(exp.amount);
    return acc;
  }, {});
  const chartData = Object.values(dailyData);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this expense record? This action is permanent.')) return;
    
    setDeletingId(id);
    try {
      await deleteExpense(id);
    } catch (err) {
      alert('Failed to delete expense: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white">View Transactions</h1>
          <p className="text-sm mt-1" style={{color:'rgba(255,255,255,0.4)'}}>Audit, search, and visually manage every logged expense.</p>
        </div>
        
        <div className="text-left md:text-right rounded-2xl px-5 py-3.5 flex flex-col justify-center" style={{background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.25)'}}>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'rgba(167,139,250,0.7)'}}>Aggregated Ledger Sum</span>
          <p className="text-2xl font-black" style={{color:'#a78bfa'}}>₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Cash Flow Graph */}
      {filteredExpenses.length > 0 && !loading && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-extrabold text-white">Cash Flow Trend</h2>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`}
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Advanced Filters Card */}
      <div className="glass-card p-5 space-y-4">
        
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search description, shopper name, notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner text-sm"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Category Filter */}
            <div className="relative">
              <select 
                value={filters.category} 
                onChange={e => setFilters({...filters, category: e.target.value})}
                className="w-full pl-3 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none font-semibold text-slate-700"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.icon} {c.label}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>

            {/* Entry Type Filter */}
            <div className="relative">
              <select 
                value={filters.entry_type} 
                onChange={e => setFilters({...filters, entry_type: e.target.value})}
                className="w-full pl-3 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none font-semibold text-slate-700"
              >
                <option value="">All Entry Types</option>
                {ENTRY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>

            {/* Start Date */}
            <div className="relative flex items-center">
              <input 
                type="date" 
                value={filters.date_from}
                onChange={e => setFilters({...filters, date_from: e.target.value})}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs font-semibold text-slate-600"
              />
            </div>

            {/* End Date */}
            <div className="relative flex items-center">
              <input 
                type="date" 
                value={filters.date_to}
                onChange={e => setFilters({...filters, date_to: e.target.value})}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs font-semibold text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Info & Reset Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400 font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.5)'}}>
            <Filter className="w-3.5 h-3.5" />
            <span>Showing {filteredExpenses.length} of {expenses.length} results</span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => refetch()}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors border border-slate-100 hover:border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-full cursor-pointer bg-white shadow-sm"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Registry</span>
            </button>

            {(filters.category || filters.entry_type || filters.date_from || filters.date_to || searchQuery) && (
              <button 
                onClick={handleResetFilters}
                className="text-blue-600 hover:text-blue-800 transition-colors hover:underline cursor-pointer bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full"
              >
                Reset Active Filters
              </button>
            )}
          </div>
        </div>

      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500 animate-pulse">Syncing transactions...</span>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <span className="text-4xl inline-block mb-3">🔍</span>
          <h3 className="text-lg font-bold text-white">No matching expenses found</h3>
          <p className="text-slate-500 max-w-sm mx-auto text-sm mt-1">
            Try adjusting your search criteria, clearing filters, or extending the date ranges.
          </p>
          <button 
            onClick={handleResetFilters}
            className="mt-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-full transition-all shadow-md shadow-blue-600/30 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Expenses Ledger Grid */
        <div className="grid grid-cols-1 gap-4">
          {filteredExpenses.map(expense => {
            const cat = CATEGORIES.find(c => c.label === expense.category);
            const isOwner = expense.user_id === user?.id;
            const canDelete = isAdmin || isOwner;

            return (
              <div 
                key={expense.id} 
                className="glass-card glass-card-hover p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                
                {/* Mobile top: Details & Icon */}
                <div className="flex items-start md:items-center gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300 shadow-sm ${cat?.color || 'bg-slate-50 text-slate-600'}`}>
                    {cat?.icon || '📦'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                      {expense.description}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold >
                        Paid by <strong className="text-slate-700">{expense.paid_by}</strong>
                      </span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5" />
                        {new Date(expense.expense_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {expense.notes && (
                      <p className="text-[11px] text-slate-400 italic mt-1.5 line-clamp-1 border-l-2 border-slate-200 pl-2">
                        “{expense.notes}”
                      </p>
                    )}
                  </div>
                </div>

                {/* Right/Bottom Side: Amount and Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 shrink-0 gap-3">
                  
                  <div className="text-left md:text-right">
                    <p className="text-xl md:text-2xl font-black text-blue-600 leading-none">
                      ₹{Number(expense.amount).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full inline-block mt-2">
                      {expense.entry_type?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {/* Attached screenshots buttons */}
                    {expense.payment_screenshot_url && (
                      <button 
                        onClick={() => setImageModal({ url: expense.payment_screenshot_url, type: 'Payment Screenshot' })}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white transition-colors shadow-sm cursor-pointer"
                        title="View Payment Receipt"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                    
                    {expense.bill_screenshot_url && (
                      <button 
                        onClick={() => setImageModal({ url: expense.bill_screenshot_url, type: 'Invoice Bill Photo' })}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-colors shadow-sm cursor-pointer"
                        title="View Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete expense */}
                    {canDelete && (
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        disabled={deletingId === expense.id}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                        title="Delete this record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Modal overlay */}
      {imageModal && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 md:p-6"
          onClick={() => setImageModal(null)}
        >
          <div className="max-w-3xl w-full flex flex-col items-center relative gap-3">
            
            <div className="flex items-center justify-between w-full bg-slate-900/50 border border-slate-700/30 backdrop-blur rounded-2xl px-4 py-2.5 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-350">{imageModal.type}</span>
              <button 
                onClick={() => setImageModal(null)}
                className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative max-h-[80vh] flex items-center justify-center p-2.5">
              <img 
                src={imageModal.url} 
                alt="Uploaded receipt attachment" 
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-xl select-none"
                onClick={e => e.stopPropagation()}
              />
            </div>
            
            <p className="text-slate-450 text-[11px] font-bold">Click outside to dismiss receipt view</p>

          </div>
        </div>
      )}

    </div>
  );
}
