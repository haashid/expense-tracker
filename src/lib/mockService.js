// Mock Service for offline/demo mode when Supabase is not configured yet
import { CATEGORIES } from './constants';

const SEED_PROFILES = [
  { id: 'user-admin-1', full_name: 'Haashid (Admin)', role: 'admin', created_at: new Date(2026, 4, 1).toISOString() },
  { id: 'user-bride-1', full_name: 'Hasheema (Bride)', role: 'member', created_at: new Date(2026, 4, 1).toISOString() },
  { id: 'user-member-1', full_name: 'Amina Khan', role: 'member', created_at: new Date(2026, 4, 2).toISOString() },
  { id: 'user-member-2', full_name: 'Zayd Ali', role: 'member', created_at: new Date(2026, 4, 3).toISOString() },
  { id: 'user-member-3', full_name: 'Farhan Syed', role: 'member', created_at: new Date(2026, 4, 4).toISOString() },
];

const SEED_EXPENSES = [
  {
    id: 'exp-1',
    user_id: 'user-admin-1',
    category: 'Venue',
    amount: 150000.00,
    description: 'Grand Palace Banquet Hall Deposit',
    paid_by: 'Haashid',
    entry_type: 'manual',
    payment_screenshot_url: '',
    bill_screenshot_url: '',
    expense_date: '2026-05-10',
    notes: '50% advance booking for the main wedding reception.',
    created_at: new Date(2026, 4, 10).toISOString(),
    updated_at: new Date(2026, 4, 10).toISOString()
  },
  {
    id: 'exp-2',
    user_id: 'user-member-1',
    category: 'Catering/Food',
    amount: 85000.00,
    description: 'Mughlai Buffet Catering Advance',
    paid_by: 'Amina Khan',
    entry_type: 'payment_screenshot',
    payment_screenshot_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    bill_screenshot_url: '',
    expense_date: '2026-05-12',
    notes: 'Advance payment for 250 guests menu selection.',
    created_at: new Date(2026, 4, 12).toISOString(),
    updated_at: new Date(2026, 4, 12).toISOString()
  },
  {
    id: 'exp-3',
    user_id: 'user-bride-1',
    category: 'Clothes/Outfits',
    amount: 65000.00,
    description: 'Bridal Lehenga (Custom designer)',
    paid_by: 'Hasheema',
    entry_type: 'bill_screenshot',
    payment_screenshot_url: '',
    bill_screenshot_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    expense_date: '2026-05-15',
    notes: 'Fitting schedule on June 15th.',
    created_at: new Date(2026, 4, 15).toISOString(),
    updated_at: new Date(2026, 4, 15).toISOString()
  },
  {
    id: 'exp-4',
    user_id: 'user-member-2',
    category: 'Jewelry',
    amount: 120000.00,
    description: '22K Gold Choker Set',
    paid_by: 'Zayd Ali',
    entry_type: 'manual',
    payment_screenshot_url: '',
    bill_screenshot_url: '',
    expense_date: '2026-05-18',
    notes: 'Purchased from Tanishq Jewellers.',
    created_at: new Date(2026, 4, 18).toISOString(),
    updated_at: new Date(2026, 4, 18).toISOString()
  },
  {
    id: 'exp-5',
    user_id: 'user-member-3',
    category: 'Decoration',
    amount: 40000.00,
    description: 'Stage Floral Setup & Lighting Advance',
    paid_by: 'Farhan Syed',
    entry_type: 'payment_screenshot',
    payment_screenshot_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
    bill_screenshot_url: '',
    expense_date: '2026-05-20',
    notes: 'Rose and Jasmine theme with fairy lights.',
    created_at: new Date(2026, 4, 20).toISOString(),
    updated_at: new Date(2026, 4, 20).toISOString()
  },
  {
    id: 'exp-6',
    user_id: 'user-admin-1',
    category: 'Photography',
    amount: 50000.00,
    description: 'Cinematography & Pre-Wedding Shoot Deposit',
    paid_by: 'Haashid',
    entry_type: 'manual',
    payment_screenshot_url: '',
    bill_screenshot_url: '',
    expense_date: '2026-05-22',
    notes: 'Vivid Studio photography package.',
    created_at: new Date(2026, 4, 22).toISOString(),
    updated_at: new Date(2026, 4, 22).toISOString()
  },
  {
    id: 'exp-7',
    user_id: 'user-member-1',
    category: 'Transport',
    amount: 15000.00,
    description: 'Family Transport Car Rentals (3 Days)',
    paid_by: 'Amina Khan',
    entry_type: 'manual',
    payment_screenshot_url: '',
    bill_screenshot_url: '',
    expense_date: '2026-05-25',
    notes: 'Rentals for out-of-town guests arrival.',
    created_at: new Date(2026, 4, 25).toISOString(),
    updated_at: new Date(2026, 4, 25).toISOString()
  },
  {
    id: 'exp-8',
    user_id: 'user-member-2',
    category: 'Gifts',
    amount: 25000.00,
    description: 'Customized Gift Boxes for Guests',
    paid_by: 'Zayd Ali',
    entry_type: 'manual',
    payment_screenshot_url: '',
    bill_screenshot_url: '',
    expense_date: '2026-05-26',
    notes: 'Dry fruits and sweet boxes including card.',
    created_at: new Date(2026, 4, 26).toISOString(),
    updated_at: new Date(2026, 4, 26).toISOString()
  },
  {
    id: 'exp-9',
    user_id: 'user-bride-1',
    category: 'Mehendi/Salon',
    amount: 12000.00,
    description: 'Bridal Henna & Salon Booking',
    paid_by: 'Hasheema',
    entry_type: 'manual',
    payment_screenshot_url: '',
    bill_screenshot_url: '',
    expense_date: '2026-05-28',
    notes: 'Booking for bride and sisters.',
    created_at: new Date(2026, 4, 28).toISOString(),
    updated_at: new Date(2026, 4, 28).toISOString()
  },
  {
    id: 'exp-10',
    user_id: 'user-member-3',
    category: 'Miscellaneous',
    amount: 8000.00,
    description: 'Custom Wedding Invitations & Stamps',
    paid_by: 'Farhan Syed',
    entry_type: 'manual',
    payment_screenshot_url: '',
    bill_screenshot_url: '',
    expense_date: '2026-05-29',
    notes: 'E-invites and printed floral cards.',
    created_at: new Date(2026, 4, 29).toISOString(),
    updated_at: new Date(2026, 4, 29).toISOString()
  }
];

