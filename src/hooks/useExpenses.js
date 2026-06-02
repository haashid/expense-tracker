import { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockService } from '../lib/mockService';

export function useExpenses(filters = {}) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stable serialised key — prevents infinite re-render when caller
  // passes an inline object literal on every render.
  const filtersKey = JSON.stringify(filters);
  const latestFiltersKey = useRef(filtersKey);
  latestFiltersKey.current = filtersKey;

  async function fetchExpenses() {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        // ── FIXED: removed broken profiles(full_name) join.
        //    expenses.user_id → auth.users, NOT profiles, so PostgREST
        //    cannot auto-resolve that join and returns a 400.
        //    The paid_by column already stores the name we need.
        let query = supabase
          .from('expenses')
          .select('*')
          .order('expense_date', { ascending: false });

        const parsed = JSON.parse(latestFiltersKey.current);
        if (parsed.category)  query = query.eq('category', parsed.category);
        if (parsed.entry_type) query = query.eq('entry_type', parsed.entry_type);
        if (parsed.date_from) query = query.gte('expense_date', parsed.date_from);
        if (parsed.date_to)   query = query.lte('expense_date', parsed.date_to);

        // Safety wrapper to prevent infinite pending state if network hangs
        // Increased to 30 seconds to allow for Supabase Free Tier "Cold Starts" (waking up)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database connection timed out. Please check your network.')), 30000);
        });

        const result = await Promise.race([query, timeoutPromise]);
        if (result.error) throw result.error;
        setExpenses(result.data || []);
      } else {
        const { data, error: mockErr } = await mockService.expenses.getAll(filters);
        if (mockErr) throw mockErr;
        setExpenses(data || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      // Do NOT re-throw — just record the error so the UI can show it
      // without triggering an infinite retry loop.
      setError(err?.message || 'Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  }

  // Only re-run when the serialised filter string actually changes.
  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  async function addExpense(expenseData, paymentFile, billFile) {
    try {
      if (isSupabaseConfigured) {
        const payload = { ...expenseData };

        if (paymentFile) {
          const path = `payments/${Date.now()}-${paymentFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('expense-uploads').upload(path, paymentFile);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage
            .from('expense-uploads').getPublicUrl(path);
          payload.payment_screenshot_url = publicUrl;
        }

        if (billFile) {
          const path = `bills/${Date.now()}-${billFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('expense-uploads').upload(path, billFile);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage
            .from('expense-uploads').getPublicUrl(path);
          payload.bill_screenshot_url = publicUrl;
        }

        const insertQuery = supabase.from('expenses').insert([payload]);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database connection timed out. Your network might be blocking Supabase.')), 30000);
        });

        const result = await Promise.race([insertQuery, timeoutPromise]);
        if (result.error) throw result.error;
        await fetchExpenses();
      } else {
        const { error: mockInsertErr } = await mockService.expenses.insert(expenseData, paymentFile, billFile);
        if (mockInsertErr) throw mockInsertErr;
        await fetchExpenses();
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      throw err;
    }
  }

  async function deleteExpense(id) {
    try {
      if (isSupabaseConfigured) {
        const { error: deleteErr } = await supabase.from('expenses').delete().eq('id', id);
        if (deleteErr) throw deleteErr;
        setExpenses(prev => prev.filter(e => e.id !== id));
      } else {
        const { error: mockDeleteErr } = await mockService.expenses.delete(id);
        if (mockDeleteErr) throw mockDeleteErr;
        setExpenses(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      throw err;
    }
  }

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  return { expenses, loading, error, addExpense, deleteExpense, totalAmount, byCategory, refetch: fetchExpenses };
}
