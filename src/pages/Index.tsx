import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ImagePlus, Megaphone, Palette, Cat, Camera, ArrowRight, Zap, Star } from "lucide-react";

const features = [
  {
    path: "/generate",
    icon: ImagePlus,
    title: "Generate Image",
    description: "Buat gambar dari teks apapun dengan AI",
    color: "bg-accent",
  },
  {
    path: "/promo",
    icon: Megaphone,
    title: "Promo Produk",
    description: "Template siap pakai untuk iklan produk UMKM",
    color: "bg-secondary",
  },
  {
    path: "/style",
    icon: Palette,
    title: "Copy Style",
    description: "Salin gaya dari gambar lain ke produkmu",
    color: "bg-accent",
  },
  {
    path: "/mascot",
    icon: Cat,
    title: "Buat Maskot",
    description: "Ciptakan maskot 3D Pixar untuk brandmu",
    color: "bg-secondary",
  },
  {
    path: "/food",
    icon: Camera,
    title: "Food Lens AI",
    description: "Upgrade foto makanan jadi profesional",
    color: "bg-accent",
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b-[3px] border-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <span className="brutal-tag">
                <Star className="w-4 h-4 inline mr-1" />
                100% GRATIS
              </span>
            </div>
            
            <h1 className="brutal-heading mb-6">
              AI Image Generator<br />
              Untuk UMKM Indonesia
            </h1>
            
            <p className="text-xl md:text-2xl font-mono mb-8 max-w-2xl mx-auto">
              Buat gambar profesional untuk bisnis Anda dalam hitungan detik. 
              Tanpa skill desain. Tanpa biaya mahal.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/generate" className="brutal-btn text-lg">
                <Zap className="w-5 h-5 mr-2" />
                Mulai Sekarang
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/promo" className="brutal-btn-outline text-lg">
                Lihat Template Promo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-display">5+</div>
              <div className="text-sm uppercase tracking-wider opacity-80">Fitur AI</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display">∞</div>
              <div className="text-sm uppercase tracking-wider opacity-80">Gambar/Hari</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display">0</div>
              <div className="text-sm uppercase tracking-wider opacity-80">Rupiah</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display">1000+</div>
              <div className="text-sm uppercase tracking-wider opacity-80">UMKM</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display text-center mb-12 uppercase">
            Pilih Fitur Sesuai Kebutuhan
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.path}
                to={feature.path}
                className="brutal-card group"
              >
                <div className={`${feature.color} w-16 h-16 flex items-center justify-center border-[3px] border-foreground mb-4 group-hover:animate-shake`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl uppercase mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center font-bold uppercase text-sm">
                  Coba Sekarang
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-accent border-y-[3px] border-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display uppercase mb-4">
            Siap Tingkatkan Bisnis Anda?
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Bergabung dengan ribuan UMKM yang sudah menggunakan AI untuk membuat konten visual profesional.
          </p>
          <Link to="/generate" className="brutal-btn-primary text-lg">
            Mulai Gratis Sekarang
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
