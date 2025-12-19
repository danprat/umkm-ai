import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ImagePlus, Megaphone, Palette, Cat, Camera, ArrowRight, Zap, CreditCard, History, TrendingUp, Crown, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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
  
  // Logic for plan display
  const isPremium = credits > 100; // Simple logic for demo, ideally checked against a plan ID
  const planName = isPremium ? "Premium Pro" : "Free Starter";
  const maxCredits = isPremium ? 1000 : 50; // Mock limit
  const usagePercentage = Math.min(100, (credits / maxCredits) * 100);
  
  const chartData = [
    { name: "Used", value: maxCredits - credits },
    { name: "Available", value: credits },
  ];
  const chartColors = ["#e2e8f0", isPremium ? "#8b5cf6" : "#3b82f6"];

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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  Alat Kreatif
                </h2>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                  AI Powered
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-5">
                {features.map((feature) => (
                  <Link
                    key={feature.path}
                    to={feature.path}
                    className="group relative overflow-hidden bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div className="relative flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                        <feature.icon className={`w-7 h-7 ${feature.color}`} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-4">
                        <ArrowRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    
                    <div className="relative mt-6">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-violet-700 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {feature.description}
                      </p>
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

          {/* Sidebar - Stats & Plan */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <Card className="rounded-3xl border-gray-100 shadow-lg shadow-gray-200/40 overflow-hidden">
              <CardHeader className="bg-gray-50/50 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Crown className={`w-5 h-5 ${isPremium ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`} />
                    Paket Anda
                  </CardTitle>
                  <Badge variant={isPremium ? "default" : "outline"} className={isPremium ? "bg-gradient-to-r from-yellow-500 to-amber-600 border-none" : "border-gray-300 text-gray-500"}>
                    {planName}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="relative w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={75}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-bold text-gray-900">{credits}</span>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kredit</span>
                    </div>
                  </div>
                  <p className="text-sm text-center text-gray-500 mt-2">
                    Anda memiliki {credits} kredit tersisa untuk bulan ini.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Usage</span>
                    <span className="font-medium">{Math.round(usagePercentage)}%</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Fitur Paket:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      50 Generasi Gambar/bulan
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Akses Template Dasar
                    </li>
                    {!isPremium && (
                      <li className="flex items-center gap-2 text-sm text-gray-400 line-through">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        Prioritas Rendering
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50/50 p-6">
                <Link to="/pricing" className="w-full">
                  <Button className={`w-full h-11 rounded-xl font-semibold shadow-lg transition-all hover:scale-[1.02] ${isPremium ? "bg-gray-900 hover:bg-gray-800" : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 border-none text-white"}`}>
                    {isPremium ? "Top Up Kredit" : "Upgrade ke Pro ⚡️"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Quick Stats Mini Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none bg-blue-50/50 hover:bg-blue-50 transition-colors">
                <CardContent className="p-4 flex flex-col gap-1">
                  <TrendingUp className="w-5 h-5 text-blue-600 mb-2" />
                  <span className="text-2xl font-bold text-gray-900">12</span>
                  <span className="text-xs text-blue-600 font-medium">Projects Created</span>
                </CardContent>
              </Card>
              <Card className="border-none bg-pink-50/50 hover:bg-pink-50 transition-colors">
                <CardContent className="p-4 flex flex-col gap-1">
                  <ImagePlus className="w-5 h-5 text-pink-600 mb-2" />
                  <span className="text-2xl font-bold text-gray-900">85</span>
                  <span className="text-xs text-pink-600 font-medium">Images Generated</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

