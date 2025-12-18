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
import { Plus, Loader2, Pencil, Trash2, Settings as SettingsIcon, Mail, Clock, CreditCard, Save } from 'lucide-react';

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
        <h1 className="text-4xl font-display uppercase font-bold bg-genz-blue inline-block px-4 py-2 border-4 border-black shadow-brutal transform -rotate-1 text-white">Settings</h1>
        <p className="text-lg font-bold mt-3 flex items-center gap-2">
          Atur konfigurasi aplikasi dan paket kredit <SettingsIcon className="w-5 h-5" />
        </p>
      </div>

      {/* General Settings */}
      <Card className="border-4 border-black shadow-brutal-lg bg-white">
        <CardHeader className="border-b-4 border-black bg-genz-blue/20">
          <CardTitle className="text-2xl font-display uppercase">Pengaturan Umum</CardTitle>
          <CardDescription className="text-base font-bold">
            Atur nilai default buat user baru
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-bold uppercase">Kredit Gratis Buat User Baru</Label>
              <Input
                type="number"
                value={freeCredits}
                onChange={(e) => setFreeCredits(parseInt(e.target.value) || 0)}
                min="0"
                className="border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-lg"
              />
              <p className="text-sm font-bold text-gray-600 flex items-center gap-1">
                <Mail className="w-4 h-4" /> Kredit yang dikasih ke user setelah verifikasi email
              </p>
            </div>
            <div className="space-y-2">
              <Label className="font-bold uppercase">Rate Limit (detik)</Label>
              <Input
                type="number"
                value={rateLimitSeconds}
                onChange={(e) => setRateLimitSeconds(parseInt(e.target.value) || 60)}
                min="1"
                className="border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-lg"
              />
              <p className="text-sm font-bold text-gray-600 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Jeda waktu minimum antara generate
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            className="bg-genz-lime text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 font-display uppercase text-lg"
          >
            {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin stroke-[3px]" /> : <Save className="w-5 h-5 mr-2" />}
            Simpan Pengaturan
          </Button>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <Card className="border-4 border-black shadow-brutal-lg bg-white">
        <CardHeader className="border-b-4 border-black bg-genz-purple/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl font-display uppercase">Paket Kredit</CardTitle>
              <CardDescription className="text-base font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Atur paket kredit yang bisa dibeli user
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
                <Button className="bg-genz-purple text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 font-display uppercase text-lg">
                  <Plus className="w-5 h-5 mr-2 stroke-[3px]" />
                  Tambah Paket
                </Button>
              </DialogTrigger>
              <DialogContent className="border-4 border-black shadow-brutal-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-display uppercase flex items-center gap-2">
                    {editingPackage ? <><Pencil className="w-5 h-5" /> Edit Paket</> : <><Plus className="w-5 h-5" /> Bikin Paket</>}
                  </DialogTitle>
                  <DialogDescription className="text-base font-bold">
                    {editingPackage ? 'Update detail paket kredit' : 'Tambahin paket kredit baru'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase">Nama Paket</Label>
                    <Input
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                      placeholder="Contoh: Starter, Pro, Enterprise"
                      className="border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold uppercase">Jumlah Kredit</Label>
                      <Input
                        type="number"
                        value={packageForm.credits}
                        onChange={(e) => setPackageForm({ ...packageForm, credits: parseInt(e.target.value) || 0 })}
                        min="1"
                        className="border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold uppercase">Harga (IDR)</Label>
                      <Input
                        type="number"
                        value={packageForm.price}
                        onChange={(e) => setPackageForm({ ...packageForm, price: parseInt(e.target.value) || 0 })}
                        min="1000"
                        step="1000"
                        className="border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPackageDialog(false)}
                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold"
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={handleSavePackage} 
                    disabled={isSaving}
                    className="bg-genz-purple text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingPackage ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />)}
                    {editingPackage ? 'Update' : 'Bikin'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="border-4 border-black rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-black hover:bg-black">
                  <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Nama</TableHead>
                  <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Kredit</TableHead>
                  <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Harga</TableHead>
                  <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Harga/Kredit</TableHead>
                  <TableHead className="text-white font-display uppercase border-r-2 border-white/20">Aktif</TableHead>
                  <TableHead className="text-white font-display uppercase text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id} className="border-b-2 border-black/10 hover:bg-genz-blue/10">
                    <TableCell className="font-bold">{pkg.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-genz-cyan/50 border-2 border-black/20 rounded font-mono font-bold">{pkg.credits}</span>
                    </TableCell>
                    <TableCell className="font-bold text-green-700">{formatCurrency(pkg.price)}</TableCell>
                    <TableCell className="font-bold text-gray-600">
                      {formatCurrency(Math.round(pkg.price / pkg.credits))}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={pkg.is_active}
                        onCheckedChange={() => handleTogglePackage(pkg)}
                        className="data-[state=checked]:bg-genz-lime"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          className="bg-genz-cyan text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 font-bold"
                          onClick={() => openEditDialog(pkg)}
                        >
                          <Pencil className="w-4 h-4 stroke-[3px]" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 font-bold"
                          onClick={() => handleDeletePackage(pkg)}
                        >
                          <Trash2 className="w-4 h-4 stroke-[3px]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