// Initialize localStorage if not set or contains outdated names
const existingProfiles = localStorage.getItem('wedding_profiles');
if (!existingProfiles || existingProfiles.includes('Hashima')) {
  localStorage.setItem('wedding_profiles', JSON.stringify(SEED_PROFILES));
  localStorage.setItem('wedding_expenses', JSON.stringify(SEED_EXPENSES));
  localStorage.removeItem('wedding_session');
} else {
  if (!localStorage.getItem('wedding_expenses')) {
    localStorage.setItem('wedding_expenses', JSON.stringify(SEED_EXPENSES));
  }
}

const getProfiles = () => JSON.parse(localStorage.getItem('wedding_profiles'));
const saveProfiles = (data) => localStorage.setItem('wedding_profiles', JSON.stringify(data));

const getExpenses = () => JSON.parse(localStorage.getItem('wedding_expenses'));
const saveExpenses = (data) => localStorage.setItem('wedding_expenses', JSON.stringify(data));

export const mockService = {
  // Authentication Mocking
  auth: {
    signIn: async (email, password) => {
      // Create user profile or match existing
      const profiles = getProfiles();
      let userProfile = profiles.find(p => p.id === `user-${email.split('@')[0]}`);
      
      if (!userProfile) {
        // Automatically make admin if email starts with admin or contains haashid
        const isAdmin = email.toLowerCase().startsWith('admin') || email.toLowerCase().includes('haashid');
        userProfile = {
          id: `user-${email.split('@')[0]}-${Math.random().toString(36).substr(2, 5)}`,
          full_name: email.toLowerCase().includes('haashid') 
            ? 'Haashid (Admin)' 
            : email.toLowerCase().includes('hasheema')
              ? 'Hasheema (Bride)'
              : email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          role: isAdmin ? 'admin' : 'member',
          created_at: new Date().toISOString()
        };
        profiles.push(userProfile);
        saveProfiles(profiles);
      }

      const mockSession = {
        user: {
          id: userProfile.id,
          email: email,
          user_metadata: { full_name: userProfile.full_name }
        },
        profile: userProfile
      };

      localStorage.setItem('wedding_session', JSON.stringify(mockSession));
      
      // Trigger auth state change manually via simple pubsub if needed, or rely on page reload / react state
      return { data: mockSession, error: null };
    },

    signOut: async () => {
      localStorage.removeItem('wedding_session');
      return { error: null };
    },

    getSession: async () => {
      const sessionStr = localStorage.getItem('wedding_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        // Sync role just in case admin panel updated it
        const profiles = getProfiles();
        const freshProfile = profiles.find(p => p.id === session.user.id);
        if (freshProfile) {
          session.profile = freshProfile;
        }
        return { data: { session }, error: null };
      }
      return { data: { session: null }, error: null };
    }
  },

  // Profile management Mocking
  profiles: {
    getAll: async () => {
      return { data: getProfiles(), error: null };
    },
    
    updateRole: async (userId, newRole) => {
      const profiles = getProfiles();
      const updated = profiles.map(p => p.id === userId ? { ...p, role: newRole } : p);
      saveProfiles(updated);
      
      // Update session if it's the current user
      const sessionStr = localStorage.getItem('wedding_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.user.id === userId) {
          session.profile.role = newRole;
          localStorage.setItem('wedding_session', JSON.stringify(session));
        }
      }
      return { data: updated.find(p => p.id === userId), error: null };
    }
  },

  // Expenses management Mocking
  expenses: {
    getAll: async (filters = {}) => {
      let expenses = getExpenses();
      const profiles = getProfiles();

      // Hydrate with profile full_name
      expenses = expenses.map(exp => {
        const profile = profiles.find(p => p.id === exp.user_id) || { full_name: exp.paid_by || 'Unknown' };
        return {
          ...exp,
          profiles: {
            full_name: profile.full_name
          }
        };
      });

      // Apply filters
      if (filters.category) {
        expenses = expenses.filter(e => e.category === filters.category);
      }
      if (filters.entry_type) {
        expenses = expenses.filter(e => e.entry_type === filters.entry_type);
      }
      if (filters.date_from) {
        expenses = expenses.filter(e => e.expense_date >= filters.date_from);
      }
      if (filters.date_to) {
        expenses = expenses.filter(e => e.expense_date <= filters.date_to);
      }

      // Sort descending by date
      expenses.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));

      return { data: expenses, error: null };
    },

    insert: async (expenseData, paymentFile, billFile) => {
      const expenses = getExpenses();
      const newExpense = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        ...expenseData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // In mock mode, if files are provided we convert them to dataURLs (base64) so they can render
      if (paymentFile) {
        newExpense.payment_screenshot_url = await fileToDataUrl(paymentFile);
      }
      if (billFile) {
        newExpense.bill_screenshot_url = await fileToDataUrl(billFile);
      }

      expenses.push(newExpense);
      saveExpenses(expenses);
      return { data: newExpense, error: null };
    },

    delete: async (id) => {
      const expenses = getExpenses();
      const filtered = expenses.filter(e => e.id !== id);
      saveExpenses(filtered);
      return { data: id, error: null };
    }
  }
};

// Helper to convert File to base64 DataURL
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
