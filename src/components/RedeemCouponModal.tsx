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
        title: 'Eits, Kosong!',
        description: 'Isi kode kuponnya dulu dong!',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Login dulu sob!');
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
        throw new Error(data.error || 'Yah, gagal redeem nih');
      }

      setSuccess({ credits: data.credits_added });
      await refreshProfile();
      
      toast({
        title: 'Mantap Jiwa! 🎉',
        description: `Dapet ${data.credits_added} kredit gratis nih!`,
      });
    } catch (error) {
      console.error('Redeem error:', error);
      toast({
        variant: 'destructive',
        title: 'Waduh Error 😅',
        description: error instanceof Error ? error.message : 'Gagal redeem kupon, coba lagi ya!',
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
      <DialogContent className="sm:max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-0 overflow-hidden gap-0 rounded-xl">
        <div className="bg-genz-pink p-6 border-b-4 border-black">
          <DialogTitle className="font-display text-3xl uppercase flex items-center gap-2">
            <Gift className="w-8 h-8 animate-bounce" />
            Klaim Kupon 🎁
          </DialogTitle>
          <DialogDescription className="text-black font-bold font-mono text-base mt-2">
            Punya kode rahasia? Masukin sini biar dapet kredit gratis!
          </DialogDescription>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="mx-auto w-20 h-20 bg-genz-lime border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-wiggle">
                <CheckCircle2 className="w-10 h-10 text-black" />
              </div>
              <h3 className="font-display text-3xl uppercase mb-2">Hore Berhasil! 🎉</h3>
              <p className="text-lg mb-8 font-bold font-mono">
                Selamat! Kamu dapet <span className="bg-black text-white px-2 py-1 rotate-2 inline-block mx-1">{success.credits} kredit</span> tambahan.
              </p>
              <Button 
                onClick={handleClose}
                className="w-full h-12 border-4 border-black bg-white text-black hover:bg-gray-100 font-display text-xl uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-lg"
              >
                Mantap! 👍
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="code" className="font-display uppercase text-xl">Kode Kupon</Label>
                <Input
                  id="code"
                  placeholder="CONTOH: PROMO2025"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleRedeem();
                    }
                  }}
                  className="border-4 border-black rounded-lg h-14 text-xl font-mono font-bold uppercase placeholder:normal-case focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-genz-cyan focus-visible:bg-genz-cyan/10"
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  onClick={handleRedeem} 
                  disabled={isLoading || !code.trim()}
                  className="w-full h-14 border-4 border-black bg-black text-white hover:bg-genz-lime hover:text-black font-display text-xl uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-lg group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Lagi Ngecek...
                    </>
                  ) : (
                    <>
                      Tukarkan Sekarang 🚀
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-full font-bold uppercase hover:bg-transparent hover:underline text-gray-500 hover:text-black"
                >
                  Batal Aja
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
