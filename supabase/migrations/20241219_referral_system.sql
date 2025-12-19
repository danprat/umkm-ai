-- ============================================
-- Referral System Schema
-- Created: 2024-12-19
-- ============================================

-- ============================================
-- ADD REFERRAL COLUMNS TO PROFILES
-- ============================================

-- Add referral_code column (unique 8-char code for each user)
ALTER TABLE public.profiles 
ADD COLUMN referral_code TEXT UNIQUE;

-- Add referred_by column (who referred this user)
ALTER TABLE public.profiles 
ADD COLUMN referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ============================================
-- REFERRAL TRACKING TABLE
-- ============================================

-- Main referrals table to track who referred whom
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    signup_bonus_awarded INTEGER NOT NULL DEFAULT 0, -- Credits awarded to referrer for signup
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ, -- When email was verified and bonus awarded
    UNIQUE(referred_id) -- Each user can only be referred once
);

-- ============================================
-- REFERRAL COMMISSIONS TABLE
-- ============================================

-- Track commission from referred user's purchases
CREATE TABLE public.referral_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    commission_credits INTEGER NOT NULL, -- Credits awarded to referrer
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(transaction_id) -- One commission per transaction
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX idx_referral_commissions_referral_id ON public.referral_commissions(referral_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;

-- Referrals policies
CREATE POLICY "Users can view referrals where they are referrer" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals where they are referred" ON public.referrals
    FOR SELECT USING (auth.uid() = referred_id);

CREATE POLICY "Admins can view all referrals" ON public.referrals
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage all referrals" ON public.referrals
    FOR ALL USING (public.is_admin());

-- Referral commissions policies
CREATE POLICY "Users can view own commissions as referrer" ON public.referral_commissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.referrals 
            WHERE referrals.id = referral_commissions.referral_id 
            AND referrals.referrer_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all commissions" ON public.referral_commissions
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage all commissions" ON public.referral_commissions
    FOR ALL USING (public.is_admin());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate unique referral code (8 uppercase alphanumeric characters)
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluded confusing chars: I, O, 0, 1
    code TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to get unique referral code (retry if collision)
CREATE OR REPLACE FUNCTION public.get_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    max_attempts INTEGER := 10;
    attempt INTEGER := 0;
BEGIN
    LOOP
        new_code := public.generate_referral_code();
        -- Check if code already exists
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code) THEN
            RETURN new_code;
        END IF;
        attempt := attempt + 1;
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Could not generate unique referral code after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate referral code on profile insert
CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := public.get_unique_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code for new profiles
CREATE TRIGGER set_profile_referral_code
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_referral_code();

-- ============================================
-- UPDATE EXISTING PROFILES WITH REFERRAL CODES
-- ============================================

-- Generate referral codes for all existing users
UPDATE public.profiles 
SET referral_code = public.get_unique_referral_code()
WHERE referral_code IS NULL;

-- ============================================
-- REFERRAL SETTINGS
-- ============================================

-- Insert referral settings
INSERT INTO public.settings (key, value) VALUES
    ('referral_signup_bonus', '10'::jsonb),  -- Credits awarded to referrer when referred user signs up
    ('referral_commission_percent', '10'::jsonb)  -- Percentage of credits to award as commission
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS FOR REFERRAL STATS
-- ============================================

-- Function to get referral stats for a user
CREATE OR REPLACE FUNCTION public.get_referral_stats(user_uuid UUID)
RETURNS TABLE (
    total_referrals BIGINT,
    completed_referrals BIGINT,
    total_signup_bonus BIGINT,
    total_commission BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(r.id)::BIGINT as total_referrals,
        COUNT(r.completed_at)::BIGINT as completed_referrals,
        COALESCE(SUM(r.signup_bonus_awarded), 0)::BIGINT as total_signup_bonus,
        COALESCE(SUM(rc.commission_credits), 0)::BIGINT as total_commission
    FROM public.referrals r
    LEFT JOIN public.referral_commissions rc ON rc.referral_id = r.id
    WHERE r.referrer_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
