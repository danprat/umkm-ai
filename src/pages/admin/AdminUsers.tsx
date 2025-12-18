import { useState, useEffect } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Minus, Loader2, CheckCircle, XCircle, Target, Mail } from 'lucide-react';

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditAction, setCreditAction] = useState<'add' | 'deduct'>('add');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('email', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch users',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const handleUpdateCredits = async () => {
    if (!selectedUser || !creditAmount) return;

    const amount = parseInt(creditAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid amount',
      });
      return;
    }

    setIsUpdating(true);

    try {
      const newCredits = creditAction === 'add' 
        ? selectedUser.credits + amount 
        : Math.max(0, selectedUser.credits - amount);

      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${creditAction === 'add' ? 'Added' : 'Deducted'} ${amount} credits`,
      });

      setSelectedUser(null);
      setCreditAmount('');
      fetchUsers();
    } catch (error) {
      console.error('Error updating credits:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update credits',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-display uppercase font-bold bg-genz-cyan inline-block px-4 py-2 border-4 border-black shadow-brutal transform -rotate-1">Users</h1>
        <p className="text-lg font-bold mt-3 flex items-center gap-2">
          Kelola akun user dan kredit mereka <Target className="w-5 h-5" />
        </p>
      </div>

      <Card className="border-4 border-black shadow-brutal-lg bg-white">
        <CardHeader className="border-b-4 border-black bg-genz-lime/20">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-2xl font-display uppercase">Semua User</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 stroke-[2.5px]" />
              <Input
                placeholder="Cari email user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="border-4 border-black rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black hover:bg-black">
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Email</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Kredit</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Verified</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Gabung</TableHead>
                    <TableHead className="text-white font-display uppercase text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-b-2 border-black/10 hover:bg-genz-lime/10">
                      <TableCell className="font-bold">{user.email}</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 bg-genz-cyan border-2 border-black rounded-full font-mono font-bold">{user.credits}</span>
                      </TableCell>
                      <TableCell>
                        {user.email_verified ? (
                          <CheckCircle className="w-5 h-5 text-green-600 fill-green-100 stroke-[2.5px]" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400 stroke-[2.5px]" />
                        )}
                      </TableCell>
                      <TableCell className="font-bold">{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-genz-lime text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 font-bold"
                            onClick={() => {
                              setSelectedUser(user);
                              setCreditAction('add');
                            }}
                          >
                            <Plus className="w-4 h-4 stroke-[3px]" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-genz-coral text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 font-bold"
                            onClick={() => {
                              setSelectedUser(user);
                              setCreditAction('deduct');
                            }}
                          >
                            <Minus className="w-4 h-4 stroke-[3px]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit Update Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="border-4 border-black shadow-brutal-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display uppercase flex items-center gap-2">
              {creditAction === 'add' ? <Plus className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
              {creditAction === 'add' ? 'Tambah' : 'Kurangi'} Kredit
            </DialogTitle>
            <DialogDescription className="text-base font-bold">
              {creditAction === 'add' ? 'Tambahin' : 'Kurangin'} kredit buat <span className="text-black">{selectedUser?.email}</span>
              <br />
              <span className="inline-block mt-2 px-3 py-1 bg-genz-cyan border-2 border-black rounded-full font-mono text-black">
                Saldo sekarang: {selectedUser?.credits}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-base font-bold uppercase">Jumlah Kredit</Label>
              <Input
                type="number"
                placeholder="Masukkan jumlah..."
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                min="1"
                className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-lg"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setSelectedUser(null)}
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold"
            >
              Batal
            </Button>
            <Button 
              onClick={handleUpdateCredits} 
              disabled={isUpdating || !creditAmount}
              className={`${creditAction === 'deduct' ? 'bg-genz-coral' : 'bg-genz-lime'} text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold`}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                creditAction === 'add' ? <Plus className="w-4 h-4 mr-2" /> : <Minus className="w-4 h-4 mr-2" />
              )}
              {creditAction === 'add' ? 'Tambah Kredit' : 'Kurangi Kredit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
