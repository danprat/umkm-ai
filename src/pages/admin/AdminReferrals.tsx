import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Gift, 
  Users, 
  Coins, 
  TrendingUp, 
  Loader2, 
  Search, 
  CheckCircle2, 
  Clock,
  Percent
} from 'lucide-react';

interface ReferralData {
  id: string;
  referrer_id: string;
  referred_id: string;
  signup_bonus_awarded: number;
  created_at: string;
  completed_at: string | null;
  referrer_email: string;
  referred_email: string;
}

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalSignupBonusAwarded: number;
  totalCommissionAwarded: number;
}

export default function AdminReferrals() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalSignupBonusAwarded: 0,
    totalCommissionAwarded: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSettings, setCurrentSettings] = useState({
    signupBonus: 10,
    commissionPercent: 10,
  });

  const fetchReferrals = async () => {
    setIsLoading(true);
    try {
      // Fetch referrals with profile info
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          referrer_id,
          referred_id,
          signup_bonus_awarded,
          created_at,
          completed_at
        `)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      // Get unique user IDs
      const userIds = new Set<string>();
      referralsData?.forEach(r => {
        userIds.add(r.referrer_id);
        userIds.add(r.referred_id);
      });

      // Fetch profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', Array.from(userIds));

      const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

      // Map referrals with email info
      const mappedReferrals: ReferralData[] = referralsData?.map(r => ({
        ...r,
        referrer_email: profileMap.get(r.referrer_id) || 'Unknown',
        referred_email: profileMap.get(r.referred_id) || 'Unknown',
      })) || [];

      setReferrals(mappedReferrals);

      // Calculate stats
      const totalReferrals = mappedReferrals.length;
      const completedReferrals = mappedReferrals.filter(r => r.completed_at !== null).length;
      const pendingReferrals = totalReferrals - completedReferrals;
      const totalSignupBonusAwarded = mappedReferrals.reduce((sum, r) => sum + r.signup_bonus_awarded, 0);

      // Fetch total commissions
      const { data: commissions } = await supabase
        .from('referral_commissions')
        .select('commission_credits');

      const totalCommissionAwarded = commissions?.reduce((sum, c) => sum + c.commission_credits, 0) || 0;

      setStats({
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalSignupBonusAwarded,
        totalCommissionAwarded,
      });

      // Fetch current settings
      const { data: settings } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['referral_signup_bonus', 'referral_commission_percent']);

      if (settings) {
        const signupBonus = settings.find(s => s.key === 'referral_signup_bonus');
        const commissionPercent = settings.find(s => s.key === 'referral_commission_percent');
        
        setCurrentSettings({
          signupBonus: parseInt(signupBonus?.value as string, 10) || 10,
          commissionPercent: parseInt(commissionPercent?.value as string, 10) || 10,
        });
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch referrals data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const filteredReferrals = referrals.filter(r => 
    r.referrer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.referred_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statCards = [
    {
      title: 'Total Referrals',
      value: stats.totalReferrals,
      icon: Users,
      bg: 'bg-genz-lime',
    },
    {
      title: 'Completed',
      value: stats.completedReferrals,
      icon: CheckCircle2,
      bg: 'bg-genz-cyan',
    },
    {
      title: 'Pending',
      value: stats.pendingReferrals,
      icon: Clock,
      bg: 'bg-genz-coral',
    },
    {
      title: 'Signup Bonus Given',
      value: `${stats.totalSignupBonusAwarded} credits`,
      icon: Gift,
      bg: 'bg-genz-pink',
    },
    {
      title: 'Commission Given',
      value: `${stats.totalCommissionAwarded} credits`,
      icon: TrendingUp,
      bg: 'bg-genz-purple',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-display uppercase font-bold bg-genz-pink inline-block px-4 py-2 border-4 border-black shadow-brutal transform -rotate-1 text-black">
          Referrals
        </h1>
        <p className="text-lg font-bold mt-3 flex items-center gap-2">
          Kelola dan pantau program referral <Gift className="w-5 h-5" />
        </p>
      </div>

      {/* Current Settings Info */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-genz-lime/30 border-3 border-black px-4 py-2 rounded-lg flex items-center gap-2">
          <Gift className="w-5 h-5" />
          <span className="font-bold">Signup Bonus: {currentSettings.signupBonus} credits</span>
        </div>
        <div className="bg-genz-purple/30 border-3 border-black px-4 py-2 rounded-lg flex items-center gap-2">
          <Percent className="w-5 h-5" />
          <span className="font-bold">Commission: {currentSettings.commissionPercent}%</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="border-4 border-black shadow-brutal bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`${card.bg} p-2 border-2 border-black rounded-lg`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-500">{card.title}</p>
                  {isLoading ? (
                    <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <p className="text-xl font-display">{card.value}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referrals Table */}
      <Card className="border-4 border-black shadow-brutal-lg bg-white">
        <CardHeader className="border-b-4 border-black bg-genz-pink/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl font-display uppercase">Daftar Referral</CardTitle>
              <CardDescription className="text-base font-bold">
                Semua referral yang terdaftar di sistem
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Cari email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="text-center py-16">
              <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-bold">Belum ada referral</p>
            </div>
          ) : (
            <div className="border-4 border-black rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black hover:bg-black">
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Referrer</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Referred</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Bonus</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Status</TableHead>
                    <TableHead className="text-white font-display uppercase">Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferrals.map((referral) => (
                    <TableRow key={referral.id} className="border-b-2 border-black/10 hover:bg-genz-pink/10">
                      <TableCell className="font-mono text-sm">{referral.referrer_email}</TableCell>
                      <TableCell className="font-mono text-sm">{referral.referred_email}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-genz-lime/50 border-2 border-black/20 rounded font-mono font-bold">
                          {referral.signup_bonus_awarded} credits
                        </span>
                      </TableCell>
                      <TableCell>
                        {referral.completed_at ? (
                          <Badge className="bg-green-500 text-white border-2 border-black">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500 text-black border-2 border-black">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">
                        {formatDate(referral.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
