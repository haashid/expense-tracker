import { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, ENTRY_TYPES } from '../lib/constants';
import { Search, Filter, Calendar, Trash2, Eye, FileText, Camera, Tag, CalendarClock, RefreshCw } from 'lucide-react';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">All Wedding Expenses</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Audit, search, and manage every logged expense in detail.</p>
        </div>
        
        <div className="text-left md:text-right bg-purple-50/70 border border-purple-100 rounded-2xl px-5 py-3.5 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest pl-0.5">Aggregated Ledger Sum</span>
          <p className="text-2xl font-black text-purple-750 mt-0.5">₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Advanced Filters Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search description, shopper name, notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/75 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all shadow-inner text-sm"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Category Filter */}
            <div className="relative">
              <select 
                value={filters.category} 
                onChange={e => setFilters({...filters, category: e.target.value})}
                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm appearance-none font-semibold text-slate-700"
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
                className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm appearance-none font-semibold text-slate-700"
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
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-xs font-semibold text-slate-600"
              />
            </div>

            {/* End Date */}
            <div className="relative flex items-center">
              <input 
                type="date" 
                value={filters.date_to}
                onChange={e => setFilters({...filters, date_to: e.target.value})}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-xs font-semibold text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Info & Reset Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400 font-bold">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full px-3 py-1 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Showing {filteredExpenses.length} of {expenses.length} results</span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => refetch()}
              className="flex items-center gap-1 hover:text-purple-650 transition-colors border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 px-3 py-1.5 rounded-full cursor-pointer bg-white shadow-sm"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Registry</span>
            </button>

            {(filters.category || filters.entry_type || filters.date_from || filters.date_to || searchQuery) && (
              <button 
                onClick={handleResetFilters}
                className="text-purple-600 hover:text-purple-800 transition-colors hover:underline cursor-pointer bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-full"
              >
                Reset Active Filters
              </button>
            )}
          </div>
        </div>

      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500 animate-pulse">Syncing transactions...</span>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
          <span className="text-4xl inline-block mb-3">🔍</span>
          <h3 className="text-lg font-bold text-slate-800">No matching expenses found</h3>
          <p className="text-slate-500 max-w-sm mx-auto text-sm mt-1">
            Try adjusting your search criteria, clearing filters, or extending the date ranges.
          </p>
          <button 
            onClick={handleResetFilters}
            className="mt-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-750 px-4 py-2 rounded-xl transition-all shadow-sm shadow-purple-100 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Expenses Ledger Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExpenses.map(expense => {
            const cat = CATEGORIES.find(c => c.label === expense.category);
            const isOwner = expense.user_id === user?.id;
            const canDelete = isAdmin || isOwner;

            return (
              <div 
                key={expense.id} 
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4 group relative"
              >
                
                {/* Category Badge & Date */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${cat?.color || 'bg-slate-100 text-slate-800'}`}>
                      {cat?.icon} {expense.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      {expense.entry_type?.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <CalendarClock className="w-3.5 h-3.5" />
                    {expense.expense_date}
                  </span>
                </div>

                {/* Amount & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-850 group-hover:text-purple-950 transition-colors">
                    {expense.description}
                  </h3>
                  {expense.notes && (
                    <p className="text-xs text-slate-450 italic bg-slate-50 border border-slate-100/50 p-2.5 rounded-xl mt-2 line-clamp-2">
                      “{expense.notes}”
                    </p>
                  )}
                </div>

                {/* Metadata & Actions split */}
                <div className="flex items-end justify-between border-t border-slate-100 pt-3.5 mt-1">
                  
                  {/* Creator / Shopper Information */}
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Paid By</span>
                    <span className="text-xs font-bold text-slate-700">{expense.paid_by}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Logged by {expense.profiles?.full_name || 'Family member'} on {new Date(expense.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Pricing and view/delete options */}
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <p className="text-xl font-black text-purple-750 leading-none">₹{Number(expense.amount).toLocaleString('en-IN')}</p>
                    
                    <div className="flex items-center gap-1.5">
                      {/* Attached screenshots buttons */}
                      {expense.payment_screenshot_url && (
                        <button 
                          onClick={() => setImageModal({ url: expense.payment_screenshot_url, type: 'Payment Screenshot' })}
                          className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Payment receipt</span>
                        </button>
                      )}
                      
                      {expense.bill_screenshot_url && (
                        <button 
                          onClick={() => setImageModal({ url: expense.bill_screenshot_url, type: 'Invoice Bill Photo' })}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Invoice Bill</span>
                        </button>
                      )}

                      {/* Delete expense */}
                      {canDelete && (
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          disabled={deletingId === expense.id}
                          className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                          title="Delete this record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
