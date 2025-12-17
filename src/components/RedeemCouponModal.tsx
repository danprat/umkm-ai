import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Gift, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RedeemCouponModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RedeemCouponModal({ open, onOpenChange }: RedeemCouponModalProps) {
  const { refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<{ credits: number } | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a coupon code',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Please login first');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redeem-coupon`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ code: code.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to redeem coupon');
      }

      setSuccess({ credits: data.credits_added });
      await refreshProfile();
      
      toast({
        title: 'Success!',
        description: `Added ${data.credits_added} credits to your account`,
      });
    } catch (error) {
      console.error('Redeem error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to redeem coupon',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setSuccess(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-[3px] border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-background p-0 overflow-hidden gap-0">
        <div className="bg-accent p-4 border-b-[3px] border-foreground">
          <DialogTitle className="font-display text-2xl uppercase flex items-center gap-2">
            <Gift className="w-6 h-6" />
            Klaim Kupon
          </DialogTitle>
          <DialogDescription className="text-foreground/80 font-medium">
            Masukkan kode kupon untuk mendapatkan kredit gratis.
          </DialogDescription>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 bg-green-100 border-[3px] border-foreground rounded-full flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-display text-2xl uppercase mb-2">Berhasil!</h3>
              <p className="text-lg mb-6">
                Selamat! Anda mendapatkan <span className="font-bold">{success.credits} kredit</span> tambahan.
              </p>
              <Button 
                onClick={handleClose}
                className="w-full border-[3px] border-foreground bg-white text-foreground hover:bg-gray-100 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Tutup
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="font-bold uppercase">Kode Kupon</Label>
                <Input
                  id="code"
                  placeholder="Contoh: UMKM2025"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleRedeem();
                    }
                  }}
                  className="border-[3px] border-foreground rounded-none h-12 text-lg font-mono uppercase placeholder:normal-case focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-accent"
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleRedeem} 
                  disabled={isLoading || !code.trim()}
                  className="w-full h-12 border-[3px] border-foreground bg-accent text-foreground hover:bg-accent/90 font-bold uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Tukarkan Kupon'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-full font-bold uppercase hover:bg-transparent hover:underline"
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
