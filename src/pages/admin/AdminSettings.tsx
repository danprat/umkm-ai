import { useState, useEffect } from 'react';
import { supabase, CreditPackage } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Settings
  const [freeCredits, setFreeCredits] = useState(10);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(60);

  // Packages
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CreditPackage | null>(null);
  const [packageForm, setPackageForm] = useState({
    name: '',
    credits: 50,
    price: 25000,
  });

  const fetchSettings = async () => {
    try {
      // Fetch settings
      const { data: settings } = await supabase
        .from('settings')
        .select('*');

      if (settings) {
        const freeCreditsVal = settings.find(s => s.key === 'free_credits');
        const rateLimitVal = settings.find(s => s.key === 'rate_limit_seconds');
        
        if (freeCreditsVal) setFreeCredits(parseInt(freeCreditsVal.value as string, 10));
        if (rateLimitVal) setRateLimitSeconds(parseInt(rateLimitVal.value as string, 10));
      }

      // Fetch packages
      const { data: pkgs } = await supabase
        .from('credit_packages')
        .select('*')
        .order('price', { ascending: true });

      setPackages(pkgs || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Update free_credits
      await supabase
        .from('settings')
        .upsert({ key: 'free_credits', value: freeCredits.toString() });

      // Update rate_limit_seconds
      await supabase
        .from('settings')
        .upsert({ key: 'rate_limit_seconds', value: rateLimitSeconds.toString() });

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePackage = async () => {
    if (!packageForm.name || packageForm.credits <= 0 || packageForm.price <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill all fields correctly',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingPackage) {
        // Update existing
        await supabase
          .from('credit_packages')
          .update({
            name: packageForm.name,
            credits: packageForm.credits,
            price: packageForm.price,
          })
          .eq('id', editingPackage.id);
      } else {
        // Create new
        await supabase
          .from('credit_packages')
          .insert({
            name: packageForm.name,
            credits: packageForm.credits,
            price: packageForm.price,
            is_active: true,
          });
      }

      toast({
        title: 'Success',
        description: `Package ${editingPackage ? 'updated' : 'created'} successfully`,
      });

      setShowPackageDialog(false);
      setEditingPackage(null);
      setPackageForm({ name: '', credits: 50, price: 25000 });
      fetchSettings();
    } catch (error) {
      console.error('Error saving package:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save package',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePackage = async (pkg: CreditPackage) => {
    try {
      await supabase
        .from('credit_packages')
        .update({ is_active: !pkg.is_active })
        .eq('id', pkg.id);
      
      fetchSettings();
    } catch (error) {
      console.error('Error toggling package:', error);
    }
  };

  const handleDeletePackage = async (pkg: CreditPackage) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      await supabase
        .from('credit_packages')
        .delete()
        .eq('id', pkg.id);

      toast({
        title: 'Success',
        description: 'Package deleted',
      });
      fetchSettings();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete package',
      });
    }
  };

  const openEditDialog = (pkg: CreditPackage) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      credits: pkg.credits,
      price: pkg.price,
    });
    setShowPackageDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure app settings and credit packages</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure default values for new users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Free Credits for New Users</Label>
              <Input
                type="number"
                value={freeCredits}
                onChange={(e) => setFreeCredits(parseInt(e.target.value) || 0)}
                min="0"
              />
              <p className="text-sm text-muted-foreground">
                Credits given to users after email verification
              </p>
            </div>
            <div className="space-y-2">
              <Label>Rate Limit (seconds)</Label>
              <Input
                type="number"
                value={rateLimitSeconds}
                onChange={(e) => setRateLimitSeconds(parseInt(e.target.value) || 60)}
                min="1"
              />
              <p className="text-sm text-muted-foreground">
                Minimum time between generations
              </p>
            </div>
          </div>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Credit Packages</CardTitle>
              <CardDescription>
                Manage purchasable credit packages
              </CardDescription>
            </div>
            <Dialog open={showPackageDialog} onOpenChange={(open) => {
              setShowPackageDialog(open);
              if (!open) {
                setEditingPackage(null);
                setPackageForm({ name: '', credits: 50, price: 25000 });
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Package
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPackage ? 'Edit Package' : 'Create Package'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPackage ? 'Update package details' : 'Add a new credit package'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Package Name</Label>
                    <Input
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                      placeholder="e.g. Starter, Pro, Enterprise"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Credits</Label>
                      <Input
                        type="number"
                        value={packageForm.credits}
                        onChange={(e) => setPackageForm({ ...packageForm, credits: parseInt(e.target.value) || 0 })}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (IDR)</Label>
                      <Input
                        type="number"
                        value={packageForm.price}
                        onChange={(e) => setPackageForm({ ...packageForm, price: parseInt(e.target.value) || 0 })}
                        min="1000"
                        step="1000"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPackageDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSavePackage} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingPackage ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Price/Credit</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.credits}</TableCell>
                  <TableCell>{formatCurrency(pkg.price)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCurrency(Math.round(pkg.price / pkg.credits))}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={pkg.is_active}
                      onCheckedChange={() => handleTogglePackage(pkg)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(pkg)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeletePackage(pkg)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
