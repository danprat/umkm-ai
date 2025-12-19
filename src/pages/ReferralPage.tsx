import { useState } from 'react';
import { 
  Copy01Icon, 
  Tick02Icon, 
  Share01Icon, 
  UserGroupIcon, 
  Money03Icon, 
  GiftIcon, 
  TradeUpIcon, 
  StarIcon, 
  LinkSquare02Icon,
  InstagramIcon, 
  WhatsappIcon, 
  Facebook02Icon, 
  Mail01Icon,
  BubbleChatIcon,
  Wallet01Icon
} from '@hugeicons/react';
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
    icon: InstagramIcon,
    color: 'text-pink-600',
    text: `Ingin foto produk UMKM Anda terlihat lebih profesional?

Gunakan UMKM AI untuk mengubah foto produk biasa menjadi luar biasa dalam hitungan detik. Teknologi AI kami membantu meningkatkan kualitas visual produk Anda secara instan.

Daftar sekarang menggunakan kode referral saya untuk mendapatkan bonus kredit:
[KODE_REFERRAL]

Atau klik tautan berikut:
[LINK_REFERRAL]

#UMKMAI #FotoProduk #BisnisOnline #UMKMIndonesia`,
  },
  {
    title: 'Template WhatsApp Grup',
    icon: WhatsappIcon,
    color: 'text-green-600',
    text: `Halo rekan-rekan UMKM,

Saya ingin berbagi alat yang sangat berguna untuk meningkatkan penjualan online. UMKM AI adalah platform yang dapat mengubah foto produk Anda menjadi materi pemasaran profesional secara otomatis.

Fitur ini sangat membantu untuk membuat katalog, postingan media sosial, dan materi promosi lainnya.

Silakan coba gratis dengan kode referral:
*[KODE_REFERRAL]*

Atau akses langsung melalui:
[LINK_REFERRAL]

Semoga bermanfaat untuk kemajuan bisnis kita bersama.`,
  },
  {
    title: 'Template Personal Chat',
    icon: BubbleChatIcon,
    color: 'text-blue-600',
    text: `Halo, saya menemukan platform yang sangat bagus untuk kebutuhan foto produk bisnis Anda.

UMKM AI memungkinkan Anda membuat foto produk berkualitas studio hanya dengan menggunakan kamera HP dan bantuan AI. Hasilnya sangat cocok untuk marketplace dan media sosial.

Anda bisa mencobanya secara gratis. Gunakan kode referral ini untuk mendapatkan tambahan kredit: [KODE_REFERRAL]

Tautan pendaftaran: [LINK_REFERRAL]

Selamat mencoba!`,
  },
  {
    title: 'Template Facebook Post',
    icon: Facebook02Icon,
    color: 'text-blue-700',
    text: `Tingkatkan Kualitas Foto Produk Anda dengan AI

Visual produk yang menarik adalah kunci sukses penjualan online. UMKM AI hadir untuk membantu pelaku usaha membuat foto produk profesional tanpa biaya mahal.

Mengapa menggunakan UMKM AI?
- Proses cepat dan otomatis
- Hasil berkualitas tinggi
- Tersedia berbagai pilihan gaya dan latar belakang
- Hemat biaya produksi

Daftarkan bisnis Anda sekarang dan dapatkan bonus kredit pengguna baru:
Kode Referral: [KODE_REFERRAL]
Link: [LINK_REFERRAL]

#UMKMAI #SolusiUMKM #DigitalMarketing #FotoProduk`,
  },
  {
    title: 'Template Email/DM',
    icon: Mail01Icon,
    color: 'text-purple-600',
    text: `Subject: Rekomendasi Alat Foto Produk Profesional untuk Bisnis Anda

Yth. Pelaku Usaha,

Dalam dunia bisnis online, kualitas foto produk sangat mempengaruhi keputusan pembeli. Saya ingin merekomendasikan UMKM AI, sebuah platform inovatif yang membantu Anda membuat foto produk kelas profesional dengan mudah.

Dengan UMKM AI, Anda dapat:
1. Mengubah latar belakang produk secara otomatis
2. Meningkatkan resolusi dan pencahayaan
3. Menghasilkan variasi foto untuk berbagai kebutuhan pemasaran

Dapatkan akses prioritas dan bonus kredit dengan mendaftar melalui tautan ini:
[LINK_REFERRAL]

Atau masukkan kode referral: [KODE_REFERRAL]

Tingkatkan penjualan Anda dengan visual produk yang lebih baik.`,
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
      <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-blue-500/10 p-8 rounded-3xl border border-white/20 backdrop-blur-sm text-center md:text-left">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-3">
              Program Referral <StarIcon className="w-8 h-8 text-yellow-500 fill-yellow-500 animate-pulse" variant="solid" />
            </h1>
            <p className="text-gray-600 text-lg">
              Undang rekan bisnis Anda untuk menggunakan UMKM AI. Dapatkan bonus kredit untuk setiap pendaftaran baru dan komisi dari setiap pembelian yang mereka lakukan.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md">
              <GiftIcon className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-3xl border-purple-100 bg-white hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Referral</CardTitle>
              <div className="p-2 bg-purple-50 rounded-xl">
                <UserGroupIcon className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {isLoading ? '...' : stats?.total_referrals || 0}
              </div>
              <p className="text-xs text-purple-600 font-medium mt-1">
                Teman yang daftar
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-green-100 bg-white hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Verified</CardTitle>
              <div className="p-2 bg-green-50 rounded-xl">
                <Tick02Icon className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {isLoading ? '...' : stats?.verified_referrals || 0}
              </div>
              <p className="text-xs text-green-600 font-medium mt-1">
                Sudah verifikasi
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-blue-100 bg-white hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Bonus Signup</CardTitle>
              <div className="p-2 bg-blue-50 rounded-xl">
                <GiftIcon className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {isLoading ? '...' : stats?.signup_bonus_total || 0}
              </div>
              <p className="text-xs text-blue-600 font-medium mt-1">
                Credit dari signup
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-yellow-100 bg-white hover:shadow-xl hover:shadow-yellow-100/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Komisi</CardTitle>
              <div className="p-2 bg-yellow-50 rounded-xl">
                <TradeUpIcon className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {isLoading ? '...' : stats?.commission_total || 0}
              </div>
              <p className="text-xs text-yellow-600 font-medium mt-1">
                Credit dari pembelian
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Referral Code Section */}
            <Card className="rounded-3xl border-gray-100 shadow-lg shadow-gray-200/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <StarIcon className="h-6 w-6 text-purple-600 fill-purple-100" />
                  Kode & Link Referral Kamu
                </CardTitle>
                <CardDescription>
                  Share kode atau link ini ke teman-teman untuk dapetin bonus!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Referral Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Kode Referral</label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <GiftIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={referralCode || ''}
                        readOnly
                        className="w-full pl-12 pr-12 py-4 border-2 border-gray-100 rounded-2xl bg-gray-50/50 font-mono text-xl font-bold text-gray-900 tracking-wider focus:ring-4 focus:ring-purple-100 focus:border-purple-200 transition-all outline-none"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        {copied === 'code' ? (
                          <Tick02Icon className="h-5 w-5 text-green-500" />
                        ) : (
                          <Copy01Icon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={handleCopyCode} 
                      size="lg" 
                      className="h-auto rounded-2xl px-8 bg-gray-900 hover:bg-gray-800 transition-all hover:scale-105"
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                {/* Referral Link */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Link Referral</label>
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LinkSquare02Icon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={getReferralLink()}
                        readOnly
                        className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all outline-none truncate"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCopyLink} variant="outline" className="flex-1 md:flex-none rounded-xl border-gray-200 hover:bg-gray-50 hover:text-blue-600">
                        {copied === 'link' ? <Tick02Icon className="h-4 w-4 mr-2" /> : <Copy01Icon className="h-4 w-4 mr-2" />}
                        Copy
                      </Button>
                      <Button onClick={handleShare} className="flex-1 md:flex-none rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-200 border-none">
                        <Share01Icon className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <StarIcon className="w-4 h-4 text-purple-600 fill-purple-600" />
                    Cara Kerja
                  </h4>
                  <ul className="space-y-3 text-sm text-purple-800">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-purple-600 font-bold flex items-center justify-center text-xs shadow-sm">1</span>
                      <span>Teman daftar pakai kode/link referral kamu</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-purple-600 font-bold flex items-center justify-center text-xs shadow-sm">2</span>
                      <span>Kamu dapet <strong className="text-purple-700">10 credit bonus</strong> setelah mereka verifikasi email</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-purple-600 font-bold flex items-center justify-center text-xs shadow-sm">3</span>
                      <span>Dapat <strong className="text-purple-700">komisi 10%</strong> dari setiap pembelian credit mereka selamanya!</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Promotion Templates */}
            <Card className="rounded-3xl border-gray-100 shadow-lg shadow-gray-200/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Share01Icon className="h-6 w-6 text-pink-500" />
                  Template Promosi Siap Pakai
                </CardTitle>
                <CardDescription>
                  Tinggal copy-paste dan share! Kode & link referral otomatis terisi.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="0" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 p-1 bg-gray-100/50 rounded-xl mb-6">
                    {promotionTemplates.map((template, index) => (
                      <TabsTrigger 
                        key={index} 
                        value={String(index)} 
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                      >
                        <template.icon className={`w-5 h-5 ${template.color}`} />
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {promotionTemplates.map((template, index) => (
                    <TabsContent key={index} value={String(index)} className="space-y-4 focus-visible:ring-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <template.icon className={`w-6 h-6 ${template.color}`} />
                          {template.title}
                        </h3>
                        <Button
                          onClick={() => handleCopyTemplate(template.text, index)}
                          variant="secondary"
                          className="gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 border-none"
                        >
                          {copied === `template-${index}` ? (
                            <>
                              <Tick02Icon className="h-4 w-4 text-green-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy01Icon className="h-4 w-4" />
                              Copy Template
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <pre className="relative bg-white border border-gray-100 rounded-xl p-6 text-sm text-gray-600 whitespace-pre-wrap overflow-x-auto font-sans leading-relaxed shadow-sm">
                          {template.text
                            .replace(/\[KODE_REFERRAL\]/g, referralCode || '...')
                            .replace(/\[LINK_REFERRAL\]/g, getReferralLink())}
                        </pre>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <span className="font-bold bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">TIP</span>
                        <span>
                          Kamu bisa edit template ini sesuai gaya kamu sendiri. Yang penting kode referral dan link-nya tetap ada ya!
                        </span>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Total Earned Card */}
            <Card className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-none shadow-xl shadow-indigo-500/30 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-24 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 p-16 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
              
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-indigo-100">
                      <Wallet01Icon className="h-5 w-5" />
                      Total Pendapatan
                    </CardTitle>
                    <CardDescription className="text-indigo-200/80 mt-1">
                      Akumulasi bonus & komisi
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative pt-0">
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-bold tracking-tight">{isLoading ? '...' : totalEarned}</span>
                  <span className="text-lg font-medium text-indigo-200">Credits</span>
                </div>
                <Button className="w-full mt-6 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                  Cairkan / Gunakan Credit
                </Button>
              </CardContent>
            </Card>

            {/* Referral List */}
            {stats && stats.referrals && stats.referrals.length > 0 ? (
              <Card className="rounded-3xl border-gray-100 shadow-lg shadow-gray-200/40 h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserGroupIcon className="h-5 w-5 text-gray-500" />
                    Daftar Referral
                  </CardTitle>
                  <CardDescription>
                    Teman yang sudah bergabung
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.referrals.map((referral) => (
                      <div
                        key={referral.referred_id}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold border border-white shadow-sm">
                            {referral.referred_email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 truncate max-w-[120px]">
                              {referral.referred_email?.split('@')[0]}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {new Date(referral.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {referral.completed_at ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] px-2 py-0.5 h-5">
                              <Tick02Icon className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 border-gray-200 text-[10px] px-2 py-0.5 h-5">
                              Pending
                            </Badge>
                          )}
                          {referral.signup_bonus_awarded > 0 && (
                            <span className="text-[10px] font-medium text-purple-600">
                              +{referral.signup_bonus_awarded} cr
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-3xl border-dashed border-2 border-gray-200 bg-gray-50/50">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Belum ada referral</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Mulai undang teman kamu dan dapatkan bonus credit!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
