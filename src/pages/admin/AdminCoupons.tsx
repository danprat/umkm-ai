import { useState, useEffect } from 'react';
import { supabase, Coupon } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, Copy, Check, Ticket, Gift, Flame, XCircle, Clock } from 'lucide-react';

// Generate random coupon code
function generateCouponCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function AdminCoupons() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New coupon form
  const [newCoupon, setNewCoupon] = useState({
    code: generateCouponCode(),
    credits: 10,
    max_users: 1,
    expires_at: '',
  });

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async () => {
    if (!newCoupon.code || newCoupon.credits <= 0 || newCoupon.max_users <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill all required fields',
      });
      return;
    }

    setIsCreating(true);

    try {
      const { error } = await supabase.from('coupons').insert({
        code: newCoupon.code.toUpperCase(),
        credits: newCoupon.credits,
        max_users: newCoupon.max_users,
        expires_at: newCoupon.expires_at || null,
        created_by: user?.id,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Coupon created successfully',
      });

      setShowDialog(false);
      setNewCoupon({
        code: generateCouponCode(),
        credits: 10,
        max_users: 1,
        expires_at: '',
      });
      fetchCoupons();
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message?.includes('duplicate') 
          ? 'Coupon code already exists' 
          : 'Failed to create coupon',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update coupon',
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'No expiry';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display uppercase font-bold bg-genz-coral inline-block px-4 py-2 border-4 border-black shadow-brutal transform -rotate-1">Kupon</h1>
          <p className="text-lg font-bold mt-3 flex items-center gap-2">
            Bikin dan atur kode kupon buat user <Ticket className="w-5 h-5" />
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-genz-lime text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 font-display uppercase text-lg">
              <Plus className="w-5 h-5 mr-2 stroke-[3px]" />
              Bikin Kupon
            </Button>
          </DialogTrigger>
          <DialogContent className="border-4 border-black shadow-brutal-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display uppercase">Bikin Kupon Baru</DialogTitle>
              <DialogDescription className="text-base font-bold flex items-center gap-2">
                Buat kode kupon biar user bisa redeem kredit gratis <Gift className="w-4 h-4" />
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-bold uppercase">Kode Kupon</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="font-mono uppercase border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold"
                    placeholder="PROMO123"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewCoupon({ ...newCoupon, code: generateCouponCode() })}
                    className="border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold"
                  >
                    Acak
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase">Jumlah Kredit</Label>
                  <Input
                    type="number"
                    value={newCoupon.credits}
                    onChange={(e) => setNewCoupon({ ...newCoupon, credits: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase">Max User</Label>
                  <Input
                    type="number"
                    value={newCoupon.max_users}
                    onChange={(e) => setNewCoupon({ ...newCoupon, max_users: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase">Tanggal Kadaluarsa (Opsional)</Label>
                <Input
                  type="datetime-local"
                  value={newCoupon.expires_at}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                  className="border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold"
              >
                Batal
              </Button>
              <Button 
                onClick={handleCreateCoupon} 
                disabled={isCreating}
                className="bg-genz-lime text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold"
              >
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Bikin Kupon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-4 border-black shadow-brutal-lg bg-white">
        <CardHeader className="border-b-4 border-black bg-genz-coral/20">
          <CardTitle className="text-2xl font-display uppercase">Semua Kupon</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin stroke-[3px]" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 px-4 border-4 border-dashed border-black/20 rounded-lg">
              <p className="text-xl font-bold">Belum ada kupon dibuat</p>
            </div>
          ) : (
            <div className="border-4 border-black rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-black hover:bg-black">
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Kode</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Kredit</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Pemakaian</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Kadaluarsa</TableHead>
                    <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Status</TableHead>
                    <TableHead className="text-white font-display uppercase">Aktif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id} className="border-b-2 border-black/10 hover:bg-genz-coral/10">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="px-3 py-1.5 bg-genz-lime border-2 border-black rounded-lg font-mono text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {coupon.code}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-genz-cyan hover:border-2 hover:border-black"
                            onClick={() => handleCopyCode(coupon.code)}
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-4 h-4 text-green-600 stroke-[3px]" />
                            ) : (
                              <Copy className="w-4 h-4 stroke-[2.5px]" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-genz-cyan/50 border-2 border-black/20 rounded font-mono font-bold">{coupon.credits}</span>
                      </TableCell>
                      <TableCell className="font-bold">
                        {coupon.used_count} / {coupon.max_users}
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${isExpired(coupon.expires_at) ? 'text-red-600' : ''}`}>
                          {formatDate(coupon.expires_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {!coupon.is_active ? (
                          <Badge className="border-2 border-black/30 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] font-bold uppercase flex items-center gap-1"><XCircle className="w-3 h-3" /> Nonaktif</Badge>
                        ) : isExpired(coupon.expires_at) ? (
                          <Badge className="bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Expired</Badge>
                        ) : coupon.used_count >= coupon.max_users ? (
                          <Badge className="bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase flex items-center gap-1"><Check className="w-3 h-3" /> Habis</Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase flex items-center gap-1"><Flame className="w-3 h-3" /> Aktif</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={coupon.is_active}
                          onCheckedChange={() => handleToggleActive(coupon)}
                          className="data-[state=checked]:bg-genz-lime"
                        />
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
