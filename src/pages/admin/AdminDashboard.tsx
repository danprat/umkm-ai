import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, Ticket, Image, TrendingUp, Coins } from 'lucide-react';

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
      emoji: '👥',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: 'text-black',
      bg: 'bg-genz-pink',
      emoji: '💰',
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions,
      icon: CreditCard,
      color: 'text-black',
      bg: 'bg-genz-cyan',
      emoji: '💳',
    },
    {
      title: 'Credits Issued',
      value: stats.creditsIssued,
      icon: Coins,
      color: 'text-black',
      bg: 'bg-genz-coral',
      emoji: '🪙',
    },
    {
      title: 'Generations',
      value: stats.totalGenerations,
      icon: Image,
      color: 'text-black',
      bg: 'bg-genz-purple',
      emoji: '🇿️',
    },
    {
      title: 'Active Coupons',
      value: stats.activeCoupons,
      icon: Ticket,
      color: 'text-black',
      bg: 'bg-genz-blue',
      emoji: '🎫',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-genz-lime rounded-full blur-3xl opacity-50"></div>
        <h1 className="text-4xl font-display uppercase animate-slide-up relative z-10">Admin Dashboard 🔧</h1>
        <p className="text-gray-600 font-bold mt-2 font-mono relative z-10">Overview of your UMKM AI platform 📊</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={card.title} className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all group" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-xs font-bold uppercase text-gray-500 mb-1 tracking-widest">
                  {card.title}
                </div>
                {isLoading ? (
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
                ) : (
                  <div className="text-3xl font-display uppercase tracking-tight">{card.value}</div>
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`p-3 border-4 border-black ${card.bg} group-hover:rotate-12 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <span className="text-2xl animate-float" style={{ animationDelay: `${index * 0.2}s` }}>{card.emoji}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions / Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border-4 border-black bg-genz-cyan p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-display uppercase mb-4 flex items-center gap-2">
                <span className="bg-white px-2 border-2 border-black text-sm py-1 rounded">NEW</span>
                Quick Actions ⚡
            </h3>
            <p className="text-black font-medium mb-4">
                Manage your platform efficiently. Check user reports, validate transactions, or update system settings.
            </p>
            <button className="bg-black text-white px-4 py-2 font-bold uppercase text-sm hover:bg-white hover:text-black border-2 border-transparent hover:border-black transition-colors">
                View All Actions
            </button>
        </div>

        <div className="border-4 border-black bg-genz-pink p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-display uppercase mb-4">System Status 🟢</h3>
            <div className="space-y-2 font-mono text-sm font-bold">
                <div className="flex justify-between border-b-2 border-black pb-1">
                    <span>Database</span>
                    <span className="bg-green-400 px-2 border border-black text-xs flex items-center">OPERATIONAL</span>
                </div>
                <div className="flex justify-between border-b-2 border-black pb-1">
                    <span>Storage</span>
                    <span className="bg-green-400 px-2 border border-black text-xs flex items-center">OPERATIONAL</span>
                </div>
                <div className="flex justify-between border-b-2 border-black pb-1">
                    <span>AI Engine</span>
                    <span className="bg-green-400 px-2 border border-black text-xs flex items-center">OPERATIONAL</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
