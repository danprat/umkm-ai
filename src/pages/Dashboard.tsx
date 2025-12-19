import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ImagePlus, Megaphone, Palette, Cat, Camera, ArrowRight, Zap, CreditCard, History, Star, Sparkles, Gift, Users, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const features = [
  {
    path: "/dashboard/generate",
    icon: ImagePlus,
    title: "Generate Image",
    color: "text-black",
    bgColor: "bg-genz-lime",
  },
  {
    path: "/dashboard/promo",
    icon: Megaphone,
    title: "Promo Produk",
    color: "text-black",
    bgColor: "bg-genz-cyan",
  },
  {
    path: "/dashboard/style",
    icon: Palette,
    title: "Copy Style",
    color: "text-black",
    bgColor: "bg-genz-coral",
  },
  {
    path: "/dashboard/mascot",
    icon: Cat,
    title: "Buat Maskot",
    color: "text-white",
    bgColor: "bg-genz-purple",
  },
  {
    path: "/dashboard/food",
    icon: Camera,
    title: "Food Lens AI",
    color: "text-black",
    bgColor: "bg-genz-pink",
  },
];

export default function Dashboard() {
  const { profile, user } = useAuth();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Bestie";
  const credits = profile?.credits || 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
        {/* Header Section - More Compact */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-3 border-black">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-genz-lime text-black font-bold text-xl">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-black flex items-center gap-2 uppercase">
                Hola, {displayName}! <span className="animate-bounce inline-block">👋</span>
              </h1>
              <p className="text-gray-600 font-mono text-sm">
                Ready buat bikin konten viral?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <Link to="/dashboard/generate" className="w-full md:w-auto">
              <Button className="gap-2 w-full md:w-auto rounded-xl h-12 bg-black hover:bg-gray-800 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-[4px] active:shadow-none">
                <Zap className="w-4 h-4 text-genz-lime fill-genz-lime" />
                <span className="font-bold">Gas Ngonten</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Referral Banner - HERO SECTION */}
            <div className="relative overflow-hidden bg-genz-pink rounded-3xl border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <Link to="/dashboard/referral" className="absolute inset-0 z-20" />
              
              <div className="absolute -right-10 -top-10 bg-genz-cyan w-64 h-64 rounded-full blur-xl opacity-50" />
              <div className="absolute -left-10 -bottom-10 bg-genz-lime w-64 h-64 rounded-full blur-xl opacity-50" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-4 text-center md:text-left flex-1">
                  <Badge className="bg-black text-genz-lime border-none px-3 py-1 font-mono text-xs uppercase tracking-wider animate-pulse">
                    Cuan Alert
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-none drop-shadow-md text-stroke-2 stroke-black">
                    Invite Bestie,<br />
                    Auto Kaya Credit!
                  </h2>
                  <p className="text-black font-bold text-lg max-w-md">
                    Dapet 10 credit GRATIS tiap temen lo join. Unlimited cuan, unlimited konten!
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border-2 border-black text-black text-xs font-bold">
                      <Gift className="w-4 h-4" /> Bonus Signup
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border-2 border-black text-black text-xs font-bold">
                      <Users className="w-4 h-4" /> Unlimited Teman
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border-2 border-black text-black text-xs font-bold">
                      <TrendingUp className="w-4 h-4" /> Passive Income
                    </div>
                  </div>
                  <Button className="mt-4 bg-genz-cyan text-black hover:bg-genz-lime hover:text-black border-2 border-black font-black uppercase tracking-wide rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Cek Link Sakti Lo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 animate-bounce-slow">
                   {/* Sticker-like graphic */}
                   <div className="absolute inset-0 bg-white rounded-full border-4 border-black flex items-center justify-center transform rotate-6 shadow-xl">
                      <span className="text-6xl font-black">$$$</span>
                   </div>
                   <div className="absolute -bottom-4 -right-4 bg-genz-lime px-4 py-2 rounded-xl border-3 border-black transform -rotate-12 z-10">
                      <span className="font-black text-black text-xl">CUAN!!</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Shortcuts - Mini Grid */}
            <div>
              <h3 className="text-xl font-black text-black uppercase mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Tools Kece
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {features.map((feature) => (
                  <Link
                    key={feature.path}
                    to={feature.path}
                    className="group flex flex-col items-center justify-center p-4 bg-white border-2 border-black rounded-xl hover:bg-genz-lime/20 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                  >
                    <div className={`w-10 h-10 ${feature.bgColor} rounded-lg flex items-center justify-center border-2 border-black mb-2 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <span className="text-xs font-bold text-center uppercase tracking-tight">{feature.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Credit Balance Card - Retro Style */}
            <Card className="rounded-3xl bg-black text-white border-3 border-black shadow-[8px_8px_0px_0px_rgba(100,100,100,0.5)] overflow-hidden relative">
               <div className="absolute top-0 right-0 p-16 bg-genz-lime rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
              
              <CardHeader className="relative pb-2">
                <CardTitle className="flex items-center gap-2 text-genz-lime font-mono uppercase tracking-widest text-sm">
                  <CreditCard className="h-4 w-4" />
                  Dompet Credit
                </CardTitle>
              </CardHeader>
              <CardContent className="relative pt-0">
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-black tracking-tighter text-white">{credits}</span>
                  <span className="text-sm font-bold text-gray-400">CR</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-mono">
                  Sisa credit buat ngonten.
                </p>
                <Link to="/pricing" className="block mt-6">
                  <Button className="w-full bg-genz-lime text-black hover:bg-genz-lime/90 border-2 border-black h-10 rounded-xl font-bold uppercase text-xs transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                    <Zap className="w-3 h-3 mr-2" />
                    Isi Ulang
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Tip - Gen Z Style */}
             <Card className="bg-yellow-50 border-3 border-black rounded-3xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Badge className="bg-black text-yellow-400 border-none px-2 py-1 font-mono text-xs uppercase animate-pulse">
                    Pro Tip 💡
                  </Badge>
                </div>
                <h3 className="text-lg font-black uppercase leading-tight mb-2">Mau Hasil Foto Aesthetic?</h3>
                <p className="text-sm text-gray-600 font-medium mb-4">
                  Cobain fitur "Copy Style". Tinggal upload foto referensi dari Pinterest/IG, AI kita bakal nyamain vibes-nya! 📸
                </p>
                <Link to="/dashboard/style">
                  <Button variant="outline" className="w-full bg-white text-black border-2 border-black hover:bg-black hover:text-white font-bold h-10 rounded-xl uppercase text-xs transition-all">
                    Cobain Skuy
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Riwayat Button Link */}
            <Link to="/dashboard/history" className="block">
              <Button variant="ghost" className="w-full justify-between border-2 border-dashed border-gray-300 rounded-xl h-12 hover:bg-gray-50 hover:border-gray-400 text-gray-500 font-bold uppercase text-xs">
                <span className="flex items-center gap-2"><History className="w-4 h-4" /> Riwayat Konten</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

