import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface ReferralStats {
  total_referrals: number;
  verified_referrals: number;
  signup_bonus_total: number;
  commission_total: number;
  referrals: ReferredUser[];
}

export interface ReferredUser {
  referred_id: string;
  referred_email: string;
  created_at: string;
  completed_at: string | null;
  signup_bonus_awarded: number;
}

export function useReferral() {
  const { user, profile } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch referral code from profile
  useEffect(() => {
    const fetchReferralCode = async () => {
      if (!user) {
        setReferralCode(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setReferralCode(data.referral_code);
      }
    };

    fetchReferralCode();
  }, [user]);

  // Fetch referral stats
  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats({
        totalReferrals: 0,
        completedReferrals: 0,
        totalSignupBonus: 0,
        totalCommission: 0,
      });
      return;null);
      return;
    }

    setIsLoading(true);

    try {
      // Get referrals where user is the referrer
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          signup_bonus_awarded,
          completed_at,
          referred_id,
          created_at,
          profiles!referrals_referred_id_fkey (
            email
          )
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
        setIsLoading(false);
        return;
      }

      // Get commissions for this user's referrals
      const referralIds = referrals?.map(r => r.id) || [];
      let commission_total = 0;

      if (referralIds.length > 0) {
        const { data: commissions, error: commissionsError } = await supabase
          .from('referral_commissions')
          .select('commission_credits')
          .in('referral_id', referralIds);

        if (!commissionsError && commissions) {
          commission_total = commissions.reduce((sum, c) => sum + c.commission_credits, 0);
        }
      }

      // Calculate stats
      const total_referrals = referrals?.length || 0;
      const verified_referrals = referrals?.filter(r => r.completed_at !== null).length || 0;
      const signup_bonus_total = referrals?.reduce((sum, r) => sum + r.signup_bonus_awarded, 0) || 0;

      // Map referred users
      const referralsList: ReferredUser[] = referrals?.map(r => ({
        referred_id: r.referred_id,
        referred_email: (r.profiles as any)?.email || 'Unknown',
        created_at: r.created_at,
        completed_at: r.completed_at,
        signup_bonus_awarded: r.signup_bonus_awarded,
      })) || [];

      setStats({
        total_referrals,
        verified_referrals,
        signup_bonus_total,
        commission_total,
        referrals: referralsList,
      }

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Generate referral link
  const getReferralLink = useCallback(() => {
    if (!referralCode) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/login?ref=${referralCode}`;
  }, [referralCode]);

  // Copy referral link to clipboard
  const copyReferralLink = useCallback(async () => {
    const link = getReferralLink();
    if (link) {
      await navigator.clipboard.writeText(link);
      return true;
    }
    return false;
  }, [getReferralLink]);

  // Copy referral code to clipboard
  const copyReferralCode = useCallback(async () => {
    if (referralCode) {
      await navigator.clipboard.writeText(referralCode);
      return true;
    }
    return false;
  }, [referralCode]);

  return {
    referralCode,
    stats,
    isLoading,
    getReferralLink,
    copyReferralLink,
    copyReferralCode,
    refreshStats: fetchStats,
  };
}
