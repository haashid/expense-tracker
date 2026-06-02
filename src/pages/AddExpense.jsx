import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, ENTRY_TYPES } from '../lib/constants';
import { Calendar, AlignLeft, User, DollarSign, Wallet, FileImage, Clipboard, Sparkles, Upload, X, ArrowLeft, Camera, Images } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AddExpense() {
  const { user, profile } = useAuth();
  const { addExpense } = useExpenses();
  const navigate = useNavigate();
  const [entryType, setEntryType] = useState('manual');
  const [loading, setLoading] = useState(false);
  
  // File upload states
  const [paymentFile, setPaymentFile] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState('');
  const [billFile, setBillFile] = useState(null);
  const [billPreview, setBillPreview] = useState('');

  const [form, setForm] = useState({
    category: 'Miscellaneous',
    amount: '',
    description: '',
    paid_by: profile?.full_name || '',
    notes: '',
    expense_date: new Date().toISOString().split('T')[0],
  });

  const [validationError, setValidationError] = useState('');

  // Handle files and generate local base64 previews
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG) only.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'payment') {
        setPaymentFile(file);
        setPaymentPreview(reader.result);
      } else {
        setBillFile(file);
        setBillPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearFile = (type) => {
    if (type === 'payment') {
      setPaymentFile(null);
      setPaymentPreview('');
    } else {
      setBillFile(null);
      setBillPreview('');
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError('');

    const parsedAmount = parseFloat(form.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Please enter a valid expense amount greater than zero.');
      return;
    }

    if (!form.description.trim()) {
      setValidationError('Please write a brief description of what this expense was for.');
      return;
    }

    // Validation for files if entry type demands it
    if (entryType === 'payment_screenshot' && !paymentFile) {
      setValidationError('Please upload a screenshot of the payment proof.');
      return;
    }
    if (entryType === 'bill_screenshot' && !billFile) {
      setValidationError('Please upload a photo of the bill or invoice.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: parsedAmount,
        entry_type: entryType,
        user_id: user?.id
      };

      await addExpense(
        payload,
        entryType === 'payment_screenshot' ? paymentFile : null,
        entryType === 'bill_screenshot' ? billFile : null
      );

      navigate('/expenses');
    } catch (err) {
      setValidationError(err.message || 'An error occurred while saving the expense.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Back to dashboard */}
      <div className="flex items-center gap-2">
        <Link 
          to="/" 
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-sm font-bold text-slate-500">Back to Analytics</span>
      </div>

      <div className="glass-card p-6 md:p-8 space-y-6">
        
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span>Add Wedding Expense</span>
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </h1>
          <p className="text-sm font-medium mt-1 >Select an entry method and input the transaction details below.</p>
        </div>

        {/* Entry Type Selector Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest pl-0.5">Entry Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ENTRY_TYPES.map(type => {
              const isActive = entryType === type.value;
              return (
                <button 
                  key={type.value} 
                  type="button"
                  onClick={() => setEntryType(type.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-24 ${
                    isActive
                      ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-100'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <p className={`font-bold text-sm ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>{type.label}</p>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${isActive ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug mt-2 font-medium">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-3 border-t border-slate-100">
          
          {validationError && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-2xl animate-shake">
              ⚠️ {validationError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest pl-0.5">Expense Category</label>
              <div className="relative">
                <select 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full pl-3.5 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all font-semibold text-slate-700 text-sm appearance-none"
                >
                  {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.icon} {c.label}</option>)}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-xs >▼</div>
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest pl-0.5">Amount (₹)</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</div>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  required 
                  value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all font-extrabold text-slate-800 placeholder-slate-350 text-sm"
                />
              </div>
            </div>

          </div>

          {/* Description input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest pl-0.5">What was this for?</label>
            <div className="relative">
              <Clipboard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="e.g. Bridal make-up booking, DJ booking deposit..." 
                required
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all font-semibold text-slate-700 text-sm placeholder-slate-350"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Paid By input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest pl-0.5">Paid by (Shopper)</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text" 
                  required 
                  placeholder="Family member name"
                  value={form.paid_by}
                  onChange={e => setForm({...form, paid_by: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all font-semibold text-slate-700 text-sm placeholder-slate-350"
                />
              </div>
            </div>

            {/* Date input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest pl-0.5">Date of Expense</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="date" 
                  required 
                  value={form.expense_date}
                  onChange={e => setForm({...form, expense_date: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all font-semibold text-slate-700 text-sm"
                />
              </div>
            </div>

          </div>

          {/* Screenshot Upload - CONDITIONAL: Payment */}
          {entryType === 'payment_screenshot' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest pl-0.5">Payment Screenshot</label>
              
              {paymentPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2.5 max-w-xs group shadow-inner">
                  <img src={paymentPreview} alt="Payment Preview" className="max-w-full max-h-48 object-cover rounded-xl shadow" />
                  <button 
                    type="button" 
                    onClick={() => handleClearFile('payment')}
                    className="absolute top-4 right-4 w-7 h-7 bg-red-650 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer hover:scale-105 active:scale-95 text-xs font-bold"
                  >
                    ✕
                  </button>
                  <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1 pl-1">
                    ✓ Attached: {paymentFile.name}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {/* Camera Button - Payment */}
                  <label className="relative flex flex-col items-center justify-center gap-2.5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 text-blue-700 rounded-2xl p-5 cursor-pointer transition-all duration-200 active:scale-95 group">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={e => handleFileChange(e, 'payment')}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-extrabold">Take Photo</p>
                      <p className="text-[10px] font-semibold text-blue-400 mt-0.5">Open camera</p>
                    </div>
                  </label>

                  {/* Gallery Button - Payment */}
                  <label className="relative flex flex-col items-center justify-center gap-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-400 text-slate-600 rounded-2xl p-5 cursor-pointer transition-all duration-200 active:scale-95 group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileChange(e, 'payment')}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <Images className="w-6 h-6 text-slate-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-extrabold">From Gallery</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Choose image</p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Screenshot Upload - CONDITIONAL: Bill */}
          {entryType === 'bill_screenshot' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest pl-0.5">Bill / Invoice photo</label>
              
              {billPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2.5 max-w-xs group shadow-inner">
                  <img src={billPreview} alt="Bill Preview" className="max-w-full max-h-48 object-cover rounded-xl shadow" />
                  <button 
                    type="button" 
                    onClick={() => handleClearFile('bill')}
                    className="absolute top-4 right-4 w-7 h-7 bg-red-650 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer hover:scale-105 active:scale-95 text-xs font-bold"
                  >
                    ✕
                  </button>
                  <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1 pl-1">
                    ✓ Attached: {billFile.name}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {/* Camera Button - Bill */}
                  <label className="relative flex flex-col items-center justify-center gap-2.5 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-400 text-emerald-700 rounded-2xl p-5 cursor-pointer transition-all duration-200 active:scale-95 group">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={e => handleFileChange(e, 'bill')}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-extrabold">Take Photo</p>
                      <p className="text-[10px] font-semibold text-emerald-500 mt-0.5">Open camera</p>
                    </div>
                  </label>

                  {/* Gallery Button - Bill */}
                  <label className="relative flex flex-col items-center justify-center gap-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-400 text-slate-600 rounded-2xl p-5 cursor-pointer transition-all duration-200 active:scale-95 group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileChange(e, 'bill')}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <Images className="w-6 h-6 text-slate-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-extrabold">From Gallery</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Choose image</p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Notes input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest pl-0.5">Shopper Notes (Optional)</label>
            <div className="relative">
              <AlignLeft className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              <textarea 
                rows={2} 
                placeholder="Any special remarks, vendor phone numbers, or installment details..." 
                value={form.notes}
                onChange={e => setForm({...form, notes: e.target.value})}
                className="w-full pl-11 pr-4 py-3 input-glass rounded-xl focus:outline-none font-semibold text-slate-700 text-sm placeholder-slate-350"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="glow-btn w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Logging transaction to registry...</span>
              </>
            ) : (
              <>
                <span>Commit Expense to Registry</span>
                <Wallet className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

      </div>

    </div>
  );
}
