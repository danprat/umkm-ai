import { useState, useEffect } from 'react';
import { supabase, Transaction } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, DollarSign, Ticket, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface TransactionWithUser extends Transaction {
  profiles?: { email: string };
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<TransactionWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchTransactions() {
      try {
        let query = supabase
          .from('transactions')
          .select('*, profiles(email)')
          .order('created_at', { ascending: false })
          .limit(100);

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Lunas</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase flex items-center gap-1"><XCircle className="w-3 h-3" /> Batal</Badge>;
      case 'expired':
        return <Badge className="bg-gray-400 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Expired</Badge>;
      default:
        return <Badge className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase">{status}</Badge>;
    }
  };

  // Calculate totals
  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCredits = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.credits, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-display uppercase font-bold bg-genz-purple inline-block px-4 py-2 border-4 border-black shadow-brutal transform -rotate-1 text-white">Transaksi</h1>
        <p className="text-lg font-bold mt-3 flex items-center gap-2">
          Pantau semua pembayaran yang masuk <DollarSign className="w-5 h-5" />
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-4 border-black shadow-brutal-lg bg-green-100">
          <CardHeader className="pb-2 border-b-4 border-black">
            <CardTitle className="text-sm font-display uppercase tracking-wide flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-display font-bold text-green-700">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-4 border-black shadow-brutal-lg bg-genz-cyan">
          <CardHeader className="pb-2 border-b-4 border-black">
            <CardTitle className="text-sm font-display uppercase tracking-wide flex items-center gap-2">
              <Ticket className="w-4 h-4" /> Kredit Terjual
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-display font-bold">{totalCredits.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-4 border-black shadow-brutal-lg bg-genz-lime">
          <CardHeader className="pb-2 border-b-4 border-black">
            <CardTitle className="text-sm font-display uppercase tracking-wide flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Transaksi Selesai
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-display font-bold">
              {transactions.filter(t => t.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-4 border-black shadow-brutal-lg bg-white">
        <CardHeader className="border-b-4 border-black bg-genz-pink/20">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-2xl font-display uppercase">Semua Transaksi</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent className="border-4 border-black">
                <SelectItem value="all" className="font-bold">Semua Status</SelectItem>
                <SelectItem value="completed" className="font-bold flex items-center gap-1">Lunas</SelectItem>
                <SelectItem value="pending" className="font-bold flex items-center gap-1">Pending</SelectItem>
                <SelectItem value="cancelled" className="font-bold flex items-center gap-1">Batal</SelectItem>
                <SelectItem value="expired" className="font-bold flex items-center gap-1">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin stroke-[3px]" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 px-4 border-4 border-dashed border-black/20 rounded-lg">
              <p className="text-xl font-bold">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="border-4 border-black rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black hover:bg-black">
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Order ID</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">User</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Jumlah</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Kredit</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Metode</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Status</TableHead>
                    <TableHead className="text-white font-display uppercase">Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-b-2 border-black/10 hover:bg-genz-purple/10">
                      <TableCell className="font-mono text-sm font-bold">
                        {tx.order_id}
                      </TableCell>
                      <TableCell className="text-sm font-bold">
                        {tx.profiles?.email || '-'}
                      </TableCell>
                      <TableCell className="font-bold text-green-700">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-genz-cyan/50 border-2 border-black/20 rounded font-mono font-bold">{tx.credits}</span>
                      </TableCell>
                      <TableCell className="uppercase text-xs font-bold">
                        {tx.payment_method || '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-sm font-bold">
                        {formatDate(tx.created_at)}
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
