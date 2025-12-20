import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, Ticket, Image, TrendingUp, Coins, Wrench, BarChart3, Zap, Activity } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalRevenue: number;
  totalTransactions: number;
  totalGenerations: number;
  activeCoupons: number;
  creditsIssued: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    totalGenerations: 0,
    activeCoupons: 0,
    creditsIssued: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch completed transactions and revenue
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, credits')
          .eq('status', 'completed');

        const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
        const creditsIssued = transactions?.reduce((sum, t) => sum + t.credits, 0) || 0;

        // Fetch generations count
        const { count: generationsCount } = await supabase
          .from('generation_history')
          .select('*', { count: 'exact', head: true });

        // Fetch active coupons count
        const { count: couponsCount } = await supabase
          .from('coupons')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        setStats({
          totalUsers: usersCount || 0,
          totalRevenue,
          totalTransactions: transactions?.length || 0,
          totalGenerations: generationsCount || 0,
          activeCoupons: couponsCount || 0,
          creditsIssued,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-black',
      bg: 'bg-genz-lime',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: 'text-black',
      bg: 'bg-genz-pink',
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions,
      icon: CreditCard,
      color: 'text-black',
      bg: 'bg-genz-cyan',
    },
    {
      title: 'Credits Issued',
      value: stats.creditsIssued,
      icon: Coins,
      color: 'text-black',
      bg: 'bg-genz-coral',
    },
    {
      title: 'Generations',
      value: stats.totalGenerations,
      icon: Image,
      color: 'text-black',
      bg: 'bg-genz-purple',
    },
    {
      title: 'Active Coupons',
      value: stats.activeCoupons,
      icon: Ticket,
      color: 'text-black',
      bg: 'bg-genz-blue',
    },
  ];

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="border-2 md:border-4 border-black p-4 md:p-8 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden rounded-lg">
        <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-genz-lime rounded-full blur-3xl opacity-50"></div>
        <h1 className="text-2xl md:text-4xl font-display uppercase animate-slide-up relative z-10 flex items-center gap-2 md:gap-3">
          <Wrench className="w-6 h-6 md:w-8 md:h-8" /> Admin Dashboard
        </h1>
        <p className="text-gray-600 font-bold mt-1 md:mt-2 font-mono relative z-10 flex items-center gap-2 text-sm md:text-base">
          <BarChart3 className="w-4 h-4 md:w-5 md:h-5" /> Overview platform UMKM AI
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {statCards.map((card, index) => (
          <div key={card.title} className="border-2 md:border-4 border-black bg-white p-3 md:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] md:hover:-translate-y-1 transition-all group rounded-lg" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-start justify-between gap-2 mb-2 md:mb-4">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] md:text-xs font-bold uppercase text-gray-500 mb-0.5 md:mb-1 tracking-wider truncate">
                  {card.title}
                </div>
                {isLoading ? (
                  <div className="h-6 md:h-8 w-16 md:w-24 bg-gray-200 animate-pulse rounded" />
                ) : (
                  <div className="text-lg md:text-3xl font-display uppercase tracking-tight truncate">{card.value}</div>
                )}
              </div>
              <div className={`p-1.5 md:p-3 border-2 md:border-4 border-black ${card.bg} md:group-hover:rotate-12 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg shrink-0`}>
                <card.icon className={`w-4 h-4 md:w-6 md:h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions / Summary */}
      <div className="grid md:grid-cols-2 gap-3 md:gap-6">
        <div className="border-2 md:border-4 border-black bg-genz-cyan p-4 md:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg">
            <h3 className="text-lg md:text-2xl font-display uppercase mb-2 md:mb-4 flex items-center gap-2 flex-wrap">
                <span className="bg-white px-2 border-2 border-black text-[10px] md:text-sm py-0.5 md:py-1 rounded">NEW</span>
                <div className="flex items-center gap-1"><Zap className="w-4 h-4 md:w-5 md:h-5" /> Quick Actions</div>
            </h3>
            <p className="text-black font-medium mb-3 md:mb-4 text-sm md:text-base">
                Kelola platform dengan efisien. Cek user, validasi transaksi, atau update pengaturan.
            </p>
            <button className="bg-black text-white px-3 md:px-4 py-2 font-bold uppercase text-xs md:text-sm border-2 border-transparent active:bg-white active:text-black md:hover:bg-white md:hover:text-black transition-colors rounded w-full md:w-auto">
                Lihat Semua
            </button>
        </div>

        <div className="border-2 md:border-4 border-black bg-genz-pink p-4 md:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg">
            <h3 className="text-lg md:text-2xl font-display uppercase mb-2 md:mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 md:w-5 md:h-5" /> System Status
            </h3>
            <div className="space-y-2 font-mono text-xs md:text-sm font-bold">
                <div className="flex justify-between border-b-2 border-black pb-1 gap-2">
                    <span>Database</span>
                    <span className="bg-green-400 px-2 border border-black text-[10px] md:text-xs flex items-center rounded shrink-0">OK</span>
                </div>
                <div className="flex justify-between border-b-2 border-black pb-1 gap-2">
                    <span>Storage</span>
                    <span className="bg-green-400 px-2 border border-black text-[10px] md:text-xs flex items-center rounded shrink-0">OK</span>
                </div>
                <div className="flex justify-between border-b-2 border-black pb-1 gap-2">
                    <span>AI Engine</span>
                    <span className="bg-green-400 px-2 border border-black text-[10px] md:text-xs flex items-center rounded shrink-0">OK</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
