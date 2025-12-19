import { useState } from 'react';
import { Copy, Check, Share2, Users, Coins, Gift, TrendingUp, Sparkles, ExternalLink } from 'lucide-react';
import { useReferral } from '@/hooks/use-referral';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const promotionTemplates = [
  {
    title: 'Template Instagram Story',
    emoji: '📸',
    text: `✨ Bikin foto produk UMKM jadi makin kece pakai AI! ✨

Gampang banget, tinggal upload foto produk kamu, langsung jadi foto profesional! 📷

Daftar pakai kode referral aku ya:
[KODE_REFERRAL]

atau klik link ini:
[LINK_REFERRAL]

#UMKMAI #FotoProduk #JualanOnline #BisnisOnline`,
  },
  {
    title: 'Template WhatsApp Grup',
    emoji: '💬',
    text: `Hai teman-teman! 👋

Mau share tools keren nih buat yang jualan online. UMKM AI bisa bikin foto produk jadi lebih menarik pakai AI, cocok banget buat toko online!

Coba deh, gratis kok buat daftar. Pakai kode referral aku ya:
*[KODE_REFERRAL]*

atau langsung klik:
[LINK_REFERRAL]

Dijamin foto produk kamu bakal lebih eye-catching! 🚀`,
  },
  {
    title: 'Template Personal Chat',
    emoji: '🤝',
    text: `Halo! Aku mau rekomendasiin tools buat bikin foto produk nih 😊

UMKM AI ini bisa bantu transform foto produk biasa jadi lebih profesional pakai AI. Cocok banget buat yang punya bisnis online!

Kalau mau coba, pakai kode referral aku ya: [KODE_REFERRAL]

Link-nya: [LINK_REFERRAL]

Gratis daftar dan ada bonus credit juga! 🎁`,
  },
  {
    title: 'Template Facebook Post',
    emoji: '📱',
    text: `🎨 UMKM AI - Solusi Foto Produk Profesional! 🎨

Pernah ngerasa foto produk kamu kurang menarik? Sekarang ada solusinya!

UMKM AI pakai teknologi AI untuk transform foto produk jadi lebih eye-catching dan profesional. Perfect untuk:
✅ Toko online
✅ Marketplace
✅ Sosial media
✅ Katalog produk

Daftar gratis sekarang pakai kode referral: [KODE_REFERRAL]
atau klik: [LINK_REFERRAL]

Bonus credit untuk pengguna baru! 🎁

#UMKMAI #BisnisOnline #FotoProduk #AI`,
  },
  {
    title: 'Template Email/DM',
    emoji: '📧',
    text: `Subject: Tools Keren Buat Foto Produk UMKM!

Halo,

Aku mau share tools yang sangat membantu untuk bisnis online, yaitu UMKM AI. Platform ini menggunakan AI untuk membuat foto produk terlihat lebih profesional dan menarik.

Fitur unggulan:
• Transform foto produk dengan AI
• Berbagai style dan background
• Mudah digunakan
• Hasil berkualitas tinggi

Kamu bisa coba gratis dengan mendaftar menggunakan kode referral aku: [KODE_REFERRAL]

Link pendaftaran: [LINK_REFERRAL]

Ada bonus credit untuk pengguna baru, jadi langsung bisa coba semua fiturnya!

Semoga bermanfaat! 😊`,
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
      toast.success('Kode referral dicopy!', { 
        description: 'Sekarang tinggal share ke teman-teman kamu!'
      });
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyReferralLink();
    if (success) {
      setCopied('link');
      toast.success('Link referral dicopy!', {
        description: 'Langsung share ke media sosial kamu!'
      });
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleCopyTemplate = (template: string, index: number) => {
    const text = template
      .replace(/\[KODE_REFERRAL\]/g, referralCode || '')
      .replace(/\[LINK_REFERRAL\]/g, getReferralLink());
    
    navigator.clipboard.writeText(text);
    setCopied(`template-${index}`);
    toast.success('Template dicopy!', {
      description: 'Tinggal paste dan kirim ke teman-teman!'
    });
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Program Referral 🎁
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ajak teman pakai UMKM AI, dapetin bonus credit! Setiap teman yang daftar pakai kode kamu, 
            kamu dapet bonus. Plus komisi dari setiap pembelian mereka! 💰
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-purple-200 dark:border-purple-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referral</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {isLoading ? '...' : stats?.total_referrals || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Teman yang daftar
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? '...' : stats?.verified_referrals || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sudah verifikasi
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bonus Signup</CardTitle>
              <Gift className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {isLoading ? '...' : stats?.signup_bonus_total || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Credit dari signup
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Komisi</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {isLoading ? '...' : stats?.commission_total || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Credit dari pembelian
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Total Earned Card */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-300 dark:border-purple-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-purple-600" />
                  Total Credit Terkumpul
                </CardTitle>
                <CardDescription className="mt-1">
                  Akumulasi dari bonus signup dan komisi pembelian
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-purple-600">
                  {isLoading ? '...' : totalEarned}
                </div>
                <p className="text-sm text-muted-foreground">Credit</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Referral Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Kode & Link Referral Kamu
            </CardTitle>
            <CardDescription>
              Share kode atau link ini ke teman-teman untuk dapetin bonus!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Referral Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Kode Referral</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={referralCode || ''}
                    readOnly
                    className="w-full px-4 py-3 pr-10 border rounded-lg bg-gray-50 dark:bg-gray-900 font-mono text-lg font-bold text-center tracking-wider"
                  />
                  <Copy className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button onClick={handleCopyCode} size="lg" className="gap-2">
                  {copied === 'code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </Button>
              </div>
            </div>

            <Separator />

            {/* Referral Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Link Referral</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={getReferralLink()}
                    readOnly
                    className="w-full px-4 py-3 pr-10 border rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
                  />
                  <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button onClick={handleCopyLink} size="lg" variant="outline" className="gap-2">
                  {copied === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </Button>
                <Button onClick={handleShare} size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                💡 Cara Kerja:
              </h4>
              <ul className="space-y-1.5 text-sm text-purple-800 dark:text-purple-200">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Teman daftar pakai kode/link referral kamu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Kamu dapet <strong>10 credit bonus</strong> setelah mereka verifikasi email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Dapat <strong>komisi 10%</strong> dari setiap pembelian credit mereka selamanya!</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Promotion Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-pink-600" />
              Template Promosi Siap Pakai
            </CardTitle>
            <CardDescription>
              Tinggal copy-paste dan share! Kode & link referral otomatis terisi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                {promotionTemplates.map((template, index) => (
                  <TabsTrigger key={index} value={String(index)} className="text-xs">
                    <span className="mr-1">{template.emoji}</span>
                    <span className="hidden md:inline">{template.title.split(' ')[1]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {promotionTemplates.map((template, index) => (
                <TabsContent key={index} value={String(index)} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <span className="text-2xl">{template.emoji}</span>
                      {template.title}
                    </h3>
                    <Button
                      onClick={() => handleCopyTemplate(template.text, index)}
                      variant="default"
                      className="gap-2"
                    >
                      {copied === `template-${index}` ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Template
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <pre className="bg-gray-50 dark:bg-gray-900 border rounded-lg p-4 text-sm whitespace-pre-wrap overflow-x-auto">
                      {template.text
                        .replace(/\[KODE_REFERRAL\]/g, referralCode || '...')
                        .replace(/\[LINK_REFERRAL\]/g, getReferralLink())}
                    </pre>
                  </div>
                  
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded p-3">
                    <span className="text-blue-600">💡</span>
                    <span>
                      <strong>Tips:</strong> Kamu bisa edit template ini sesuai gaya kamu sendiri. 
                      Yang penting kode referral dan link-nya tetap ada ya!
                    </span>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Referral List */}
        {stats && stats.referrals && stats.referrals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Daftar Referral Kamu
              </CardTitle>
              <CardDescription>
                Teman-teman yang sudah daftar pakai kode referral kamu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.referrals.map((referral) => (
                  <div
                    key={referral.referred_id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {referral.referred_email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{referral.referred_email}</p>
                        <p className="text-xs text-muted-foreground">
                          Bergabung {new Date(referral.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {referral.completed_at ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Pending
                        </Badge>
                      )}
                      {referral.signup_bonus_awarded > 0 && (
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100">
                          +{referral.signup_bonus_awarded} credit
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
