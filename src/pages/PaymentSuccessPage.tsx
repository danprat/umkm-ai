import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Loader2, Sparkles, LayoutDashboard, PartyPopper, Zap } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3] p-4 font-mono">
        <div className="bg-white border-4 border-black p-8 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md text-center">
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-12 h-12 animate-spin mb-6 text-black" />
            <p className="text-xl font-display uppercase tracking-wider">Memproses Pembayaran...</p>
            <p className="text-sm font-bold text-gray-500 mt-2">
              Sabar ya, lagi dicek sama sistem...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3] p-4 font-mono overflow-hidden relative">
      {/* Confetti Background Effect (Static CSS based) */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px'}}></div>
      
      <div className="bg-white border-4 border-black p-8 rounded-xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-md text-center relative z-10 animate-bounce-in">
        <div className="mx-auto w-24 h-24 bg-green-400 border-4 border-black flex items-center justify-center mb-6 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-wiggle">
          <PartyPopper className="w-12 h-12 text-black" />
        </div>
        
        <h1 className="text-4xl font-display uppercase mb-2 text-black flex items-center justify-center gap-2">
          MANTAP JIWAAA! <PartyPopper className="w-10 h-10 text-genz-pink fill-genz-pink" />
        </h1>
        <p className="font-bold text-gray-600 mb-8 text-lg">
          Pembayaran berhasil! Kredit udah masuk ke akun kamu.
        </p>
        
        <div className="bg-genz-cyan/20 border-4 border-black p-4 text-center mb-8 rounded-lg border-dashed">
          <p className="text-sm font-bold text-black mb-1 flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Kredit akan muncul otomatis
          </p>
          <p className="text-xs text-gray-600">
            Kalo belum muncul dalam 5 menit, kontak support ya!
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/dashboard/generate')}
            className="w-full py-4 bg-black text-white font-display text-xl uppercase border-4 border-transparent hover:bg-genz-lime hover:text-black hover:border-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 rounded-lg flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Langsung Generate!
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-white text-black font-bold uppercase text-sm border-4 border-black hover:bg-gray-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Ke Dashboard Aja
          </button>
        </div>
      </div>
    </div>
  );
}
