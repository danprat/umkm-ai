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
import { Plus, Loader2, Copy, Check } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">Create and manage coupon codes</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>
                Generate a coupon code for users to redeem credits
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="font-mono uppercase"
                    placeholder="PROMO123"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewCoupon({ ...newCoupon, code: generateCouponCode() })}
                  >
                    Generate
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Credits</Label>
                  <Input
                    type="number"
                    value={newCoupon.credits}
                    onChange={(e) => setNewCoupon({ ...newCoupon, credits: parseInt(e.target.value) || 0 })}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Users</Label>
                  <Input
                    type="number"
                    value={newCoupon.max_users}
                    onChange={(e) => setNewCoupon({ ...newCoupon, max_users: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expiry Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={newCoupon.expires_at}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCoupon} disabled={isCreating}>
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Coupon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No coupons created yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 rounded font-mono text-sm">
                          {coupon.code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyCode(coupon.code)}
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{coupon.credits}</TableCell>
                    <TableCell>
                      {coupon.used_count} / {coupon.max_users}
                    </TableCell>
                    <TableCell>
                      <span className={isExpired(coupon.expires_at) ? 'text-red-500' : ''}>
                        {formatDate(coupon.expires_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {!coupon.is_active ? (
                        <Badge variant="outline">Inactive</Badge>
                      ) : isExpired(coupon.expires_at) ? (
                        <Badge className="bg-red-100 text-red-700">Expired</Badge>
                      ) : coupon.used_count >= coupon.max_users ? (
                        <Badge className="bg-yellow-100 text-yellow-700">Fully Used</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={coupon.is_active}
                        onCheckedChange={() => handleToggleActive(coupon)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
