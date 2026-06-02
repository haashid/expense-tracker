import { useExpenses } from '../hooks/useExpenses';
import { CATEGORIES } from '../lib/constants';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { IndianRupee, FileText, LayoutGrid, Calendar, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = [
  '#7C3AED', // Violet/Purple
  '#EA580C', // Orange
  '#DB2777', // Pink
  '#CA8A04', // Yellow
  '#E11D48', // Rose
  '#2563EB', // Blue
  '#16A34A', // Green
  '#0D9488', // Teal
  '#475569', // Slate
  '#4F46E5'  // Indigo
];

export default function Dashboard() {
  const { expenses, loading, totalAmount, byCategory } = useExpenses();

  const chartData = Object.entries(byCategory)
    .map(([name, value]) => {
      const cat = CATEGORIES.find(c => c.label === name);
      return { 
        name, 
        value,
        icon: cat?.icon || '📦',
        color: cat?.color || 'bg-slate-100'
      };
    })
    .sort((a, b) => b.value - a.value);

  const recentExpenses = expenses.slice(0, 5);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Calculating wedding metrics...</p>
      </div>
    );
  }

  // Calculate highest single expense
  const highestExpense = expenses.length > 0 
    ? expenses.reduce((max, e) => Number(e.amount) > Number(max.amount) ? e : max, expenses[0]) 
    : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hasheema's Wedding</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time expenditure tracking, analytics & budget planning.</p>
        </div>
        
        <Link 
          to="/add"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-750 hover:to-purple-700 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-md shadow-purple-100 hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
        >
          <span>➕ Record New Expense</span>
        </Link>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* Total spent card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-50 rounded-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Total Spent</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <IndianRupee className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4">₹{totalAmount.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Grand total wedding investment</span>
          </div>
        </div>

        {/* Total transactions card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Total Transactions</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4">{expenses.length}</p>
          <div className="text-[11px] font-bold text-slate-400 mt-2">
            <span>Logged receipts & bills</span>
          </div>
        </div>

        {/* Categories used card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-50 rounded-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Active Segments</span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4">{Object.keys(byCategory).length}</p>
          <div className="text-[11px] font-bold text-slate-400 mt-2">
            <span>Out of 10 configured categories</span>
          </div>
        </div>

        {/* Highest Single Expense card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-50 rounded-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Peak Expense</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4">
            ₹{highestExpense ? Number(highestExpense.amount).toLocaleString('en-IN') : '0'}
          </p>
          <div className="text-[11px] font-bold text-slate-400 mt-2 truncate">
            <span>{highestExpense ? highestExpense.description : 'No transactions recorded'}</span>
          </div>
        </div>

      </div>

      {expenses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
          <span className="text-5xl inline-block mb-4">✨</span>
          <h3 className="text-lg font-bold text-slate-800">Welcome to Hashima's Wedding Tracker</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm mt-1">
            There are currently no expenses recorded. Click "Record New Expense" above to start building the registry and expense boards!
          </p>
        </div>
      ) : (
        <>
          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Pie Chart Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
              <div className="mb-4">
                <h2 className="font-extrabold text-slate-850 text-base">Category Allocation</h2>
                <p className="text-xs font-medium text-slate-450 mt-0.5">Visual allocation of wedding funds by category.</p>
              </div>
              
              <div className="h-64 relative flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie 
                      data={chartData} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={65}
                      innerRadius={45}
                      paddingAngle={3}
                      dataKey="value" 
                      nameKey="name" 
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    >
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} className="focus:outline-none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`}
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Horizontal Bar Chart breakdown */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
              <div className="mb-4">
                <h2 className="font-extrabold text-slate-850 text-base">Spending Breakdown</h2>
                <p className="text-xs font-medium text-slate-450 mt-0.5">Horizontal representation of expenditure magnitude.</p>
              </div>

              <div className="h-64 relative flex-1">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#334155' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`}
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[0, 8, 8, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Leaders & Recents Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Category Leaderboard */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col lg:col-span-1">
              <div className="mb-4">
                <h2 className="font-extrabold text-slate-850 text-base">Budget Leaders</h2>
                <p className="text-xs font-medium text-slate-450 mt-0.5">Categories with highest consumption.</p>
              </div>

              <div className="space-y-4 flex-1">
                {chartData.slice(0, 4).map((entry, index) => {
                  const percentage = ((entry.value / totalAmount) * 100).toFixed(1);
                  return (
                    <div key={entry.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm">{entry.icon}</span>
                          <span>{entry.name}</span>
                        </span>
                        <span className="text-slate-400 font-semibold">{percentage}%</span>
                      </div>
                      
                      {/* Custom progress bar */}
                      <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>₹{Number(entry.value).toLocaleString('en-IN')} spent</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Expenses List */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-extrabold text-slate-850 text-base">Recent Ledger Entries</h2>
                  <p className="text-xs font-medium text-slate-450 mt-0.5">The last 5 logged expenses in the registry.</p>
                </div>
                
                <Link 
                  to="/expenses" 
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-purple-650 hover:text-purple-800 transition-colors group cursor-pointer"
                >
                  <span>View All Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-between">
                {recentExpenses.map(expense => {
                  const cat = CATEGORIES.find(c => c.label === expense.category);
                  return (
                    <div key={expense.id} className="py-3 flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-slate-100 transition-all duration-300">
                          {cat?.icon || '📦'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate group-hover:text-purple-950 transition-colors">
                            {expense.description}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-450 mt-0.5 truncate">
                            {expense.category} · Paid by <span className="text-slate-600 font-bold">{expense.paid_by}</span> · Date: {expense.expense_date} · Logged: {new Date(expense.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-extrabold text-purple-750 text-sm">
                          ₹{Number(expense.amount).toLocaleString('en-IN')}
                        </p>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                          {expense.entry_type?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
