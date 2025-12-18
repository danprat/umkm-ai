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
      color: 'text-foreground',
      bg: 'bg-genz-lime',
      emoji: '👥',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: 'text-foreground',
      bg: 'bg-genz-pink',
      emoji: '💰',
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions,
      icon: CreditCard,
      color: 'text-foreground',
      bg: 'bg-genz-cyan',
      emoji: '💳',
    },
    {
      title: 'Credits Issued',
      value: stats.creditsIssued,
      icon: Coins,
      color: 'text-foreground',
      bg: 'bg-genz-coral',
      emoji: '🪙',
    },
    {
      title: 'Generations',
      value: stats.totalGenerations,
      icon: Image,
      color: 'text-foreground',
      bg: 'bg-genz-purple',
      emoji: '🇿️',
    },
    {
      title: 'Active Coupons',
      value: stats.activeCoupons,
      icon: Ticket,
      color: 'text-foreground',
      bg: 'bg-genz-blue',
      emoji: '🎫',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-[3px] border-foreground p-6 bg-gradient-to-r from-genz-lime/20 to-genz-pink/20 shadow-brutal">
        <h1 className="text-3xl font-display uppercase animate-slide-up">Admin Dashboard 🔧</h1>
        <p className="text-foreground font-bold mt-2">Overview of your UMKM AI platform 📊</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={card.title} className="border-[3px] border-foreground bg-white p-6 shadow-brutal hover:shadow-brutal-lg hover:translate-y-[-4px] transition-all group" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm font-bold uppercase text-muted-foreground mb-1">
                  {card.title}
                </div>
                {isLoading ? (
                  <div className="h-8 w-24 bg-gray-200 animate-pulse border-[2px] border-foreground" />
                ) : (
                  <div className="text-3xl font-display uppercase">{card.value}</div>
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`p-3 border-[3px] border-foreground ${card.bg} group-hover:animate-float`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <span className="text-2xl">{card.emoji}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity could go here */}
      <div className="border-[3px] border-foreground bg-gradient-to-br from-genz-cyan/30 to-genz-purple/30 p-6 shadow-brutal">
        <h3 className="text-xl font-display uppercase mb-3">Quick Actions ⚡</h3>
        <p className="text-foreground font-medium">
          Use the sidebar to manage users, view transactions, create coupons, and configure settings. 🛠️
        </p>
      </div>
    </div>
  );
}
