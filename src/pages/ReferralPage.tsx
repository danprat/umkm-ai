import { useState } from 'react';
import { 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Coins, 
  Gift, 
  TrendingUp, 
  Star, 
  ExternalLink,
  Instagram, 
  MessageCircle, 
  Facebook, 
  Mail,
  MessageSquare,
  Wallet,
  Zap
} from 'lucide-react';
import { useReferral } from '@/hooks/use-referral';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const promotionTemplates = [
  {
    title: 'Template Instagram Story',
    icon: Instagram,
    color: 'text-pink-600',
    text: `Foto produk masih burik? Plis deh, hari gini masih manual?

Pake UMKM AI dong! Foto produk auto glowing dalam detik. Bikin jualan makin aesthetic tanpa ribet.

Pake kode gue biar dapet bonus credit:
[KODE_REFERRAL]

Cekidot langsung:
[LINK_REFERRAL]

#UMKMAI #FotoProduk #Aesthetic #BisnisOnline #Cuan`,
  },
  {
    title: 'Template WhatsApp Grup',
    icon: MessageCircle,
    color: 'text-green-600',
    text: `Guys, nemu tools gokil nih buat foto produk!

Namanya UMKM AI. Hasilnya kayak studio pro, padahal cuma modal HP + AI. Gak perlu skill edit dewa.

Cobain deh, mumpung ada bonus pake kode gue:
*[KODE_REFERRAL]*

Gas langsung ke sini:
[LINK_REFERRAL]

Semoga laris manis tanjung kimpul!`,
  },
  {
    title: 'Template Personal Chat',
    icon: MessageSquare,
    color: 'text-blue-600',
    text: `Woy, liat deh app ini. Bisa bikin foto produk lo jadi next level banget!

Gak perlu sewa fotografer mahal, UMKM AI solusinya. Hasilnya kece parah buat sosmed.

Pake kode gue ya biar dapet credit gratis: [KODE_REFERRAL]

Link: [LINK_REFERRAL]

Cobain skrg, ntar nyesel loh!`,
  },
  {
    title: 'Template Facebook Post',
    icon: Facebook,
    color: 'text-blue-700',
    text: `Foto Produk Kece Badai Tanpa Bikin Kantong Bolong!

Kenapa harus ribet kalo ada UMKM AI?
- Hasil instan
- Kualitas HD
- Hemat duit
- Auto aesthetic

Buruan daftar pake link sakti ini biar dapet bonus:
Kode: [KODE_REFERRAL]
Link: [LINK_REFERRAL]

#UMKMAI #FotoProdukKece #CuanOnline #UMKMNaikKelas`,
  },
  {
    title: 'Template Email/DM',
    icon: Mail,
    color: 'text-purple-600',
    text: `Subject: Rahasia Foto Produk Laris Manis!

Hai Bestie!

Mau foto produkmu dilirik banyak orang? Kualitas visual itu koentji!

Cobain UMKM AI deh. Bisa ubah background otomatis, lighting oke, resolusi tinggi. Praktis banget buat yang mager edit manual.

Dapet bonus credit kalo daftar lewat sini:
[LINK_REFERRAL]

Atau pake kode: [KODE_REFERRAL]

Yuk upgrade bisnismu sekarang!`,
  },
];

