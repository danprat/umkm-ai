-- ============================================
-- UMKM-AI SaaS Database Schema
-- Created: 2024-12-17
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 0,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    credits_granted BOOLEAN NOT NULL DEFAULT FALSE, -- Track if free credits already granted
    last_generate_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admins table (email whitelist)
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Credit packages table
CREATE TABLE public.credit_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price INTEGER NOT NULL, -- in IDR (Rupiah)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.credit_packages(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- in IDR
    credits INTEGER NOT NULL,
    order_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'expired')),
    payment_method TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coupons table
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    credits INTEGER NOT NULL,
    max_users INTEGER NOT NULL DEFAULT 1,
    used_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coupon redemptions table
CREATE TABLE public.coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(coupon_id, user_id) -- One-time redemption per user
);

-- Generation history table
CREATE TABLE public.generation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    image_path TEXT NOT NULL,
    aspect_ratio TEXT,
    page_type TEXT NOT NULL, -- 'generate', 'promo', 'mascot', 'food', 'style'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings table (key-value store)
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupon_redemptions_user_id ON public.coupon_redemptions(user_id);
CREATE INDEX idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX idx_generation_history_created_at ON public.generation_history(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE email = auth.jwt()->>'email'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin());

-- Admins table policies (only admins can read)
CREATE POLICY "Admins can view admin list" ON public.admins
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can check if they are admin" ON public.admins
    FOR SELECT USING (email = auth.jwt()->>'email');

-- Credit packages policies (public read, admin write)
CREATE POLICY "Anyone can view active packages" ON public.credit_packages
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage packages" ON public.credit_packages
    FOR ALL USING (public.is_admin());

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.transactions
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all transactions" ON public.transactions
    FOR UPDATE USING (public.is_admin());

-- Coupons policies
CREATE POLICY "Admins can manage coupons" ON public.coupons
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view active coupons for redemption" ON public.coupons
    FOR SELECT USING (is_active = TRUE);

-- Coupon redemptions policies
CREATE POLICY "Users can view own redemptions" ON public.coupon_redemptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own redemptions" ON public.coupon_redemptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions" ON public.coupon_redemptions
    FOR SELECT USING (public.is_admin());

-- Generation history policies
CREATE POLICY "Users can view own history" ON public.generation_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own history" ON public.generation_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all history" ON public.generation_history
    FOR SELECT USING (public.is_admin());

-- Settings policies (public read, admin write)
CREATE POLICY "Anyone can view settings" ON public.settings
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage settings" ON public.settings
    FOR ALL USING (public.is_admin());

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, credits, email_verified, credits_granted)
    VALUES (
        NEW.id,
        NEW.email,
        0, -- Start with 0 credits, granted after email verification
        COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_credit_packages_updated_at
    BEFORE UPDATE ON public.credit_packages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
    ('free_credits', '10'::jsonb),
    ('rate_limit_seconds', '60'::jsonb);

-- Insert default credit packages
INSERT INTO public.credit_packages (name, credits, price, is_active) VALUES
    ('Starter', 50, 25000, TRUE),
    ('Popular', 100, 45000, TRUE),
    ('Pro', 250, 100000, TRUE);

-- ============================================
-- IMPORTANT: Add your admin email below!
-- ============================================
-- INSERT INTO public.admins (email) VALUES ('your-admin-email@gmail.com');

-- ============================================
-- STORAGE BUCKET (Run in Supabase Dashboard)
-- ============================================
-- 1. Go to Storage > Create new bucket
-- 2. Name: "generated-images"
-- 3. Public bucket: Yes
-- 4. Add policies:
--    - INSERT: authenticated users can upload to their folder (storage.foldername(name)[1] = auth.uid()::text)
--    - SELECT: public read access

-- ============================================
-- EDGE FUNCTION SECRETS (Set in Supabase Dashboard)
-- ============================================
-- PAKASIR_SLUG=your-pakasir-slug
-- PAKASIR_API_KEY=your-pakasir-api-key
-- GEMINI_API_KEY=your-gemini-api-key
