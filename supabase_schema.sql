-- ==========================================
-- 💍 HASHEEMA'S WEDDING EXPENSE TRACKER SCHEMA
-- Run this script in your Supabase SQL Editor.
-- ==========================================

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Trigger function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 
    CASE 
      WHEN NEW.email = 'haashidgo@gmail.com' THEN 'admin'
      ELSE 'member'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the above trigger function
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'Venue', 'Catering/Food', 'Clothes/Outfits', 'Jewelry',
    'Decoration', 'Photography', 'Transport', 'Gifts',
    'Mehendi/Salon', 'Miscellaneous'
  )),
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  paid_by TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('manual', 'payment_screenshot', 'bill_screenshot')),
  payment_screenshot_url TEXT,
  bill_screenshot_url TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on Expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Trigger function to automatically update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS expenses_updated_at ON public.expenses;
CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ==========================================
-- 🔐 ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Profiles Read & Update Policies
CREATE POLICY "Users can read all profiles" ON public.profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can update any profile" ON public.profiles 
  FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Expenses Select, Insert, Update, and Delete Policies
CREATE POLICY "All authenticated users can view expenses" ON public.expenses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses or Admin update any" ON public.expenses
  FOR UPDATE USING (
    auth.uid() = user_id OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Users can delete own expenses or Admin delete any" ON public.expenses
  FOR DELETE USING (
    auth.uid() = user_id OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ==========================================
-- 📷 PUBLIC STORAGE BUCKET FOR RECEIPTS
-- ==========================================

-- Insert the receipt uploads bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('expense-uploads', 'expense-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage upload policy
CREATE POLICY "Authenticated users can upload receipt photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'expense-uploads' AND auth.role() = 'authenticated');

-- Storage public read policy
CREATE POLICY "Anyone can view receipt photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'expense-uploads');

-- Storage delete policy
CREATE POLICY "Admin or owner can delete receipt photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'expense-uploads' AND (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
  );
