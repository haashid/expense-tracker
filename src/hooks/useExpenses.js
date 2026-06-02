import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockService } from '../lib/mockService';

export function useExpenses(filters = {}) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchExpenses() {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        let query = supabase
          .from('expenses')
          .select(`*, profiles(full_name)`)
          .order('expense_date', { ascending: false });

        if (filters.category) query = query.eq('category', filters.category);
        if (filters.entry_type) query = query.eq('entry_type', filters.entry_type);
        if (filters.date_from) query = query.gte('expense_date', filters.date_from);
        if (filters.date_to) query = query.lte('expense_date', filters.date_to);

        const { data, error: fetchErr } = await query;
        if (fetchErr) throw fetchErr;
        setExpenses(data || []);
      } else {
        const { data, error: mockErr } = await mockService.expenses.getAll(filters);
        if (mockErr) throw mockErr;
        setExpenses(data || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message || 'An error occurred fetching expenses.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExpenses();
  }, [JSON.stringify(filters)]);

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

        const { error: insertError } = await supabase.from('expenses').insert([payload]);
        if (insertError) throw insertError;
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
