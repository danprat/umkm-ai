import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ImagePlus, Megaphone, Palette, Cat, Camera, ArrowRight, Zap, CreditCard, History, Star, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const features = [
  {
    path: "/dashboard/generate",
    icon: ImagePlus,
    title: "Generate Image",
    description: "Buat gambar produk profesional dari teks",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    gradient: "from-blue-500/20 to-blue-600/5"
  },
  {
    path: "/dashboard/promo",
    icon: Megaphone,
    title: "Promo Produk",
    description: "Template iklan siap pakai untuk media sosial",
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    borderColor: "border-pink-200",
    gradient: "from-pink-500/20 to-pink-600/5"
  },
  {
    path: "/dashboard/style",
    icon: Palette,
    title: "Copy Style",
    description: "Adaptasi gaya visual dari referensi gambar",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200",
    gradient: "from-purple-500/20 to-purple-600/5"
  },
  {
    path: "/dashboard/mascot",
    icon: Cat,
    title: "Buat Maskot",
    description: "Karakter unik untuk identitas brand Anda",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-200",
    gradient: "from-orange-500/20 to-orange-600/5"
  },
  {
    path: "/dashboard/food",
    icon: Camera,
    title: "Food Lens AI",
    description: "Optimasi fotografi makanan menjadi lebih menggugah",
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    gradient: "from-green-500/20 to-green-600/5"
  },
];

export default function Dashboard() {
  const { profile, user } = useAuth();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || "User";
  const credits = profile?.credits || 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-blue-500/10 p-6 rounded-3xl border border-white/20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xl">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                Halo, {displayName} <span className="animate-wave inline-block origin-bottom-right">👋</span>
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                Siap berkarya hari ini?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link to="/dashboard/history" className="w-full md:w-auto">
              <Button variant="outline" className="gap-2 w-full md:w-auto rounded-full h-11 border-gray-200 hover:bg-white hover:text-violet-600 transition-colors">
                <History className="w-4 h-4" />
                Riwayat
              </Button>
            </Link>
            <Link to="/dashboard/generate" className="w-full md:w-auto">
              <Button className="gap-2 w-full md:w-auto rounded-full h-11 bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all hover:scale-105">
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                Buat Baru
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Tools */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                    <Sparkles className="w-8 h-8 text-violet-600 fill-violet-100" />
                    Alat Kreatif
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base">
                    Wujudkan ide kreatif Anda dengan teknologi AI terdepan
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-none px-4 py-1.5 text-sm font-semibold shadow-lg shadow-violet-500/30 w-fit">
                  🤖 AI Powered
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <Link
                    key={feature.path}
                    to={feature.path}
                    className="group relative overflow-hidden bg-white border-2 border-gray-100 rounded-3xl p-7 hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500 hover:-translate-y-2 hover:border-transparent"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Animated gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                    
                    {/* Decorative circles */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 ${feature.bgColor} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                    <div className={`absolute -bottom-10 -left-10 w-32 h-32 ${feature.bgColor} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-5">
                        <div className={`relative w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg ${feature.borderColor} border-2`}>
                          <feature.icon className={`w-8 h-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                          <div className={`absolute -top-1 -right-1 w-3 h-3 ${feature.color.replace('text-', 'bg-')} rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse`} />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-4 group-hover:rotate-45">
                          <ArrowRight className={`w-5 h-5 ${feature.color}`} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-bold text-xl text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-fuchsia-600 transition-all duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700">
                          {feature.description}
                        </p>
                        <div className={`flex items-center gap-2 text-xs font-semibold ${feature.color} opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 transform translate-y-2 group-hover:translate-y-0`}>
                          Mulai Sekarang <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Quick Tips or Recent Activity Placeholder */}
            <Card className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white border-none rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <CardContent className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-4">
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md">Pro Tip</Badge>
                  <h3 className="text-2xl font-bold">Tingkatkan Kualitas Promosi Anda</h3>
                  <p className="text-indigo-100 max-w-md">
                    Gunakan fitur "Copy Style" untuk meniru gaya visual dari brand-brand besar dan terapkan pada produk Anda.
                  </p>
                </div>
                <Link to="/dashboard/style">
                  <Button variant="secondary" className="bg-white text-violet-900 hover:bg-indigo-50 border-none font-semibold h-12 px-6 rounded-full shadow-lg shadow-indigo-900/20">
                    Coba Sekarang
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Stats & Credits */}
          <div className="space-y-6">
            {/* Credit Balance Card */}
            <Card className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-none shadow-xl shadow-indigo-500/30 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-24 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 p-16 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
              
              <CardHeader className="relative pb-2">
                <CardTitle className="flex items-center gap-2 text-indigo-100 text-base">
                  <CreditCard className="h-5 w-5" />
                  Saldo Kredit
                </CardTitle>
              </CardHeader>
              <CardContent className="relative pt-0">
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-bold tracking-tight">{credits}</span>
                  <span className="text-lg font-medium text-indigo-200">Credits</span>
                </div>
                <p className="text-sm text-indigo-200/80 mt-3">
                  Kredit tersedia untuk membuat konten
                </p>
                <Link to="/pricing" className="block mt-6">
                  <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm h-11 rounded-xl font-semibold transition-all hover:scale-[1.02]">
                    <Zap className="w-4 h-4 mr-2" />
                    Beli Kredit
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

