import { useState } from 'react';
import { Copy, Check, Share2, Users, Coins, Gift, TrendingUp } from 'lucide-react';
import { useReferral } from '@/hooks/use-referral';
import { toast } from 'sonner';

export function ReferralCard() {
  const { 
    referralCode, 
    stats, 
    isLoading, 
    copyReferralCode, 
    copyReferralLink,
    getReferralLink 
  } = useReferral();
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  const handleCopyCode = async () => {
    const success = await copyReferralCode();
    if (success) {
      setCopied('code');
      toast.success('Kode referral dicopy!');
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyReferralLink();
    if (success) {
      setCopied('link');
      toast.success('Link referral dicopy!');
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleShare = async () => {
    const link = getReferralLink();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'UMKM AI - Bikin Foto Produk Keren!',
          text: 'Coba UMKM AI buat bikin foto produk keren pakai AI. Daftar gratis pakai kode referral aku!',
          url: link,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border-4 border-black p-6 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const totalCredits = (stats?.signup_bonus_total || 0) + (stats?.commission_total || 0);

  return (
    <div className="bg-white border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-genz-lime via-genz-cyan to-genz-pink p-4 border-b-4 border-black">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg border-2 border-black">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-xl uppercase">Program Referral</h3>
            <p className="text-sm font-bold font-mono">Ajak teman, dapat kredit!</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Referral Code */}
        <div className="mb-6">
          <label className="block text-sm font-bold uppercase mb-2 font-mono">Kode Referral Kamu</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-100 border-3 border-black px-4 py-3 rounded-lg font-mono text-xl font-bold tracking-wider text-center">
              {referralCode || '--------'}
            </div>
            <button
              onClick={handleCopyCode}
              className="bg-black text-white px-4 py-3 rounded-lg border-3 border-black hover:bg-genz-lime hover:text-black transition-colors flex items-center gap-2"
            >
              {copied === 'code' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Share Link */}
        <div className="mb-6">
          <label className="block text-sm font-bold uppercase mb-2 font-mono">Link Referral</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-100 border-3 border-black px-4 py-3 rounded-lg font-mono text-sm truncate">
              {getReferralLink() || 'Loading...'}
            </div>
            <button
              onClick={handleCopyLink}
              className="bg-genz-cyan px-4 py-3 rounded-lg border-3 border-black hover:bg-genz-lime transition-colors flex items-center gap-2"
            >
              {copied === 'link' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
            <button
              onClick={handleShare}
              className="bg-genz-pink px-4 py-3 rounded-lg border-3 border-black hover:bg-genz-coral transition-colors flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-genz-lime/30 border-3 border-black p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase font-mono">Total Referral</span>
            </div>
            <p className="text-2xl font-display">{stats?.total_referrals || 0}</p>
          </div>
          <div className="bg-genz-cyan/30 border-3 border-black p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-4 h-4" />
              <span className="text-xs font-bold uppercase font-mono">Verified</span>
            </div>
            <p className="text-2xl font-display">{stats?.verified_referrals || 0}</p>
          </div>
          <div className="bg-genz-pink/30 border-3 border-black p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-4 h-4" />
              <span className="text-xs font-bold uppercase font-mono">Bonus Signup</span>
            </div>
            <p className="text-2xl font-display">{stats?.signup_bonus_total || 0}</p>
          </div>
          <div className="bg-genz-purple/30 border-3 border-black p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase font-mono">Komisi</span>
            </div>
            <p className="text-2xl font-display">{stats?.commission_total || 0}</p>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-black text-white p-4 rounded-lg border-3 border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              <span className="font-bold uppercase font-mono">Total Kredit dari Referral</span>
            </div>
            <span className="text-2xl font-display text-genz-lime">{totalCredits}</span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 text-sm text-gray-600 font-mono">
          <p className="mb-1">💰 <strong>Bonus signup:</strong> Dapat kredit saat temanmu daftar & verifikasi email</p>
          <p>📈 <strong>Komisi:</strong> Dapat 10% kredit setiap temanmu beli paket</p>
        </div>
      </div>
    </div>
  );
}
