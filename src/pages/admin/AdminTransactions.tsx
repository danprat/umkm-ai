import { useState, useEffect } from 'react';
import { supabase, Transaction } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, Ticket, CheckCircle, Clock, XCircle, AlertCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface TransactionWithUser extends Transaction {
  profiles?: { email: string };
}

export default function AdminTransactions() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<TransactionWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [oldPendingCount, setOldPendingCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('transactions')
        .select('*, profiles(email)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;
      setTransactions(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOldPendingCount = async () => {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lt('created_at', fortyEightHoursAgo);
    setOldPendingCount(count || 0);
  };

  const handleDeleteOldPending = async () => {
    setIsDeleting(true);
    try {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('status', 'pending')
        .lt('created_at', fortyEightHoursAgo);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: `${oldPendingCount} transaksi pending lama berhasil dihapus`,
      });
      fetchTransactions();
      fetchOldPendingCount();
    } catch (error) {
      console.error('Error deleting old pending:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menghapus transaksi pending',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: `${selectedIds.size} transaksi berhasil dihapus`,
      });
      setSelectedIds(new Set());
      fetchTransactions();
      fetchOldPendingCount();
    } catch (error) {
      console.error('Error deleting selected:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menghapus transaksi',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map(t => t.id)));
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchTransactions();
    fetchOldPendingCount();
  }, [statusFilter, currentPage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-4xl font-display uppercase font-bold bg-genz-purple inline-block px-3 md:px-4 py-1.5 md:py-2 border-2 md:border-4 border-black shadow-brutal transform -rotate-1 text-white">Transaksi</h1>
        <p className="text-sm md:text-lg font-bold mt-2 md:mt-3 flex items-center gap-2">
          Pantau semua pembayaran <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card className="border-2 md:border-4 border-black shadow-brutal-lg bg-green-100 rounded-lg">
          <CardHeader className="pb-1 md:pb-2 border-b-2 md:border-b-4 border-black p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-display uppercase tracking-wide flex items-center gap-1 md:gap-2">
              <DollarSign className="w-3 h-3 md:w-4 md:h-4" /> Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 md:pt-4 p-3 md:p-6">
            <div className="text-lg md:text-3xl font-display font-bold text-green-700 truncate">
              {formatCurrency(totalRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 md:border-4 border-black shadow-brutal-lg bg-genz-cyan rounded-lg">
          <CardHeader className="pb-1 md:pb-2 border-b-2 md:border-b-4 border-black p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-display uppercase tracking-wide flex items-center gap-1 md:gap-2">
              <Ticket className="w-3 h-3 md:w-4 md:h-4" /> Kredit Terjual
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 md:pt-4 p-3 md:p-6">
            <div className="text-lg md:text-3xl font-display font-bold">{totalCredits.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-2 md:border-4 border-black shadow-brutal-lg bg-genz-lime rounded-lg">
          <CardHeader className="pb-1 md:pb-2 border-b-2 md:border-b-4 border-black p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-display uppercase tracking-wide flex items-center gap-1 md:gap-2">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4" /> Selesai
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 md:pt-4 p-3 md:p-6">
            <div className="text-lg md:text-3xl font-display font-bold">
              {transactions.filter(t => t.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 md:border-4 border-black shadow-brutal-lg bg-white rounded-lg">
        <CardHeader className="border-b-2 md:border-b-4 border-black bg-genz-pink/20 p-3 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
            <CardTitle className="text-lg md:text-2xl font-display uppercase">Semua Transaksi</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
              {selectedIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-xs md:text-sm h-9"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Hapus {selectedIds.size} Terpilih
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-2 md:border-4 border-black shadow-brutal-lg max-w-[95vw] sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-display uppercase">Hapus Transaksi?</AlertDialogTitle>
                      <AlertDialogDescription className="font-bold">
                        Akan menghapus {selectedIds.size} transaksi terpilih. Aksi ini tidak bisa dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel className="border-2 border-black font-bold">Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteSelected}
                        disabled={isDeleting}
                        className="bg-red-500 text-white border-2 border-black font-bold"
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {oldPendingCount > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-orange-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-xs md:text-sm h-9"
                    >
                      <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      {oldPendingCount} Pending &gt;48h
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-2 md:border-4 border-black shadow-brutal-lg max-w-[95vw] sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-display uppercase">Hapus Pending Lama?</AlertDialogTitle>
                      <AlertDialogDescription className="font-bold">
                        Akan menghapus {oldPendingCount} transaksi pending yang lebih dari 48 jam. Aksi ini tidak bisa dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel className="border-2 border-black font-bold">Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteOldPending}
                        disabled={isDeleting}
                        className="bg-red-500 text-white border-2 border-black font-bold"
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Hapus Semua
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 md:w-48 border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-sm">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent className="border-2 md:border-4 border-black">
                  <SelectItem value="all" className="font-bold">Semua</SelectItem>
                  <SelectItem value="completed" className="font-bold">Lunas</SelectItem>
                  <SelectItem value="pending" className="font-bold">Pending</SelectItem>
                  <SelectItem value="cancelled" className="font-bold">Batal</SelectItem>
                  <SelectItem value="expired" className="font-bold">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin stroke-[3px]" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 md:py-12 px-4 border-2 md:border-4 border-dashed border-black/20 rounded-lg">
              <p className="text-base md:text-xl font-bold">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="border-2 md:border-4 border-black rounded-lg overflow-x-auto">
              <Table className="min-w-[850px]">
                <TableHeader>
                  <TableRow className="bg-black hover:bg-black">
                    <TableHead className="text-white border-r-2 border-white/20 w-10">
                      <Checkbox
                        checked={transactions.length > 0 && selectedIds.size === transactions.length}
                        onCheckedChange={toggleSelectAll}
                        className="border-white data-[state=checked]:bg-genz-lime data-[state=checked]:text-black"
                      />
                    </TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20 text-[10px] md:text-sm whitespace-nowrap">Order ID</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20 text-[10px] md:text-sm whitespace-nowrap">User</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20 text-[10px] md:text-sm whitespace-nowrap">Jumlah</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20 text-[10px] md:text-sm whitespace-nowrap">Kredit</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20 text-[10px] md:text-sm whitespace-nowrap">Metode</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20 text-[10px] md:text-sm whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-white font-display uppercase text-[10px] md:text-sm whitespace-nowrap">Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} className={`border-b-2 border-black/10 hover:bg-genz-purple/10 ${selectedIds.has(tx.id) ? 'bg-red-50' : ''}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(tx.id)}
                          onCheckedChange={() => toggleSelect(tx.id)}
                          className="border-black data-[state=checked]:bg-red-500 data-[state=checked]:text-white"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-[10px] md:text-sm font-bold">
                        {tx.order_id}
                      </TableCell>
                      <TableCell className="text-[10px] md:text-sm font-bold max-w-[120px] truncate">
                        {tx.profiles?.email || '-'}
                      </TableCell>
                      <TableCell className="font-bold text-green-700 text-xs md:text-sm whitespace-nowrap">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-genz-cyan/50 border-2 border-black/20 rounded font-mono font-bold text-xs md:text-sm">{tx.credits}</span>
                      </TableCell>
                      <TableCell className="uppercase text-[10px] md:text-xs font-bold">
                        {tx.payment_method || '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-[10px] md:text-sm font-bold whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t-2 border-black/10">
              <p className="text-xs md:text-sm font-bold text-gray-600">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold h-8 px-2 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 py-1 bg-genz-purple text-white border-2 border-black font-bold text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold h-8 px-2 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
