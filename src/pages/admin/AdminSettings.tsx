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
import { Plus, Loader2, Pencil, Trash2, Settings as SettingsIcon, Mail, Clock, CreditCard, Save, Gift, Percent } from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Settings
  const [freeCredits, setFreeCredits] = useState(10);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(60);
  const [referralSignupBonus, setReferralSignupBonus] = useState(10);
  const [referralCommissionPercent, setReferralCommissionPercent] = useState(10);

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
        const referralBonusVal = settings.find(s => s.key === 'referral_signup_bonus');
        const referralCommissionVal = settings.find(s => s.key === 'referral_commission_percent');
        
        if (freeCreditsVal) setFreeCredits(parseInt(freeCreditsVal.value as string, 10));
        if (rateLimitVal) setRateLimitSeconds(parseInt(rateLimitVal.value as string, 10));
        if (referralBonusVal) setReferralSignupBonus(parseInt(referralBonusVal.value as string, 10));
        if (referralCommissionVal) setReferralCommissionPercent(parseInt(referralCommissionVal.value as string, 10));
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

      // Update referral_signup_bonus
      await supabase
        .from('settings')
        .upsert({ key: 'referral_signup_bonus', value: referralSignupBonus.toString() });

      // Update referral_commission_percent
      await supabase
        .from('settings')
        .upsert({ key: 'referral_commission_percent', value: referralCommissionPercent.toString() });

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
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-4xl font-display uppercase font-bold bg-genz-blue inline-block px-3 md:px-4 py-1.5 md:py-2 border-2 md:border-4 border-black shadow-brutal transform -rotate-1 text-white">Settings</h1>
        <p className="text-sm md:text-lg font-bold mt-2 md:mt-3 flex items-center gap-2">
          Atur konfigurasi aplikasi <SettingsIcon className="w-4 h-4 md:w-5 md:h-5" />
        </p>
      </div>

      {/* General Settings */}
      <Card className="border-2 md:border-4 border-black shadow-brutal-lg bg-white rounded-lg">
        <CardHeader className="border-b-2 md:border-b-4 border-black bg-genz-blue/20 p-3 md:p-6">
          <CardTitle className="text-lg md:text-2xl font-display uppercase">Pengaturan Umum</CardTitle>
          <CardDescription className="text-xs md:text-base font-bold">
            Atur nilai default buat user baru
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs md:text-base">Kredit Gratis User Baru</Label>
              <Input
                type="number"
                value={freeCredits}
                onChange={(e) => setFreeCredits(parseInt(e.target.value) || 0)}
                min="0"
                className="border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-base md:text-lg"
              />
              <p className="text-xs md:text-sm font-bold text-gray-600 flex items-center gap-1">
                <Mail className="w-3 h-3 md:w-4 md:h-4" /> Setelah verifikasi email
              </p>
            </div>
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs md:text-base">Rate Limit (detik)</Label>
              <Input
                type="number"
                value={rateLimitSeconds}
                onChange={(e) => setRateLimitSeconds(parseInt(e.target.value) || 60)}
                min="1"
                className="border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-base md:text-lg"
              />
              <p className="text-xs md:text-sm font-bold text-gray-600 flex items-center gap-1">
                <Clock className="w-3 h-3 md:w-4 md:h-4" /> Jeda antar generate
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            className="bg-genz-lime text-black border-2 md:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-display uppercase text-sm md:text-lg w-full sm:w-auto"
          >
            {isSaving ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin stroke-[3px]" /> : <Save className="w-4 h-4 md:w-5 md:h-5 mr-2" />}
            Simpan
          </Button>
        </CardContent>
      </Card>

      {/* Referral Settings */}
      <Card className="border-2 md:border-4 border-black shadow-brutal-lg bg-white rounded-lg">
        <CardHeader className="border-b-2 md:border-b-4 border-black bg-genz-pink/20 p-3 md:p-6">
          <CardTitle className="text-lg md:text-2xl font-display uppercase">Pengaturan Referral</CardTitle>
          <CardDescription className="text-xs md:text-base font-bold">
            Atur bonus dan komisi program referral
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs md:text-base">Bonus Signup Referral</Label>
              <Input
                type="number"
                value={referralSignupBonus}
                onChange={(e) => setReferralSignupBonus(parseInt(e.target.value) || 0)}
                min="0"
                className="border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-base md:text-lg"
              />
              <p className="text-xs md:text-sm font-bold text-gray-600 flex items-center gap-1">
                <Gift className="w-3 h-3 md:w-4 md:h-4" /> Kredit untuk referrer
              </p>
            </div>
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs md:text-base">Komisi Pembelian (%)</Label>
              <Input
                type="number"
                value={referralCommissionPercent}
                onChange={(e) => setReferralCommissionPercent(parseInt(e.target.value) || 0)}
                min="0"
                max="100"
                className="border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-base md:text-lg"
              />
              <p className="text-xs md:text-sm font-bold text-gray-600 flex items-center gap-1">
                <Percent className="w-3 h-3 md:w-4 md:h-4" /> Dari pembelian teman
              </p>
            </div>
          </div>
          <div className="bg-genz-pink/10 border-2 border-black/20 p-3 md:p-4 rounded-lg">
            <p className="text-xs md:text-sm font-bold">
              📌 Contoh: Komisi {referralCommissionPercent}% → teman beli 100 kredit, referrer dapat {Math.floor(100 * referralCommissionPercent / 100)} kredit.
            </p>
          </div>
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            className="bg-genz-pink text-black border-2 md:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-display uppercase text-sm md:text-lg w-full sm:w-auto"
          >
            {isSaving ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin stroke-[3px]" /> : <Save className="w-4 h-4 md:w-5 md:h-5 mr-2" />}
            Simpan Referral
          </Button>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <Card className="border-2 md:border-4 border-black shadow-brutal-lg bg-white rounded-lg">
        <CardHeader className="border-b-2 md:border-b-4 border-black bg-genz-purple/20 p-3 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
            <div>
              <CardTitle className="text-lg md:text-2xl font-display uppercase">Paket Kredit</CardTitle>
              <CardDescription className="text-xs md:text-base font-bold flex items-center gap-1 md:gap-2">
                <CreditCard className="w-3 h-3 md:w-4 md:h-4" /> Paket kredit untuk user
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
                <Button className="bg-genz-purple text-white border-2 md:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-display uppercase text-sm md:text-lg w-full sm:w-auto">
                  <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 stroke-[3px]" />
                  Tambah
                </Button>
              </DialogTrigger>
              <DialogContent className="border-2 md:border-4 border-black shadow-brutal-lg max-w-[95vw] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl md:text-2xl font-display uppercase flex items-center gap-2">
                    {editingPackage ? <><Pencil className="w-4 h-4 md:w-5 md:h-5" /> Edit Paket</> : <><Plus className="w-4 h-4 md:w-5 md:h-5" /> Bikin Paket</>}
                  </DialogTitle>
                  <DialogDescription className="text-sm md:text-base font-bold">
                    {editingPackage ? 'Update detail paket' : 'Tambahin paket baru'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 md:space-y-4 py-3 md:py-4">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase text-sm">Nama Paket</Label>
                    <Input
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                      placeholder="Contoh: Starter, Pro"
                      className="border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold uppercase text-sm">Jumlah Kredit</Label>
                      <Input
                        type="number"
                        value={packageForm.credits}
                        onChange={(e) => setPackageForm({ ...packageForm, credits: parseInt(e.target.value) || 0 })}
                        min="1"
                        className="border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold uppercase text-sm">Harga (IDR)</Label>
                      <Input
                        type="number"
                        value={packageForm.price}
                        onChange={(e) => setPackageForm({ ...packageForm, price: parseInt(e.target.value) || 0 })}
                        min="1000"
                        step="1000"
                        className="border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 flex-col sm:flex-row">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPackageDialog(false)}
                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold w-full sm:w-auto"
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={handleSavePackage} 
                    disabled={isSaving}
                    className="bg-genz-purple text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold w-full sm:w-auto"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingPackage ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />)}
                    {editingPackage ? 'Update' : 'Bikin'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="border-2 md:border-4 border-black rounded-lg overflow-x-auto">
            <Table className="min-w-[550px]">
              <TableHeader>
                <TableRow className="bg-black hover:bg-black">
                  <TableHead className="text-white font-display uppercase border-r-2 border-white/20 text-[10px] md:text-sm whitespace-nowrap">Nama</TableHead>
                  <TableHead className="text-white font-display uppercase border-r-2 border-white/20 text-[10px] md:text-sm whitespace-nowrap">Kredit</TableHead>
                  <TableHead className="text-white font-display uppercase border-r-2 border-white/20 text-[10px] md:text-sm whitespace-nowrap">Harga</TableHead>
                  <TableHead className="text-white font-display uppercase border-r-2 border-white/20 text-[10px] md:text-sm whitespace-nowrap">Aktif</TableHead>
                  <TableHead className="text-white font-display uppercase text-right text-[10px] md:text-sm whitespace-nowrap">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id} className="border-b-2 border-black/10 hover:bg-genz-blue/10">
                    <TableCell className="font-bold text-xs md:text-sm">{pkg.name}</TableCell>
                    <TableCell>
                      <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-genz-cyan/50 border-2 border-black/20 rounded font-mono font-bold text-xs md:text-sm">{pkg.credits}</span>
                    </TableCell>
                    <TableCell className="font-bold text-green-700 text-xs md:text-sm whitespace-nowrap">{formatCurrency(pkg.price)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={pkg.is_active}
                        onCheckedChange={() => handleTogglePackage(pkg)}
                        className="data-[state=checked]:bg-genz-lime scale-90 md:scale-100"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <Button
                          size="sm"
                          className="bg-genz-cyan text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold h-7 w-7 md:h-9 md:w-auto md:px-3 p-0"
                          onClick={() => openEditDialog(pkg)}
                        >
                          <Pencil className="w-3 h-3 md:w-4 md:h-4 stroke-[3px]" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold h-7 w-7 md:h-9 md:w-auto md:px-3 p-0"
                          onClick={() => handleDeletePackage(pkg)}
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4 stroke-[3px]" />
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
