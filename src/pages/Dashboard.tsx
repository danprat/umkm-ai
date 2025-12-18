import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ImagePlus, Megaphone, Palette, Cat, Camera, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    path: "/dashboard/generate",
    icon: ImagePlus,
    title: "Generate Image",
    description: "Buat gambar dari teks apapun dengan AI",
    color: "bg-genz-lime",
  },
  {
    path: "/dashboard/promo",
    icon: Megaphone,
    title: "Promo Produk",
    description: "Template siap pakai untuk iklan produk UMKM",
    color: "bg-genz-pink",
  },
  {
    path: "/dashboard/style",
    icon: Palette,
    title: "Copy Style",
    description: "Salin gaya dari gambar lain ke produkmu",
    color: "bg-genz-cyan",
  },
  {
    path: "/dashboard/mascot",
    icon: Cat,
    title: "Buat Maskot",
    description: "Ciptakan maskot unik untuk brandmu",
    color: "bg-genz-coral",
  },
  {
    path: "/dashboard/food",
    icon: Camera,
    title: "Food Lens AI",
    description: "Upgrade foto makanan jadi profesional",
    color: "bg-genz-purple",
  },
];

export default function Dashboard() {
  const { profile, user } = useAuth();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || "User";

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <section className="py-8 border-b-4 border-black bg-[#f3f3f3]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-black text-white p-2 rounded-lg animate-bounce">
                <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-5xl font-display uppercase tracking-tighter">
              Halo, {displayName}
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-bold font-mono flex items-center gap-2">
            Mau bikin apa hari ini? Pilih menu di bawah ya! <ChevronDown className="w-5 h-5 animate-bounce" />
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 bg-white min-h-[calc(100vh-200px)]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link
                key={feature.path}
                to={feature.path}
                className="group relative bg-white border-4 border-black p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                {/* Decorative background circle */}
                <div className={`absolute -right-6 -top-6 w-24 h-24 ${feature.color} rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500`}></div>
                
                <div className="relative z-10">
                    <div className="flex justify-start items-start mb-6">
                        <div className={`${feature.color} w-16 h-16 flex items-center justify-center border-4 border-black rounded-xl group-hover:rotate-6 transition-transform`}>
                            <feature.icon className="w-8 h-8 text-black" />
                        </div>
                    </div>
                    
                    <h3 className="font-display text-3xl uppercase mb-2 leading-none">
                    {feature.title}
                    </h3>
                    <p className="text-gray-600 font-medium font-mono mb-6 line-clamp-2">
                    {feature.description}
                    </p>
                    
                    <div className="inline-flex items-center gap-2 font-bold uppercase text-sm bg-black text-white px-4 py-2 rounded-lg group-hover:bg-genz-lime group-hover:text-black transition-colors border-2 border-black">
                    Gas Bikin!
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