export default function ReferralPage() {
  const { 
    referralCode, 
    stats, 
    isLoading, 
    copyReferralCode, 
    copyReferralLink,
    getReferralLink 
  } = useReferral();
  const [copied, setCopied] = useState<'code' | 'link' | string | null>(null);

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

  const handleCopyTemplate = (template: string, index: number) => {
    const text = template
      .replace(/\[KODE_REFERRAL\]/g, referralCode || '')
      .replace(/\[LINK_REFERRAL\]/g, getReferralLink());
    
    navigator.clipboard.writeText(text);
    setCopied(`template-${index}`);
    toast.success('Template dicopy!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = async () => {
    const link = getReferralLink();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'UMKM AI - Bikin Foto Produk Keren!',
          text: `Coba UMKM AI buat bikin foto produk keren pakai AI. Daftar gratis pakai kode referral ${referralCode}!`,
          url: link,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const totalEarned = (stats?.signup_bonus_total || 0) + (stats?.commission_total || 0);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
        {/* Header - Neo Brutalism Style */}
        <div className="bg-genz-cyan border-4 border-black p-6 md:p-8 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
            <div className="space-y-4 max-w-2xl w-full">
              <Badge className="bg-black text-white border-none px-4 py-1 text-xs md:text-sm font-bold uppercase tracking-wider mx-auto md:mx-0 w-fit block">
                Referral Zone
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase leading-none tracking-tighter">
                Cuan Bareng<br />Bestie!
              </h1>
              <p className="text-black font-bold text-base md:text-xl border-l-0 md:border-l-4 border-black pl-0 md:pl-4 pt-2 md:pt-0">
                Ajak temen lo join UMKM AI! Lo dapet credit gratis, mereka dapet tools kece buat foto produk. Win-win solution kan?
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3 hover:rotate-0 transition-transform">
                <Gift className="w-12 h-12 md:w-16 md:h-16 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Grid Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {[
            { title: "Bestie Joined", value: stats?.total_referrals || 0, icon: Users, color: "bg-genz-pink" },
            { title: "Verified Users", value: stats?.verified_referrals || 0, icon: Check, color: "bg-genz-lime" },
            { title: "Cuan Signup", value: stats?.signup_bonus_total || 0, icon: Gift, color: "bg-genz-purple", textColor: "text-white" },
            { title: "Passive Income", value: stats?.commission_total || 0, icon: TrendingUp, color: "bg-genz-coral" }
          ].map((stat, idx) => (
            <div key={idx} className={`${stat.color} border-2 md:border-4 border-black p-4 md:p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] md:hover:translate-x-[2px] md:hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all`}>
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <h3 className={`font-bold uppercase tracking-wide text-[10px] md:text-sm ${stat.textColor || 'text-black'}`}>{stat.title}</h3>
                <stat.icon className={`w-4 h-4 md:w-6 md:h-6 ${stat.textColor || 'text-black'}`} />
              </div>
              <div className={`text-2xl md:text-4xl font-black ${stat.textColor || 'text-black'}`}>
                {isLoading ? '...' : stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Referral Code Section */}
            <div className="bg-white border-4 border-black p-4 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-6">
                <Star className="h-6 w-6 md:h-8 md:w-8 text-black fill-yellow-400" />
                <h2 className="text-xl md:text-2xl font-black uppercase">Link Sakti Lo</h2>
              </div>
              
              <div className="space-y-6">
                {/* Referral Code */}
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider">Kode Referral</label>
                  <div className="flex flex-col md:flex-row gap-2 md:gap-0">
                    <div className="flex-1 border-4 border-black md:border-r-0 bg-gray-50 px-4 py-3 md:px-6 md:py-4 font-mono text-lg md:text-xl font-bold tracking-widest text-center">
                      {referralCode || '...'}
                    </div>
                    <Button 
                      onClick={handleCopyCode} 
                      className="h-12 md:h-auto rounded-none border-4 border-black px-8 bg-black text-white hover:bg-genz-lime hover:text-black font-bold uppercase tracking-wide transition-all w-full md:w-auto"
                    >
                      {copied === 'code' ? <Check className="h-5 w-5" /> : 'Copy'}
                    </Button>
                  </div>
                </div>

                {/* Referral Link */}
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider">Link Referral</label>
                  <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                    <div className="flex-1 border-4 border-black bg-white px-4 py-3 font-mono text-xs md:text-sm truncate">
                      {getReferralLink()}
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleCopyLink} variant="outline" className="flex-1 md:flex-none rounded-none border-4 border-black hover:bg-black hover:text-white font-bold uppercase h-12 md:h-10 text-xs md:text-sm">
                        {copied === 'link' ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        Copy
                      </Button>
                      <Button onClick={handleShare} className="flex-1 md:flex-none rounded-none border-4 border-black bg-genz-purple text-white hover:bg-genz-purple/90 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold uppercase h-12 md:h-10 text-xs md:text-sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-genz-blue/20 border-4 border-black p-4 md:p-6 mt-8">
                  <h4 className="font-black uppercase text-base md:text-lg mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-black fill-black" />
                    Caranya Gampang Banget
                  </h4>
                  <ul className="space-y-4 font-medium text-sm md:text-base">
                    <li className="flex items-start gap-4">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-black text-white flex items-center justify-center font-bold text-xs md:text-sm border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] shrink-0">1</div>
                      <p className="pt-0.5 md:pt-1">Teman daftar pakai link lo</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-black text-white flex items-center justify-center font-bold text-xs md:text-sm border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] shrink-0">2</div>
                      <p className="pt-0.5 md:pt-1">Lo dapet <span className="bg-genz-lime px-1 border border-black text-[10px] md:text-xs font-bold inline-block">10 CREDIT GRATIS</span> (auto masuk!) setelah verifikasi</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-black text-white flex items-center justify-center font-bold text-xs md:text-sm border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] shrink-0">3</div>
                      <p className="pt-0.5 md:pt-1">Dapet <span className="bg-genz-lime px-1 border border-black text-[10px] md:text-xs font-bold inline-block">KOMISI 10%</span> tiap mereka beli credit. Selamanya!</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Promotion Templates */}
            <div className="bg-white border-4 border-black p-4 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-black fill-genz-pink" />
                  <h2 className="text-xl md:text-2xl font-black uppercase">Template Siap Pakai</h2>
                </div>
                <p className="text-xs md:text-sm font-bold text-gray-500 md:ml-auto">Tinggal copy-paste dan share!</p>
              </div>
              
              <Tabs defaultValue="0" className="w-full">
                <TabsList className="flex w-full flex-wrap gap-2 bg-transparent h-auto p-0 mb-6">
                  {promotionTemplates.map((template, index) => (
                    <TabsTrigger 
                      key={index} 
                      value={String(index)} 
                      className="flex-1 md:flex-none rounded-none border-2 border-black data-[state=active]:bg-black data-[state=active]:text-white bg-white hover:bg-gray-100 transition-all font-bold uppercase text-[10px] md:text-xs px-2 py-2 md:px-4 md:py-2 min-w-[40px] md:min-w-fit"
                    >
                      <span className="md:hidden"><template.icon className="w-4 h-4" /></span>
                      <span className="hidden md:inline">{template.title.replace('Template ', '')}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {promotionTemplates.map((template, index) => (
                  <TabsContent key={index} value={String(index)} className="space-y-4 focus-visible:ring-0 mt-0">
                    <div className="bg-gray-50 border-4 border-black p-4 md:p-6 relative">
                      <div className="absolute top-4 right-4">
                        <Button
                          onClick={() => handleCopyTemplate(template.text, index)}
                          size="sm"
                          className="rounded-none border-2 border-black bg-white text-black hover:bg-black hover:text-white font-bold uppercase text-[10px] md:text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-8 px-2 md:px-4"
                        >
                          {copied === `template-${index}` ? (
                            <>
                              <Check className="h-3 w-3 mr-1 md:mr-2" />
                              <span className="hidden md:inline">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1 md:mr-2" />
                              <span className="hidden md:inline">Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <h3 className="font-bold text-sm md:text-lg mb-4 flex items-center gap-2 uppercase pr-16 md:pr-0">
                        <template.icon className={`w-4 h-4 md:w-5 md:h-5`} />
                        {template.title}
                      </h3>
                      <pre className="font-mono text-xs md:text-sm whitespace-pre-wrap leading-relaxed bg-white border-2 border-black p-3 md:p-4 overflow-x-auto">
                        {template.text
                          .replace(/\[KODE_REFERRAL\]/g, referralCode || '...')
                          .replace(/\[LINK_REFERRAL\]/g, getReferralLink())}
                      </pre>
                    </div>
                    
                    <div className="bg-genz-lime/30 border-2 border-black p-3 text-[10px] md:text-xs font-bold flex gap-2 items-start md:items-center">
                      <span className="bg-black text-white px-2 py-0.5 text-[8px] md:text-[10px] uppercase shrink-0 mt-0.5 md:mt-0">TIP</span>
                      Bebas edit sesuka hati! Yang penting kode referral & link jangan sampe ilang ya!
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>

          <div className="space-y-6">
            {/* Total Earned Card */}
            <div className="bg-black text-white border-4 border-black p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)] md:shadow-[8px_8px_0px_0px_rgba(100,100,100,0.5)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg md:text-xl font-black uppercase text-genz-lime flex items-center gap-2">
                    <Wallet className="h-5 w-5 md:h-6 md:w-6" />
                    Total Cuan Lo
                  </h2>
                  <p className="text-gray-400 text-xs md:text-sm font-mono mt-1">
                    Hasil dari sebar link sakti
                  </p>
                </div>
              </div>
              <div className="border-t-2 border-gray-800 my-4"></div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-6xl font-black tracking-tighter">{isLoading ? '...' : totalEarned}</span>
                <span className="text-lg md:text-xl font-bold text-genz-lime">CR</span>
              </div>
              <p className="text-[10px] md:text-xs text-gray-400 mt-4 font-mono bg-gray-900 p-2 inline-block">
                Credit langsung masuk wallet!
              </p>
            </div>

            {/* Referral List */}
            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-fit">
              <div className="p-4 md:p-6 border-b-4 border-black bg-genz-pink">
                <h2 className="text-lg md:text-xl font-black uppercase flex items-center gap-2 text-white text-stroke-1 stroke-black">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-black" />
                  Bestie List
                </h2>
                <p className="text-black font-bold text-xs md:text-sm mt-1">
                  Mereka yang udah join squad lo
                </p>
              </div>
              
              <div className="p-4 md:p-6">
                {stats && stats.referrals && stats.referrals.length > 0 ? (
                  <div className="space-y-3 md:space-y-4">
                    {stats.referrals.map((referral) => (
                      <div
                        key={referral.referred_id}
                        className="flex items-center justify-between p-3 border-2 border-black bg-gray-50 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 md:h-10 md:w-10 bg-black text-white flex items-center justify-center font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] text-xs md:text-base">
                            {referral.referred_email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-xs md:text-sm text-black truncate max-w-[100px] md:max-w-[120px]">
                              {referral.referred_email?.split('@')[0]}
                            </p>
                            <p className="text-[10px] font-mono text-gray-500">
                              {new Date(referral.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {referral.completed_at ? (
                            <span className="bg-genz-lime text-black border border-black text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 font-bold uppercase">
                              Verified
                            </span>
                          ) : (
                            <span className="bg-gray-200 text-gray-500 border border-black text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 font-bold uppercase">
                              Pending
                            </span>
                          )}
                          {referral.signup_bonus_awarded > 0 && (
                            <span className="text-[8px] md:text-[10px] font-black text-genz-purple">
                              +{referral.signup_bonus_awarded} CR
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8 border-2 border-dashed border-black bg-gray-50">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <Users className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                    </div>
                    <h3 className="font-black uppercase text-base md:text-lg">Masih sepi nih...</h3>
                    <p className="text-xs md:text-sm font-medium text-gray-500 mt-1 max-w-[200px] mx-auto">
                      Ayo ajak bestie lo join biar rame!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
