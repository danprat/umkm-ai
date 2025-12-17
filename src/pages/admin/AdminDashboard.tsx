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
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions,
      icon: CreditCard,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Credits Issued',
      value: stats.creditsIssued,
      icon: Coins,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Generations',
      value: stats.totalGenerations,
      icon: Image,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
    },
    {
      title: 'Active Coupons',
      value: stats.activeCoupons,
      icon: Ticket,
      color: 'text-cyan-600',
      bg: 'bg-cyan-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your UMKM AI platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity could go here */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>Use the sidebar to manage users, view transactions, create coupons, and configure settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
