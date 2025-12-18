import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ImagePlus, Megaphone, Palette, Cat, Camera, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    path: "/dashboard/generate",
    icon: ImagePlus,
    title: "Generate Image",
    description: "Buat gambar dari teks apapun dengan AI",
    color: "bg-genz-lime",
    emoji: "✨",
  },
  {
    path: "/dashboard/promo",
    icon: Megaphone,
    title: "Promo Produk",
    description: "Template siap pakai untuk iklan produk UMKM",
    color: "bg-genz-pink",
    emoji: "📣",
  },
  {
    path: "/dashboard/style",
    icon: Palette,
    title: "Copy Style",
    description: "Salin gaya dari gambar lain ke produkmu",
    color: "bg-genz-cyan",
    emoji: "🎨",
  },
  {
    path: "/dashboard/mascot",
    icon: Cat,
    title: "Buat Maskot",
    description: "Ciptakan maskot unik untuk brandmu",
    color: "bg-genz-coral",
    emoji: "🦁",
  },
  {
    path: "/dashboard/food",
    icon: Camera,
    title: "Food Lens AI",
    description: "Upgrade foto makanan jadi profesional",
    color: "bg-genz-purple",
    emoji: "🍔",
  },
];

export default function Dashboard() {
  const { profile, user } = useAuth();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || "User";

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <section className="py-6 border-b-[3px] border-foreground bg-gradient-to-r from-genz-lime/10 via-genz-pink/10 to-genz-cyan/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 animate-float text-genz-pink" />
            <h1 className="text-xl md:text-2xl font-display uppercase">
              Selamat Datang, {displayName} 👋
            </h1>
          </div>
          <p className="text-sm text-foreground font-bold">
            Pilih fitur AI untuk membuat gambar profesional ⚡
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.path}
                to={feature.path}
                className="brutal-card group hover:animate-wiggle relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 text-3xl animate-float">{feature.emoji}</div>
                <div className={`${feature.color} w-16 h-16 flex items-center justify-center border-[3px] border-foreground mb-4 group-hover:animate-float rounded-lg`}>
                  <feature.icon className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="font-display text-2xl uppercase mb-2">
                  {feature.title}
                </h3>
                <p className="text-foreground font-medium">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center font-bold uppercase text-sm">
                  Mulai ⚡
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
