import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Loader2, Sparkles, LayoutDashboard } from 'lucide-react';

export default function PaymentSuccessPage() {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending'>('loading');

  useEffect(() => {
    // Refresh profile to get updated credits
    const refreshData = async () => {
      await refreshProfile();
      // Payment might still be processing, show success anyway
      // The webhook will update credits in the background
      setStatus('success');
    };

    // Wait a bit for webhook to process
    const timer = setTimeout(refreshData, 2000);
    
    return () => clearTimeout(timer);
  }, [refreshProfile]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="brutal-card w-full max-w-md text-center">
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-display uppercase">Memproses Pembayaran...</p>
            <p className="text-sm text-muted-foreground font-mono mt-2">
              Mohon tunggu sementara kami memverifikasi transaksi Anda
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="brutal-card w-full max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-green-400 border-[3px] border-foreground flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-display uppercase mb-2">Pembayaran Berhasil!</h1>
        <p className="text-muted-foreground font-mono mb-6">
          Kredit sudah ditambahkan ke akun Anda
        </p>
        
        <div className="bg-muted border-[3px] border-foreground p-4 text-center mb-6">
          <p className="text-sm text-muted-foreground font-mono mb-1">
            Kredit akan muncul di akun Anda segera
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Jika kredit tidak muncul dalam 5 menit, silakan hubungi support
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/dashboard/generate')}
            className="brutal-btn-primary w-full justify-center"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Mulai Generate
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="brutal-btn w-full justify-center"
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
